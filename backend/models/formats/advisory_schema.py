"""
backend/models/formats/advisory_schema.py - Intelligence Advisory Pydantic Schema.
Owned by: LLM/Prompt Engineer (Role #3).
Per build_specifications/02_ingestion_schemas_and_orchestration.md Section 2.1.
"""

from typing import List
from pydantic import BaseModel, Field


class AdvisorySchema(BaseModel):
    """Deliverable F3: Formal Intelligence Advisory document."""
    advisory_id: str = Field(description="Generated reference code e.g. NTRO-ADV-2026-09")
    title: str = Field(description="Formal threat title")
    severity_level: str = Field(description="CRITICAL | HIGH | MEDIUM | LOW")
    threat_overview: str = Field(description="Detailed mechanism and threat actor attribution")
    affected_systems: List[str] = Field(default_factory=list, description="Hardware, software, protocols targeted")
    indicators_of_compromise: List[str] = Field(default_factory=list, description="IPs, hashes, file paths, C2 domains")
    recommended_mitigations: List[str] = Field(default_factory=list, description="Immediate actionable countermeasures")
    compliance_and_governance: str = Field(description="Regulatory / reporting requirements")
    cited_chunk_ids: List[str] = Field(default_factory=list)
