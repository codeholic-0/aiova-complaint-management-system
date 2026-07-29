from langgraph.graph import StateGraph, END
from agents.state import ComplaintState
from agents.nodes.classify import classify_intent
from agents.nodes.extract import extract_entities
from agents.nodes.assess import risk_assessment
from agents.nodes.merge import merge_changes
from agents.nodes.bonus_nodes import run_command


def build_graph() -> StateGraph:
    workflow = StateGraph(ComplaintState)

    workflow.add_node("classify", classify_intent)
    workflow.add_node("extract", extract_entities)
    workflow.add_node("assess", risk_assessment)
    workflow.add_node("merge", merge_changes)
    workflow.add_node("run_command", run_command)

    workflow.set_entry_point("classify")

    def router(state: ComplaintState) -> str:
        intent = state.get("intent", "log")
        if intent == "command":
            return "run_command"
        if intent == "edit":
            return "merge"
        return "extract"

    workflow.add_conditional_edges("classify", router, {
        "extract": "extract",
        "merge": "merge",
        "run_command": "run_command",
    })

    workflow.add_edge("extract", "assess")
    workflow.add_edge("assess", END)
    workflow.add_edge("merge", END)
    workflow.add_edge("run_command", END)

    return workflow.compile()


graph = build_graph()