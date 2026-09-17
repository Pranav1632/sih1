"""
backend/ingestion/source_governance.py - Source Governance & Conflict Detection.
Owned by: Ingestion Engineer (Task 3).

Implements:
1. Authority weighting:
   - PRIMARY DOCUMENT: 1.0 (Absolute Authority)
   - SUPPORTING CONTEXT: 0.5 (Contextual Backdrop)
2. Numerical and factual conflict detection:
   - Compares claims across Primary vs Supporting chunks.
   - Flags discrepancies (e.g. '2 endpoints' vs '14 endpoints').
   - Guarantees Primary document remains authoritative.
"""

import re
from typing import Any, Dict, List, Optional, Set, Tuple

WORD_TO_NUM = {
    "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4,
    "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9,
    "ten": 10, "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14,
    "fifteen": 15, "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19,
    "twenty": 20, "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60,
    "seventy": 70, "eighty": 80, "ninety": 90, "hundred": 100, "thousand": 1000
}


def _parse_quantity(num_str: str) -> Optional[int]:
    """Converts a numerical string or English number word to integer."""
    clean = num_str.lower().strip()
    if clean.isdigit():
        return int(clean)
    return WORD_TO_NUM.get(clean)


def _extract_numerical_claims(text: str) -> List[Dict[str, Any]]:
    """
    Extracts numerical quantifier claims with their subject nouns.
    Example: 'two endpoints were infected' -> value: 2, subject: 'endpoints', context: 'two endpoints'
    """
    claims = []
    # Pattern: number or number-word followed by optional words and a noun
    num_words_regex = "|".join(WORD_TO_NUM.keys())
    pattern = rf"\b(\d+|{num_words_regex})\s+([a-zA-Z_\-]+(?:\s+[a-zA-Z_\-]+)?)\b"

    for match in re.finditer(pattern, text, flags=re.IGNORECASE):
        num_raw = match.group(1)
        subject_raw = match.group(2).lower()
        val = _parse_quantity(num_raw)

        if val is None:
            continue

        # Filter out common stop-word subjects (e.g. "of them", "in the", "years old")
        stop_nouns = {"of", "in", "at", "to", "for", "on", "with", "by", "percent", "%", "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december", "am", "pm", "hours", "minutes", "seconds"}
        words = subject_raw.split()
        if not words or words[0] in stop_nouns:
            continue

        # Stem/lemmatize simple plurals for matching
        clean_subject = words[0].rstrip("s") if len(words[0]) > 3 and words[0].endswith("s") else words[0]

        claims.append({
            "raw_text": match.group(0),
            "value": val,
            "raw_value": num_raw,
            "subject": clean_subject,
            "full_subject": subject_raw,
            "char_start": match.start(),
            "char_end": match.end(),
        })

    return claims


def detect_conflicts(
    primary_chunks: List[Dict[str, Any]],
    supporting_chunks: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Detects contradictions between primary document chunks and supporting document chunks.
    Identifies numerical discrepancies and flags them with PRIMARY_AUTHORITATIVE resolution.
    """
    conflicts: List[Dict[str, Any]] = []
    conflict_counter = 1

    # 1. Index primary claims by subject
    primary_claims: Dict[str, List[Tuple[Dict[str, Any], Dict[str, Any]]]] = {}
    for p_chunk in primary_chunks:
        p_text = p_chunk.get("text", "")
        extracted = _extract_numerical_claims(p_text)
        for claim in extracted:
            subj = claim["subject"]
            primary_claims.setdefault(subj, []).append((p_chunk, claim))

    # 2. Compare supporting claims against primary baseline
    seen_pairs: Set[str] = set()

    for s_chunk in supporting_chunks:
        s_text = s_chunk.get("text", "")
        extracted = _extract_numerical_claims(s_text)

        for s_claim in extracted:
            subj = s_claim["subject"]
            if subj in primary_claims:
                for p_chunk, p_claim in primary_claims[subj]:
                    # Check for value contradiction
                    if p_claim["value"] != s_claim["value"]:
                        pair_key = f"{subj}_{p_claim['value']}_{s_claim['value']}"
                        if pair_key in seen_pairs:
                            continue
                        seen_pairs.add(pair_key)

                        conflict_id = f"conflict_{conflict_counter:02d}"
                        conflict_counter += 1

                        description = (
                            f"Numerical conflict on '{subj}': Primary document ({p_chunk.get('doc_id')}) "
                            f"asserts {p_claim['raw_value']} ({p_claim['raw_text']}), whereas supporting "
                            f"source ({s_chunk.get('doc_id')}) claims {s_claim['raw_value']} ({s_claim['raw_text']}). "
                            f"Primary value {p_claim['value']} retained as authoritative."
                        )

                        conflicts.append({
                            "conflict_id": conflict_id,
                            "conflict_type": "NUMERICAL_DISCREPANCY",
                            "subject": subj,
                            "primary_doc_id": p_chunk.get("doc_id"),
                            "primary_chunk_id": p_chunk.get("chunk_id"),
                            "primary_value": p_claim["value"],
                            "primary_text": p_claim["raw_text"],
                            "supporting_doc_id": s_chunk.get("doc_id"),
                            "supporting_chunk_id": s_chunk.get("chunk_id"),
                            "supporting_value": s_claim["value"],
                            "supporting_text": s_claim["raw_text"],
                            "resolution": "PRIMARY_AUTHORITATIVE",
                            "authority_weight_applied": 1.0,
                            "description": description,
                        })

    return conflicts


def apply_source_governance(
    chunks: List[Dict[str, Any]],
    primary_doc_id: Optional[str] = None,
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Applies deterministic source governance to parsed chunks:
    - Primary chunks: Authority Weight = 1.0 (Absolute Authority)
    - Supporting chunks: Authority Weight = 0.5 (Contextual Backdrop)
    - Detects numerical and factual conflicts, keeping Primary authoritative.

    Parameters:
    - chunks: List of chunk dictionaries.
    - primary_doc_id: Identifier of the primary source document. If None,
                      infers from first chunk or existing PRIMARY role.

    Returns:
    - Tuple: (weighted_chunks, conflicts_list)
    """
    if not chunks:
        return [], []

    # 1. Determine primary_doc_id
    if not primary_doc_id:
        # Check if any chunk is already designated as PRIMARY
        for c in chunks:
            if c.get("source_role") == "PRIMARY":
                primary_doc_id = c.get("doc_id")
                break
        # Otherwise default to first chunk's doc_id
        if not primary_doc_id:
            primary_doc_id = chunks[0].get("doc_id", "doc_01")

    # 2. Assign authority weights and roles
    weighted_chunks: List[Dict[str, Any]] = []
    primary_chunks: List[Dict[str, Any]] = []
    supporting_chunks: List[Dict[str, Any]] = []

    for c in chunks:
        chunk_copy = dict(c)
        doc_id = chunk_copy.get("doc_id")

        if doc_id == primary_doc_id:
            chunk_copy["source_role"] = "PRIMARY"
            chunk_copy["authority_weight"] = 1.0
            primary_chunks.append(chunk_copy)
        else:
            chunk_copy["source_role"] = "SUPPORTING"
            chunk_copy["authority_weight"] = 0.5
            supporting_chunks.append(chunk_copy)

        weighted_chunks.append(chunk_copy)

    # 3. Detect conflicts between primary and supporting documents
    conflicts = detect_conflicts(primary_chunks, supporting_chunks)

    return weighted_chunks, conflicts
