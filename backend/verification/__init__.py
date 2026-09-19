"""
backend/verification/__init__.py - Sentinel-Transform Verification Engine.
Owned by: Verification Engineer (Role #4).
"""

from backend.verification.fuzzy_matcher import run_entity_verification
from backend.verification.reflection import reflection_audit_pass, run_reflection_repair
from backend.verification.gate_node import run_entity_and_claim_verification

__all__ = [
    "run_entity_verification",
    "reflection_audit_pass",
    "run_reflection_repair",
    "run_entity_and_claim_verification",
]
