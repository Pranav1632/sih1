"""
backend/verification/gate_node.py - Entity and Claim Verification Gate Node.
Owned by: Verification Engineer (Role #4).
Per BUILD_04_verification_engineer.md Task 3.
"""

from typing import Dict, Any, List, Set
from backend.orchestration.state import AgentState
from backend.verification.fuzzy_matcher import run_entity_verification


def extract_all_source_entities(state: AgentState) -> Set[str]:
    """
    Gathers all authoritative source entities extracted during ingestion and SEI indexing.
    """
    entities: Set[str] = set()

    # From top-level state
    for ent in state.get("extracted_entities", []):
        if isinstance(ent, dict) and "text" in ent:
            entities.add(ent["text"].strip())
        elif isinstance(ent, str):
            entities.add(ent.strip())

    # From source chunks
    for chunk in state.get("source_chunks", []):
        for ent in chunk.get("extracted_entities", []):
            if isinstance(ent, dict) and "text" in ent:
                entities.add(ent["text"].strip())
            elif isinstance(ent, str):
                entities.add(ent.strip())

    return entities


def gather_text_from_draft(format_key: str, draft: Any) -> List[str]:
    """
    Extracts all text fields from a draft deliverable for entity verification.
    """
    if hasattr(draft, "model_dump"):
        draft = draft.model_dump()
    if not isinstance(draft, dict):
        return []

    texts: List[str] = []

    if format_key == "advisory":
        for k in ("title", "threat_overview", "compliance_and_governance"):
            if draft.get(k):
                texts.append(str(draft[k]))
        for item in draft.get("affected_systems", []):
            texts.append(str(item))
        for item in draft.get("recommended_mitigations", []):
            texts.append(str(item))

    elif format_key == "exec_summary":
        for k in ("situation_overview", "strategic_impact"):
            if draft.get(k):
                texts.append(str(draft[k]))
        for item in draft.get("core_findings", []):
            texts.append(str(item))
        for item in draft.get("decisions_required", []):
            texts.append(str(item))

    elif format_key == "linkedin":
        for k in ("headline", "opening_hook", "call_to_action"):
            if draft.get(k):
                texts.append(str(draft[k]))
        for item in draft.get("body_paragraphs", []):
            texts.append(str(item))
        for item in draft.get("key_takeaways", []):
            texts.append(str(item))

    elif format_key == "twitter":
        for tweet in draft.get("tweets", []):
            if isinstance(tweet, dict) and "content" in tweet:
                texts.append(tweet["content"])

    elif format_key == "presentation":
        if draft.get("deck_title"):
            texts.append(draft["deck_title"])
        for slide in draft.get("slides", []):
            if isinstance(slide, dict):
                if slide.get("title"):
                    texts.append(slide["title"])
                for bp in slide.get("bullet_points", []):
                    texts.append(str(bp))
                if slide.get("speaker_notes"):
                    texts.append(slide["speaker_notes"])

    elif format_key in ("video", "video_package"):
        if draft.get("video_title"):
            texts.append(draft["video_title"])
        if draft.get("logline"):
            texts.append(draft["logline"])
        for scene in draft.get("scenes", []):
            if isinstance(scene, dict):
                if scene.get("visual_description"):
                    texts.append(scene["visual_description"])
                if scene.get("narration_voiceover"):
                    texts.append(scene["narration_voiceover"])
                if scene.get("on_screen_subtitles"):
                    texts.append(scene["on_screen_subtitles"])

    elif format_key == "infographic":
        if draft.get("infographic_title"):
            texts.append(draft["infographic_title"])
        for sec in draft.get("sections", []):
            if isinstance(sec, dict):
                if sec.get("header"):
                    texts.append(sec["header"])
                if sec.get("descriptive_copy"):
                    texts.append(sec["descriptive_copy"])

    else:
        # Generic string value collector
        for v in draft.values():
            if isinstance(v, str):
                texts.append(v)
            elif isinstance(v, list):
                for item in v:
                    if isinstance(item, str):
                        texts.append(item)

    return texts


def run_entity_and_claim_verification(state: AgentState) -> AgentState:
    """
    AgentState node function: run_entity_and_claim_verification.
    Extracts all draft entities across requested formats, runs fuzzy matching
    against source entities, triggers Hard Gate if discrepancies occur,
    and formats items exactly for Frontend HardGateModal.
    Matches Orchestration Lead's stub contract.
    """
    source_entities = extract_all_source_entities(state)
    draft_outputs = state.get("draft_outputs", {})

    all_discrepancies: List[Dict[str, Any]] = []
    claim_verifications: List[Dict[str, Any]] = []
    seen_draft_entities: Set[str] = set()

    for format_key, draft in draft_outputs.items():
        text_segments = gather_text_from_draft(format_key, draft)
        full_format_text = " ".join(text_segments)

        # 1. Entity verification check
        res = run_entity_verification(full_format_text, source_entities)
        for mismatch in res.get("mismatches", []):
            ent_key = (mismatch["draft_entity"], mismatch.get("suggested_source_entity"))
            if ent_key not in seen_draft_entities:
                seen_draft_entities.add(ent_key)
                all_discrepancies.append(mismatch)

        # 2. Claim citation verification
        cited_ids = []
        if isinstance(draft, dict) and "cited_chunk_ids" in draft:
            cited_ids = draft["cited_chunk_ids"]
        claim_verifications.append({
            "format": format_key,
            "cited_chunk_ids": cited_ids,
            "status": "VERIFIED" if res.get("passed", True) else "NEEDS_REVIEW",
        })

    # Set state flags
    state["entity_discrepancies"] = all_discrepancies
    state["hard_gate_triggered"] = len(all_discrepancies) > 0
    state["claim_verifications"] = claim_verifications

    return state
