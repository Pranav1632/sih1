# BUILD_LLM_Prompt_Engineer.md
> ⚠️ AGENT INSTRUCTIONS: You are building ONLY the items in this file. Nothing else. Build exactly as specified.

## Your Scope
All 7 Pydantic schemas, the format-specific prompts, and the parallel format generator node. This is the single-pass generator (the Multi-Agent Debate Arena is OUT OF SCOPE per BUILD.md — do not build it).

## Your Files
- `backend/models/formats/linkedin_schema.py` — `LinkedInSchema`
- `backend/models/formats/twitter_schema.py` — `TweetItem`, `TwitterThreadSchema`
- `backend/models/formats/advisory_schema.py` — `AdvisorySchema`
- `backend/models/formats/exec_summary_schema.py` — `ExecSummarySchema`
- `backend/models/formats/presentation_schema.py` — `Slide`, `PresentationSchema`
- `backend/models/formats/video_package_schema.py` — `Scene`, `VideoPackageSchema`
- `backend/models/formats/infographic_schema.py` — `InfographicSection`, `InfographicSchema`
- `backend/models/formats/__init__.py` — re-exports all schema classes so other teammates can `from backend.models.formats import AdvisorySchema` etc.
- `backend/generation/prompts.py` — one prompt template per format
- `backend/generation/generator_node.py` — `run_parallel_format_generation(state) -> state`
- `backend/tests/test_generation.py` — your test file

## Your Tasks (ordered by priority)

### Task 1: Pydantic schemas first, standalone (Day 1-2)
- What to build: all 7 schemas (`LinkedInSchema`, `TwitterThreadSchema`, `AdvisorySchema`, `ExecSummarySchema`, `PresentationSchema`, `VideoPackageSchema`, `InfographicSchema`) exactly field-for-field from the spec — no additions, no omissions
- File(s): the 7 files listed above under "Your Files," plus `backend/models/formats/__init__.py` re-exporting all classes
- Inputs: none — this is foundational, hand these to Verification, Export, and Frontend teammates by end of Day 2 so they can build against real (not fixture) schemas
- Outputs: importable Pydantic models
- Acceptance criteria: `.model_json_schema()` on each matches the spec's field list exactly; announce completion in team channel so #4/#5/#6 switch off the fixture

### Task 2: Prompts per format (Day 2-4)
- What to build: one prompt template per format that instructs the model to (a) ground every claim in provided `source_chunks`, (b) output `cited_chunk_ids` for every claim, (c) use `ChatOllama.with_structured_output(SchemaClass)` for guaranteed valid JSON
- File(s): `backend/generation/prompts.py`
- Inputs: `merged_context`, `parameters` (tone/audience/detail/objective), `requested_formats`
- Outputs: one filled schema instance per requested format
- Acceptance criteria: test each prompt against `fixtures/mock_source_chunks.json`, confirm output cites only chunk_ids present in the fixture (no invented chunk_ids)

### Task 3: Generator node (Day 4-6)
- What to build: `run_parallel_format_generation(state: AgentState) -> AgentState` — dispatches prompts for all `requested_formats` (can be sequential if `asyncio` parallelism is out of time budget — sequential is acceptable, just note it), populates `draft_outputs`
- File(s): `backend/generation/generator_node.py`
- Inputs: `state["merged_context"]`, `state["parameters"]`, `state["requested_formats"]`
- Outputs: `state["draft_outputs"]`
- Acceptance criteria: hand this function to Orchestration Lead by Day 6 matching their stub signature exactly; confirm CPU dev-model output for one deliberately-tricky case (a document with a subtly similar org name) actually produces a testable near-miss for the Verification Engineer's gate to catch

## Contracts You Must Honor
- Schema field names/types are locked after Day 2 — any change requires updating BUILD.md and notifying #4/#5/#6 same day
- `run_parallel_format_generation` signature must exactly match Orchestration Lead's stub

## DO NOT
- Do not build the Multi-Agent Debate Arena (Threat Analyst / Risk Analyst / Judge) — explicitly out of scope
- Do not modify files owned by other teammates
- Do not change the shared contract definitions
- Do not add packages without updating the master BUILD.md first
