# BUILD_Verification_Engineer.md
> ⚠️ AGENT INSTRUCTIONS: You are building ONLY the items in this file. Nothing else. Build exactly as specified.

## Your Scope
The Layer 1 deterministic entity verification gate (spaCy + RapidFuzz) and the 2-pass bounded reflection audit (structural + grounding). This is your platform's single most important demo moment — build and test it thoroughly.

## Your Files
- `backend/verification/fuzzy_matcher.py` — `run_entity_verification(text, source_entities) -> dict`
- `backend/verification/gate_node.py` — `run_entity_and_claim_verification(state) -> state`
- `backend/verification/reflection.py` — `run_reflection_repair(state) -> state`, `reflection_audit_pass(state) -> dict`

## Your Tasks (ordered by priority)

### Task 1: Build entity verification against the fixture (Day 1-3)
- What to build: `run_entity_verification(generated_text, source_entities) -> dict` exactly per `03_verification_debate_and_build_plan.md` Section 1.2 — spaCy entity extraction, RapidFuzz fuzzy match, 75-99% score band = `FLAGGED_MISMATCH`, <75% = `UNGROUNDED_NEW_ENTITY`
- File(s): `backend/verification/fuzzy_matcher.py`
- Inputs: `fixtures/mock_draft_outputs.json` text fields + entities extracted from `fixtures/mock_source_chunks.json` — build and test against these before real generator output exists
- Outputs: `{passed: bool, mismatches: List[dict]}`
- Acceptance criteria: prove it runs under 50ms on a realistic-length advisory text; hand-craft a test case with "Directorate of Grid Power Resilience" vs source's "Directorate of Power Grid Resilience" and confirm it flags at the expected similarity band

### Task 2: 2-Pass reflection audit (Day 3-5)
- What to build: Pass 1 structural audit (missing IOCs, <2 mitigations) and Pass 2 grounding audit (e.g. flag any mitigation mentioning "third-party cloud scanner" as a sovereignty violation) exactly per `03_verification_debate_and_build_plan.md` Section 2.3
- File(s): `backend/verification/reflection.py`
- Inputs: `state["draft_outputs"]["advisory"]`
- Outputs: `audit_notes`, `state["schema_errors"]` for Orchestration Lead's bounded retry edge
- Acceptance criteria: test with a deliberately incomplete advisory (missing IOCs) and confirm Pass 1 catches it; test with a mitigation mentioning a cloud scanner and confirm Pass 2 catches it

### Task 3: Gate node + Hard Gate trigger (Day 5-7)
- What to build: `run_entity_and_claim_verification(state: AgentState) -> AgentState` — runs Task 1's matcher across all `draft_outputs`, sets `state["hard_gate_triggered"] = True` on any `FLAGGED_MISMATCH` or `UNGROUNDED_NEW_ENTITY`, populates `state["entity_discrepancies"]`
- File(s): `backend/verification/gate_node.py`
- Inputs: `state["draft_outputs"]`, `state["source_chunks"]` (for source entity set)
- Outputs: `state["hard_gate_triggered"]`, `state["entity_discrepancies"]`, `state["claim_verifications"]`
- Acceptance criteria: hand this function to Orchestration Lead by Day 7 matching their stub signature; confirm end-to-end that a deliberately mismatched entity name halts the graph before export

## Contracts You Must Honor
- `entity_discrepancies` list shape: `{draft_entity, suggested_source_entity, similarity_score, status}` — Frontend Engineer's Hard Gate modal depends on this exact shape
- `run_entity_and_claim_verification` and `run_reflection_repair` signatures must exactly match Orchestration Lead's stubs

## DO NOT
- Do not build GraphRAG/NetworkX Layer 2 — explicitly out of scope for this build
- Do not modify files owned by other teammates
- Do not change the shared contract definitions
- Do not add packages without updating the master BUILD.md first
