import os
import json
from typing import Dict, Any
from backend.orchestration.state import AgentState
from backend.exporters.pptx_exporter import export_pptx
from backend.exporters.docx_exporter import export_docx

FIXTURES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "fixtures"))
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))


def run_ingestion_and_normalization(state: AgentState) -> Dict[str, Any]:
    """Ingestion node stub: loads chunks from files or fixture."""
    chunks = state.get("source_chunks") or []
    if not chunks:
        chunks_path = os.path.join(FIXTURES_DIR, "mock_source_chunks.json")
        if os.path.exists(chunks_path):
            with open(chunks_path, "r", encoding="utf-8") as f:
                chunks = json.load(f)
    return {
        "source_chunks": chunks,
        "primary_doc_id": "doc_01"
    }


def run_context_and_entity_extraction(state: AgentState) -> Dict[str, Any]:
    """Context and entity extraction node stub."""
    return {
        "context_summary": "Substation control software firmware vulnerability analysis.",
        "extracted_entities": [
            {"text": "Cyber Resilience Unit", "label": "ORG"},
            {"text": "Directorate of Power Grid Resilience", "label": "ORG"},
            {"text": "substation control software", "label": "TECH"}
        ],
        "merged_context": {
            "incident": "Operation GhostLatch",
            "confirmed_infected": 2,
            "remediated": True
        }
    }


def run_parallel_format_generation(state: AgentState) -> Dict[str, Any]:
    """Format generation node stub: loads mock draft outputs or formats."""
    drafts = state.get("draft_outputs") or {}
    if not drafts:
        drafts_path = os.path.join(FIXTURES_DIR, "mock_draft_outputs.json")
        if os.path.exists(drafts_path):
            with open(drafts_path, "r", encoding="utf-8") as f:
                drafts = json.load(f)

    # If presentation was requested but not in fixture, supply presentation schema draft
    if "presentation" in state.get("requested_formats", []) or "pptx" in state.get("requested_formats", []):
        drafts["presentation"] = {
            "deck_title": "Operation GhostLatch Intelligence Briefing",
            "target_audience": "Critical Infrastructure Leadership",
            "slides": [
                {
                    "slide_number": 1,
                    "title": "Incident Containment Status",
                    "bullet_points": [
                        "Firmware vulnerability detected and isolated",
                        "Two endpoints confirmed affected and remediated",
                        "No operational outages incurred across grid"
                    ],
                    "visual_guidance": "2-column status dashboard layout",
                    "speaker_notes": "Presenting status for Operation GhostLatch containment.",
                    "slide_reference_citations": ["doc_01_chunk_01", "doc_01_chunk_02"]
                }
            ]
        }

    return {"draft_outputs": drafts}


def run_reflection_repair(state: AgentState) -> Dict[str, Any]:
    """Reflection repair node stub."""
    attempts = dict(state.get("reflection_attempts", {}))
    attempts["structural"] = attempts.get("structural", 0) + 1
    return {"reflection_attempts": attempts}


def run_entity_and_claim_verification(state: AgentState) -> Dict[str, Any]:
    """
    Verification gate node stub: checks for entity mismatches.
    If human has not yet approved, checks if test discrepancy is configured.
    """
    params = state.get("parameters", {})
    # Check if a test mismatch is requested (e.g. for Hard Gate testing)
    simulate_gate = params.get("simulate_hard_gate", False)
    human_approved = state.get("human_approved", False)

    if simulate_gate and not human_approved:
        discrepancies = [
            {
                "draft_entity": "Directorate of Grid Power Resilience",
                "source_entity": "Directorate of Power Grid Resilience",
                "similarity_score": 0.88,
                "issue": "Near-miss entity mismatch detected in draft output"
            }
        ]
        return {
            "hard_gate_triggered": True,
            "entity_discrepancies": discrepancies
        }

    return {
        "hard_gate_triggered": False,
        "entity_discrepancies": []
    }


def run_deterministic_exporters(state: AgentState) -> Dict[str, Any]:
    """
    Deterministic exporter node stub: compiles real .pptx and .docx files
    from draft_outputs.
    """
    job_id = state.get("job_id", "default_job")
    drafts = state.get("draft_outputs", {})
    exported = dict(state.get("exported_files", {}))

    # Export PPTX if present
    presentation_data = drafts.get("presentation")
    if presentation_data:
        pptx_path = os.path.join(DATA_DIR, f"{job_id}_export.pptx")
        export_pptx(presentation_data, pptx_path)
        exported["pptx"] = pptx_path

    # Export DOCX if present
    advisory_data = drafts.get("advisory")
    if advisory_data:
        docx_path = os.path.join(DATA_DIR, f"{job_id}_export.docx")
        export_docx(advisory_data, docx_path)
        exported["docx"] = docx_path

    return {"exported_files": exported}
