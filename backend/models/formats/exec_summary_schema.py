"""
backend/models/formats/exec_summary_schema.py - Executive Summary Pydantic Schema.
Owned by: LLM/Prompt Engineer (Role #3).
Per build_specifications/02_ingestion_schemas_and_orchestration.md Section 2.1.
"""

from typing import List
from pydantic import BaseModel, Field


class ExecSummarySchema(BaseModel):
    """Deliverable F4: Strategic Executive Briefing."""
    situation_overview: str = Field(description="1-paragraph strategic briefing for leaders")
    core_findings: List[str] = Field(default_factory=list, description="Top 3-5 critical factual discoveries")
    strategic_impact: str = Field(description="Financial, operational, or national security risk")
    decisions_required: List[str] = Field(default_factory=list, description="Immediate executive decisions needed")
    confidence_assessment: str = Field(description="HIGH | MODERATE | LOW analytical confidence")
    cited_chunk_ids: List[str] = Field(default_factory=list)
