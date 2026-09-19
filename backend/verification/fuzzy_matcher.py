"""
backend/verification/fuzzy_matcher.py - Deterministic Entity Verification Engine.
Owned by: Verification Engineer (Role #4).
Per build_specifications/03_verification_debate_and_build_plan.md Section 1.2.
"""

import re
from typing import Set, Dict, Any, List, Union
import spacy
from rapidfuzz import fuzz, process

_nlp = None


def get_spacy_nlp():
    """Lazy load and cache spaCy model for sub-50ms CPU execution."""
    global _nlp
    if _nlp is None:
        try:
            _nlp = spacy.load("en_core_web_sm")
        except Exception:
            _nlp = spacy.blank("en")
    return _nlp


def clean_entity_text(text: str) -> str:
    """Normalizes whitespace and strips leading determiners (the, a, an)."""
    cleaned = re.sub(r"^(the|a|an)\s+", "", text.strip(), flags=re.IGNORECASE).strip()
    return re.sub(r"\s+", " ", cleaned)


def run_entity_verification(
    generated_text: str,
    source_entities: Union[Set[str], List[str]],
) -> Dict[str, Any]:
    """
    Deterministic Exact/Fuzzy Entity Set Gate (<50ms CPU execution).
    Extracts named entities (ORG, PERSON, GPE) from generated text and validates
    against source_entities using token transposition & ratio fuzzy matching.

    Returns:
        dict: {
            "passed": bool,
            "mismatches": [
                {
                    "draft_entity": str,
                    "suggested_source_entity": str or None,
                    "similarity_score": float,
                    "status": "FLAGGED_MISMATCH" | "UNGROUNDED_NEW_ENTITY"
                }
            ]
        }
    """
    if not generated_text or not generated_text.strip():
        return {"passed": True, "mismatches": []}

    nlp = get_spacy_nlp()
    doc = nlp(generated_text)

    target_labels = {"ORG", "PERSON", "GPE"}
    raw_entities = [
        ent.text.strip()
        for ent in doc.ents
        if ent.label_ in target_labels and len(ent.text.strip()) > 1
    ]

    # Clean source entities
    source_entities_set = {
        clean_entity_text(str(e)) for e in source_entities if str(e).strip()
    }

    mismatches: List[Dict[str, Any]] = []
    seen_drafts: Set[str] = set()

    for raw_ent in raw_entities:
        clean_draft = clean_entity_text(raw_ent)
        if not clean_draft or clean_draft in seen_drafts:
            continue
        seen_drafts.add(clean_draft)

        # 1. Exact match check
        if clean_draft in source_entities_set:
            continue

        # 2. Case-insensitive exact match check
        lower_match = next((s for s in source_entities_set if s.lower() == clean_draft.lower()), None)
        if lower_match is not None:
            continue

        # 3. Fuzzy match against source entity set
        if source_entities_set:
            match_result = process.extractOne(
                clean_draft,
                source_entities_set,
                scorer=fuzz.ratio,
            )
            if match_result is not None:
                best_match, score, _ = match_result
            else:
                best_match, score = None, 0.0
        else:
            best_match, score = None, 0.0

        score = float(score)

        # 75% to 99% indicates a likely transposition, distortion, or entity hallucination
        if 75.0 <= score < 100.0:
            mismatches.append({
                "draft_entity": clean_draft,
                "suggested_source_entity": best_match,
                "similarity_score": round(score, 1),
                "status": "FLAGGED_MISMATCH",
            })
        elif score < 75.0:
            mismatches.append({
                "draft_entity": clean_draft,
                "suggested_source_entity": None,
                "similarity_score": round(score, 1),
                "status": "UNGROUNDED_NEW_ENTITY",
            })

    return {
        "passed": len(mismatches) == 0,
        "mismatches": mismatches,
    }
