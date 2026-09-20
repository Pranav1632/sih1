"""
backend/orchestration/node_stubs.py - Day 1 Node Function Stubs.
Owned by: Orchestration Lead.

These stub functions define the exact contract signatures for all 6 pipeline nodes.
Other teammates will replace these stub functions with their real implementations:
- Ingestion Engineer: run_ingestion_and_normalization
- LLM/Prompt Engineer: run_context_and_entity_extraction, run_parallel_format_generation
- Verification Engineer: run_reflection_repair, run_entity_and_claim_verification
- Backend/Export Engineer: run_deterministic_exporters
"""

import os
from typing import Dict, Any
from backend.orchestration.state import AgentState


def run_ingestion_and_normalization(state: AgentState) -> Dict[str, Any]:
    """
    Node 1: Ingestion & Normalizer Node.
    Owned by: Ingestion Engineer (ingestion.normalizer.run_ingestion_and_normalization).
    Extracts, coordinates, and normalizes uploaded documents into source_chunks.
    """
    return {
        "source_chunks": state.get("source_chunks", []),
        "primary_doc_id": state.get("primary_doc_id", "doc_01"),
        "uploaded_files": state.get("uploaded_files", []),
    }


def run_context_and_entity_extraction(state: AgentState) -> Dict[str, Any]:
    """
    Node 2: Context & Entity Extraction Node.
    Owned by: Ingestion Engineer / LLM Engineer.
    Extracts named entities and merges context for prompt construction.
    """
    return {
        "context_summary": state.get("context_summary", "Stub context summary"),
        "extracted_entities": state.get("extracted_entities", []),
        "merged_context": state.get("merged_context", {}),
    }


def run_parallel_format_generation(state: AgentState) -> Dict[str, Any]:
    """
    Node 3: Parallel Format Generators Node.
    Owned by: LLM/Prompt Engineer (generation.generator_node.run_parallel_format_generation).
    Generates draft deliverables conforming to the 7 Pydantic schemas.
    """
    return {
        "draft_outputs": state.get("draft_outputs", {}),
        "requested_formats": state.get("requested_formats", []),
        "parameters": state.get("parameters", {}),
    }


def run_reflection_repair(state: AgentState) -> Dict[str, Any]:
    """
    Node 4: Reflection Check & Targeted Repair Node.
    Owned by: Verification Engineer (verification.reflection.run_reflection_repair).
    Performs schema validation and increments reflection_attempts if repair needed.
    """
    reflection_attempts = dict(state.get("reflection_attempts", {}))
    # In no-op stub mode, no errors are introduced unless already present in state
    return {
        "reflection_attempts": reflection_attempts,
        "schema_errors": state.get("schema_errors", None),
    }


def run_entity_and_claim_verification(state: AgentState) -> Dict[str, Any]:
    """
    Node 5: Entity Verification Gate Node.
    Owned by: Verification Engineer (verification.gate_node.run_entity_and_claim_verification).
    Runs spaCy + RapidFuzz to flag entity discrepancies and set hard_gate_triggered.
    """
    params = state.get("parameters", {})
    simulate_gate = params.get("simulate_hard_gate", False)
    human_approved = state.get("human_approved", False)

    if simulate_gate and not human_approved:
        return {
            "hard_gate_triggered": True,
            "entity_discrepancies": [
                {
                    "draft_entity": "Directorate of Grid Power Resilience",
                    "suggested_source_entity": "Directorate of Power Grid Resilience",
                    "similarity_score": 86.1,
                    "status": "FLAGGED_MISMATCH",
                }
            ],
            "claim_verifications": state.get("claim_verifications", []),
            "human_approved": False,
            "human_corrections": state.get("human_corrections", {}),
        }

    try:
        from backend.verification.gate_node import run_entity_and_claim_verification as real_gate
        return real_gate(state)
    except Exception:
        return {
            "claim_verifications": state.get("claim_verifications", []),
            "entity_discrepancies": state.get("entity_discrepancies", []),
            "hard_gate_triggered": state.get("hard_gate_triggered", False),
            "human_approved": human_approved,
            "human_corrections": state.get("human_corrections", {}),
        }


def run_deterministic_exporters(state: AgentState) -> Dict[str, Any]:
    """
    Node 6: Deterministic Exporter Node.
    Owned by: Backend/Export Engineer (exporters.pptx_exporter, exporters.docx_exporter).
    Exports validated schemas into real .pptx presentations and .docx advisories.
    """
    exported_files = dict(state.get("exported_files", {}))
    drafts = state.get("draft_outputs", {})
    job_id = state.get("job_id", "job_default")

    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
    os.makedirs(data_dir, exist_ok=True)

    try:
        from backend.exporters.pptx_exporter import export_pptx
        from backend.exporters.docx_exporter import export_docx

        if "presentation" in drafts:
            pptx_path = os.path.join(data_dir, f"{job_id}_presentation.pptx")
            export_pptx(drafts["presentation"], pptx_path)
            exported_files["presentation"] = pptx_path

        if "advisory" in drafts:
            docx_path = os.path.join(data_dir, f"{job_id}_advisory.docx")
            export_docx(drafts["advisory"], docx_path)
            exported_files["advisory"] = docx_path
    except Exception as e:
        pass

    return {
        "exported_files": exported_files,
    }
