from typing import TypedDict, List, Dict, Any


class AgentState(TypedDict):
    job_id: str
    uploaded_files: List[Dict[str, Any]]
    primary_doc_id: str
    source_chunks: List[Dict[str, Any]]
    context_summary: str
    extracted_entities: List[Dict[str, Any]]
    merged_context: Dict[str, Any]
    parameters: Dict[str, Any]
    requested_formats: List[str]
    draft_outputs: Dict[str, Any]
    reflection_attempts: Dict[str, int]
    claim_verifications: List[Dict[str, Any]]
    entity_discrepancies: List[Dict[str, Any]]
    hard_gate_triggered: bool
    human_approved: bool
    human_corrections: Dict[str, Any]
    exported_files: Dict[str, str]
