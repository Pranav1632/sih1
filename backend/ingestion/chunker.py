"""
backend/ingestion/chunker.py - Coordinate-Aware Document Chunker.
Owned by: Ingestion Engineer (Task 3).

Splits raw text and layout-extracted content into coordinate-indexed chunks
matching the exact schema specified in BUILD.md and fixtures/mock_source_chunks.json.
Preserves character offsets (char_start, char_end), page boundaries, and timestamps.
"""

import re
from typing import Any, Dict, List, Optional

try:
    import spacy
    _NLP = spacy.load("en_core_web_sm")
except Exception:
    _NLP = None


def extract_entities_from_text(text: str) -> List[Dict[str, str]]:
    """
    Extracts named entities (ORG, TECH/PRODUCT, GPE, DATE, etc.) from chunk text.
    Uses spaCy if loaded; falls back to regex-based heuristic extraction.
    """
    if not text or not text.strip():
        return []

    entities = []
    seen = set()

    if _NLP is not None:
        try:
            doc = _NLP(text)
            for ent in doc.ents:
                ent_text = ent.text.strip()
                if len(ent_text) > 1 and ent_text.lower() not in seen:
                    label = ent.label_
                    if label in ("PRODUCT", "LAW", "FAC"):
                        label = "TECH"
                    elif label in ("NORP", "PERSON", "ORG", "GPE", "DATE"):
                        pass
                    else:
                        label = ent.label_
                    entities.append({"text": ent_text, "label": label})
                    seen.add(ent_text.lower())
            return entities
        except Exception:
            pass

    # Heuristic fallback if spaCy is unavailable
    # Match capitalized phrases (like "Cyber Resilience Unit", "Directorate of Power Grid Resilience")
    pattern = r"\b[A-Z][a-z]+(?:\s+(?:of|and|for|the|[A-Z][a-z]+))*\b"
    for match in re.finditer(pattern, text):
        phrase = match.group(0).strip()
        if len(phrase.split()) >= 2 and phrase.lower() not in seen:
            entities.append({"text": phrase, "label": "ORG"})
            seen.add(phrase.lower())

    return entities


def chunk_text(
    raw_text: str,
    coordinates: Optional[Dict[str, Any]] = None,
    max_chunk_size: int = 500,
    overlap: int = 50,
    extract_entities: bool = True,
) -> List[Dict[str, Any]]:
    """
    Splits raw text into coordinate-aware chunks adhering to the locked SEI schema.

    Parameters:
    - raw_text: Text content to chunk.
    - coordinates: Dictionary with coordinate context:
        - doc_id: str (default 'doc_01')
        - source_name: str (default 'source_document')
        - source_role: str ('PRIMARY' or 'SUPPORTING', default 'PRIMARY')
        - page_number: Optional[int] (default 1)
        - timestamp_start: Optional[float] (default None)
        - timestamp_end: Optional[float] (default None)
        - base_char_offset: int (default 0)
        - chunk_index_offset: int (default 1)
    - max_chunk_size: Maximum character length per chunk (default 500).
    - overlap: Character overlap between consecutive chunks (default 50).
    - extract_entities: Whether to run entity extraction on each chunk (default True).

    Returns:
    - List of chunk dictionaries matching fixtures/mock_source_chunks.json.
    """
    if not raw_text or not raw_text.strip():
        return []

    coords = coordinates or {}
    doc_id = str(coords.get("doc_id", "doc_01"))
    source_name = str(coords.get("source_name", "source_document"))
    source_role = str(coords.get("source_role", "PRIMARY"))
    page_number = coords.get("page_number")
    timestamp_start = coords.get("timestamp_start")
    timestamp_end = coords.get("timestamp_end")
    base_char_offset = int(coords.get("base_char_offset", 0))
    chunk_index_offset = int(coords.get("chunk_index_offset", 1))

    text_len = len(raw_text)

    # Case 1: Text fits inside a single chunk
    if text_len <= max_chunk_size:
        entities = extract_entities_from_text(raw_text) if extract_entities else []
        chunk_id = f"{doc_id}_chunk_{chunk_index_offset:02d}"
        return [
            {
                "chunk_id": chunk_id,
                "doc_id": doc_id,
                "source_name": source_name,
                "source_role": source_role,
                "page_number": page_number,
                "timestamp_start": timestamp_start,
                "timestamp_end": timestamp_end,
                "char_start": base_char_offset,
                "char_end": base_char_offset + text_len,
                "text": raw_text.strip(),
                "extracted_entities": entities,
            }
        ]

    # Case 2: Multi-chunk splitting with sentence boundary detection
    chunks = []
    current_start = 0
    chunk_idx = chunk_index_offset

    while current_start < text_len:
        target_end = min(current_start + max_chunk_size, text_len)

        if target_end < text_len:
            # Look backwards from target_end for a natural sentence break
            break_window = raw_text[current_start:target_end]
            sentence_breaks = [m.end() for m in re.finditer(r"[.!?]\s+|\n\n|\n", break_window)]

            if sentence_breaks and sentence_breaks[-1] > int(max_chunk_size * 0.4):
                split_point = current_start + sentence_breaks[-1]
            else:
                # Fallback to word boundary
                space_break = raw_text.rfind(" ", current_start, target_end)
                if space_break > current_start + int(max_chunk_size * 0.4):
                    split_point = space_break + 1
                else:
                    split_point = target_end
        else:
            split_point = text_len

        chunk_text_slice = raw_text[current_start:split_point].strip()

        if chunk_text_slice:
            actual_start_offset = current_start
            actual_end_offset = split_point
            entities = extract_entities_from_text(chunk_text_slice) if extract_entities else []
            chunk_id = f"{doc_id}_chunk_{chunk_idx:02d}"

            chunks.append(
                {
                    "chunk_id": chunk_id,
                    "doc_id": doc_id,
                    "source_name": source_name,
                    "source_role": source_role,
                    "page_number": page_number,
                    "timestamp_start": timestamp_start,
                    "timestamp_end": timestamp_end,
                    "char_start": base_char_offset + actual_start_offset,
                    "char_end": base_char_offset + actual_end_offset,
                    "text": chunk_text_slice,
                    "extracted_entities": entities,
                }
            )
            chunk_idx += 1

        if split_point >= text_len:
            break

        # Move forward, maintaining overlap
        current_start = max(split_point - overlap, current_start + 1)

    return chunks
