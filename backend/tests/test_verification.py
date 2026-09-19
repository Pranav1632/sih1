"""
backend/tests/test_verification.py - Unit tests for Role #4 Verification Engineer.
Validates the <50ms CPU Entity Matcher, the deliberate transposition test case,
the 2-Pass Bounded Reflection audit, and the Hard Gate node execution.
"""

import time
import pytest
from backend.verification.fuzzy_matcher import run_entity_verification
from backend.verification.reflection import reflection_audit_pass, run_reflection_repair
from backend.verification.gate_node import (
    run_entity_and_claim_verification,
    extract_all_source_entities,
)
from backend.orchestration.state import get_empty_agent_state


class TestEntityVerificationMatcher:
    """Task 1: Deterministic Exact/Fuzzy Entity Set Gate tests."""

    def test_deliberate_transposition_flagged_mismatch(self):
        """
        The Flagship SIH Differentiator:
        Source: 'Directorate of Power Grid Resilience'
        Draft: 'Directorate of Grid Power Resilience'
        Must flag as FLAGGED_MISMATCH in the 75-99% similarity band.
        """
        source_entities = {"Directorate of Power Grid Resilience"}
        draft_text = (
            "The incident remediation was coordinated with the "
            "Directorate of Grid Power Resilience following the substation compromise."
        )

        res = run_entity_verification(draft_text, source_entities)

        assert not res["passed"], "Transposition should not pass verification"
        assert len(res["mismatches"]) == 1

        mismatch = res["mismatches"][0]
        assert mismatch["draft_entity"] == "Directorate of Grid Power Resilience"
        assert mismatch["suggested_source_entity"] == "Directorate of Power Grid Resilience"
        assert 75.0 <= mismatch["similarity_score"] < 100.0
        assert mismatch["status"] == "FLAGGED_MISMATCH"

    def test_sub_50ms_cpu_performance_benchmark(self):
        """Proves entity verification runs in under 50 milliseconds on realistic text."""
        source_entities = {
            "Directorate of Power Grid Resilience",
            "National Technical Research Organisation",
            "CERT-In",
            "Shadow Wolf",
        }
        realistic_advisory = """
        INCIDENT ADVISORY NTRO-ADV-2026-09
        On 14 September 2026, the Directorate of Power Grid Resilience identified unauthorized
        firmware exploitation targeting substation relay nodes. The National Technical Research
        Organisation verified that zero external data egress occurred. CERT-In mandates compliance
        monitoring. Remediation is active across all regional grids.
        """
        # Warmup
        run_entity_verification(realistic_advisory, source_entities)

        # Benchmark 5 iterations
        times = []
        for _ in range(5):
            t0 = time.perf_counter()
            res = run_entity_verification(realistic_advisory, source_entities)
            t1 = time.perf_counter()
            times.append((t1 - t0) * 1000)

        avg_ms = sum(times) / len(times)
        print(f"\n[+] Average CPU Verification Latency: {avg_ms:.2f} ms")
        assert avg_ms < 50.0, f"Verification took {avg_ms:.2f} ms, exceeding 50 ms budget"
        assert res["passed"] is True

    def test_ungrounded_new_entity_detected(self):
        """Validates that a completely fabricated entity (<75% similarity) is flagged as UNGROUNDED_NEW_ENTITY."""
        source_entities = {"Directorate of Power Grid Resilience"}
        draft_text = "The attack was executed in collaboration with Phantom Global Syndicate."

        res = run_entity_verification(draft_text, source_entities)
        assert not res["passed"]
        mismatch = next(m for m in res["mismatches"] if "Phantom Global Syndicate" in m["draft_entity"])
        assert mismatch["status"] == "UNGROUNDED_NEW_ENTITY"
        assert mismatch["similarity_score"] < 75.0

    def test_exact_match_passes_cleanly(self):
        """Exact matches must pass without generating mismatches."""
        source_entities = {"Directorate of Power Grid Resilience", "CERT-In"}
        draft_text = "Report submitted directly to the Directorate of Power Grid Resilience and CERT-In."

        res = run_entity_verification(draft_text, source_entities)
        assert res["passed"] is True
        assert len(res["mismatches"]) == 0


class TestTwoPassBoundedReflection:
    """Task 2: 2-Pass Bounded Reflection Audit tests."""

    def test_pass_1_catches_missing_iocs_and_insufficient_mitigations(self):
        state = get_empty_agent_state()
        state["draft_outputs"] = {
            "advisory": {
                "advisory_id": "ADV-01",
                "indicators_of_compromise": [],  # Missing
                "recommended_mitigations": ["Single mitigation"],  # < 2
            }
        }

        audit = reflection_audit_pass(state)
        assert audit["passed"] is False
        assert any("Missing Indicators of Compromise" in note for note in audit["audit_notes"])
        assert any("requires at least 2" in note for note in audit["audit_notes"])

    def test_pass_2_catches_cloud_scanner_sovereignty_violation(self):
        state = get_empty_agent_state()
        state["draft_outputs"] = {
            "advisory": {
                "advisory_id": "ADV-02",
                "indicators_of_compromise": ["CVE-2026-0001"],
                "recommended_mitigations": [
                    "Isolate infected substation endpoints",
                    "Scan network utilizing a third-party cloud scanner for rapid analysis",
                ],
            }
        }

        audit = reflection_audit_pass(state)
        assert audit["passed"] is False
        assert any("Air-gapped defense prohibits cloud-based scanning tools" in note for note in audit["audit_notes"])

    def test_run_reflection_repair_bounds_at_one_retry(self):
        state = get_empty_agent_state()
        state["draft_outputs"] = {
            "advisory": {
                "advisory_id": "ADV-03",
                "indicators_of_compromise": [],
                "recommended_mitigations": [],
            }
        }
        state["reflection_attempts"] = {"advisory": 0}

        # First pass: repair triggered, attempt count becomes 1
        repaired_state = run_reflection_repair(state)
        assert repaired_state["reflection_attempts"]["advisory"] == 1
        assert len(repaired_state["draft_outputs"]["advisory"]["recommended_mitigations"]) >= 2

        # Second pass: max retries reached, forces forward progress
        repaired_state["reflection_attempts"]["advisory"] = 1
        final_state = run_reflection_repair(repaired_state)
        assert final_state["schema_errors"] is None


class TestVerificationGateNode:
    """Task 3: Hard Gate node execution and frontend state contract."""

    def test_gate_triggers_on_entity_transposition(self):
        state = get_empty_agent_state(job_id="test_gate_job_001")
        state["extracted_entities"] = [{"text": "Directorate of Power Grid Resilience", "label": "ORG"}]
        state["source_chunks"] = [
            {
                "chunk_id": "chunk_01",
                "extracted_entities": [{"text": "Directorate of Power Grid Resilience"}],
            }
        ]
        state["draft_outputs"] = {
            "advisory": {
                "title": "Advisory Notice",
                "threat_overview": "Directive issued to Directorate of Grid Power Resilience.",
                "cited_chunk_ids": ["chunk_01"],
            }
        }

        updated_state = run_entity_and_claim_verification(state)

        # Flagship check: Hard Gate MUST be triggered
        assert updated_state["hard_gate_triggered"] is True
        assert len(updated_state["entity_discrepancies"]) >= 1

        # Check frontend contract compliance
        discrepancy = updated_state["entity_discrepancies"][0]
        assert "draft_entity" in discrepancy
        assert "suggested_source_entity" in discrepancy
        assert "similarity_score" in discrepancy
        assert "status" in discrepancy
        assert discrepancy["status"] == "FLAGGED_MISMATCH"
        assert discrepancy["draft_entity"] == "Directorate of Grid Power Resilience"
        assert discrepancy["suggested_source_entity"] == "Directorate of Power Grid Resilience"

    def test_gate_clears_on_grounded_truth(self):
        state = get_empty_agent_state(job_id="test_gate_job_002")
        state["extracted_entities"] = [{"text": "Directorate of Power Grid Resilience", "label": "ORG"}]
        state["draft_outputs"] = {
            "advisory": {
                "title": "Advisory Notice",
                "threat_overview": "Remediation verified by Directorate of Power Grid Resilience.",
                "cited_chunk_ids": ["chunk_01"],
            }
        }

        updated_state = run_entity_and_claim_verification(state)
        assert updated_state["hard_gate_triggered"] is False
        assert len(updated_state["entity_discrepancies"]) == 0
