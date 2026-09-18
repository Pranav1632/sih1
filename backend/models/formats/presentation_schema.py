from typing import List
from pydantic import BaseModel, Field


class Slide(BaseModel):
    slide_number: int
    title: str
    bullet_points: List[str] = Field(description="3-5 concise, hierarchical bullet points")
    visual_guidance: str = Field(description="Visual layout direction (e.g. 2-column chart)")
    speaker_notes: str = Field(description="Comprehensive script for the presenter")
    slide_reference_citations: List[str] = Field(default_factory=list)


class PresentationSchema(BaseModel):
    deck_title: str
    target_audience: str
    slides: List[Slide]
