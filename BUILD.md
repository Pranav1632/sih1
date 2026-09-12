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

### File Structure (root)
```
sentinel-transform/
├── backend/
│   ├── models/formats/        # 7 Pydantic schemas — LLM/Prompt Engineer
│   ├── ingestion/              # parsers, chunker, SEI — Ingestion Engineer
│   ├── orchestration/          # state.py, graph.py, nodes — Orchestration Lead
│   ├── verification/           # fuzzy_matcher.py, gate.py, reflection.py — Verification Engineer
│   ├── exporters/               # pptx_exporter.py, docx_exporter.py — Backend/Export Engineer
│   ├── api/                     # FastAPI routes — Backend/Export Engineer
│   └── main.py
├── frontend/
│   └── src/components/         # IngestionZone, ParameterControls, HardGateModal, CitationDrawer — Frontend Engineer
├── fixtures/                    # mock_source_chunks.json, mock_draft_outputs.json — shared, frozen Day 1
└── data/                        # SQLite DB, uploaded files (gitignored)
```

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
