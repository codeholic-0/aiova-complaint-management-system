import json
from langchain_core.messages import HumanMessage, SystemMessage
from agents.state import ComplaintState
from agents.prompts.bonus_prompts import (
    COMPLETENESS_PROMPT,
    DUPLICATE_PROMPT,
    ROOTCAUSE_PROMPT,
    CAPA_PROMPT,
    SUMMARY_PROMPT,
    RISK_CLASSIFY_PROMPT,
)
from utils.groq_client import get_groq_llm_json, get_groq_llm


def completeness_check(state: ComplaintState) -> dict:
    llm = get_groq_llm_json()
    form_data = {"form": state.get("form", {}), "assessment": state.get("assessment", {})}
    messages = [
        SystemMessage(content=COMPLETENESS_PROMPT),
        HumanMessage(content=json.dumps(form_data, indent=2)),
    ]
    result = json.loads(llm.invoke(messages).content)
    return {"missing_fields": result.get("missing_fields", [])}


def duplicate_detection(state: ComplaintState) -> dict:
    llm = get_groq_llm_json()
    form = state.get("form", {})
    context = json.dumps(form, indent=2)
    messages = [
        SystemMessage(content=DUPLICATE_PROMPT),
        HumanMessage(content=f"Complaint: {context}"),
    ]
    result = json.loads(llm.invoke(messages).content)
    return {"duplicate_info": result.get("reason")}


def root_cause_analysis(state: ComplaintState) -> dict:
    llm = get_groq_llm_json()
    data = {"form": state.get("form", {}), "assessment": state.get("assessment", {})}
    messages = [
        SystemMessage(content=ROOTCAUSE_PROMPT),
        HumanMessage(content=json.dumps(data, indent=2)),
    ]
    result = json.loads(llm.invoke(messages).content)
    return {"root_cause": result.get("root_cause")}


def capa_recommendation(state: ComplaintState) -> dict:
    llm = get_groq_llm_json()
    data = {"form": state.get("form", {}), "assessment": state.get("assessment", {}), "root_cause": state.get("root_cause")}
    messages = [
        SystemMessage(content=CAPA_PROMPT),
        HumanMessage(content=json.dumps(data, indent=2)),
    ]
    result = json.loads(llm.invoke(messages).content)
    return {"capa": json.dumps(result)}


def complaint_summary(state: ComplaintState) -> dict:
    llm = get_groq_llm()
    data = {"form": state.get("form", {}), "assessment": state.get("assessment", {})}
    messages = [
        SystemMessage(content=SUMMARY_PROMPT),
        HumanMessage(content=json.dumps(data, indent=2)),
    ]
    result = llm.invoke(messages)
    return {"summary": result.content}


def risk_classification(state: ComplaintState) -> dict:
    llm = get_groq_llm_json()
    data = {"form": state.get("form", {}), "assessment": state.get("assessment", {})}
    messages = [
        SystemMessage(content=RISK_CLASSIFY_PROMPT),
        HumanMessage(content=json.dumps(data, indent=2)),
    ]
    result = json.loads(llm.invoke(messages).content)
    assessment = state.get("assessment", {})
    assessment["risk_category"] = result.get("ich_q9_classification", assessment.get("risk_category"))
    return {"assessment": assessment, "reply": f"ICH Q9 Classification: {result.get('ich_q9_classification')} — {result.get('rationale', '')}"}