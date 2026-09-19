"""
backend/models/formats/twitter_schema.py - Twitter/X Thread Pydantic Schema.
Owned by: LLM/Prompt Engineer (Role #3).
Per build_specifications/02_ingestion_schemas_and_orchestration.md Section 2.1.
"""

from typing import List
from pydantic import BaseModel, Field


class TweetItem(BaseModel):
    """Single tweet within a thread."""
    tweet_number: int = Field(description="Order in the thread (e.g. 1, 2, 3)")
    content: str = Field(description="Post text strictly <= 280 characters")
    character_count: int = Field(description="Exact character length")
    contains_media_placeholder: bool = Field(default=False)


class TwitterThreadSchema(BaseModel):
    """Deliverable F2: Twitter/X Post & Thread sequence."""
    thread_title: str
    total_tweets: int
    tweets: List[TweetItem] = Field(default_factory=list)
    cited_chunk_ids: List[str] = Field(default_factory=list)
