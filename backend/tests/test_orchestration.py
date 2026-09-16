"""
backend/tests/test_orchestration.py - Unit and Integration Tests for Orchestration State Machine.
Owned by: Orchestration Lead.
Covers Tasks 1, 2, and 3 acceptance criteria.
"""

import pytest
from langgraph.checkpoint.memory import MemorySaver

from backend.orchestration.state import AgentState, get_empty_agent_state
from backend.orchestration.graph import (
    app,
    build_workflow,
    check_reflection,
    check_hard_gate,
)


def test_task_1_stub_graph_end_to_end():
    """
    Task 1 Acceptance Criteria:
    Running the stub graph with a sample job_id completes without error and returns
    an AgentState with all keys present (even if empty).
    """
    job_id = "test_job_task1_001"
    config = {"configurable": {"thread_id": job_id}}
    initial_state = get_empty_agent_state(job_id=job_id)

    # Invoke graph end-to-end
    result = app.invoke(initial_state, config=config)

    # Expected fields defined in BUILD.md
    expected_keys = {
        "job_id",
        "uploaded_files",
        "primary_doc_id",
        "source_chunks",
        "context_summary",
        "extracted_entities",
        "merged_context",
        "parameters",
        "requested_formats",
        "draft_outputs",
        "reflection_attempts",
        "schema_errors",
        "claim_verifications",
        "entity_discrepancies",
        "hard_gate_triggered",
        "human_approved",
        "human_corrections",
        "exported_files",
    }

    assert result is not None
    assert result.get("job_id") == job_id
    for key in expected_keys:
        assert key in result, f"Expected key '{key}' missing from resulting AgentState"


def test_task_2_check_reflection_logic():
    """
    Task 2 Acceptance Criteria:
    check_reflection(state) -> str exactly per Section 3.3.
    Max 1 retry, then force-forward to verification gate.
    A second reflection failure does NOT trigger a second retry.
    """
    # Case 1: No schema errors -> proceed directly
    state_no_error: AgentState = {
        "reflection_attempts": {},
        "schema_errors": None,
    }
    assert check_reflection(state_no_error) == "proceed_to_gate"

    # Case 2: Schema errors and 0 previous attempts -> retry reflection
    state_first_failure: AgentState = {
        "reflection_attempts": {"linkedin": 0},
        "schema_errors": {"linkedin": ["Missing key takeaways"]},
    }
    assert check_reflection(state_first_failure) == "retry_reflection"

    # Case 3: Schema errors and 1 previous attempt (second failure) -> hard cap reached, proceed to gate
    state_second_failure: AgentState = {
        "reflection_attempts": {"linkedin": 1},
        "schema_errors": {"linkedin": ["Still missing key takeaways"]},
    }
    assert check_reflection(state_second_failure) == "proceed_to_gate"

    # Case 4: Multiple formats, one already retried once (max >= 1) -> proceed to gate
    state_multi_formats: AgentState = {
        "reflection_attempts": {"linkedin": 1, "twitter": 0},
        "schema_errors": {"twitter": ["Tweet > 280 chars"]},
    }
    assert check_reflection(state_multi_formats) == "proceed_to_gate"


def test_task_3_check_hard_gate_logic():
    """
    Task 3 Acceptance Criteria:
    check_hard_gate(state) -> str conditional edge.
    If hard gate triggered and not human approved -> pause_for_human.
    Otherwise -> proceed_to_export.
    """
    # Case 1: Clean run (no discrepancy) -> proceed
    clean_state: AgentState = {
        "hard_gate_triggered": False,
        "human_approved": False,
    }
    assert check_hard_gate(clean_state) == "proceed_to_export"

    # Case 2: Discrepancy triggered and human has NOT approved -> pause
    discrepancy_state: AgentState = {
        "hard_gate_triggered": True,
        "human_approved": False,
    }
    assert check_hard_gate(discrepancy_state) == "pause_for_human"

    # Case 3: Discrepancy triggered BUT human has approved -> proceed
    approved_state: AgentState = {
        "hard_gate_triggered": True,
        "human_approved": True,
    }
    assert check_hard_gate(approved_state) == "proceed_to_export"


def test_task_3_hard_gate_pause_and_resume_execution():
    """
    Task 3 End-to-End Pause & Resume:
    1. Graph pauses at checkpoint when Hard Gate triggers (discrepancy found).
    2. Confirm graph halts before export node.
    3. Resume execution via app.update_state() + app.invoke(None, ...).
    4. Confirm run completes cleanly.
    """
    job_id = "test_hard_gate_pause_resume_001"
    config = {"configurable": {"thread_id": job_id}}

    # Custom graph instance with simulated gate trigger
    workflow = build_workflow()
    memory = MemorySaver()
    test_app = workflow.compile(
        checkpointer=memory,
        interrupt_before=["export_node"],
    )

    initial_state = get_empty_agent_state(job_id=job_id)
    # Simulate verification finding an entity discrepancy
    initial_state["hard_gate_triggered"] = True
    initial_state["entity_discrepancies"] = [
        {
            "found_entity": "Directorate of Grid Power Resilience",
            "source_entity": "Directorate of Power Grid Resilience",
            "similarity": 89.2,
        }
    ]

    # Run graph - it should pause at check_hard_gate because hard_gate_triggered=True and human_approved=False
    paused_state = test_app.invoke(initial_state, config=config)

    # Check state at halt: export_node must NOT have written exported_files
    assert paused_state.get("hard_gate_triggered") is True
    assert paused_state.get("human_approved") is False
    assert paused_state.get("exported_files") == {}

    # Verify checkpointer state snapshot
    checkpoint_state = test_app.get_state(config)
    assert checkpoint_state.values.get("hard_gate_triggered") is True

    # Operator approves in UI / review endpoint
    test_app.update_state(
        config=config,
        values={
            "human_approved": True,
            "human_corrections": {
                "Directorate of Grid Power Resilience": "Directorate of Power Grid Resilience"
            },
        },
    )

    # Resume execution with None input
    resumed_state = test_app.invoke(None, config=config)

    # Confirm run resumed and finished
    assert resumed_state.get("human_approved") is True
    assert "Directorate of Grid Power Resilience" in resumed_state.get("human_corrections", {})
