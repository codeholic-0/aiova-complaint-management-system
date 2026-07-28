import json
from langchain_core.messages import HumanMessage, SystemMessage
from agents.state import ComplaintState
from agents.prompts.extract_prompt import EXTRACT_SYSTEM_PROMPT
from utils.groq_client import get_groq_llm_json

def extract_entities(state: ComplaintState) -> dict:
    llm = get_groq_llm_json()
    text = state.get("extracted_text") or state["raw_input"]
    messages = [
        SystemMessage(content=EXTRACT_SYSTEM_PROMPT),
        HumanMessage(content=text[:4000]),
    ]
    response = llm.invoke(messages)
    result = json.loads(response.content)

    form = state.get("form", {})
    for key in ["source", "customer_name", "product_name", "strength", "batch_lot",
                 "mfg_date", "expiry_date", "complaint_type", "complaint_date", "description"]:
        if result.get(key):
            form[key] = result[key]
    if result.get("quantity") is not None:
        form["quantity"] = result["quantity"]
    if result.get("unit"):
        form["unit"] = result["unit"]

    return {
        "form": form,
        "reply": f"I extracted the complaint details from the provided text. Found: {result.get('product_name', 'N/A')}, Batch: {result.get('batch_lot', 'N/A')}."
    }