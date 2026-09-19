"""
backend/models/formats/presentation_schema.py - Presentation Deck Pydantic Schema.
Owned by: LLM/Prompt Engineer (Role #3).
Per build_specifications/02_ingestion_schemas_and_orchestration.md Section 2.1.
"""

from typing import List
from pydantic import BaseModel, Field


class Slide(BaseModel):
    """Single presentation slide."""
    slide_number: int
    title: str
    bullet_points: List[str] = Field(default_factory=list, description="3-5 concise, hierarchical bullet points")
    visual_guidance: str = Field(default="", description="Visual layout direction (e.g. 2-column chart)")
    speaker_notes: str = Field(default="", description="Comprehensive script for the presenter")
    slide_reference_citations: List[str] = Field(default_factory=list)


class PresentationSchema(BaseModel):
    """Deliverable F5: Multi-slide presentation deck."""
    deck_title: str
    target_audience: str
    slides: List[Slide] = Field(default_factory=list)
