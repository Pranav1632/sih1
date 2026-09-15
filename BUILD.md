# BUILD.md — Sentinel-Transform
### SIH 2026 | PS 26154 | National Technical Research Organisation (NTRO)
> ⚠️ AGENT INSTRUCTIONS: Build ONLY what is listed here. Do not add features, do not infer requirements, do not improve on the spec. If something is unclear, output a comment `// UNCLEAR: [question]` and stop. Do not proceed past unclear points.

## Project Overview
An air-gapped, on-premise multi-agent platform that transforms one source document (report/advisory/article/scan/audio/video) into up to 7 operator-selected deliverables (LinkedIn post, Twitter/X thread, Intelligence Advisory, Executive Summary, Presentation deck, Video production package, Infographic spec) — with zero cloud egress and a deterministic Hard Gate that halts export on any entity/fact discrepancy against the source.

## Scope for This Build (10 days, 6 people) — CUT LIST
**IN SCOPE:** Ingestion (PDF/DOCX/OCR/ASR), all 7 Pydantic schemas + generators, Layer 1 entity verification (spaCy + RapidFuzz) Hard Gate, 2-pass reflection (structural + grounding audits, single-pass, no debate), python-pptx/python-docx exporters, React dashboard with citation drawer and Hard Gate modal.

**OUT OF SCOPE (do not build — mention only in pitch deck as Phase 2 roadmap):**
- Multi-Agent Debate Arena (Threat Analyst vs Risk Analyst vs Judge) — too expensive for the time budget.
- GraphRAG / NetworkX multi-hop knowledge graph traversal (Layer 2) — Layer 1 alone is the demo-worthy differentiator.
- Any cloud API fallback of any kind.

If any teammate is tempted to build something not on this list, they must flag it in the team channel before starting — do not silently add scope.

## Tech Stack (exact)
- **Backend**: Python 3.11, FastAPI, Pydantic v2, LangGraph, langchain-core, langchain-ollama
- **LLM Runtime**: Ollama (local). Dev model: `qwen2.5:3b` or `phi4-mini` (CPU). Demo model: confirmed on Day 1 based on actual RTX 3050 VRAM — `phi4-mini` (≤4GB VRAM) or `qwen2.5:7b` Q4_K_M (6GB+ VRAM).
- **Ingestion**: PyMuPDF (PDF), python-docx (DOCX), Tesseract OCR (images), faster-whisper `small` int8 (audio/video)
- **Verification**: spaCy `en_core_web_sm`, RapidFuzz
- **Storage**: SQLite (Source Evidence Index)
- **Exporters**: python-pptx, python-docx
- **Frontend**: React + Vite + TypeScript, Tailwind, lucide-react
- **State/Checkpointing**: LangGraph `MemorySaver`

## Hardware Execution Policy
- All 6 teammates develop on Windows 11 CPU using the 3B/mini dev model — no GPU dependency during build.
- **Day 1 action item (Orchestration Lead)**: run `nvidia-smi` on the RTX 3050 demo machine, confirm actual VRAM, lock the demo model choice, communicate to all teammates same day.
- Zero outbound network calls anywhere in the pipeline. No API keys for any LLM provider. This is a judged differentiator — do not weaken it for convenience.

## Shared Contracts (ALL agents must honor these)

### Data Models — `AgentState` (owned by Orchestration Lead, everyone else reads/writes only their assigned fields)
```python
class AgentState(TypedDict):
    job_id: str
    uploaded_files: List[Dict[str, Any]]
    primary_doc_id: str
    source_chunks: List[Dict[str, Any]]      # written by Ingestion Engineer
    context_summary: str
    extracted_entities: List[Dict[str, Any]] # written by Ingestion Engineer
    merged_context: Dict[str, Any]
    parameters: Dict[str, Any]               # written by Frontend via API
    requested_formats: List[str]             # written by Frontend via API
    draft_outputs: Dict[str, Any]            # written by LLM/Prompt Engineer
    reflection_attempts: Dict[str, int]
    claim_verifications: List[Dict[str, Any]]# written by Verification Engineer
    entity_discrepancies: List[Dict[str, Any]]# written by Verification Engineer
    hard_gate_triggered: bool                # written by Verification Engineer
    human_approved: bool                     # written by Backend via review endpoint
    human_corrections: Dict[str, Any]
    exported_files: Dict[str, str]           # written by Backend/Export Engineer
```

### The 7 Pydantic Schemas
Exact field-for-field definitions as specified in `02_ingestion_schemas_and_orchestration.md` Section 2.1 (`LinkedInSchema`, `TwitterThreadSchema`, `AdvisorySchema`, `ExecSummarySchema`, `PresentationSchema`, `VideoPackageSchema`, `InfographicSchema`). Owned by LLM/Prompt Engineer. No field renaming, no added fields, without updating this file first.

### Source Evidence Index Chunk Schema
Exact shape as in `fixtures/mock_source_chunks.json` — `chunk_id`, `doc_id`, `source_name`, `source_role` (`PRIMARY`|`SUPPORTING`), `page_number`, `timestamp_start`, `timestamp_end`, `char_start`, `char_end`, `text`, `extracted_entities`.

### API Endpoints (owned by Backend/Export Engineer)
| Method | Path | Request | Response | Auth |
|---|---|---|---|---|
| POST | `/api/ingest` | multipart files + `source_role` per file | `{job_id, source_chunks[]}` | none (air-gapped, local only) |
| POST | `/api/generate` | `{job_id, parameters, requested_formats}` | `{job_id, status}` | none |
| GET | `/api/status/{job_id}` | — | `{status, hard_gate_triggered, entity_discrepancies[]}` | none |
| POST | `/api/review/confirm` | `{job_id, human_approved, human_corrections}` | `{status}` | none |
| GET | `/api/export/{format}/{job_id}` | — | file download (`.pptx`/`.docx`) | none |

### Environment Variables
| Var | Purpose | Owner |
|---|---|---|
| `OLLAMA_HOST` | local Ollama endpoint, e.g. `http://localhost:11434` | Orchestration Lead |
| `OLLAMA_MODEL_DEV` | `qwen2.5:3b` or `phi4-mini` | Orchestration Lead |
| `OLLAMA_MODEL_DEMO` | locked Day 1 per VRAM check | Orchestration Lead |
| `SQLITE_DB_PATH` | `./data/sentinel.db` | Ingestion Engineer |
| `FASTAPI_PORT` | `8000` | Backend/Export Engineer |

### File Structure (root) — EXACT, every file named
> Agents must create files at these exact paths with these exact names. Do not invent alternate names, do not place files in the root instead of their assigned folder, do not skip an `__init__.py`. If a file you need isn't listed here, add it to this table first and notify the team before creating it.

```
sentinel-transform/
├── backend/
│   ├── __init__.py
│   ├── main.py                              # Backend/Export Engineer — single FastAPI app entrypoint (uvicorn target)
│   ├── config.py                            # Orchestration Lead — loads all env vars from BUILD.md's table
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   └── formats/                         # LLM/Prompt Engineer — one file per schema, no combined file
│   │       ├── __init__.py
│   │       ├── linkedin_schema.py           # LinkedInSchema
│   │       ├── twitter_schema.py            # TweetItem, TwitterThreadSchema
│   │       ├── advisory_schema.py           # AdvisorySchema
│   │       ├── exec_summary_schema.py       # ExecSummarySchema
│   │       ├── presentation_schema.py       # Slide, PresentationSchema
│   │       ├── video_package_schema.py      # Scene, VideoPackageSchema
│   │       └── infographic_schema.py        # InfographicSection, InfographicSchema
│   │
│   ├── ingestion/                           # Ingestion Engineer
│   │   ├── __init__.py
│   │   ├── parsers.py                       # parse_pdf, parse_docx, parse_image, parse_audio_video
│   │   ├── chunker.py                       # chunk_text
│   │   ├── source_governance.py             # apply_source_governance
│   │   ├── sei_store.py                     # SQLite Source Evidence Index CRUD
│   │   └── normalizer.py                    # run_ingestion_and_normalization (AgentState node)
│   │
│   ├── generation/                          # LLM/Prompt Engineer
│   │   ├── __init__.py
│   │   ├── prompts.py                       # one prompt template per format
│   │   └── generator_node.py                # run_parallel_format_generation (AgentState node)
│   │
│   ├── verification/                        # Verification Engineer
│   │   ├── __init__.py
│   │   ├── fuzzy_matcher.py                 # run_entity_verification
│   │   ├── gate_node.py                     # run_entity_and_claim_verification (AgentState node)
│   │   └── reflection.py                    # reflection_audit_pass, run_reflection_repair (AgentState node)
│   │
│   ├── orchestration/                       # Orchestration Lead
│   │   ├── __init__.py
│   │   ├── state.py                         # AgentState TypedDict
│   │   ├── graph.py                         # StateGraph assembly, conditional edges, MemorySaver
│   │   └── node_stubs.py                    # Day-1 stub functions, replaced by real ones at integration
│   │
│   ├── exporters/                           # Backend/Export Engineer
│   │   ├── __init__.py
│   │   ├── pptx_exporter.py                 # export_pptx
│   │   └── docx_exporter.py                 # export_docx
│   │
│   ├── api/                                 # Backend/Export Engineer
│   │   ├── __init__.py
│   │   └── routes.py                        # all 5 endpoints from the API table below
│   │
│   └── tests/                               # each engineer writes the test file for their own module
│       ├── __init__.py
│       ├── test_ingestion.py                # Ingestion Engineer
│       ├── test_generation.py               # LLM/Prompt Engineer
│       ├── test_verification.py             # Verification Engineer
│       ├── test_exporters.py                # Backend/Export Engineer
│       └── test_api.py                      # Backend/Export Engineer
│
├── frontend/                                # Frontend Engineer
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── api/
│       │   └── client.ts                    # typed functions for all 5 endpoints
│       └── components/
│           ├── IngestionZone.tsx
│           ├── ParameterControls.tsx
│           ├── FormatSelector.tsx
│           ├── HardGateModal.tsx
│           └── SourceEvidenceViewer.tsx
│
├── fixtures/                                # shared, frozen Day 1 — do not rename or move
│   ├── mock_source_chunks.json
│   └── mock_draft_outputs.json
│
├── data/                                    # gitignored — SQLite DB + uploaded files created at runtime
│   └── .gitkeep
│
├── docs/                                    # reference specs already provided — read-only, do not edit
│   ├── 00_master_overview.md
│   ├── 01_architecture_tech_stack_and_ui.md
│   ├── 02_ingestion_schemas_and_orchestration.md
│   ├── 03_verification_debate_and_build_plan.md
│   └── 04_demo_script_and_pitch_deck.md
│
├── BUILD.md                                 # this file
├── BUILD_01_orchestration_lead.md
├── BUILD_02_ingestion_engineer.md
├── BUILD_03_llm_prompt_engineer.md
├── BUILD_04_verification_engineer.md
├── BUILD_05_backend_export_engineer.md
├── BUILD_06_frontend_engineer.md
├── INTEGRATION.md
├── requirements.txt                         # Orchestration Lead — pin exact versions, Day 1
├── .env.example                             # Orchestration Lead — every var from the env table below, no real secrets
├── .gitignore                               # Orchestration Lead — must include data/, node_modules/, venv/, *.db
└── README.md                                # Orchestration Lead — setup instructions, updated as pieces land
```

**Naming rule for all agents**: use the exact filenames above — snake_case for Python, PascalCase only for `.tsx` component files as shown. Never create `utils.py`, `helpers.py`, `misc.py`, or any file not in this tree without adding it here first and notifying the team.

## Team Overview
| Teammate | Role | Owns | Integrates With |
|----------|------|------|-----------------|
| #1 | Orchestration Lead | LangGraph StateGraph, AgentState, node wiring, checkpointing | Everyone (state contract) |
| #2 | Ingestion Engineer | Parsers, chunker, Source Evidence Index, source governance | #1 (source_chunks), #6 (citation drawer data) |
| #3 | LLM/Prompt Engineer | 7 Pydantic schemas, prompts, generator node | #4, #5, #6 (schema shapes) |
| #4 | Verification Engineer | spaCy+RapidFuzz gate, 2-pass reflection | #3 (reads drafts), #5 (writes gate status) |
| #5 | Backend/Export Engineer | FastAPI, python-pptx/docx exporters | #1, #4 (state), #6 (API contract) |
| #6 | Frontend Engineer | React dashboard, Hard Gate modal, citation drawer | #5 (API only) |

## DO NOT Section (applies to all agents)
- Do not add any feature not listed in this document, including anything in the OUT OF SCOPE cut list above
- Do not change shared contract definitions (AgentState fields, Pydantic schemas, API shapes) without updating this file first and notifying all teammates
- Do not rename files or folders from the structure above
- Do not install packages not listed in the tech stack
- Do not add any outbound network call, cloud API key, or telemetry of any kind
- Do not use your own judgment to "improve" the code — build exactly what's specified
