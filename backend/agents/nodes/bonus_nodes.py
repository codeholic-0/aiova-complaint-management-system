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

COMMANDS = {
    "/completeness": "Check which fields are still missing",
    "/duplicate": "Check for potential duplicate complaints",
    "/rootcause": "Perform root cause analysis",
    "/capa": "Recommend corrective and preventive actions",
    "/summary": "Generate a complaint summary",
    "/riskclassify": "ICH Q9 risk classification",
    "/undo": "Undo last edit",
    "/diff": "Show changes from last edit",
    "/commands": "Show this help message",
}


def run_command(state: ComplaintState) -> dict:
    cmd = state.get("command", "")
    if cmd == "/commands" or cmd not in COMMANDS:
        help_text = "**Available commands:**\n" + "\n".join(
            f"  `{k}` — {v}" for k, v in sorted(COMMANDS.items())
        )
        return {"reply": help_text}

    dispatch = {
        "/completeness": _completeness,
        "/duplicate": _duplicate,
        "/rootcause": _rootcause,
        "/capa": _capa,
        "/summary": _summary,
        "/riskclassify": _riskclassify,
        "/undo": _undo,
        "/diff": _diff,
    }
    handler = dispatch.get(cmd)
    if handler:
        return handler(state)
    return {"reply": f"Unknown command: {cmd}"}


def _completeness(state: ComplaintState) -> dict:
    llm = get_groq_llm_json()
    form_data = {"form": state.get("form", {}), "assessment": state.get("assessment", {})}
    messages = [
        SystemMessage(content=COMPLETENESS_PROMPT),
        HumanMessage(content=json.dumps(form_data, indent=2)),
    ]
    result = json.loads(llm.invoke(messages).content)
    missing = result.get("missing_fields", [])
    if missing:
        reply = f"**Missing fields:** {', '.join(missing)}"
    else:
        reply = "All fields are complete!"
    return {"missing_fields": missing, "reply": reply}


def _duplicate(state: ComplaintState) -> dict:
    llm = get_groq_llm_json()
    form = state.get("form", {})
    messages = [
        SystemMessage(content=DUPLICATE_PROMPT),
        HumanMessage(content=json.dumps(form, indent=2)),
    ]
    result = json.loads(llm.invoke(messages).content)
    reason = result.get("reason", "No duplicates detected.")
    return {"duplicate_info": reason, "reply": f"**Duplicate Check:** {reason}"}


def _rootcause(state: ComplaintState) -> dict:
    llm = get_groq_llm_json()
    data = {"form": state.get("form", {}), "assessment": state.get("assessment", {})}
    messages = [
        SystemMessage(content=ROOTCAUSE_PROMPT),
        HumanMessage(content=json.dumps(data, indent=2)),
    ]
    result = json.loads(llm.invoke(messages).content)
    rc = result.get("root_cause", "Unable to determine.")
    return {"root_cause": rc, "reply": f"**Root Cause Analysis:** {rc}"}


def _capa(state: ComplaintState) -> dict:
    llm = get_groq_llm_json()
    data = {
        "form": state.get("form", {}),
        "assessment": state.get("assessment", {}),
        "root_cause": state.get("root_cause"),
    }
    messages = [
        SystemMessage(content=CAPA_PROMPT),
        HumanMessage(content=json.dumps(data, indent=2)),
    ]
    result = json.loads(llm.invoke(messages).content)
    reply = "**CAPA Recommendation:** " + result.get("recommended_action", "")
    return {"capa": json.dumps(result), "reply": reply}


def _summary(state: ComplaintState) -> dict:
    llm = get_groq_llm()
    data = {"form": state.get("form", {}), "assessment": state.get("assessment", {})}
    messages = [
        SystemMessage(content=SUMMARY_PROMPT),
        HumanMessage(content=json.dumps(data, indent=2)),
    ]
    result = llm.invoke(messages)
    text = result.content
    return {"summary": text, "reply": f"**Summary:**\n{text}"}


def _riskclassify(state: ComplaintState) -> dict:
    llm = get_groq_llm_json()
    data = {"form": state.get("form", {}), "assessment": state.get("assessment", {})}
    messages = [
        SystemMessage(content=RISK_CLASSIFY_PROMPT),
        HumanMessage(content=json.dumps(data, indent=2)),
    ]
    result = json.loads(llm.invoke(messages).content)
    assessment = dict(state.get("assessment", {}))
    classification = result.get("ich_q9_classification", "")
    rationale = result.get("rationale", "")
    assessment["risk_category"] = classification
    reply = f"**ICH Q9 Classification:** {classification}\n\n*{rationale}*"
    return {"assessment": assessment, "reply": reply}


def _undo(state: ComplaintState) -> dict:
    prev_form = state.get("previous_form")
    prev_assessment = state.get("previous_assessment")
    if not prev_form and not prev_assessment:
        return {"reply": "Nothing to undo — no previous state saved."}
    update = {}
    if prev_form:
        update["form"] = dict(prev_form)
    if prev_assessment:
        update["assessment"] = dict(prev_assessment)
    update["reply"] = "Undone! Restored previous state."
    return update


def _diff(state: ComplaintState) -> dict:
    form = state.get("form", {})
    assessment = state.get("assessment", {})
    prev_form = state.get("previous_form", {})
    prev_assessment = state.get("previous_assessment", {})

    changes = []
    all_keys = set(list(form.keys()) + list(prev_form.keys()))
    for k in sorted(all_keys):
        old = prev_form.get(k, "—")
        new = form.get(k, "—")
        if old != new:
            changes.append(f"  `{k}`: _{old}_ → **{new}**")

    all_ak = set(list(assessment.keys()) + list(prev_assessment.keys()))
    for k in sorted(all_ak):
        old = prev_assessment.get(k, "—")
        new = assessment.get(k, "—")
        if old != new:
            changes.append(f"  `{k}`: _{old}_ → **{new}**")

    if not changes:
        return {"reply": "No changes detected since last edit."}
    reply = "**Changes since last edit:**\n" + "\n".join(changes)
    return {"reply": reply}


# Keep original function names for backward compatibility / direct imports
completeness_check = _completeness
duplicate_detection = _duplicate
root_cause_analysis = _rootcause
capa_recommendation = _capa
complaint_summary = _summary
risk_classification = _riskclassify