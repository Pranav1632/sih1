# 00. Master Overview & Documentation Index
### SIH Problem Statement 26154 | National Technical Research Organisation (NTRO)
**Platform Name**: Sentinel-Transform (Sovereign Multi-Format Intelligence Transformation Engine)

---

## 1. Problem Definition & Mission Context

National security and intelligence analysts at organisations like the **National Technical Research Organisation (NTRO)** process vast volumes of unstructured, sensitive intelligence data daily—including threat intelligence briefs, incident reports, technical advisories, research papers, policy memorandums, audio/video intercepts, and scanned field reports.

### The Operational Bottleneck:
To disseminate this intelligence to diverse stakeholders (tactical operators, technical engineers, executive leadership, inter-agency liaisons, and public media), analysts must manually analyze the source material and repeatedly draft separate communication deliverables for each target audience. This process is:
- **Labor-Intensive**: Consumes up to 70% of analytical cycles on repetitive re-writing.
- **Prone to Human Error**: Discrepancies emerge across different deliverables derived from the same source.
- **Latency-Critical**: Delays in advisory publication can expose critical national infrastructure to exploitation.

### The Core Barrier:
Standard commercial generative AI solutions (e.g., public ChatGPT, Claude, Gemini cloud endpoints) are **categorically unacceptable** for NTRO due to:
1. **Data Sovereignty Violations**: Classified and restricted telemetry cannot be routed to third-party or foreign cloud infrastructure.
2. **Hallucination Risk**: Unconstrained LLM drafting invents named entities, transposes organizational hierarchies, and fabricates technical claims.
3. **Black-Box Opacity**: Lack of sentence-level auditability prevents forensic verification back to the authoritative source document.

---

## 2. System Mission & Core Principles

**Sentinel-Transform** is an air-gapped, on-premise, multi-agent AI transformation platform that transforms operator-supplied source intelligence into seven distinct, production-ready communication deliverables through a single unified interface.

```
+----------------------------------------------------------------------------------------------------+
|                                    FOUR CARDINAL PRINCIPLES                                        |
+----------------------------------------------------------------------------------------------------+
| 1. The Source is the Absolute Factual Authority                                                    |
|    Output deliverables may adapt style, tone, and format, but may NEVER invent facts, statistics,  |
|    or entities not grounded in the source text.                                                    |
|                                                                                                    |
| 2. Zero Outbound Telemetry (Air-Gapped by Design)                                                  |
|    All inference, embeddings, OCR, ASR, vector indexing, and graph traversal run on local          |
|    hardware (CPU/GPU) behind an air-gapped security perimeter. Zero external API calls.            |
|                                                                                                    |
| 3. Mandatory Human-in-the-Loop Gate for Discrepancies                                              |
|    Any claim or named entity that cannot be deterministically verified against the source text     |
|    triggers a HARD GATE that halts publication and mandates human operator review.                 |
|                                                                                                    |
| 4. Deterministic Structured Generation Before Rendering                                            |
|    LLMs generate validated JSON schemas (Pydantic models), which are then compiled into real       |
|    artifacts (.pptx, .docx, web cards) by deterministic code, eliminating structural drift.        |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Scope of Required Deliverables (The 7 SIH Formats)

The system fulfills all seven deliverables explicitly enumerated in SIH Problem Statement 26154:

| Format ID | Deliverable Name | Output Specification | Physical Artifact Form |
|---|---|---|---|
| `F1` | **LinkedIn Post** | Professional headline, narrative hook, key takeaways, strategic hashtags, call-to-action, evidence citations. | Formatted rich-text card with 1-click copy. |
| `F2` | **Twitter/X Post & Thread** | Ordered multi-tweet sequence, character-count aware ($\le 280$ chars), numbering `(1/N)`, hashtags, source citations. | Thread preview card with per-tweet copy controls. |
| `F3` | **Intelligence Advisory** | Structured national security advisory: Threat Overview, Affected Systems, Impact Assessment, IOCs, Remediation Steps. | Formal downloadable `.docx` / `.pdf` with institutional header. |
| `F4` | **Executive Summary** | High-level situational briefing: Situation, Key Findings, Risk Assessment, Decisions Required, Source Traceability. | Executive briefing document card & printable summary. |
| `F5` | **Presentation Deck** | Multi-slide structure: Slide titles, hierarchical bullet points, visual direction, and complete speaker notes. | Real, editable `.pptx` presentation file via `python-pptx`. |
| `F6` | **Video Production Package** | Complete video package: Logline, target duration, scene-by-scene storyboard, narration script, subtitles, visual cues. | Comprehensive production brief document (`.docx` / `.pdf`). |
| `F7` | **Infographic Content Spec** | Content hierarchy, core stats/callouts, layout block recommendations, chart type specifications, key messaging. | Structured visual layout brief card and JSON spec. |

---

## 4. Consolidated Build Specifications Index

The engineering specifications are consolidated into four comprehensive master documents:

- **[`00_master_overview.md`](file:///d:/downloads%20D/files%20%281%29/build_specifications/00_master_overview.md)**: (This file) Problem statement context, cardinal defense principles, scope, and index.
- **[`01_architecture_tech_stack_and_ui.md`](file:///d:/downloads%20D/files%20%281%29/build_specifications/01_architecture_tech_stack_and_ui.md)** *(Combined 1 + 2 + 3)*:
  - System Architecture & End-to-End Multi-Agent Flow (Dual-Tier design)
  - Technology Stack & Hardware Execution Policy (Windows 11 CPU $\rightarrow$ RTX 3050 portability, benchmarks, 0 KB egress)
  - Complete Parameter Matrix (all 11 controls mapped), Format-Aware Parameter Resolver, Dashboard UI Wireframe & Hard Gate Modal.
- **[`02_ingestion_schemas_and_orchestration.md`](file:///d:/downloads%20D/files%20%281%29/build_specifications/02_ingestion_schemas_and_orchestration.md)** *(Combined 4 + 5 + 6)*:
  - Multimodal Ingestion Pipeline (PyMuPDF, docx, Tesseract OCR, faster-whisper)
  - Source Governance (Primary vs. Supporting authority weights) & Forensic Sentence-Level Claim Attribution (Gap 5 Solution)
  - Complete Pydantic v2 Schemas for All 7 Formats & Deterministic File Exporters (`python-pptx` slides + speaker notes, `python-docx`)
  - LangGraph State Machine Specification (`AgentState` TypedDict, StateGraph nodes, edges, bounded reflection, and checkpoint interrupts).
- **[`03_verification_debate_and_build_plan.md`](file:///d:/downloads%20D/files%20%281%29/build_specifications/03_verification_debate_and_build_plan.md)** *(Combined 7 + 8 + 9)*:
  - Verification Gate & GraphRAG Entity Architecture (`spaCy` + `RapidFuzz` <50ms CPU code, `NetworkX` knowledge graph traversal)
  - High-Stakes Advisory Pipeline (Multi-Agent Debate Arena: Threat Analyst vs. Risk Analyst $\rightarrow$ Judge, and 2-Pass Bounded Reflection)
  - Step-by-Step Implementation & Build Roadmap (Phases 1 to 5 with exact PowerShell commands on Windows 11).
- **[`04_demo_script_and_pitch_deck.md`](file:///d:/downloads%20D/files%20%281%29/build_specifications/04_demo_script_and_pitch_deck.md)**:
  - Scripted 2-Minute Demo Video Storyboard (120-second hard cap with fast-forward cues and spoken voiceover)
  - Winning 5-Slide Technical Pitch Deck Specification tailored for the NTRO jury.
