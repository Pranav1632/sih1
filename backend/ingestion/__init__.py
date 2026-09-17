"""
backend/ingestion package.
Owned by: Ingestion Engineer.

Exposes:
- SEIStore: SQLite Source Evidence Index store
- chunk_text: Coordinate-aware document chunker
- apply_source_governance: 1.0/0.5 source role weighting and conflict detector
- run_ingestion_and_normalization: LangGraph AgentState node function
- parse_pdf, parse_docx, parse_image, parse_audio_video, parse_text, parse_file: Multimodal parsers
"""

from backend.ingestion.chunker import chunk_text, extract_entities_from_text
from backend.ingestion.normalizer import run_ingestion_and_normalization
from backend.ingestion.parsers import (
    parse_audio_video,
    parse_docx,
    parse_file,
    parse_image,
    parse_pdf,
    parse_text,
)
from backend.ingestion.sei_store import SEIStore
from backend.ingestion.source_governance import apply_source_governance, detect_conflicts

__all__ = [
    "SEIStore",
    "chunk_text",
    "extract_entities_from_text",
    "parse_pdf",
    "parse_docx",
    "parse_image",
    "parse_audio_video",
    "parse_text",
    "parse_file",
    "apply_source_governance",
    "detect_conflicts",
    "run_ingestion_and_normalization",
]
