import json
from langchain_core.messages import HumanMessage, SystemMessage
from agents.state import ComplaintState
from agents.prompts.merge_prompt import MERGE_SYSTEM_PROMPT
from utils.groq_client import get_groq_llm_json

def merge_changes(state: ComplaintState) -> dict:
    llm = get_groq_llm_json()
    current = json.dumps({"form": state.get("form", {}), "assessment": state.get("assessment", {})}, indent=2)
    user_edit = state["raw_input"]

    messages = [
        SystemMessage(content=MERGE_SYSTEM_PROMPT),
        HumanMessage(content=f"CURRENT STATE:\n{current}\n\nEDIT REQUEST:\n{user_edit}"),
    ]
    response = llm.invoke(messages)
    result = json.loads(response.content)

    return {
        "form": result.get("form", state.get("form", {})),
        "assessment": result.get("assessment", state.get("assessment", {})),
        "reply": result.get("reply", "Updated successfully."),
    }