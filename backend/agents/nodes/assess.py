import json
from langchain_core.messages import HumanMessage, SystemMessage
from agents.state import ComplaintState
from agents.prompts.assess_prompt import ASSESS_SYSTEM_PROMPT
from utils.groq_client import get_groq_llm_json

def risk_assessment(state: ComplaintState) -> dict:
    llm = get_groq_llm_json()
    form = state.get("form", {})
    context = json.dumps(form, indent=2)

    messages = [
        SystemMessage(content=ASSESS_SYSTEM_PROMPT),
        HumanMessage(content=f"Complaint details:\n{context}\n\nAssess the risk."),
    ]
    response = llm.invoke(messages)
    result = json.loads(response.content)

    return {
        "assessment": {
            "severity": result.get("severity"),
            "priority": result.get("priority"),
            "risk_category": result.get("risk_category"),
            "recommended_actions": result.get("recommended_actions", []),
            "regulatory_impact": result.get("regulatory_impact"),
            "next_steps": result.get("next_steps"),
        },
        "reply": f"Risk assessment complete. Severity: {result.get('severity')}, Priority: {result.get('priority')}."
    }