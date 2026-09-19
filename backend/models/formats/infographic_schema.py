"""
backend/models/formats/infographic_schema.py - Infographic Spec Pydantic Schema.
Owned by: LLM/Prompt Engineer (Role #3).
Per build_specifications/02_ingestion_schemas_and_orchestration.md Section 2.1.
"""

from typing import List
from pydantic import BaseModel, Field


class InfographicSection(BaseModel):
    """Single modular section within an infographic specification."""
    section_order: int
    header: str
    key_statistic_or_callout: str
    descriptive_copy: str
    recommended_chart_type: str = Field(description="Bar Chart | Flowchart | Timeline | Metric Card")


class InfographicSchema(BaseModel):
    """Deliverable F7: Infographic content specification and visual layout."""
    infographic_title: str
    central_theme: str
    sections: List[InfographicSection] = Field(default_factory=list)
    cited_chunk_ids: List[str] = Field(default_factory=list)
