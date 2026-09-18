from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from backend.orchestration.state import AgentState
from backend.orchestration.node_stubs import (
    run_ingestion_and_normalization,
    run_context_and_entity_extraction,
    run_parallel_format_generation,
    run_reflection_repair,
    run_entity_and_claim_verification,
    run_deterministic_exporters
)


def check_reflection(state: AgentState) -> str:
    """Bounded reflection: max 1 retry."""
    max_retries = max(state.get("reflection_attempts", {}).values(), default=0)
    if state.get("schema_errors") and max_retries < 1:
        return "retry_reflection"
    return "proceed_to_gate"


def check_hard_gate(state: AgentState) -> str:
    """The Flagship Hard Gate conditional edge."""
    if state.get("hard_gate_triggered", False) and not state.get("human_approved", False):
        return "pause_for_human"
    return "proceed_to_export"


def build_graph():
    """Builds and compiles the Sentinel-Transform StateGraph."""
    workflow = StateGraph(AgentState)

    # 1. Register Nodes
    workflow.add_node("ingestion_node", run_ingestion_and_normalization)
    workflow.add_node("context_node", run_context_and_entity_extraction)
    workflow.add_node("generator_node", run_parallel_format_generation)
    workflow.add_node("reflection_node", run_reflection_repair)
    workflow.add_node("verification_gate_node", run_entity_and_claim_verification)
    workflow.add_node("export_node", run_deterministic_exporters)

    # 2. Pipeline Edges
    workflow.set_entry_point("ingestion_node")
    workflow.add_edge("ingestion_node", "context_node")
    workflow.add_edge("context_node", "generator_node")
    workflow.add_edge("generator_node", "reflection_node")

    workflow.add_conditional_edges(
        "reflection_node",
        check_reflection,
        {
            "retry_reflection": "generator_node",
            "proceed_to_gate": "verification_gate_node"
        }
    )

    workflow.add_conditional_edges(
        "verification_gate_node",
        check_hard_gate,
        {
            "pause_for_human": END,
            "proceed_to_export": "export_node"
        }
    )

    workflow.add_edge("export_node", END)

    memory = MemorySaver()
    compiled_app = workflow.compile(checkpointer=memory)
    return compiled_app


# Singleton compiled app instance for the runtime
app = build_graph()
