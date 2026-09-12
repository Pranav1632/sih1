# PPTX_BUILD.md — Sentinel-Transform Pitch Deck
### SIH 2026 | PS 26154 | Gen AI Platform for Automated Content Transformation | NTRO
> Modeled on the team's PS-26183 deck structure (6 slides: Title → Innovation & Solution → Tech Stack → Risk/Feasibility → Benefits by Domain → Key Papers & Context) — same visual grammar, sharper content, real citations.
>
> ⚠️ AGENT INSTRUCTIONS: Build exactly these 6 slides, this content, in this order. Do not add slides. Do not invent statistics or citations beyond what's listed here — every number below is sourced; if you need another, flag it, don't fabricate one.

## Design Direction (match the PS-26183 deck's visual language)
- Same freeform/icon-badge header style per slide (colored geometric header shape + slide title in caps top-left)
- Dark, high-contrast palette; one accent color per slide section (blue for Innovation, teal for Tech, amber/red for Risk, green for Benefits)
- Numbered/lettered micro-badges next to each key stat (mirrors the "24.02L", "$154B" callout style)
- Every claim that has a source gets a small citation tag, bottom-of-box, same as the reference deck's paper citations

---

## Slide 1 — Title Page
- **Header shapes**: same decorative group elements as reference slide 1 (blank layout, logo group top, grid accents)
- **Content block**:
  - Problem Statement ID – 26154
  - Problem Statement Title – Gen AI Platform for Automated Content Transformation
  - Theme – Blockchain & Cybersecurity
  - PS Category – Software
  - Team ID – [fill in]
  - Team Name – [fill in]
  - Platform Name (subtitle under team block): **Sentinel-Transform** — Sovereign Multi-Format Intelligence Transformation Engine

---

## Slide 2 — Innovation & Uniqueness
- **Slide title (header badge)**: INNOVATION & UNIQUENESS
- **Big stat callout** (top-right, mirrors "3x" badge): **0 KB** — egress, always
- **Proposed Solution** (box):
  - One analyst-supplied source (report, advisory, article, scan, audio/video) → up to 7 mission-ready deliverables, generated in parallel from a single shared context
  - Every deliverable is deterministically compiled — the LLM writes structured data, not the final file
- **How It Addresses The Problem** (box):
  - Eliminates the manual re-drafting cycle analysts currently repeat per audience — reclaims time currently lost to repetitive rewriting across formats
  - Single shared context object across all 7 generators removes cross-deliverable contradiction (the advisory and the LinkedIn post can no longer disagree on a number)
  - Air-gapped local inference means the source material never leaves the operator's machine — the actual barrier named in the PS is solved architecturally, not by policy promise
- **Five differentiator callouts** (small tiles, mirrors the reference deck's 5-tile row):
  1. **Zero-Egress Air-Gapped Inference** — no cloud LLM, no API key, no telemetry, ever
  2. **Entity Fact-Check Hard Gate (<50ms)** — spaCy + RapidFuzz catch name/org transpositions before export and physically lock the download endpoint until a human signs off
  3. **Primary vs. Supporting Source Governance** — deterministic 1.0 / 0.5 authority weighting auto-resolves conflicting numbers across documents instead of silently picking one
  4. **Deterministic Compilation, Not Free-Text Export** — validated Pydantic schema → real `.pptx`/`.docx` via code, eliminating structural drift between runs
  5. **Forensic Sentence-Level Citation** — every generated claim traces to an exact source page and character offset; hover-to-highlight in the source document

---

## Slide 3 — Tech Stack
- **Slide title**: TECH STACK
- **Layout**: grouped by pipeline stage (mirrors reference deck's icon-column layout)
  - **Ingestion**: PyMuPDF (PDF) · python-docx (DOCX) · Tesseract OCR (scans/images) · faster-whisper `small` int8 (audio/video)
  - **Orchestration**: LangGraph `StateGraph` + `MemorySaver` checkpointing — auditable, resumable state machine, not a black-box agent loop
  - **Local Inference**: Ollama runtime — `phi4-mini` (CPU dev + 4GB-VRAM demo) / `qwen2.5:7b` Q4_K_M (6GB+ VRAM demo, confirmed Day 1 against actual hardware)
  - **Verification**: spaCy `en_core_web_sm` + RapidFuzz (Layer 1, shipped) · NetworkX GraphRAG multi-hop traversal (Layer 2, Phase 2 roadmap)
  - **Structured Generation**: Pydantic v2 schemas + `ChatOllama.with_structured_output()`
  - **Export**: python-pptx (editable decks + speaker notes) · python-docx (institutional advisories)
  - **Backend**: FastAPI
  - **Frontend**: React + Vite + TypeScript + Tailwind + lucide-react
- **Hardware execution policy strip** (bottom banner, mirrors reference deck's benchmark strip):
  - Dev: Windows 11, CPU-only, `phi4-mini`/`qwen2.5:3b`
  - Demo: NVIDIA RTX 3050 (VRAM confirmed Day 1 — 4GB → `phi4-mini`; 6GB+ → `qwen2.5:7b` Q4_K_M)
  - **0 KB outbound network traffic**, verified via local firewall log during demo

---

## Slide 4 — Risk → Mitigation & Why It's Feasible
- **Slide title**: RISK → MITIGATION
- **Risk/mitigation pairs** (mirrors reference deck's arrow-pair tiles):
  - *Local LLM too slow/unstable live* → Recorded demo uses 4-8x fast-forward with on-screen timer during generation passes; smaller fallback model (`phi4-mini`) always available
  - *Entity gate false-flags legitimate synonyms* → Fuzzy threshold tuned to the 75–99% similarity band only; below 75% is a separate "ungrounded new entity" class; human override always available, system never blocks silently
  - *RTX 3050 VRAM insufficient for the planned demo model* → Day 1 `nvidia-smi` check locks the model choice before any build work starts; `phi4-mini` is the confirmed universal fallback
  - *Cross-document conflicting facts (primary vs. supporting)* → Deterministic source governance (Slide 2, differentiator #3) resolves this automatically and flags the conflict for the analyst rather than silently picking one number
  - *Judges skeptical of a "zero hallucination" claim* → Live demo deliberately induces an entity transposition and shows the Hard Gate catching and halting it in real time — the claim is demonstrated, not asserted
- **Why It's Feasible** (box):
  - Every component is open-source and CPU-runnable — no paid API dependency, no internet dependency during judging
  - Structured output via Pydantic eliminates most of the format-drift risk that sinks free-text LLM demos
  - Built on established, published techniques — entity/claim grounding against source documents is an active, well-documented research area (Dhuliawala et al., ACL Findings 2024, *Chain-of-Verification Reduces Hallucination*; Tang et al., EMNLP 2024, *MiniCheck: Efficient Fact-Checking of LLMs on Grounding Documents*) — not unproven research
  - 10-day/6-person scope is deliberately cut to what ships: Layer 1 verification gate + single-pass generation + 2-pass reflection audit are the committed build; multi-agent debate arena and GraphRAG Layer 2 are named explicitly as Phase 2 roadmap, not overclaimed as done

---

## Slide 5 — Benefits by Domain
- **Slide title**: BENEFITS BY DOMAIN
- **Table** (Domain | Benefit | Problem Scale — mirrors reference deck exactly):

| Domain | Benefit | Problem Scale |
|---|---|---|
| **Operational** | Frees analysts from repetitive manual re-drafting across every audience-specific format | Manual multi-format rewriting is a named, explicit bottleneck in the PS itself |
| **National Security** | Faster advisory-to-publication time without sacrificing accuracy | CERT-In alone issued 65 formal advisories, 1,530 alerts and 390 vulnerability notes in 2025 — every one manually drafted per audience today |
| **Scale** | Background-capable pipeline supports rising incident volume without proportional analyst headcount growth | CERT-In handled 29.44 lakh (2.94M) cyber incidents in 2025, with a projected ~30% increase for 2026 |
| **Trust & Auditability** | Forensic sentence-level citation + Hard Gate produce defensible, traceable outputs instead of black-box LLM text | Directly answers the PS's stated concern about hallucination risk in unconstrained generative drafting |
| **Sovereignty** | Zero outbound telemetry — classified/sensitive source material never reaches third-party infrastructure | Directly answers the PS's stated data-sovereignty barrier to using commercial cloud GenAI tools |

---

## Slide 6 — Key Papers & Grounding
- **Slide title**: KEY PAPERS
- **Grounding / Hallucination Detection**:
  - Dhuliawala et al. (2024) — *Chain-of-Verification Reduces Hallucination in Large Language Models* — ACL Findings 2024
  - Tang, Laban & Durrett (2024) — *MiniCheck: Efficient Fact-Checking of LLMs on Grounding Documents* — EMNLP 2024
  - Ji et al. (2023) — *Towards Mitigating Hallucination in Large Language Models via Self-Reflection* — arXiv:2310.06271 (basis for the 2-pass reflection engine)
  - Jacovi et al. (2025) — *The FACTS Grounding Leaderboard: Benchmarking LLMs' Ability to Ground Responses to Long-Form Input* — arXiv:2501.03200
- **Knowledge-Graph Verification (Phase 2 roadmap basis)**:
  - Edge et al. (2024) — *From Local to Global: A GraphRAG Approach to Query-Focused Summarization* — arXiv:2404.16130 (basis for the planned Layer 2 NetworkX multi-hop traversal)
- **India Context** (source: Carnegie Endowment, "Mapping India's Cybersecurity Administration in 2025"; SARO India Cybersecurity Threat Landscape 2025–2026):
  - NCIIPC (under NTRO) issues advisories and near-real-time threat intelligence for Critical Information Infrastructure; CERT-In serves as the national nodal agency for broader incident response
  - CERT-In 2025: 29.44 lakh incidents handled, 1,530 alerts, 390 vulnerability notes, 65 advisories issued — all currently requiring manual multi-audience drafting
  - **Confirmed gap**: no publicly documented sovereign, air-gapped, deterministic-verification content transformation platform exists for this workflow today — this is the gap Sentinel-Transform targets
