# BUILD_Ingestion_Engineer.md
> ⚠️ AGENT INSTRUCTIONS: You are building ONLY the items in this file. Nothing else. Build exactly as specified.

## Your Scope
Multimodal ingestion (PDF, DOCX, image OCR, audio/video ASR), coordinate-aware chunking, the Source Evidence Index (SQLite), and Primary/Supporting source governance logic including conflict flagging.

## Your Files
- `backend/ingestion/parsers.py` — PyMuPDF, python-docx, Tesseract, faster-whisper wrappers
- `backend/ingestion/chunker.py` — coordinate-aware chunker
- `backend/ingestion/source_governance.py` — authority weighting + conflict detection
- `backend/ingestion/sei_store.py` — SQLite Source Evidence Index CRUD
- `backend/ingestion/normalizer.py` — the actual `run_ingestion_and_normalization(state) -> state` node function

## Your Tasks (ordered by priority)

### Task 1: Build against the fixture first (Day 1-2)
- What to build: `sei_store.py` schema + CRUD, using `fixtures/mock_source_chunks.json` as the target shape to insert/query — do this before touching real parsers, so you validate the schema independently
- File(s): `backend/ingestion/sei_store.py`
- Inputs: `fixtures/mock_source_chunks.json`
- Outputs: SQLite table matching the chunk schema in BUILD.md exactly
- Acceptance criteria: fixture data round-trips through insert → query with no field loss

### Task 2: Parsers (Day 2-4)
- What to build: one function per file type — `parse_pdf(path) -> List[chunk_dict]` (PyMuPDF, preserve page numbers + char offsets), `parse_docx(path) -> List[chunk_dict]` (preserve headings/paragraphs/tables), `parse_image(path) -> List[chunk_dict]` (Tesseract, grayscale + contrast preprocessing first), `parse_audio_video(path) -> List[chunk_dict]` (faster-whisper `small`, `int8`, timestamped segments)
- File(s): `backend/ingestion/parsers.py`
- Inputs: raw uploaded files
- Outputs: chunk dicts matching the exact SEI schema
- Acceptance criteria: each parser tested independently on one sample file of its type, output validated against schema

### Task 3: Chunker + Source Governance (Day 4-5)
- What to build: `chunk_text(raw_text, coordinates) -> List[chunk_dict]`; `apply_source_governance(chunks, primary_doc_id) -> (chunks_with_weights, conflicts[])` implementing the 1.0/0.5 authority weighting and numerical/factual conflict flagging exactly per `02_ingestion_schemas_and_orchestration.md` Section 1.2
- File(s): `backend/ingestion/chunker.py`, `backend/ingestion/source_governance.py`
- Inputs: parsed chunks, operator-designated `primary_doc_id`
- Outputs: `source_chunks`, `merged_context` including a `conflicts` list
- Acceptance criteria: test case with contradicting primary/supporting numbers (e.g. "2 endpoints" vs "14 endpoints") correctly flags the conflict and keeps primary's number authoritative

### Task 4: Wire into AgentState node (Day 5-6)
- What to build: `run_ingestion_and_normalization(state: AgentState) -> AgentState` — the real node function matching Orchestration Lead's stub signature exactly
- File(s): `backend/ingestion/normalizer.py`
- Inputs: `state["uploaded_files"]`
- Outputs: `state["source_chunks"]`, `state["primary_doc_id"]`, `state["extracted_entities"]`
- Acceptance criteria: hand this function to Orchestration Lead by Day 6, they swap it into the graph with no signature changes needed

## Contracts You Must Honor
- Chunk schema is locked (see `fixtures/mock_source_chunks.json`) — any field change requires updating BUILD.md
- `run_ingestion_and_normalization` signature must exactly match what Orchestration Lead stubbed

## DO NOT
- Do not build anything outside parsers/chunker/governance/SEI — verification, prompts, and exporters are not your scope
- Do not modify files owned by other teammates
- Do not change the shared contract definitions
- Do not add packages without updating the master BUILD.md first
