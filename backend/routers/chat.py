import json
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel
from agents.graph import graph

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    complaint_id: int = None


async def event_generator(message: str, complaint_id: int = None):
    initial_state = {
        "intent": "",
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

    # Step 1: show progress
    yield {"event": "progress", "data": json.dumps({"percent": 10, "status": "Classifying intent..."})}

    result = graph.invoke(initial_state)

    yield {"event": "progress", "data": json.dumps({"percent": 50, "status": "Extracting details...", "form": result.get("form", {})})}

    yield {"event": "progress", "data": json.dumps({"percent": 80, "status": "Running risk assessment...", "assessment": result.get("assessment", {})})}

    yield {"event": "progress", "data": json.dumps({"percent": 100, "status": "Complete"})}

    yield {"event": "result", "data": json.dumps({
        "form": result.get("form", {}),
        "assessment": result.get("assessment", {}),
        "reply": result.get("reply", ""),
        "complaint_id": result.get("complaint_id"),
    })}


@router.get("/stream")
async def chat_stream(message: str, complaint_id: int = None):
    return EventSourceResponse(event_generator(message, complaint_id))