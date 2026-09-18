from typing import List
from pydantic import BaseModel, Field


class AdvisorySchema(BaseModel):
    advisory_id: str = Field(description="Generated reference code e.g. NTRO-ADV-2026-09")
    title: str = Field(description="Formal threat title")
    severity_level: str = Field(description="CRITICAL | HIGH | MEDIUM | LOW")
    threat_overview: str = Field(description="Detailed mechanism and threat actor attribution")
    affected_systems: List[str] = Field(description="Hardware, software, protocols targeted")
    indicators_of_compromise: List[str] = Field(description="IPs, hashes, file paths, C2 domains")
    recommended_mitigations: List[str] = Field(description="Immediate actionable countermeasures")
    compliance_and_governance: str = Field(description="Regulatory / reporting requirements")
    cited_chunk_ids: List[str] = Field(default_factory=list)
