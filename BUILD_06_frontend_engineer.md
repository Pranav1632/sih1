# BUILD_Frontend_Engineer.md
> ⚠️ AGENT INSTRUCTIONS: You are building ONLY the items in this file. Nothing else. Build exactly as specified.

## Your Scope
The React dashboard: ingestion drag-and-drop zone, parameter controls, format multi-select, the Hard Gate modal (your platform's key demo moment — polish this above everything else), and the citation drawer with source highlight.

## Your Files
- `frontend/src/components/IngestionZone.tsx`
- `frontend/src/components/ParameterControls.tsx`
- `frontend/src/components/FormatSelector.tsx`
- `frontend/src/components/HardGateModal.tsx`
- `frontend/src/components/SourceEvidenceViewer.tsx` (citation drawer)
- `frontend/src/api/client.ts` — typed API client matching BUILD.md's endpoint contracts

## Your Tasks (ordered by priority)

### Task 1: Scaffold + API client against mocked backend (Day 1-2)
- What to build: Vite React TS project init; `api/client.ts` with typed functions for all 5 endpoints from BUILD.md, pointed at Backend Engineer's mocked FastAPI server (live by end of Day 2)
- File(s): project scaffold, `frontend/src/api/client.ts`
- Inputs: mocked API responses from Backend Engineer
- Outputs: working dev server that can call every endpoint and log responses
- Acceptance criteria: all 5 endpoint calls succeed against the mocked backend by Day 2

### Task 2: Ingestion zone + parameter controls (Day 2-4)
- What to build: drag-and-drop upload with per-file `Primary Document` toggle (exactly one file can be primary), the 11-control parameter matrix (tone, audience, detail level, objective, etc. per `01_architecture_tech_stack_and_ui.md`), multi-select for the 7 formats
- File(s): `IngestionZone.tsx`, `ParameterControls.tsx`, `FormatSelector.tsx`
- Inputs: user interaction, `fixtures/mock_source_chunks.json` for dev-time rendering
- Outputs: calls `/api/ingest` then `/api/generate` with the correct payload shape
- Acceptance criteria: submitting a mock upload produces a correctly-shaped `/api/generate` request

### Task 3: Hard Gate Modal — THE key demo moment (Day 4-6)
- What to build: modal that triggers on `hard_gate_triggered: true` from `/api/status`, displays each `entity_discrepancies[]` item (draft entity vs suggested source entity vs similarity score), and offers exactly the 3 actions from the Hard Gate Operational Protocol: "Accept Source Correction," "Override & Keep Draft" (requires a checked "Analyst Signed Authorization" box), "Edit Manually" (inline markdown editor)
- File(s): `HardGateModal.tsx`
- Inputs: `entity_discrepancies` shape from Verification Engineer (confirm exact shape with them before building)
- Outputs: calls `/api/review/confirm` with the operator's choice
- Acceptance criteria: this is what judges will see for ~10 seconds — polish the visual design (red alert styling, clear before/after text diff) more than any other component; test all 3 action paths against the mocked backend first, then real

### Task 4: Citation drawer (Day 6-8)
- What to build: hovering/clicking `[Ref: Page N]` badges opens a split drawer, scrolls to the cited page, highlights the exact `char_start`–`char_end` span in yellow, per `02_ingestion_schemas_and_orchestration.md` Section 1.4
- File(s): `SourceEvidenceViewer.tsx`
- Inputs: `cited_chunk_ids` from any deliverable, chunk data from `/api/status` or a dedicated chunk-lookup response
- Outputs: interactive highlight-on-hover UI
- Acceptance criteria: works against fixture data first, then real ingested PDF

## Contracts You Must Honor
- API request/response shapes are locked per BUILD.md — do not invent fields the backend doesn't send
- `entity_discrepancies` item shape must match what Verification Engineer defines — confirm before building Task 3

## DO NOT
- Do not call any backend logic directly — only through the FastAPI endpoints in `api/client.ts`
- Do not modify files owned by other teammates
- Do not change the shared contract definitions
- Do not add packages without updating the master BUILD.md first
