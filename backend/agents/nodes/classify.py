import json
from langchain_core.messages import HumanMessage, SystemMessage
from agents.state import ComplaintState
from utils.groq_client import get_groq_llm_json

CLASSIFY_PROMPT = """Classify the user's message intent. Choose ONE:
- "log": new complaint information, describing a product issue
- "edit": modifying an existing complaint field
- "extract": document/file upload or pasted email content

Return JSON: {"intent": "log" | "edit" | "extract", "reason": "brief explanation"}"""

def classify_intent(state: ComplaintState) -> dict:
    llm = get_groq_llm_json()
    messages = [
        SystemMessage(content=CLASSIFY_PROMPT),
        HumanMessage(content=state["raw_input"][:2000]),
    ]
    response = llm.invoke(messages)
    result = json.loads(response.content)
    return {"intent": result["intent"]}