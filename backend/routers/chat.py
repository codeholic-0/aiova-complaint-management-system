import json
from datetime import datetime, date
from fastapi import APIRouter, Depends
from sse_starlette.sse import EventSourceResponse
from sqlalchemy.orm import Session
from db.session import get_db
from db.models import Complaint, RiskAssessment
from agents.graph import graph

router = APIRouter(prefix="/api/chat", tags=["chat"])


async def event_generator(message: str, complaint_id: int = None, db: Session = None):
    initial_state = {
        "intent": "",
        "command": "",
        "raw_input": message,
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

    if complaint_id and db:
        complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        assessment = db.query(RiskAssessment).filter(
            RiskAssessment.complaint_id == complaint_id
        ).first()
        if complaint:
            def safe(val):
                if isinstance(val, (datetime, date)):
                    return val.isoformat()
                return val
            initial_state["form"] = {c.name: safe(getattr(complaint, c.name)) for c in Complaint.__table__.columns}
            initial_state["previous_form"] = dict(initial_state["form"])
        if assessment:
            def safe(val):
                if isinstance(val, (datetime, date)):
                    return val.isoformat()
                return val
            initial_state["assessment"] = {c.name: safe(getattr(assessment, c.name)) for c in RiskAssessment.__table__.columns}
            initial_state["previous_assessment"] = dict(initial_state["assessment"])

    yield {"event": "progress", "data": json.dumps({"percent": 10, "status": "Classifying intent..."})}

    is_new = not complaint_id
    result = graph.invoke(initial_state)
    new_id = result.get("complaint_id") or complaint_id

    intent = result.get("intent", "")

    # For /commands, just stream reply — no DB writes
    if intent == "command":
        yield {"event": "result", "data": json.dumps({
            "form": result.get("form", {}),
            "assessment": result.get("assessment", {}),
            "reply": result.get("reply", ""),
            "complaint_id": new_id,
        })}
        return

    if is_new and result.get("form"):
        col_names = Complaint.__table__.columns.keys()
        form_data = {k: v for k, v in result["form"].items() if k in col_names}
        complaint = Complaint(**form_data)
        db.add(complaint)
        db.flush()
        assessment_data = result.get("assessment", {})
        if assessment_data:
            assessment = RiskAssessment(complaint_id=complaint.id, **assessment_data)
            db.add(assessment)
        db.commit()
        new_id = complaint.id

    yield {"event": "progress", "data": json.dumps({"percent": 50, "status": "Extracting details...", "form": result.get("form", {})})}
    yield {"event": "progress", "data": json.dumps({"percent": 80, "status": "Running risk assessment...", "assessment": result.get("assessment", {})})}
    yield {"event": "progress", "data": json.dumps({"percent": 100, "status": "Complete"})}
    yield {"event": "result", "data": json.dumps({
        "form": result.get("form", {}),
        "assessment": result.get("assessment", {}),
        "reply": result.get("reply", ""),
        "complaint_id": new_id,
    })}


@router.get("/stream")
async def chat_stream(message: str, complaint_id: int = None, db: Session = Depends(get_db)):
    return EventSourceResponse(event_generator(message, complaint_id, db))
