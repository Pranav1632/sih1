"""
backend/models/formats/video_package_schema.py - Video Production Package Pydantic Schema.
Owned by: LLM/Prompt Engineer (Role #3).
Per build_specifications/02_ingestion_schemas_and_orchestration.md Section 2.1.
"""

from typing import List
from pydantic import BaseModel, Field


class Scene(BaseModel):
    """Single video scene storyboard entry."""
    scene_number: int
    duration_seconds: int
    visual_description: str = Field(description="On-screen visual action, b-roll, graphics")
    narration_voiceover: str = Field(description="Exact spoken narration text")
    on_screen_subtitles: str = Field(description="Lower-third subtitle text")
    music_sound_cues: str = Field(default="", description="Audio tone and sound effects")


class VideoPackageSchema(BaseModel):
    """Deliverable F6: Video production package storyboard and narration script."""
    video_title: str
    target_duration: str
    logline: str
    scenes: List[Scene] = Field(default_factory=list)
    cited_chunk_ids: List[str] = Field(default_factory=list)
