import json
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from db.session import get_db
from db.models import Complaint, RiskAssessment
from agents.graph import graph
from tools.pdf_parser import extract_text_from_pdf, extract_text_from_email

router = APIRouter(prefix="/api/complaint", tags=["complaint"])


def run_graph(raw_input: str, complaint_id: int = None) -> dict:
    initial_state = {
        "intent": "",
        "command": "",
        "raw_input": raw_input,
        "extracted_text": "",
        "form": {},
        "assessment": {},
        "previous_form": None,
        "previous_assessment": None,
        "complaint_id": complaint_id,
        "reply": "",
        "missing_fields": [],
        "duplicate_info": None,
        "root_cause": None,
        "capa": None,
        "summary": None,
    }
    result = graph.invoke(initial_state)
    return result


@router.post("/log")
def log_complaint(body: dict, db: Session = Depends(get_db)):
    text = body.get("text", "")
    result = run_graph(text)

    complaint = Complaint(**result.get("form", {}))
    db.add(complaint)
    db.flush()

    assessment_data = result.get("assessment", {})
    assessment = RiskAssessment(complaint_id=complaint.id, **assessment_data)
    db.add(assessment)
    db.commit()

    return {
        "complaint_id": complaint.id,
        "form": result.get("form", {}),
        "assessment": result.get("assessment", {}),
        "reply": result.get("reply", ""),
    }


@router.put("/edit")
def edit_complaint(body: dict, db: Session = Depends(get_db)):
    complaint_id = body.get("complaint_id")
    prompt = body.get("prompt", "")

    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    assessment = db.query(RiskAssessment).filter(
        RiskAssessment.complaint_id == complaint_id
    ).first()

    current_form = {c.name: getattr(complaint, c.name) for c in Complaint.__table__.columns}
    current_assessment = (
        {c.name: getattr(assessment, c.name) for c in RiskAssessment.__table__.columns}
        if assessment else {}
    )

    initial_state = {
        "intent": "edit",
        "command": "",
        "raw_input": prompt,
        "extracted_text": "",
        "form": current_form,
        "assessment": current_assessment,
        "previous_form": current_form,
        "previous_assessment": current_assessment,
        "complaint_id": complaint_id,
        "reply": "",
        "missing_fields": [],
        "duplicate_info": None,
        "root_cause": None,
        "capa": None,
        "summary": None,
    }
    result = graph.invoke(initial_state)

    for key, value in result.get("form", {}).items():
        setattr(complaint, key, value)
    assessment_data = result.get("assessment", {})
    if assessment:
        for key, value in assessment_data.items():
            setattr(assessment, key, value)
    db.commit()

    return {
        "complaint_id": complaint_id,
        "form": result.get("form", {}),
        "assessment": result.get("assessment", {}),
        "reply": result.get("reply", ""),
    }


@router.post("/extract")
def extract_from_file(body: dict, db: Session = Depends(get_db)):
    text = body.get("text", body.get("extracted_text", ""))
    result = run_graph(text, complaint_id=body.get("complaint_id"))

    return {
        "form": result.get("form", {}),
        "assessment": result.get("assessment", {}),
        "reply": result.get("reply", ""),
    }


@router.post("/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    filename = file.filename.lower()

    if filename.endswith(".pdf"):
        text = extract_text_from_pdf(contents)
    elif filename.endswith(".eml"):
        text = extract_text_from_email(contents)
    else:
        text = contents.decode("utf-8", errors="ignore")

    result = run_graph(text)

    complaint = Complaint(**result.get("form", {}))
    db.add(complaint)
    db.flush()

    assessment_data = result.get("assessment", {})
    assessment = RiskAssessment(complaint_id=complaint.id, **assessment_data)
    db.add(assessment)
    db.commit()

    return {
        "complaint_id": complaint.id,
        "form": result.get("form", {}),
        "assessment": result.get("assessment", {}),
        "reply": result.get("reply", ""),
    }