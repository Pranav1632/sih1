# BUILD_Backend_Export_Engineer.md
> ⚠️ AGENT INSTRUCTIONS: You are building ONLY the items in this file. Nothing else. Build exactly as specified.

## Your Scope
The FastAPI application (all 5 endpoints), the human-review resume logic, and the deterministic exporters (python-pptx, python-docx).

## Your Files
- `backend/api/routes.py` — all 5 endpoints
- `backend/api/main.py` — FastAPI app entrypoint, CORS for local frontend only
- `backend/exporters/pptx_exporter.py` — `PresentationSchema` → real `.pptx`
- `backend/exporters/docx_exporter.py` — `AdvisorySchema` → real `.docx`

## Your Tasks (ordered by priority)

### Task 1: Exporters against real schemas (Day 2-5, once #3 hands off schemas Day 2)
- What to build: `export_pptx(deck: PresentationSchema, output_path)` — title slide, per-slide bullet hierarchy, visual guidance as slide notes/layout hints, full speaker notes, citation footers. `export_docx(advisory: AdvisorySchema, output_path)` — institutional header, severity color banner, IOC table, footnote citations.
- File(s): `backend/exporters/pptx_exporter.py`, `backend/exporters/docx_exporter.py`
- Inputs: `fixtures/mock_draft_outputs.json` until #3's real schemas land, then real schema instances
- Outputs: real, openable `.pptx`/`.docx` files
- Acceptance criteria: exported files open correctly in PowerPoint/Word with no corruption, all fields present, speaker notes readable

### Task 2: FastAPI skeleton (Day 1-2, in parallel with Task 1)
- What to build: all 5 endpoints from BUILD.md's API table, initially returning mock/fixture responses so Frontend Engineer can build against them Day 1
- File(s): `backend/api/routes.py`, `backend/api/main.py`
- Inputs: none initially — mock responses
- Outputs: running FastAPI server at `localhost:8000` with all 5 routes live (mocked)
- Acceptance criteria: `curl` or Postman hits each endpoint and gets a schema-correct mocked response by end of Day 2 — hand this to Frontend Engineer immediately

### Task 3: Wire real graph invocation (Day 6-8)
- What to build: replace mocked endpoint bodies with real calls into Orchestration Lead's compiled `app` — `/api/generate` calls `app.invoke()`, `/api/review/confirm` calls the `app.update_state()` + `app.invoke(None, ...)` resume pattern exactly as in `02_ingestion_schemas_and_orchestration.md` Section 3.3
- File(s): `backend/api/routes.py`
- Inputs: Orchestration Lead's compiled `app`, `thread_id` = `job_id`
- Outputs: real end-to-end request/response cycle including Hard Gate pause and resume
- Acceptance criteria: full flow works: upload → generate → hard gate pause → confirm → export, all through real HTTP calls

### Task 4: Export locking (Day 8)
- What to build: `/api/export/{format}/{job_id}` must return HTTP 423 (Locked) if `hard_gate_triggered == True and human_approved == False`, per the Hard Gate Operational Protocol Rule 1 in `03_verification_debate_and_build_plan.md`
- File(s): `backend/api/routes.py`
- Inputs: `state["hard_gate_triggered"]`, `state["human_approved"]`
- Outputs: locked/unlocked export behavior
- Acceptance criteria: attempt export before approval → 423; approve → export succeeds

## Contracts You Must Honor
- All 5 API endpoint shapes are locked per BUILD.md — any change requires updating BUILD.md and notifying Frontend Engineer same day
- Never let export succeed while `hard_gate_triggered == True and human_approved == False` — this is a Cardinal Principle, not a nice-to-have

## DO NOT
- Do not add authentication (explicitly out of scope — this is a local air-gapped demo, no auth needed)
- Do not modify files owned by other teammates
- Do not change the shared contract definitions
- Do not add packages without updating the master BUILD.md first
