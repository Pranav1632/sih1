"""
backend/models/formats/linkedin_schema.py - LinkedIn Post Pydantic Schema.
Owned by: LLM/Prompt Engineer (Role #3).
Per build_specifications/02_ingestion_schemas_and_orchestration.md Section 2.1.
"""

from typing import List
from pydantic import BaseModel, Field


class LinkedInSchema(BaseModel):
    """Deliverable F1: LinkedIn thought-leadership and advisory post."""
    headline: str = Field(description="Punchy, professional title/hook")
    opening_hook: str = Field(description="First 2 lines designed to stop the scroll")
    body_paragraphs: List[str] = Field(default_factory=list, description="Core insights, formatted with spacing")
    key_takeaways: List[str] = Field(default_factory=list, description="3-4 bulleted high-impact takeaways")
    call_to_action: str = Field(description="Professional engagement or advisory prompt")
    hashtags: List[str] = Field(default_factory=list, description="5-8 relevant domain hashtags (#CyberSecurity, etc.)")
    cited_chunk_ids: List[str] = Field(default_factory=list, description="Source chunk IDs supporting the claims")
