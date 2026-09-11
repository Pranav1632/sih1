# Master Architecture Compendium: Variants & Numbered Component Breakdown
### SIH Problem Statement 26154 | National Technical Research Organisation (NTRO)
**Platform Name**: Sentinel-Transform (Sovereign Multi-Format Intelligence Transformation Engine)

---

# PART I: THE THREE ARCHITECTURAL VARIANTS

In national defense intelligence systems, one size does not fit all stages of evaluation. We define **three precise architectural variants**, mapping each to its strategic role in qualifying for the **top 5 out of 500 teams**:

```
+---------------------------------------------------------------------------------------------------------+
|                                    THREE ARCHITECTURAL VARIANTS                                         |
+---------------------+---------------------------------+-------------------------+-----------------------+
| Variant             | Name & Core Philosophy          | Primary Target / Use    | Key Strength          |
+---------------------+---------------------------------+-------------------------+-----------------------+
| VARIANT 1           | Deterministic State Machine     | Live Video Demo &       | Zero-crash stability, |
|                     | (LangGraph Execution Engine)    | Working Codebase        | sub-3s latency, 100%  |
|                     |                                 |                         | deliverable coverage  |
+---------------------+---------------------------------+-------------------------+-----------------------+
| VARIANT 2           | Advanced Sovereign Agentic      | 5-Slide Technical PPT & | Theoretical depth,    |
|                     | Architecture (GraphRAG+Debate)  | 2-Page Architecture Doc | multi-hop reasoning,  |
|                     |                                 |                         | self-correcting agents|
+---------------------+---------------------------------+-------------------------+-----------------------+
| VARIANT 3           | Unified Production Hybrid       | Enterprise Scalability  | Modular plugin: V1 is |
|                     | Architecture                    | & Final Grand Finale    | kernel, V2 features   |
|                     |                                 | Live Defense Stage      | plug in as subgraphs  |
+---------------------+---------------------------------+-------------------------+-----------------------+
```

---

## 1. Variant 1: Deterministic State Machine Engine (Demo & Code Submission)
- **Design Philosophy**: High reliability, deterministic state transitions, bounded execution, and review-first checkpoints.
- **Target Role**: Powers the **working code repository** and the **2-minute video recording**. It guarantees that the system will never crash, hallucinate unhandled exceptions, or freeze during live evaluation.
- **Key Characteristics**:
  - Linear/branching state progression using **LangGraph StateGraph**.
  - Local Qwen 2.5 inference with zero third-party network calls.
  - Deterministic exact/fuzzy entity verification (<50ms CPU execution).
  - Mandatory human review modal before file export.

```mermaid
flowchart TD
    V1_IN["1. Ingestion & Source Governance"] --> V1_CTX["2. Context & Entity Extraction"]
    V1_CTX --> V1_ROUTER{"3. Deterministic Router"}
    V1_ROUTER --> V1_GEN["4. Parallel Format Generators (7 Formats)"]
    V1_GEN --> V1_REF["5. Bounded Reflection Pass (<=1 retry)"]
    V1_REF --> V1_GATE{"6. Entity Fact-Check Hard Gate"}
    V1_GATE -->|"Mismatch"| V1_HUMAN["Mandatory Human Review Modal"]
    V1_GATE -->|"Passed"| V1_EXP["7. Deterministic Exporters (PPTX, DOCX)"]
    V1_HUMAN -->|"Analyst Approves"| V1_EXP

    classDef v1 fill:#ccfbf1,stroke:#0d9488,color:#134e4a;
    classDef gate fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
    class V1_IN,V1_CTX,V1_ROUTER,V1_GEN,V1_REF,V1_EXP v1;
    class V1_GATE,V1_HUMAN gate;
```

---

## 2. Variant 2: Advanced Sovereign Agentic Architecture (PPT & Pitch Submission)
- **Design Philosophy**: Autonomous cognitive reasoning, knowledge graph grounding, multi-agent dialectical debate, and episodic memory reuse.
- **Target Role**: Featured in the **5-slide technical pitch deck** and **2-page architecture submission**. It positions your team far above the 495 competitors who submit basic "prompt wrapper" pipelines.
- **Key Characteristics**:
  - **Plan-and-Solve Orchestration**: Autonomous task decomposition for novel intelligence combinations.
  - **Multi-Agent Debate Arena**: Threat Analyst vs. Operational Risk Analyst merged by an impartial Judge for critical advisories.
  - **GraphRAG Traversal**: Multi-hop verification over an in-memory entity relationship graph.
  - **Episodic Hybrid Memory**: Approved outputs write back to an episodic session log, making the system smarter over repeated queries.

```mermaid
flowchart TD
    V2_IN["Multimodal Ingest"] --> V2_GRAPH[("Local Knowledge Graph<br/>GraphRAG")]
    V2_IN --> V2_VEC[("Vector Store")]
    V2_GRAPH & V2_VEC --> V2_MERGE["Merged Context"]
    V2_MERGE --> V2_PLAN["Plan-and-Solve Orchestrator"]
    
    V2_PLAN --> V2_GEN["Format Generation Cascade"]
    V2_GEN --> V2_DEBATE["Debate Arena (High-Stakes Advisory)"]
    V2_GEN --> V2_REFLECT["2-Pass Reflection Loop"]
    V2_DEBATE --> V2_REFLECT
    
    V2_REFLECT --> V2_GRAG_GATE{"GraphRAG Multi-Hop Gate"}
    V2_GRAG_GATE --> V2_REVIEW["Operator Review & Approval"]
    V2_REVIEW --> V2_EPI[("Episodic Memory Log")]
    V2_EPI -.->|"Compounds Knowledge"| V2_GRAPH

    classDef adv fill:#ede9fe,stroke:#7c3aed,color:#4c1d95;
    classDef mem fill:#dbeafe,stroke:#2563eb,color:#1e3a8a;
    class V2_IN,V2_MERGE,V2_PLAN,V2_GEN,V2_DEBATE,V2_REFLECT,V2_GRAG_GATE,V2_REVIEW adv;
    class V2_GRAPH,V2_VEC,V2_EPI mem;
```

---

## 3. Variant 3: Unified Production Hybrid Architecture (Enterprise Reality)
- **Design Philosophy**: The engineering bridge between Variant 1 and Variant 2. Variant 1 acts as the **stable execution kernel**, while Variant 2 capabilities plug in as **isolated, compiled subgraphs**.
- **Why this matters**: You never have to throw away code. When moving from the hackathon demo to the Grand Finale, you simply plug in the debate subgraph and GraphRAG module into existing LangGraph nodes.

```mermaid
graph TD
    subgraph KERNEL["Stable Execution Kernel (Variant 1)"]
        K_ING[Ingestion Node] --> K_CTX[Context Node]
        K_CTX --> K_ROUTE[Router Node]
        K_ROUTE --> K_GEN[Generators Node]
        K_GEN --> K_GATE[Fact Gate Node]
        K_GATE --> K_EXP[Exporter Node]
    end

    subgraph PLUGINS["Modular Agentic Plugins (Variant 2 Upgrades)"]
        K_ROUTE -.->|"output == advisory"| P_DEBATE["Debate Subgraph<br/>(Threat Agent + Risk Agent -> Judge)"]
        P_DEBATE -.-> K_GATE
        
        K_GATE -.->|"entity check"| P_GRAG["GraphRAG Traversal<br/>(NetworkX Multi-Hop Query)"]
        P_GRAG -.-> K_EXP
    end

    classDef k fill:#ccfbf1,stroke:#0d9488,color:#134e4a;
    classDef p fill:#fce7f3,stroke:#db2777,color:#831843;
    class K_ING,K_CTX,K_ROUTE,K_GEN,K_GATE,K_EXP k;
    class P_DEBATE,P_GRAG p;
```

---

# PART II: COMPONENT-WISE DEEP-DIVE (NUMBERED 1 TO 9)

To eliminate complexity, the entire architecture is broken down into **nine modular, numbered components**. Each component has an isolated sub-diagram, exact I/O contracts, and failure mitigations.

---

### Component 1: Multimodal Ingestion & Source Governance Engine

```mermaid
flowchart LR
    RAW["Raw Upload: PDF, DOCX, Scans, Audio/Video"] --> GOV{"Source Governance Engine"}
    GOV -->|"Primary Checkbox"| PRI["Primary Authority (Weight: 1.0)"]
    GOV -->|"Secondary Files"| SUP["Supporting Context (Weight: 0.5)"]
    
    PRI & SUP --> ROUTE_TYPE{"File Type Dispatch"}
    ROUTE_TYPE -->|".pdf"| PYMU["PyMuPDF Parser (Layout & Pages)"]
    ROUTE_TYPE -->|".docx"| DOCX["python-docx Parser (Tables & Headers)"]
    ROUTE_TYPE -->|".png/.jpg"| TESS["Tesseract OCR Engine (Contrast Enhanced)"]
    ROUTE_TYPE -->|".mp4/.wav"| WHISP["faster-whisper (Timestamped ASR)"]
```

* **Responsibilities**: Normalizes heterogeneous files into structured text while establishing institutional authority hierarchies.
* **Input Data**: Binary file streams (`.pdf`, `.docx`, `.png`, `.jpg`, `.mp4`, `.wav`, raw text prompt).
* **Output Data**: Ordered list of normalized document objects with governance tags (`source_role: PRIMARY | SUPPORTING`).
* **Hardware Policy**: Runs 100% on CPU using PyMuPDF, Tesseract, and faster-whisper (CTranslate2).
* **Failure Mitigation**: If OCR confidence is low (<60%), the chunk is flagged with `low_confidence: True` to warn downstream generators.

---

### Component 2: Unified Evidence Index & Dual-Extraction Layer

```mermaid
flowchart TD
    RAW_CHUNKS["Ingested Text Chunks"] --> CHUNK_INDEXER["Coordinate Chunker<br/>Assigns doc_id, chunk_id, page_no, char_offsets"]
    CHUNK_INDEXER --> SEI[("Source Evidence Index")]
    
    SEI --> AGENT_CTX["Context Extraction Agent<br/>Narrative Spine, Findings, Timeline"]
    SEI --> AGENT_ENT["Keyword & Entity Agent (spaCy + LLM)<br/>Names, Orgs, Threat Clusters, IOCs, CVEs"]
    
    AGENT_CTX --> MERGE["Unified Merged Context Object"]
    AGENT_ENT --> MERGE
    AGENT_ENT --> ENT_REGISTRY[("Source Entity Registry<br/>(Ground Truth Set)")]
```

* **Responsibilities**: Establishes forensic chunk coordinates and extracts an immutable factual anchor before any format drafting begins.
* **Input Data**: Raw normalized text streams from Component 1.
* **Output Data**:
  1. `Source Evidence Index`: Chunks indexed by physical coordinates (`doc_id`, `chunk_id`, `page_number`, `char_start`, `char_end`).
  2. `Merged Context Object`: Concise executive narrative spine.
  3. `Source Entity Registry`: Clean set of verified named entities (People, Orgs, Malware, CVEs).
* **Why it matters**: Prevents cross-format drift. When Twitter and Advisory are generated simultaneously, both condition on this *same* context.

---

### Component 3: Hybrid Orchestration & Request Routing Engine

```mermaid
flowchart TD
    INPUT["Merged Context + Operator Dashboard Parameters"] --> ROUTER{"Request Analyzer Node"}
    
    ROUTER -->|"Single Standard Format"| FAST["Direct Template Dispatcher<br/>(0ms LLM Overhead)"]
    ROUTER -->|"Multi-Format or Novel Objective"| PLANNER["Plan-and-Solve Task Decomposer<br/>(LLM Decomposition)"]
    
    FAST --> TASKS["Dispatched Task Queue"]
    PLANNER --> TASKS
```

* **Responsibilities**: Inspects the operator's request and routes via the fastest, most cost-effective path.
* **Routing Logic**:
  - **Fast Path (Rule-Based)**: Known single-format requests (e.g. "Advisory only" or "LinkedIn only") route directly to the prompt template. Latency overhead: **0 ms**.
  - **Planner Path (LLM Planner)**: Multi-format requests (e.g. "Generate Advisory + Twitter Thread + Presentation") decompose into parallel task payloads.

---

### Component 4: Parallel Format Generation Engines (The 7 Formats)

```mermaid
flowchart LR
    QUEUE["Task Queue"] --> FORK{"Parallel Dispatcher"}
    
    FORK --> F1["1. LinkedIn Agent -> LinkedInSchema"]
    FORK --> F2["2. Twitter/X Agent -> TwitterThreadSchema (<280 char)"]
    FORK --> F3["3. Executive Summary Agent -> ExecSummarySchema"]
    FORK --> F4["4. Presentation Agent -> PresentationSchema (Slides+Notes)"]
    FORK --> F5["5. Video Package Agent -> VideoPackageSchema (Storyboard)"]
    FORK --> F6["6. Infographic Agent -> InfographicSchema (Layout Specs)"]
    FORK --> F7["7. Advisory Agent -> Routed to Advisory Subgraph (Component 5)"]
```

* **Responsibilities**: Transforms the shared context into deliverable-specific structured JSON models.
* **Key Guarantee**: Every agent outputs strict JSON conforming to Pydantic schemas defined in Component 8.
* **Execution Footprint**:
  - On RTX 3050 GPU: Runs sequentially or queued in ~7–9 seconds per format using Qwen 2.5 7B.
  - On CPU: Runs in ~4–6 seconds using Qwen 2.5 3B.

---

### Component 5: High-Stakes Advisory Pipeline (Multi-Agent Debate)

```mermaid
flowchart TD
    ADV_IN["Advisory Task Dispatched"] --> FORK_DEBATE{"Split Analytical Perspectives"}
    
    FORK_DEBATE --> AGENT_THREAT["Threat Analyst Agent<br/>Focus: Attack vectors, CVEs, protocol abuse, IOCs"]
    FORK_DEBATE --> AGENT_RISK["Operational Risk Agent<br/>Focus: Blast radius, asset exposure, compliance directives"]
    
    AGENT_THREAT --> DRAFT_A["Draft A (Technical Priority)"]
    AGENT_RISK --> DRAFT_B["Draft B (Risk Priority)"]
    
    DRAFT_A & DRAFT_B --> JUDGE["Debate Judge Synthesizer Agent<br/>Resolves contradictions adhering to Primary Source.<br/>Fuses best IOCs from Draft A and best risk language from Draft B."]
    
    JUDGE --> FUSED_ADV["Fused Advisory Draft -> AdvisorySchema"]
```

* **Responsibilities**: Elevates national security threat advisories from standard summaries to peer-reviewed intelligence products.
* **Why it works**: Eliminates single-prompt bias. A single LLM prompt either becomes too technical or too generic. Two specialized agents arguing through an impartial Judge Agent yield balanced, actionable advisories.

---

### Component 6: Bounded Self-Reflection & Schema Repair Loop

```mermaid
flowchart TD
    DRAFT["Generated Deliverable JSON"] --> AUDIT{"Reflection Audit Node"}
    
    AUDIT --> CHK1["Check 1: Mandatory Schema Fields Populated?"]
    AUDIT --> CHK2["Check 2: Word Count within Target Range (+/-15%)?"]
    AUDIT --> CHK3["Check 3: Are Mitigations Contradicting Constraints?"]
    
    CHK1 & CHK2 & CHK3 --> DECISION{"Any Violations Found?"}
    
    DECISION -->|"Yes & Retry < 1"| REPAIR["Targeted Patch Pass (LLM Repair)"]
    REPAIR --> AUDIT
    
    DECISION -->|"Yes & Retry >= 1"| FORCE_PASS["Force Proceed with Warning Tag"]
    DECISION -->|"Clean / No Errors"| PASS["Proceed to Component 7"]
    FORCE_PASS --> PASS
```

* **Responsibilities**: Catches structural omissions and JSON formatting issues automatically.
* **Hard Cap Rule**: Maximum **1 retry pass**. If an issue persists, the system forces forward progress and routes the draft to the human review gate, guaranteeing zero infinite latency loops.

---

### Component 7: Dual-Layer Verification & Entity Fact-Check Hard Gate

```mermaid
flowchart TD
    DRAFT_TEXT["Validated Deliverable Draft"] --> NER["spaCy Entity Extractor (CPU <20ms)<br/>Pulls all Person, Org, GPE, Threat mentions"]
    
    NER --> MATCH{"Layer 1: RapidFuzz Exact/Fuzzy Matcher"}
    MATCH -->|"Exact Match in Source Entity Registry"| CLEAN["Status: Verified Clean"]
    
    MATCH -->|"Similarity 75% - 99%"| TRANSPOSITION["FLAG: Entity Transposition Detected!"]
    MATCH -->|"Similarity < 75%"| UNGROUNDED["FLAG: Ungrounded New Entity!"]
    
    TRANSPOSITION & UNGROUNDED --> HARD_GATE{"HARD GATE DECISION"}
    
    HARD_GATE -->|"Mismatch Found"| HALT["HALT AUTOMATED EXPORT<br/>Pop Up Mandatory Human Review Modal"]
    HALT --> OPERATOR{"Human Analyst Action"}
    
    OPERATOR -->|"Accept Source Correction"| APPLY["Replace Entity & Log Audit Trail"]
    OPERATOR -->|"Override Draft"| OVERRIDE["Log Signed Analyst Override"]
    
    CLEAN --> APPROVED["Proceed to Component 8 (Export)"]
    APPLY & OVERRIDE --> APPROVED
```

* **Responsibilities**: The flagship anti-hallucination differentiator. Detects when an LLM transposes an organization name (e.g. *"Directorate of Grid Power Resilience"* vs. *"Directorate of Power Grid Resilience"*).
* **The Hard Gate Protocol**: Automated file export is physically blocked until an analyst reviews and resolves the flag.

---

### Component 8: Deterministic Multi-Format Exporters

```mermaid
flowchart LR
    VALIDATED_SCHEMAS["Approved Pydantic Schemas"] --> DISPATCH{"Exporter Dispatcher"}
    
    DISPATCH -->|"PresentationSchema"| EXP_PPTX["python-pptx Exporter<br/>Outputs native .pptx slide deck with speaker notes"]
    DISPATCH -->|"AdvisorySchema"| EXP_DOCX["python-docx Exporter<br/>Outputs formal Word advisory with institutional headers"]
    DISPATCH -->|"ExecSummarySchema"| EXP_PDF["ReportLab PDF Exporter<br/>Outputs executive briefing PDF"]
    DISPATCH -->|"Social & Video"| EXP_WEB["Interactive UI Cards<br/>1-click copy-ready formatted rich text"]
```

* **Responsibilities**: Compiles validated JSON data into real, editable Microsoft Office and PDF files.
* **Key Feature**: Presentations exported via `python-pptx` include actual PowerPoint slide shapes, bullet hierarchies, visual layouts, and complete speaker notes referencing source document pages.

---

### Component 9: Hybrid Memory & Air-Gapped Audit Logging Layer

```mermaid
flowchart TD
    OP_ACTION["Operator Review & Approval Event"] --> LOGGER["Audit Trail Engine"]
    
    LOGGER --> SQLITE[("Local SQLite Audit Database<br/>job_id • inputs • model_outputs • diffs • timestamps")]
    LOGGER --> EPI_LOG[("Episodic Session Memory<br/>Approved Entity Corrections")]
    
    EPI_LOG -.->|"Refines Future Discrepancy Gate"| ENT_REGISTRY[("Source Entity Registry")]
```

* **Responsibilities**: Records a permanent, tamper-evident forensic log of every transformation and feeds approved entity corrections back into local memory so the system gets faster and more confident over time.
* **Security Posture**: Stored locally in SQLite; zero data is transmitted off the machine.

---

# PART III: ARCHITECTURAL SELECTION & MIGRATION MATRIX

| Evaluation Milestone | Recommended Architecture Variant | Why This Variant Wins |
|---|---|---|
| **Round 1 Screening (Online Submission)** | **Variant 1 for Demo Video & Code**<br/>**Variant 2 for 5-Slide PPT & Architecture Doc** | Evaluators see a flawless, crash-proof 2-minute demo showing all 7 formats working live, accompanied by a pitch deck demonstrating elite defense-grade theoretical depth. |
| **Grand Finale (Live Defense Stage)** | **Variant 3 (Unified Hybrid Architecture)** | Demonstrates that the code running on the stage laptop is the modular foundation of a nation-scale sovereign intelligence system. |

### Code Migration Path (Adding Variant 2 to Variant 1 Without Rewrites):
1. **Week 1 (MVP)**: Implement Components 1, 2, 3, 4, 7, and 8. You have a rock-solid, working 7-format engine with the Hard Gate.
2. **Week 2 (Deepening)**: Plug Component 5 (Advisory Debate) into the LangGraph router as an isolated subgraph.
3. **Week 3 (Episodic Upgrade)**: Add Component 9 (SQLite Episodic memory) to write back verified corrections to Component 2's entity registry.
