"""
backend/orchestration/graph.py - Sentinel-Transform LangGraph State Machine.
Owned by: Orchestration Lead.

Wires the 6 pipeline nodes, bounded reflection routing (<= 1 retry),
the Hard Gate pause/resume conditional edge, and MemorySaver checkpointing.
"""

from typing import Optional, List
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from backend.orchestration.state import AgentState, get_empty_agent_state
from backend.orchestration.node_stubs import (
    run_ingestion_and_normalization,
    run_context_and_entity_extraction,
    run_parallel_format_generation,
    run_reflection_repair,
    run_entity_and_claim_verification,
    run_deterministic_exporters,
)


def check_reflection(state: AgentState) -> str:
    """
    Conditional edge: Bounded reflection (hard cap <= 1 retry).
    Per 02_ingestion_schemas_and_orchestration.md Section 3.3.
    """
    max_retries = max(state.get("reflection_attempts", {}).values(), default=0)
    if state.get("schema_errors") and max_retries < 1:
        return "retry_reflection"
    return "proceed_to_gate"


def check_hard_gate(state: AgentState) -> str:
    """
    Conditional edge: Hard Gate verification check.
    If hard_gate_triggered is True and human_approved is False, halts execution before export.
    """
    if state.get("hard_gate_triggered", False) and not state.get("human_approved", False):
        return "pause_for_human"
    return "proceed_to_export"


def build_workflow() -> StateGraph:
    """
    Constructs and returns the uncompiled StateGraph for Sentinel-Transform.
    """
    workflow = StateGraph(AgentState)

    # 1. Add Processing Nodes
    workflow.add_node("ingestion_node", run_ingestion_and_normalization)
    workflow.add_node("context_node", run_context_and_entity_extraction)
    workflow.add_node("generator_node", run_parallel_format_generation)
    workflow.add_node("reflection_node", run_reflection_repair)
    workflow.add_node("verification_gate_node", run_entity_and_claim_verification)
    workflow.add_node("export_node", run_deterministic_exporters)

    # 2. Define Flow Edges
    workflow.set_entry_point("ingestion_node")
    workflow.add_edge("ingestion_node", "context_node")
    workflow.add_edge("context_node", "generator_node")
    workflow.add_edge("generator_node", "reflection_node")

    # 3. Conditional Edge: Bounded Reflection
    workflow.add_conditional_edges(
        "reflection_node",
        check_reflection,
        {
            "retry_reflection": "generator_node",
            "proceed_to_gate": "verification_gate_node",
        },
    )

    # 4. Conditional Edge: Hard Gate
    workflow.add_conditional_edges(
        "verification_gate_node",
        check_hard_gate,
        {
            "pause_for_human": END,  # Halts execution at checkpoint
            "proceed_to_export": "export_node",
        },
    )

    workflow.add_edge("export_node", END)
    return workflow


# Build the graph workflow
workflow = build_workflow()

# Compile persistent app with MemorySaver checkpointer and interrupt_before
memory = MemorySaver()
app = workflow.compile(
    checkpointer=memory,
    interrupt_before=["export_node"],
)


if __name__ == "__main__":
    import uuid

    sample_job_id = f"job_sample_{uuid.uuid4().hex[:8]}"
    print(f"[*] Running Day 1 no-op stub graph with job_id: {sample_job_id}")

    config = {"configurable": {"thread_id": sample_job_id}}
    initial_state = get_empty_agent_state(job_id=sample_job_id)

    final_state = app.invoke(initial_state, config=config)
    print("[+] Graph run completed successfully.")
    print(f"[+] Total state keys present: {len(final_state.keys())}")
    for key in sorted(final_state.keys()):
        print(f"    - {key}: {type(final_state[key]).__name__}")
