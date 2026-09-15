# BUILD_Orchestration_Lead.md
> ⚠️ AGENT INSTRUCTIONS: You are building ONLY the items in this file. Nothing else. Build exactly as specified.

## Your Scope
The LangGraph state machine: `AgentState` definition, all node wiring, conditional edges, bounded reflection routing, the Hard Gate pause/resume mechanism, and checkpoint persistence. You do NOT write any node's internal logic (ingestion parsing, LLM prompts, verification rules, exporter code) — you only wire the graph and own the state contract those nodes read/write.

## Your Files
- `backend/orchestration/__init__.py`
- `backend/orchestration/state.py` — `AgentState` TypedDict (exact fields, see BUILD.md)
- `backend/orchestration/graph.py` — `StateGraph` assembly, node registration, conditional edges, `MemorySaver` checkpointer
- `backend/orchestration/node_stubs.py` — empty stub functions for `run_ingestion_and_normalization`, `run_context_and_entity_extraction`, `run_parallel_format_generation`, `run_reflection_repair`, `run_entity_and_claim_verification`, `run_deterministic_exporters` (Day 1, so the graph runs end-to-end on Day 1 even before real logic exists — other teammates replace stub bodies with real implementations, they do not touch `graph.py`)
- `backend/config.py` — loads every env var from BUILD.md's Environment Variables table
- `requirements.txt`, `.env.example`, `.gitignore`, `README.md` — you own these root files; update `README.md` as other teammates' pieces land

## Your Tasks (ordered by priority)

### Task 1: Define AgentState and stub graph (Day 1)
- What to build: `AgentState` TypedDict exactly as in BUILD.md. A `graph.py` that wires all 6 nodes with stub functions from `node_stubs.py`, so `python -m backend.orchestration.graph` runs a no-op pass through the whole pipeline.
- File(s): `backend/orchestration/state.py`, `backend/orchestration/graph.py`, `backend/orchestration/node_stubs.py`
- Inputs: none — this is the foundation everyone else builds against
- Outputs: importable `app` (compiled graph) that other teammates' real node functions get swapped into
- Acceptance criteria: running the stub graph with a sample `job_id` completes without error and returns an `AgentState` with all keys present (even if empty)

### Task 2: Bounded reflection conditional edge (Day 3-4)
- What to build: `check_reflection(state) -> str` exactly per `02_ingestion_schemas_and_orchestration.md` Section 3.3 — max 1 retry, then force-forward to verification gate
- File(s): `backend/orchestration/graph.py`
- Inputs: `state["reflection_attempts"]`, `state["schema_errors"]` (set by Verification Engineer's reflection node)
- Outputs: routes to `generator_node` (retry) or `verification_gate_node` (proceed)
- Acceptance criteria: unit test proves a second reflection failure does NOT trigger a second retry

### Task 3: Hard Gate pause/resume (Day 5-6)
- What to build: `check_hard_gate(state) -> str` conditional edge; `interrupt_before=["export_node"]`; the `app.update_state(...)` + `app.invoke(None, ...)` resume pattern exactly as documented in `02_ingestion_schemas_and_orchestration.md` Section 3.3
- File(s): `backend/orchestration/graph.py`
- Inputs: `state["hard_gate_triggered"]`, `state["human_approved"]` (set by Verification Engineer, then updated by Backend Engineer's review endpoint)
- Outputs: graph pauses at checkpoint when gate triggers; resumes cleanly when Backend Engineer calls the resume pattern
- Acceptance criteria: manually trigger gate, confirm graph halts before export node, confirm calling resume with `human_approved: True` completes the run

### Task 4: Swap in real node logic (Day 7-9)
- What to build: nothing new — replace each stub in `node_stubs.py` imports with the real functions your teammates hand you (`ingestion.normalizer.run_ingestion_and_normalization`, etc.)
- File(s): `backend/orchestration/graph.py`
- Inputs: real node functions from #2, #3, #4, #5 — matching the exact function signatures you defined in Task 1
- Outputs: fully wired graph, no stubs remaining
- Acceptance criteria: end-to-end run from real PDF upload to real exported .pptx/.docx completes, including a Hard Gate pause on a deliberately mismatched entity test case

## Contracts You Must Honor
- `AgentState` field names/types are locked after Day 1 — any change requires updating `BUILD.md` and notifying everyone same day
- Node function signatures you define in Task 1 are the contract every teammate's real implementation must match exactly (same function name, same `state: AgentState -> AgentState` shape)

## DO NOT
- Do not build ingestion, prompt, verification, or exporter logic yourself — you wire stubs/real functions, you don't write their internals
- Do not modify files owned by other teammates
- Do not change the shared contract definitions without updating BUILD.md first
- Do not add packages without updating the master BUILD.md first
