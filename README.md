# Sentinel-Transform: Sovereign Multi-Format Intelligence Transformation Platform
### Smart India Hackathon (SIH) | Problem Statement 26154 | National Technical Research Organisation (NTRO)

[![Sovereign AI](https://img.shields.io/badge/Sovereignty-100%25%20On--Premise-blue.svg)](README.md)
[![Data Egress](https://img.shields.io/badge/Data%20Egress-0%20KB%20(Air--Gapped)-success.svg)](README.md)
[![Hardware](https://img.shields.io/badge/Hardware-Local%20CPU%20%2F%20RTX%203050-orange.svg)](README.md)
[![Deliverables](https://img.shields.io/badge/Deliverables-All%207%20Formats%20Supported-purple.svg)](README.md)

---

## 1. Executive Mission Overview

**Sentinel-Transform** is an air-gapped, on-premise multi-agent AI transformation engine developed for the **National Technical Research Organisation (NTRO)**. It solves the critical intelligence dissemination bottleneck by transforming heterogeneous, sensitive source material (threat intelligence reports, advisories, news articles, scanned documents, and audio/video intercepts) into seven distinct, production-ready communication deliverables through a single unified interface.

### The 7 SIH Deliverables Generated:
1. **Intelligence Advisory**: Formal institutional security advisory document (`.docx` / `.pdf`).
2. **Executive Summary**: Strategic briefing with situational overview and decision matrices.
3. **Presentation Deck**: Multi-slide presentation with bullet hierarchy and speaker notes (`.pptx`).
4. **Video Production Package**: Comprehensive storyboard, narration script, scene descriptions, and subtitle specs.
5. **Infographic Content Spec**: Modular layout hierarchy, key stats callouts, and chart specifications.
6. **LinkedIn Post**: Professional thought-leadership post with strategic hashtags.
7. **Twitter/X Thread**: Numbered multi-tweet sequence strictly respecting 280-character constraints.

---

## 2. Core Architectural Differentiators

- **100% Air-Gapped Local Inference**: Runs entirely on local consumer hardware (optimized for Windows 11 CPU during development and NVIDIA RTX 3050 GPU for deployment). Zero third-party cloud APIs.
- **Deterministic LangGraph State Machine**: Replace black-box agent drift with an inspectable, auditable state machine with checkpoint persistence.
- **Entity Fact-Check Hard Gate**: Flags name and organization transpositions (e.g. *Directorate of Grid Power Resilience* vs. *Directorate of Power Grid Resilience*) in under 50ms using `spaCy` + `RapidFuzz`. Automatically **halts publication** until human analyst approval.
- **Forensic Sentence-Level Claim Attribution**: Chunks retain exact page numbers and character coordinates, enabling interactive click-to-highlight source citations.
- **Deterministic Compilation**: Generates structured Pydantic schemas compiled into real `.pptx` presentations and `.docx` advisories via local Python libraries.

---

## 3. Specifications & System Documentation

Comprehensive technical specifications are located in the [`build_specifications/`](build_specifications/) directory:

- **[`00_master_overview.md`](build_specifications/00_master_overview.md)**: Problem statement context, cardinal principles, scope, and index.
- **[`01_architecture_tech_stack_and_ui.md`](build_specifications/01_architecture_tech_stack_and_ui.md)**: System architecture, technology stack, hardware execution policies, and complete UI parameter framework.
- **[`02_ingestion_schemas_and_orchestration.md`](build_specifications/02_ingestion_schemas_and_orchestration.md)**: Multimodal ingestion engine, Pydantic schemas for all 7 formats, and LangGraph state machine.
- **[`03_verification_debate_and_build_plan.md`](build_specifications/03_verification_debate_and_build_plan.md)**: Entity verification gate, high-stakes advisory debate arena, and phased 8-day build roadmap.
- **[`04_demo_script_and_pitch_deck.md`](build_specifications/04_demo_script_and_pitch_deck.md)**: Scripted 2-minute demo video storyboard and the winning 5-slide technical pitch deck.
- **[`architecture_master_breakdown.md`](build_specifications/architecture_master_breakdown.md)**: Standalone architecture compendium detailing the 3 variants and 9 numbered component deep-dives.

---

## 4. Quickstart Setup Guide (Windows 11)

### 1. Install & Verify Ollama
Download and install Ollama from [ollama.com](https://ollama.com/download/windows). Verify in PowerShell:
```powershell
ollama --version
ollama pull qwen2.5:3b    # For fast CPU development
ollama pull qwen2.5:7b    # For RTX 3050 GPU deployment
```

### 2. Setup Python Environment
```powershell
# Using uv (fastest):
uv venv .venv --python 3.11
uv pip install -r requirements.txt --python .venv\Scripts\python.exe

# Or standard venv:
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 3. Run Orchestration State Machine (Day 1 Stub Graph)
```powershell
.\.venv\Scripts\python.exe -m backend.orchestration.graph
```

### 4. Run Verification & State Machine Tests
```powershell
.\.venv\Scripts\python.exe -m pytest backend/tests/test_orchestration.py -v
```

---

## 5. LangGraph Architecture & Shared State Contract

The orchestration state machine (`backend/orchestration/graph.py`) manages the lifecycle of document transformation across 6 processing nodes:

```
[START] -> ingestion_node -> context_node -> generator_node -> reflection_node
                                                  ^                   |
                                                  |-- (retry <= 1) ---+
                                                                      v
[END] <--- export_node <--- [Hard Gate: Human Approval] <--- verification_gate_node
```

1. **`ingestion_node`**: Normalizes documents into coordinate-indexed chunks.
2. **`context_node`**: Extracts entities and merges primary/supporting context.
3. **`generator_node`**: Dispatches parallel generators for requested deliverable schemas.
4. **`reflection_node`**: Audits drafts against Pydantic schemas (bounded to max 1 retry).
5. **`verification_gate_node`**: Evaluates entity/claim fidelity; triggers Hard Gate if discrepancies arise.
6. **`export_node`**: Compiles deliverables into production `.pptx` and `.docx` packages.

---

## 6. Security & Sovereignty Statement

Sentinel-Transform is engineered specifically for defense and national security applications. All model weights, embeddings, vector indexes, and processing artifacts remain strictly within the host operating system boundary.

