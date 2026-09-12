# INTEGRATION.md — Merge Rules & Interface Contracts
### Sentinel-Transform | SIH 2026 PS 26154

> This document defines how the pieces come together. Read this before merging any branch.

## Parallelization Design (why nobody blocks until Day 9)
Every teammate builds against **frozen fixtures** (`fixtures/mock_source_chunks.json`, `fixtures/mock_draft_outputs.json`) and **mocked endpoints** from Day 1, instead of waiting for real upstream output:
- Ingestion Engineer (#2) validates the SEI schema against the chunk fixture before writing real parsers.
- LLM/Prompt Engineer (#3) hands off the 7 real Pydantic schemas by end of **Day 2** — this is the one hard early dependency everyone else benefits from, but #4/#5/#6 can start Day 1 against the fixture and swap to real schemas Day 2 without changing their own code structure.
- Backend Engineer (#5) stands up all 5 API endpoints with mocked responses by end of **Day 2** — Frontend Engineer (#6) builds against this immediately and never waits on real backend logic.
- Verification Engineer (#4) and Orchestration Lead (#1) both build and test their nodes standalone against fixtures/stubs; they only need each other at final wiring.

**Nobody needs another teammate's finished work until the Day 9 integration pass.** Each person's task list is ordered so their own Day 1-2 work is self-contained.

## Integration Order (Day 9)
1. **Orchestration Lead** swaps all node stubs for real functions handed off by #2, #3, #4, #5 (in that order — ingestion first since everything downstream needs `source_chunks`)
2. **Backend Engineer** wires the compiled graph into real API endpoints, replacing all mocks
3. **Frontend Engineer** points `api/client.ts` at the real (unmocked) backend, removes fixture fallbacks
4. **Verification Engineer + Frontend Engineer together** run the Hard Gate end-to-end test case (deliberately mismatched entity) and confirm the modal displays correctly with real data
5. **Full team** runs one complete pipeline pass: upload → generate → hard gate → approve → export → download, on the actual demo machine (RTX 3050)

## Interface Contracts (every handoff point)
| From | To | What | Format |
|---|---|---|---|
| Ingestion Engineer | Orchestration Lead | `run_ingestion_and_normalization(state) -> state` | function matching stub signature |
| Ingestion Engineer | LLM/Prompt Engineer, Verification Engineer | `source_chunks`, chunk schema | JSON per `fixtures/mock_source_chunks.json` shape |
| LLM/Prompt Engineer | Verification, Backend/Export, Frontend | 7 Pydantic schemas | `.py` files, hand off Day 2 |
| LLM/Prompt Engineer | Orchestration Lead | `run_parallel_format_generation(state) -> state` | function matching stub signature |
| Verification Engineer | Orchestration Lead | `run_entity_and_claim_verification`, `run_reflection_repair` | functions matching stub signatures |
| Verification Engineer | Frontend Engineer | `entity_discrepancies` item shape | confirm exact shape before Frontend Task 3 |
| Backend Engineer | Frontend Engineer | 5 API endpoints | mocked Day 2, real Day 8-9 |
| Orchestration Lead | Backend Engineer | compiled `app` (LangGraph) | Python import, Day 6-8 |

## Merge Rules
- **Branch naming**: `role/feature` e.g. `ingestion/pdf-parser`, `frontend/hard-gate-modal`
- **Who merges what**: each teammate merges their own branches into `main` after self-testing against fixtures; Orchestration Lead reviews and merges any PR touching `orchestration/` or `state.py`; no one merges directly to `main` without a self-test pass
- **What to test before merging**: run the relevant acceptance criteria from your `BUILD_*.md` task list; for anyone touching a shared contract (`AgentState`, a Pydantic schema, an API shape), post in the team channel before merging

## What Each Agent Must NOT Touch
| File/Module | Owner | Others must not modify |
|---|---|---|
| `orchestration/state.py`, `graph.py` | Orchestration Lead | all others |
| `ingestion/*` | Ingestion Engineer | all others |
| `models/formats/*`, `generation/*` | LLM/Prompt Engineer | all others |
| `verification/*` | Verification Engineer | all others |
| `api/*`, `exporters/*` | Backend/Export Engineer | all others |
| `frontend/*` | Frontend Engineer | all others |
| `fixtures/*` | Shared, frozen Day 1 | anyone changing it must notify all teammates |

## Demo Path (step by step, mapped to owning teammate's code)
1. **0:00–0:15** — Dashboard loads, air-gapped badge visible → **Frontend**
2. **0:15–0:38** — Drag-drop PDF + image, toggle Primary, set parameters, select 3 formats → **Frontend** (UI) + **Ingestion Engineer** (`/api/ingest` backend)
3. **0:38–0:52** — Click Execute, fast-forwarded LangGraph run → **Orchestration Lead** (graph execution) + **LLM/Prompt Engineer** (generation) + **Backend Engineer** (`/api/generate`)
4. **0:52–1:20** — Hard Gate modal fires on entity mismatch, operator clicks "Accept Source Correction" → **Verification Engineer** (gate logic) + **Frontend** (modal) + **Backend Engineer** (`/api/review/confirm`)
5. **1:20–1:45** — Citation drawer click-to-highlight, download real .pptx → **Frontend** (drawer) + **Ingestion Engineer** (SEI coordinates) + **Backend Engineer** (exporters)
6. **1:45–2:00** — Architecture summary, QR code → static slide, no code

## Known Integration Risks
- **Risk**: LLM/Prompt Engineer late on 7 schemas past Day 2 → **Mitigation**: #4/#5/#6 keep building against the fixture shape, which is designed to be schema-compatible; swap-in is a low-effort find/replace once real schemas land.
- **Risk**: RTX 3050 VRAM insufficient for the planned demo model → **Mitigation**: Day 1 VRAM check locks the model choice early; `phi4-mini` is the confirmed fallback that fits any RTX 3050 variant.
- **Risk**: Hard Gate never fires on real data because the dev model is too well-behaved → **Mitigation**: Verification Engineer keeps a hand-crafted test fixture with a deliberate entity transposition, used for both testing and — if needed — the recorded demo, to guarantee the flagship moment triggers reliably.
- **Risk**: Full pipeline (ingestion → 3 formats → gate → export) too slow live → **Mitigation**: demo script already uses 4-8x fast-forward with on-screen timer per `04_demo_script_and_pitch_deck.md` — do not attempt to speed up the actual model, speed up the video.
