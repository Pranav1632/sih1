"""
backend/orchestration/state.py - LangGraph AgentState Definition.
Owned by: Orchestration Lead.
Shared contract across all engineering roles.
"""

from typing import TypedDict, List, Dict, Any, Optional


class AgentState(TypedDict, total=False):
    """
    Central shared state contract for the Sentinel-Transform LangGraph pipeline.
    Defined in BUILD.md and BUILD_01_orchestration_lead.md.
    """
    job_id: str
    uploaded_files: List[Dict[str, Any]]
    primary_doc_id: str
    source_chunks: List[Dict[str, Any]]        # Written by Ingestion Engineer
    context_summary: str
    extracted_entities: List[Dict[str, Any]]   # Written by Ingestion Engineer
    merged_context: Dict[str, Any]
    parameters: Dict[str, Any]                 # Written by Frontend via API
    requested_formats: List[str]               # Written by Frontend via API
    draft_outputs: Dict[str, Any]              # Written by LLM/Prompt Engineer
    reflection_attempts: Dict[str, int]        # Format -> retry count
    schema_errors: Optional[Dict[str, Any]]    # Written by Verification Engineer
    claim_verifications: List[Dict[str, Any]]  # Written by Verification Engineer
    entity_discrepancies: List[Dict[str, Any]] # Written by Verification Engineer
    hard_gate_triggered: bool                  # Written by Verification Engineer
    human_approved: bool                       # Written by Backend via review endpoint
    human_corrections: Dict[str, Any]
    exported_files: Dict[str, str]             # Written by Backend/Export Engineer


def get_empty_agent_state(job_id: str = "") -> AgentState:
    """
    Returns an AgentState dictionary with all required keys initialized to empty defaults.
    Ensures complete key coverage for Day 1 stub execution and testing.
    """
    return {
        "job_id": job_id,
        "uploaded_files": [],
        "primary_doc_id": "",
        "source_chunks": [],
        "context_summary": "",
        "extracted_entities": [],
        "merged_context": {},
        "parameters": {},
        "requested_formats": [],
        "draft_outputs": {},
        "reflection_attempts": {},
        "schema_errors": None,
        "claim_verifications": [],
        "entity_discrepancies": [],
        "hard_gate_triggered": False,
        "human_approved": False,
        "human_corrections": {},
        "exported_files": {},
    }
