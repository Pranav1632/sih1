"""
backend/ingestion/normalizer.py - Ingestion & Normalizer LangGraph Node.
Owned by: Ingestion Engineer (Task 4).

Connects raw file uploads into coordinate-aware source_chunks, runs multimodal
parsers, applies source governance weighting, detects conflicts, populates the
SEIStore, and returns updated AgentState keys matching Orchestration Lead's contract.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional

from backend.ingestion.chunker import chunk_text
from backend.ingestion.parsers import parse_file
from backend.ingestion.sei_store import SEIStore
from backend.ingestion.source_governance import apply_source_governance


def run_ingestion_and_normalization(
    state: Dict[str, Any],
    sei_store: Optional[SEIStore] = None,
) -> Dict[str, Any]:
    """
    Node 1: Ingestion & Normalizer Node.
    Contract signature matching backend.orchestration.node_stubs.run_ingestion_and_normalization.

    Inputs (from state):
    - state["uploaded_files"]: List of file descriptors:
        [{"path": str, "doc_id": str, "source_name": str, "source_role": str}, ...]
      or in-memory items with "text"/"content".
    - state["primary_doc_id"]: Optional override for primary source doc_id.
    - state["source_chunks"]: Pre-existing chunks if re-running or testing.

    Outputs (state updates):
    - "source_chunks": List of coordinate-indexed chunk dictionaries.
    - "primary_doc_id": Locked primary doc_id.
    - "uploaded_files": The input uploaded files list.
    - "extracted_entities": Consolidated list of entities extracted across all chunks.
    - "merged_context": Context dictionary including detected conflicts and summary stats.
    """
    uploaded_files = state.get("uploaded_files", [])
    primary_doc_id = state.get("primary_doc_id", "")
    existing_chunks = state.get("source_chunks", [])

    all_chunks: List[Dict[str, Any]] = []

    # 1. If source_chunks are already provided in state, start with them
    if existing_chunks:
        all_chunks.extend(existing_chunks)
    else:
        # 2. Process each uploaded file
        for idx, f_info in enumerate(uploaded_files, start=1):
            doc_id = f_info.get("doc_id", f"doc_{idx:02d}")
            source_name = f_info.get("source_name") or f_info.get("filename") or f"document_{idx}"
            source_role = f_info.get("source_role")

            if not source_role:
                if primary_doc_id and doc_id == primary_doc_id:
                    source_role = "PRIMARY"
                elif not primary_doc_id and idx == 1:
                    source_role = "PRIMARY"
                else:
                    source_role = "SUPPORTING"

            # Check if file path is provided on disk
            file_path = f_info.get("path") or f_info.get("file_path")
            if file_path and Path(file_path).exists():
                parsed_chunks = parse_file(
                    str(file_path),
                    doc_id=doc_id,
                    source_name=source_name,
                    source_role=source_role,
                )
                all_chunks.extend(parsed_chunks)
            elif "text" in f_info or "content" in f_info:
                raw_text = f_info.get("text") or f_info.get("content", "")
                coords = {
                    "doc_id": doc_id,
                    "source_name": source_name,
                    "source_role": source_role,
                    "page_number": f_info.get("page_number", 1),
                    "timestamp_start": f_info.get("timestamp_start"),
                    "timestamp_end": f_info.get("timestamp_end"),
                    "base_char_offset": 0,
                    "chunk_index_offset": 1,
                }
                parsed_chunks = chunk_text(raw_text, coordinates=coords)
                all_chunks.extend(parsed_chunks)

    # 3. Apply deterministic Source Governance (1.0 vs 0.5 weights + conflict detection)
    resolved_chunks, conflicts = apply_source_governance(
        all_chunks,
        primary_doc_id=primary_doc_id or None,
    )

    # Resolve locked primary_doc_id
    if not primary_doc_id:
        for c in resolved_chunks:
            if c.get("source_role") == "PRIMARY":
                primary_doc_id = c.get("doc_id", "doc_01")
                break
        if not primary_doc_id:
            primary_doc_id = "doc_01"

    # 4. Consolidate extracted entities
    seen_entities = set()
    extracted_entities: List[Dict[str, str]] = []
    for c in resolved_chunks:
        for ent in c.get("extracted_entities", []):
            key = (ent.get("text", "").lower(), ent.get("label", ""))
            if key not in seen_entities and ent.get("text"):
                seen_entities.add(key)
                extracted_entities.append(ent)

    # 5. Index into SEI SQLite Store
    store = sei_store or SEIStore()
    if resolved_chunks:
        store.insert_chunks(resolved_chunks)

    # 6. Merge context
    merged_context = dict(state.get("merged_context", {}))
    merged_context["conflicts"] = conflicts
    merged_context["total_chunks"] = len(resolved_chunks)
    merged_context["total_entities"] = len(extracted_entities)

    return {
        "source_chunks": resolved_chunks,
        "primary_doc_id": primary_doc_id,
        "uploaded_files": uploaded_files,
        "extracted_entities": extracted_entities,
        "merged_context": merged_context,
    }
