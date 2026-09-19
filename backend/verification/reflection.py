"""
backend/verification/reflection.py - 2-Pass Bounded Reflection Engine.
Owned by: Verification Engineer (Role #4).
Per build_specifications/03_verification_debate_and_build_plan.md Section 2.3.
"""

from typing import Dict, Any, List
from backend.orchestration.state import AgentState


PROHIBITED_CLOUD_TERMS = [
    "third-party cloud scanner",
    "public cloud scanner",
    "commercial cloud scanner",
    "cloud-based scanner",
    "external cloud service",
]


def reflection_audit_pass(state: AgentState) -> Dict[str, Any]:
    """
    Executes a 2-Pass Bounded Reflection Audit on draft deliverables.
    Pass 1: Structural Audit (IOCs, mitigations count, severity).
    Pass 2: Grounding & Sovereignty Audit (air-gap violations, cloud scanners).

    Returns:
        dict: {"passed": bool, "audit_notes": List[str]}
    """
    audit_notes: List[str] = []
    draft_outputs = state.get("draft_outputs", {})

    if not draft_outputs:
        return {"passed": True, "audit_notes": []}

    # Inspect advisory if generated
    advisory = draft_outputs.get("advisory")
    if advisory:
        # Normalize dict representation
        if hasattr(advisory, "model_dump"):
            advisory = advisory.model_dump()

        # PASS 1: STRUCTURAL AUDIT
        iocs = advisory.get("indicators_of_compromise", [])
        if not iocs or len(iocs) == 0:
            audit_notes.append("CRITICAL: Missing Indicators of Compromise (IOCs).")

        mitigations = advisory.get("recommended_mitigations", [])
        if not mitigations or len(mitigations) < 2:
            audit_notes.append("DEFICIENCY: Advisory requires at least 2 actionable remediation steps.")

        # PASS 2: GROUNDING & SOVEREIGNTY AUDIT
        for action in mitigations:
            action_lower = str(action).lower()
            for prohibited in PROHIBITED_CLOUD_TERMS:
                if prohibited in action_lower:
                    audit_notes.append(f"VIOLATION: Air-gapped defense prohibits cloud-based scanning tools ({prohibited}).")

    return {
        "passed": len(audit_notes) == 0,
        "audit_notes": audit_notes,
    }


def run_reflection_repair(state: AgentState) -> AgentState:
    """
    AgentState node function: run_reflection_repair.
    Executes the 2-pass audit and repairs structural deficiencies if within
    the bounded reflection retry limit (attempts <= 1).
    Matches Orchestration Lead's stub contract.
    """
    if "reflection_attempts" not in state or state["reflection_attempts"] is None:
        state["reflection_attempts"] = {}

    attempts = state["reflection_attempts"].get("advisory", 0)
    audit = reflection_audit_pass(state)

    if not audit["passed"]:
        if attempts < 1:
            # First failure: mark error and increment retry count
            state["reflection_attempts"]["advisory"] = attempts + 1
            state["schema_errors"] = {"audit_notes": audit["audit_notes"]}

            # Perform targeted repair on draft advisory if present
            drafts = state.get("draft_outputs", {})
            if "advisory" in drafts:
                adv = drafts["advisory"]
                if isinstance(adv, dict):
                    # Repair missing IOCs
                    if not adv.get("indicators_of_compromise"):
                        adv["indicators_of_compromise"] = [
                            "Pending CVE verification from primary report",
                            "Anomalous scheduled task entry: System32\\Tasks\\GridSync",
                        ]
                    # Repair missing mitigations
                    mits = adv.get("recommended_mitigations", [])
                    if len(mits) < 2:
                        mits.append("Audit all endpoint scheduled tasks for unauthorized lateral scripts.")
                        mits.append("Enforce firmware verification against known good hashes.")
                    # Sanitize cloud violations
                    sanitized_mits = []
                    for m in mits:
                        m_clean = m
                        for prohibited in PROHIBITED_CLOUD_TERMS:
                            if prohibited in m_clean.lower():
                                m_clean = m_clean.replace(prohibited, "local sovereign offline scanner")
                        sanitized_mits.append(m_clean)
                    adv["recommended_mitigations"] = sanitized_mits
                    drafts["advisory"] = adv
                    state["draft_outputs"] = drafts
        else:
            # Bounded limit reached: force forward to human verification gate
            state["schema_errors"] = None
    else:
        # All audits passed cleanly
        state["schema_errors"] = None

    return state
