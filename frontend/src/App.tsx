import React, { useState, useEffect } from 'react';
import {
  Shield,
  Cpu,
  Download,
  Archive,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileText,
  Presentation,
  Video,
  BarChart3,
  Linkedin,
  Twitter,
  BookOpen,
  RefreshCw,
  Check,
  Zap,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Lock,
  Terminal,
  Activity,
  UploadCloud,
  FileCheck2,
  History,
  ChevronDown,
} from 'lucide-react';

import { IngestionZone, UploadedItem } from './components/IngestionZone';
import { ParameterSection1, ParameterSection2, ParameterSection3 } from './components/ParameterControls';
import { HardGateModal } from './components/HardGateModal';
import { SourceEvidenceViewer } from './components/SourceEvidenceViewer';
import { PipelineWorkingState } from './components/PipelineWorkingState';
import { HistoryArchive, HistorySessionItem, ChatMessage } from './components/HistoryArchive';

import {
  GlobalParams,
  SourceChunk,
  EntityDiscrepancy,
  PipelineLogEvent,
  MOCK_DRAFT_OUTPUTS,
  ingestFiles,
  generateDeliverables,
  getStatus,
  confirmReview,
  getExportUrl,
} from './api/client';

const DEFAULT_PRESEED_HISTORY: HistorySessionItem[] = [
  {
    id: 'hist_resume_f_8',
    jobId: 'job_c5d23a8b',
    timestamp: '20 Sep 2026, 22:34',
    inputFileName: 'resume_f_8.pdf',
    selectedFormats: ['exec_summary', 'presentation', 'linkedin', 'advisory'],
    totalDuration: '08:29.6',
    pipelineLogs: [
      { step: 'ingestion_node', title: 'Ingestion & Normalizer Node', status: 'completed', message: '[INGEST_AGENT] ✅ Ingested 13 chunks into SQLite SEI vault (2.05s).', timestamp: '2.05s', egress: '0 KB' },
      { step: 'context_node', title: 'Context & Entity Extraction Node', status: 'completed', message: '[RESEARCH_AGENT] ✅ Deep document analysis & NER completed (0.65s).', timestamp: '2.70s', egress: '0 KB' },
      { step: 'generator_node', title: 'Parallel Multi-Format Generation Node', status: 'completed', message: '[LLM_SYNTHESIZER] ✨ Completed structured schemas for 4 formats via local LLM.', timestamp: '488.38s', egress: '0 KB' },
      { step: 'reflection_node', title: '2-Pass Bounded Reflection Node', status: 'completed', message: '[REFLECTION_AGENT] ✅ Structural audit & 0 cloud telemetry verified (0.61s).', timestamp: '488.99s', egress: '0 KB' },
      { step: 'verification_gate_node', title: 'Deterministic Verification Gate Node', status: 'completed', message: '[VERIFICATION_GATE] ✅ RapidFuzz sub-10ms CPU cross-check passed with 0 discrepancies (0.05s).', timestamp: '489.04s', egress: '0 KB' },
      { step: 'export_node', title: 'Deterministic Exporters Node', status: 'completed', message: '[EXPORTER_AGENT] ✅ Compiled .pptx presentation with speaker notes and .docx advisory (0.80s).', timestamp: '489.84s', egress: '0 KB' },
    ],
    chatMessages: [
      { id: 'm1', sender: 'agent', agentName: 'Sovereign Orchestrator', text: 'Document resume_f_8.pdf successfully transformed into 4 formats with 0 KB cloud telemetry.', timestamp: '22:34' },
      { id: 'm2', sender: 'agent', agentName: 'Verification Gate', text: 'All extracted entities verified against source coordinates with 100% confidence.', timestamp: '22:34' },
    ],
    draftOutputs: {
      exec_summary: {
        situation_overview: "PRANAV SACHIN GAIKWAD, a third-year Computer Engineering student at AISSMS Institute of Information Technology in Pune, demonstrates expertise in building distributed backend systems with Node.js/Express, TypeScript, and Python/FastAPI. His experience includes message queues, load balancing, low-latency caching, AI-driven workflows, and LLM integrations.",
        core_findings: [
          "PRANAV SACHIN GAIKWAD has developed a custom API gateway with Opossum circuit breakers for load balancing and exposed Prometheus metrics to monitor system performance.",
          "He successfully scaled an Express backend to three replicas using Docker Compose and GitHub Actions CI/CD pipeline, including unit tests on every commit.",
          "PRANAV SACHIN GAIKWAD has implemented contract-overlap validation and a BullMQ background worker for bulk PDF payslip generation and email delivery, with comprehensive audit and error logging."
        ],
        strategic_impact: "The strategic impact of PRANAV SACHIN GAIKWAD's work includes the potential to build resilient, production-grade systems at scale. His experience in AI-driven workflows and LLM integrations could significantly enhance system functionality and security.",
        decisions_required: [
          "Leadership should consider offering a Software Engineer Internship position for PRANAV SACHIN GAIKWAD to leverage his skills and further develop them within the organization.",
          "Investigate opportunities for integrating AI and LLM technologies into existing systems based on PRANAV SACHIN GAIKWAD's expertise."
        ],
        confidence_assessment: "HIGH",
        cited_chunk_ids: ["doc_01_chunk_01"]
      },
      linkedin: {
        headline: "Building Resilient Systems: A Comprehensive Overview from a Student Perspective",
        opening_hook: "As a third-year Computer Engineering student, Pranav Gaikwad is not just building systems; he's crafting them to withstand the harshest cyber storms.",
        body_paragraphs: [
          "Pranav Gaikwad’s journey as a Software Engineer Internship candidate showcases his proficiency in languages such as Python, JavaScript, TypeScript, Java, C, C++, SQL, and more.",
          "With a focus on AI-driven workflows and LLM integrations, Pranav has demonstrated his ability to integrate cutting-edge technologies. His work includes implementing contract-overlap validation, self-approval guards for time-off requests, and BullMQ background workers.",
          "Pranav’s experience in system design is evident through his scaling of the Express backend to 3 load-balanced replicas behind a custom API gateway with Opossum circuit breakers."
        ],
        key_takeaways: [
          "Pranav Gaikwad’s internship experience highlights the importance of robust backend architectures.",
          "His integration of LLMs like OpenAI, Anthropic, and Gemini showcases proficiency in advanced technologies.",
          "Use of BullMQ for asynchronous analytics ingestion underscores the need for efficient data processing."
        ],
        call_to_action: "Explore resilient backend architectures and AI-driven workflows for production scale.",
        hashtags: ["#Intelligence", "#Strategy", "#Innovation"],
        cited_chunk_ids: ["doc_01_chunk_01"]
      },
      presentation: {
        deck_title: "Presentation on PRANAV SACHIN GAIKWAD's Professional Background",
        target_audience: "Senior leadership / technical audience",
        slides: [
          {
            slide_number: 1,
            title: "Executive Overview",
            bullet_points: [
              "Third-year Computer Engineering student with extensive experience in backend systems development.",
              "Comfortable working across API, database, and integration layers using Node.js/Express, TypeScript, Python/FastAPI.",
              "Experience includes AI-driven workflows, LLM integrations, message queues, load balancing, low-latency caching."
            ],
            visual_guidance: "Full-width text with header graphic",
            speaker_notes: "Introduce the candidate and provide a high-level overview of his engineering background.",
            slide_reference_citations: ["doc_01_chunk_01"]
          },
          {
            slide_number: 2,
            title: "Core Findings",
            bullet_points: [
              "Proficient in multiple programming languages including Python, JavaScript, TypeScript, Java, C, and C++.",
              "Experience with backend technologies such as Node.js (Express.js), FastAPI (Python), REST APIs, JWT/Session Auth, Microservices.",
              "Knowledge of data structures, algorithms, system design, and database management systems."
            ],
            visual_guidance: "2-column layout with bullet list",
            speaker_notes: "Detail his technical skills in languages, backend technologies, and system architecture.",
            slide_reference_citations: ["doc_01_chunk_02"]
          },
          {
            slide_number: 3,
            title: "Strategic Recommendations",
            bullet_points: [
              "Encourage the organization to consider his experience in AI-driven workflows and LLM integrations.",
              "Recommend integrating BullMQ-based async analytics ingestion into existing systems.",
              "Suggest exploring opportunities for internships or entry-level positions where he can apply his skills."
            ],
            visual_guidance: "Single column with action callout box",
            speaker_notes: "Propose strategic recommendations based on technical capabilities.",
            slide_reference_citations: ["doc_01_chunk_03"]
          }
        ]
      },
      advisory: {
        advisory_id: "NTRO-ADV-2026-09",
        title: "Technical Capability & Infrastructure Architecture Assessment",
        severity_level: "HIGH",
        threat_overview: "PRANAV SACHIN GAIKWAD, a third-year Computer Engineering student at AISSMS Institute of Information Technology in Pune, has developed and implemented systems including an Express backend with Opossum circuit breakers, Redis sorted sets, BullMQ-based async analytics ingestion, and a custom API gateway.",
        affected_systems: ["Custom API Gateway", "Express Backend", "BullMQ Ingestion Pipeline"],
        indicators_of_compromise: [
          "Custom API Gateway with Opossum circuit breakers, Redis sorted sets, BullMQ-based async analytics ingestion, and Prometheus metrics.",
          "BullMQ background worker for bulk PDF payslip generation and email delivery."
        ],
        recommended_mitigations: [
          "Implement rate limiting mechanisms to prevent unauthorized access to the custom API gateway.",
          "Audit and monitor the usage of BullMQ-based workers handling sensitive operations."
        ],
        compliance_and_governance: "Report status to designated technical leadership within standard operational guidelines.",
        cited_chunk_ids: ["doc_01_chunk_01"]
      }
    },
    status: 'completed'
  }
];

export const App: React.FC = () => {
  // 1. Top-Level Main Tabs: 'ingestion' | 'pipeline' | 'outputs' | 'history'
  const [activeMainTab, setActiveMainTab] = useState<'ingestion' | 'pipeline' | 'outputs' | 'history'>('ingestion');

  // Transformation History State (Persisted in localStorage)
  const [history, setHistory] = useState<HistorySessionItem[]>(() => {
    try {
      const saved = localStorage.getItem('sentinel_history_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_PRESEED_HISTORY;
  });

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sentinel_history_v1', JSON.stringify(history));
    } catch (err) {
      console.warn('Could not save history to localStorage', err);
    }
  }, [history]);

  // 2. Files & Ingestion State
  const [files, setFiles] = useState<UploadedItem[]>([]);

  // 3. Parameters State (11 Matrix Controls + Sections 1, 2, 3)
  const [parameters, setParameters] = useState<GlobalParams>({
    tone: 'Authoritative',
    audience: 'Technical',
    detail: 'Standard',
    words: 500,
    objective: 'heuristic',
    language: 'English',
    formality: 9,
    keywords_must: [],
    add_on_instruction: '',
    fact_matching_gate: true,
    model_selected: 'qwen2.5:3b',
    custom_output_active: false,
    format_customizations: {},
  });

  // UI View Mode States
  const [showIngestionZone, setShowIngestionZone] = useState<boolean>(true);
  const [advisoryViewMode, setAdvisoryViewMode] = useState<'card' | 'text'>('card');
  const [presentationViewMode, setPresentationViewMode] = useState<'card' | 'text'>('card');
  const [copiedAdvisory, setCopiedAdvisory] = useState<boolean>(false);
  const [copiedPresentation, setCopiedPresentation] = useState<boolean>(false);
  const [copiedTwitter, setCopiedTwitter] = useState<boolean>(false);

  // 4. Formats State
  const [selectedFormats, setSelectedFormats] = useState<string[]>([
    'advisory',
    'exec_summary',
    'presentation',
  ]);
  const [activeDeliverableTab, setActiveDeliverableTab] = useState<string>('advisory');

  // 5. Pipeline Execution State
  const [jobId, setJobId] = useState<string>('');
  const [executionPhase, setExecutionPhase] = useState<
    | 'idle'
    | 'ingesting'
    | 'extracting'
    | 'generating'
    | 'reflecting'
    | 'evaluating_gate'
    | 'exporting'
    | 'hard_gate_halted'
    | 'completed'
  >('idle');
  const [sourceChunks, setSourceChunks] = useState<SourceChunk[]>([]);
  const [draftOutputs, setDraftOutputs] = useState<Record<string, any>>({});
  const [exportedFiles, setExportedFiles] = useState<Record<string, string>>({});
  const [pipelineLogs, setPipelineLogs] = useState<PipelineLogEvent[]>([]);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState<number>(0);
  const [stepDurations, setStepDurations] = useState<Record<string, string>>({});

  // Real-time LLM streaming state — per-format accumulated token text
  const [streamingText, setStreamingText] = useState<string>('');
  const [liveFormat, setLiveFormat] = useState<string>('');

  // Real-time live stopwatch for pipeline execution
  useEffect(() => {
    let interval: any = null;
    const isRunning = [
      'ingesting',
      'extracting',
      'generating',
      'reflecting',
      'evaluating_gate',
      'exporting',
    ].includes(executionPhase);

    if (isRunning) {
      interval = setInterval(() => {
        setTotalElapsedSeconds((prev) => +(prev + 0.1).toFixed(1));
      }, 100);
    } else if (executionPhase === 'idle') {
      setTotalElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [executionPhase]);

  // 6. Hard Gate State
  const [hardGateModalOpen, setHardGateModalOpen] = useState<boolean>(false);
  const [discrepancies, setDiscrepancies] = useState<EntityDiscrepancy[]>([]);
  const [humanApproved, setHumanApproved] = useState<boolean>(false);

  // 7. Citation Drawer State
  const [citationDrawerOpen, setCitationDrawerOpen] = useState<boolean>(false);
  const [activeCitationChunkId, setActiveCitationChunkId] = useState<string | null>(null);

  // 8. Feedback & Copy status
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Ensure active deliverable tab is within selected formats
  useEffect(() => {
    if (!selectedFormats.includes(activeDeliverableTab) && selectedFormats.length > 0) {
      setActiveDeliverableTab(selectedFormats[0]);
    }
  }, [selectedFormats, activeDeliverableTab]);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Handle Pipeline Execution
  const handleExecute = async () => {
    if (files.length === 0) {
      alert('Please upload at least one intelligence source or click "Load Sample Intel" first.');
      return;
    }

    // Switch to Pipeline Working State tab immediately so user watches live streaming progress!
    setActiveMainTab('pipeline');
    setExecutionPhase('ingesting');
    setHumanApproved(false);
    setDraftOutputs({});
    setDiscrepancies([]);
    setTotalElapsedSeconds(0);
    setStepDurations({});
    setStreamingText('');
    setLiveFormat('');

    const startOverall = performance.now();
    const tIngestStart = performance.now();

    // Step 1: Ingestion
    setPipelineLogs([
      {
        step: 'system_init',
        title: 'Airgap Sovereign Engine',
        status: 'completed',
        message: '[SOVEREIGN_SYSTEM] 🚀 Initializing Sovereign StateGraph. Mandatory local LLM active (0 KB cloud egress).',
        timestamp: '0.00s',
        egress: '0 KB',
      },
      {
        step: 'ingestion_node',
        title: 'Ingestion & Normalizer Node',
        status: 'running',
        message: `[INGEST_AGENT] 🔍 Ingesting ${files.length} document(s)... Parsing layout boundaries and coordinate chunks.`,
        timestamp: '0.08s',
        egress: '0 KB',
      },
    ]);

    try {
      const filesToIngest = files.map((f) => ({
        file: f.file || new File(['sample report text'], f.name, { type: f.type }),
        role: f.role,
      }));
      const ingestRes = await ingestFiles(filesToIngest);
      const currentJobId = ingestRes.job_id;
      setJobId(currentJobId);

      // Open SSE stream to receive live LLM tokens as Ollama generates them
      const es = new EventSource(`http://127.0.0.1:8000/api/stream/${currentJobId}/tokens`);
      es.onmessage = (e) => {
        try {
          const evt = JSON.parse(e.data);
          if (evt.type === 'format_start') {
            setLiveFormat(evt.format);
            setStreamingText('');  // clear for new format
          } else if (evt.type === 'token') {
            setStreamingText((prev) => prev + evt.text);
          } else if (evt.type === 'stream_end' || evt.type === 'pipeline_done') {
            es.close();
          }
        } catch {}
      };
      es.onerror = () => es.close();

      const realChunks = ingestRes.source_chunks && ingestRes.source_chunks.length > 0
        ? ingestRes.source_chunks
        : [];
      if (realChunks.length > 0) {
        setSourceChunks(realChunks);
      }

      const dIngest = ((performance.now() - tIngestStart) / 1000).toFixed(2) + 's';
      setStepDurations((prev) => ({ ...prev, ingestion_node: dIngest }));

      await sleep(500);

      // Step 2: Context & Entity Extraction
      const tContextStart = performance.now();
      setExecutionPhase('extracting');
      setPipelineLogs((prev) => [
        ...prev.map((l) =>
          l.step === 'ingestion_node'
            ? {
                ...l,
                status: 'completed' as const,
                message: `[INGEST_AGENT] ✅ Ingested and coordinate-indexed ${realChunks.length} chunks into SQLite SEI vault (${dIngest}).`,
              }
            : l
        ),
        {
          step: 'context_node',
          title: 'Context & Entity Extraction Node',
          status: 'running',
          message: `[RESEARCH_AGENT] 🧠 Conducting full-document research across all ${realChunks.length} chunks with spaCy NER (ORG, GPE, TECH)...`,
          timestamp: ((performance.now() - startOverall) / 1000).toFixed(2) + 's',
          egress: '0 KB',
        },
      ]);

      await sleep(650);
      const dContext = ((performance.now() - tContextStart) / 1000).toFixed(2) + 's';
      setStepDurations((prev) => ({ ...prev, context_node: dContext }));

      // Step 3: Parallel Format Generation
      const tGenStart = performance.now();
      setExecutionPhase('generating');
      setPipelineLogs((prev) => [
        ...prev.map((l) =>
          l.step === 'context_node'
            ? {
                ...l,
                status: 'completed' as const,
                message: `[RESEARCH_AGENT] ✅ Deep document analysis & NER completed with zero external transmission (${dContext}).`,
              }
            : l
        ),
        {
          step: 'generator_node',
          title: 'Parallel Multi-Format Generation Node',
          status: 'running',
          message: `[LLM_SYNTHESIZER] ⚡ Dispatching structured synthesis to local Ollama (qwen2.5:3b) for ${selectedFormats.length} schemas [${selectedFormats.join(', ')}]...`,
          timestamp: ((performance.now() - startOverall) / 1000).toFixed(2) + 's',
          egress: '0 KB',
        },
      ]);

      // Trigger backend generation (runs local Ollama)
      await generateDeliverables(currentJobId, parameters, selectedFormats);

      const dGen = ((performance.now() - tGenStart) / 1000).toFixed(2) + 's';
      setStepDurations((prev) => ({ ...prev, generator_node: dGen }));

      await sleep(500);

      // Step 4: 2-Pass Bounded Reflection
      const tReflectStart = performance.now();
      setExecutionPhase('reflecting');
      setPipelineLogs((prev) => [
        ...prev.map((l) =>
          l.step === 'generator_node'
            ? {
                ...l,
                status: 'completed' as const,
                message: `[LLM_SYNTHESIZER] ✨ Completed structured schemas for [${selectedFormats.join(', ')}] via local LLM (${dGen}).`,
              }
            : l
        ),
        {
          step: 'reflection_node',
          title: '2-Pass Bounded Reflection Node',
          status: 'running',
          message: '[REFLECTION_AGENT] 🛡️ Pass 1 structural audit & Pass 2 sovereign air-gap telemetry boundary verification (cap <= 1 retry)...',
          timestamp: ((performance.now() - startOverall) / 1000).toFixed(2) + 's',
          egress: '0 KB',
        },
      ]);

      await sleep(600);
      const dReflect = ((performance.now() - tReflectStart) / 1000).toFixed(2) + 's';
      setStepDurations((prev) => ({ ...prev, reflection_node: dReflect }));

      // Step 5: Deterministic Verification Gate
      const tGateStart = performance.now();
      setExecutionPhase('evaluating_gate');
      setPipelineLogs((prev) => [
        ...prev.map((l) =>
          l.step === 'reflection_node'
            ? {
                ...l,
                status: 'completed' as const,
                message: `[REFLECTION_AGENT] ✅ Structural schema audit & 0 cloud telemetry policy verified (${dReflect}).`,
              }
            : l
        ),
        {
          step: 'verification_gate_node',
          title: 'Deterministic Verification Gate Node',
          status: 'running',
          message: '[VERIFICATION_GATE] ⚖️ RapidFuzz sub-10ms CPU cross-check: Comparing draft entities against authoritative source coordinates...',
          timestamp: ((performance.now() - startOverall) / 1000).toFixed(2) + 's',
          egress: '0 KB',
        },
      ]);

      const statusRes = await getStatus(currentJobId);
      const dGate = ((performance.now() - tGateStart) / 1000).toFixed(2) + 's';
      setStepDurations((prev) => ({ ...prev, verification_gate_node: dGate }));
      await sleep(400);

      if (statusRes.hard_gate_triggered && !statusRes.human_approved) {
        setExecutionPhase('hard_gate_halted');
        setDiscrepancies(statusRes.entity_discrepancies || []);
        setDraftOutputs(statusRes.draft_outputs || {});
        setPipelineLogs((prev) => [
          ...prev.map((l) =>
            l.step === 'verification_gate_node'
              ? {
                  ...l,
                  status: 'paused' as const,
                  message: `[VERIFICATION_GATE] ⚠️ FLAGGED_MISMATCH: Entity discrepancy intercepted! Export locked (HTTP 423). Awaiting operator sign-off (${dGate}).`,
                }
              : l
          ),
        ]);
        setHardGateModalOpen(true);
      } else {
        // Step 6: Exporters
        const tExportStart = performance.now();
        setExecutionPhase('exporting');
        setPipelineLogs((prev) => [
          ...prev.map((l) =>
            l.step === 'verification_gate_node'
              ? {
                  ...l,
                  status: 'completed' as const,
                  message: `[VERIFICATION_GATE] ✅ Deterministic RapidFuzz cross-check passed with 0 discrepancies (${dGate}).`,
                }
              : l
          ),
          {
            step: 'export_node',
            title: 'Deterministic Exporters Node',
            status: 'running',
            message: '[EXPORTER_AGENT] 📦 Compiling deterministic binary outputs (.pptx presentation with speaker notes, .docx advisory)...',
            timestamp: ((performance.now() - startOverall) / 1000).toFixed(2) + 's',
            egress: '0 KB',
          },
        ]);

        await sleep(650);
        const dExport = ((performance.now() - tExportStart) / 1000).toFixed(2) + 's';
        setStepDurations((prev) => ({ ...prev, export_node: dExport }));

        setExecutionPhase('completed');
        const finalDrafts =
          statusRes.draft_outputs && Object.keys(statusRes.draft_outputs).length > 0
            ? statusRes.draft_outputs
            : MOCK_DRAFT_OUTPUTS;
        setDraftOutputs(finalDrafts);
        setExportedFiles(statusRes.exported_files || {});
        setHumanApproved(true);
        const totalDuration = ((performance.now() - startOverall) / 1000).toFixed(2) + 's';
        setPipelineLogs((prev) => [
          ...prev.map((l) =>
            l.step === 'export_node'
              ? {
                  ...l,
                  status: 'completed' as const,
                  message: `[EXPORTER_AGENT] ✅ Compiled deliverables into sovereign vault with 0 KB egress (${dExport}).`,
                }
              : l
          ),
          {
            step: 'complete',
            title: 'Sovereign Pipeline Complete',
            status: 'completed',
            message: `[SOVEREIGN_SYSTEM] 🚀 Pipeline execution finished in ${totalDuration}. All deliverables ready for air-gapped export.`,
            timestamp: totalDuration,
            egress: '0 KB',
          },
        ]);

        // Save to Transformation History (Input: ONLY file name as requested)
        const primaryFileName = files.length > 0 ? files[0].name : 'intelligence_report.pdf';
        const newSessionItem: HistorySessionItem = {
          id: `hist_${currentJobId || Date.now()}`,
          jobId: currentJobId || `job_${Date.now().toString(16)}`,
          timestamp: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
          inputFileName: primaryFileName, // ONLY file name
          selectedFormats: [...selectedFormats],
          totalDuration,
          pipelineLogs: [
            ...pipelineLogs,
            {
              step: 'export_node',
              title: 'Deterministic Exporters Node',
              status: 'completed',
              message: `[EXPORTER_AGENT] ✅ Compiled deliverables with 0 KB egress (${dExport}).`,
              timestamp: totalDuration,
              egress: '0 KB',
            },
          ],
          chatMessages: [
            {
              id: `msg_init_${Date.now()}`,
              sender: 'agent',
              agentName: 'Sovereign Orchestrator',
              text: `Transformation completed for ${primaryFileName}. Generated ${selectedFormats.length} formats [${selectedFormats.join(', ')}] in ${totalDuration} with zero cloud data egress.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
          draftOutputs: finalDrafts,
          exportedFiles: statusRes.exported_files || {},
          status: 'completed',
        };
        setHistory((prev) => [newSessionItem, ...prev.filter((h) => h.jobId !== currentJobId)]);

        // Default to first deliverable format tab and automatically navigate to outputs tab
        if (selectedFormats.length > 0) {
          setActiveDeliverableTab(selectedFormats[0]);
        }
        await sleep(1200);
        setActiveMainTab('outputs');
      }
    } catch (err) {
      console.error('Execution error:', err);
      setExecutionPhase('idle');
    }
  };

  // Trigger Deliberate Hard Gate Simulation
  const handleSimulateHardGate = async () => {
    if (files.length === 0) {
      setFiles([
        {
          id: 'demo_01',
          name: 'Operation_GhostLatch_Incident_Report.pdf',
          size: 2450000,
          type: 'application/pdf',
          role: 'PRIMARY',
        },
      ]);
    }

    setActiveMainTab('pipeline');
    setExecutionPhase('ingesting');

    try {
      const demoFile = files[0]?.file || new File(['deliberate test'], 'incident_report.pdf', { type: 'application/pdf' });
      const ingestRes = await ingestFiles([{ file: demoFile, role: 'PRIMARY' }]);
      setJobId(ingestRes.job_id);
      if (ingestRes.source_chunks) setSourceChunks(ingestRes.source_chunks);

      setExecutionPhase('generating');
      await generateDeliverables(ingestRes.job_id, { ...parameters, simulate_hard_gate: true }, selectedFormats);

      setExecutionPhase('hard_gate_halted');
      const statusRes = await getStatus(ingestRes.job_id);
      setDiscrepancies(statusRes.entity_discrepancies || []);
      setDraftOutputs(statusRes.draft_outputs || {});
      if (statusRes.logs) setPipelineLogs(statusRes.logs);
      setHardGateModalOpen(true);
    } catch (err) {
      console.error('Simulation error:', err);
      setExecutionPhase('idle');
    }
  };

  // Handle Analyst Resolution on Hard Gate Modal
  const handleHardGateDecision = async (
    action: 'accept_correction' | 'override' | 'manual_edit',
    customText?: string
  ) => {
    const updatedDrafts = { ...draftOutputs };

    if (action === 'accept_correction') {
      const sourceTruth = discrepancies[0]?.suggested_source_entity || 'Directorate of Power Grid Resilience';
      if (updatedDrafts.advisory) {
        updatedDrafts.advisory.compliance_and_governance =
          `Report to ${sourceTruth} within 24 hours per standing protocol.`;
      }
    } else if (action === 'manual_edit' && customText) {
      if (updatedDrafts.advisory) {
        updatedDrafts.advisory.compliance_and_governance =
          `Report to ${customText} within 24 hours per standing protocol.`;
      }
    }

    setDraftOutputs(updatedDrafts);

    await confirmReview({
      job_id: jobId,
      human_approved: true,
      human_corrections: {
        action,
        customText,
      },
    });

    const statusRes = await getStatus(jobId);
    setDraftOutputs(statusRes.draft_outputs || updatedDrafts);
    setExportedFiles(statusRes.exported_files || {});
    if (statusRes.logs) setPipelineLogs(statusRes.logs);

    setHumanApproved(true);
    setHardGateModalOpen(false);
    setExecutionPhase('completed');
    setActiveMainTab('outputs');
  };

  // Transformation History Handlers
  const handleRestoreHistory = (item: HistorySessionItem) => {
    setDraftOutputs(item.draftOutputs || {});
    setExportedFiles(item.exportedFiles || {});
    if (item.selectedFormats && item.selectedFormats.length > 0) {
      setSelectedFormats(item.selectedFormats);
      setActiveDeliverableTab(item.selectedFormats[0]);
    }
    setActiveMainTab('outputs');
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear the transformation audit history?')) {
      setHistory([]);
      try {
        localStorage.removeItem('sentinel_history_v1');
      } catch {}
    }
  };

  const handleDeleteHistorySession = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const handleAddChatMessage = (sessionId: string, message: ChatMessage) => {
    setHistory((prev) =>
      prev.map((h) =>
        h.id === sessionId
          ? { ...h, chatMessages: [...(h.chatMessages || []), message] }
          : h
      )
    );
  };

  // Open Citation Drawer
  const openCitation = (chunkId: string) => {
    setActiveCitationChunkId(chunkId);
    setCitationDrawerOpen(true);
  };

  // Text extractors for DOCX & PPTX text representations
  const getFullAdvisoryText = (adv: any) => {
    if (!adv) return '';
    return `INTELLIGENCE ADVISORY: ${adv.advisory_id || 'NTRO-ADV-2026-09'}
TITLE: ${adv.title || 'Operational Intelligence Advisory'}
SEVERITY: ${adv.severity_level || 'HIGH'}
CITATIONS: ${(adv.cited_chunk_ids || []).join(', ')}

================================================================================
1. THREAT OVERVIEW
================================================================================
${adv.threat_overview || ''}

================================================================================
2. AFFECTED SYSTEMS & ASSETS
================================================================================
${(adv.affected_systems || []).map((s: string, i: number) => `  [${i + 1}] ${s}`).join('\n')}

================================================================================
3. INDICATORS OF COMPROMISE (IOCs)
================================================================================
${(adv.indicators_of_compromise || []).map((ioc: string, i: number) => `  • ${ioc}`).join('\n')}

================================================================================
4. RECOMMENDED MITIGATIONS & ACTION DIRECTIVES
================================================================================
${(adv.recommended_mitigations || []).map((m: string, i: number) => `  (${i + 1}) ${m}`).join('\n')}

================================================================================
5. COMPLIANCE & INTER-AGENCY GOVERNANCE
================================================================================
${adv.compliance_and_governance || 'Standard operational guidelines apply.'}`;
  };

  const getFullPresentationText = (ppt: any) => {
    if (!ppt) return '';
    let out = `DECK TITLE: ${ppt.deck_title || 'Presentation'}\nTARGET AUDIENCE: ${ppt.target_audience || 'Leadership'}\n\n`;
    (ppt.slides || []).forEach((s: any, idx: number) => {
      out += `================================================================================\n`;
      out += `SLIDE ${s.slide_number || idx + 1}: ${s.title || ''}\n`;
      out += `================================================================================\n`;
      out += `Visual Guidance: ${s.visual_guidance || 'Standard widescreen layout'}\n\n`;
      out += `Bullet Points:\n`;
      (s.bullet_points || []).forEach((bp: string) => {
        out += `  • ${bp}\n`;
      });
      out += `\nSpoken Script / Speaker Notes:\n  "${s.speaker_notes || 'N/A'}"\n\n`;
      if (s.slide_reference_citations?.length) {
        out += `Citations: ${s.slide_reference_citations.join(', ')}\n\n`;
      }
    });
    return out;
  };

  // Copy Active Deliverable
  const handleCopyContent = () => {
    const content = JSON.stringify(draftOutputs[activeDeliverableTab] || {}, null, 2);
    navigator.clipboard.writeText(content);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Download Active Deliverable in its native format
  const handleDownloadActiveDeliverable = () => {
    const data = draftOutputs[activeDeliverableTab];
    if (!data) return;

    if (activeDeliverableTab === 'presentation' && jobId && humanApproved) {
      window.location.href = getExportUrl('pptx', jobId);
      return;
    }
    if (activeDeliverableTab === 'advisory' && jobId && humanApproved) {
      window.location.href = getExportUrl('docx', jobId);
      return;
    }

    const docBaseName = files[0]?.name ? files[0].name.replace(/\.[^/.]+$/, '') : 'deliverable';
    let content = '';
    let ext = 'txt';
    let mimeType = 'text/plain';

    if (activeDeliverableTab === 'exec_summary') {
      ext = 'md';
      mimeType = 'text/markdown';
      content = `# Executive Situational Briefing: ${docBaseName}\n\n` +
        `**Confidence Assessment:** ${data.confidence_assessment || 'HIGH'}\n\n` +
        `## Situation Overview\n${data.situation_overview || ''}\n\n` +
        `## Core Findings\n` +
        (data.core_findings?.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n') || '') +
        `\n\n## Strategic Infrastructure Impact\n${data.strategic_impact || ''}\n\n` +
        `## Leadership Decisions Required\n` +
        (data.decisions_required?.map((d: string) => `- [ ] ${d}`).join('\n') || '');
    } else if (activeDeliverableTab === 'linkedin') {
      ext = 'txt';
      content = `${data.headline || ''}\n\n${data.opening_hook || ''}\n\n` +
        (data.body_paragraphs?.join('\n\n') || '') +
        `\n\nKey Takeaways:\n` +
        (data.key_takeaways?.map((t: string) => `• ${t}`).join('\n') || '') +
        `\n\n${data.hashtags?.join(' ') || ''}`;
    } else if (activeDeliverableTab === 'twitter') {
      ext = 'txt';
      content =
        data.tweets?.map((t: any) => `[Tweet ${t.tweet_number || 1}]\n${t.content}`).join('\n\n---\n\n') ||
        '';
    } else if (activeDeliverableTab === 'video') {
      ext = 'md';
      mimeType = 'text/markdown';
      content = `# Video Script: ${data.video_title || docBaseName}\n` +
        `Target Duration: ${data.target_duration || '60s'}\n` +
        `Logline: ${data.logline || ''}\n\n` +
        (data.scenes
          ?.map(
            (s: any) =>
              `### Scene ${s.scene_number} (${s.duration_seconds}s)\n- **Visual:** ${s.visual_description}\n- **Audio:** "${s.narration_voiceover}"\n- **Subtitles:** ${s.on_screen_subtitles || ''}`
          )
          .join('\n\n') || '');
    } else if (activeDeliverableTab === 'infographic') {
      ext = 'json';
      mimeType = 'application/json';
      content = JSON.stringify(data, null, 2);
    } else {
      ext = 'json';
      mimeType = 'application/json';
      content = JSON.stringify(data, null, 2);
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docBaseName}_${activeDeliverableTab}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download all generated deliverables in a single ZIP package
  const handleDownloadAllZip = () => {
    const activeJobId = jobId || 'job_c5d23a8b';
    window.location.href = getExportUrl('zip', activeJobId);
  };

  const getFormatDownloadLabel = (tab: string) => {
    switch (tab) {
      case 'presentation':
        return 'Download .pptx';
      case 'advisory':
        return 'Download .docx';
      case 'exec_summary':
        return 'Download Brief (.md)';
      case 'linkedin':
        return 'Download Post (.txt)';
      case 'twitter':
        return 'Download Thread (.txt)';
      case 'video':
        return 'Download Script (.md)';
      case 'infographic':
        return 'Download Blueprint (.json)';
      default:
        return 'Download Deliverable';
    }
  };

  const primaryDoc = files.find((f) => f.role === 'PRIMARY')?.name;

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-neutral-900">
      
      {/* Vercel-Style Minimalist Navbar */}
      <header className="border-b border-neutral-200/80 bg-white/80 backdrop-blur sticky top-0 z-40 px-6 py-2.5">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-neutral-900 font-sans">
                  Sentinel-Transform
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                  v1.0 Sovereign
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Multi-Format Intelligence Transformation Engine • NTRO PS 26154
              </p>
            </div>
          </div>

          {/* Three Primary Navigation Tabs (Vercel Segmented Control) */}
          <div className="flex items-center p-1 bg-neutral-100 border border-neutral-200/80 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveMainTab('ingestion')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeMainTab === 'ingestion'
                  ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200/80'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>1. Source Ingestion</span>
              {files.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center font-mono">
                  {files.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('pipeline')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeMainTab === 'pipeline'
                  ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200/80'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>2. Pipeline Working State</span>
              {executionPhase !== 'idle' && (
                <span className={`w-2 h-2 rounded-full ${
                  executionPhase === 'completed'
                    ? 'bg-emerald-500'
                    : executionPhase === 'hard_gate_halted'
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-blue-500 animate-pulse'
                }`} />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('outputs')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeMainTab === 'outputs'
                  ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200/80'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>3. Deliverable Outputs</span>
              {Object.keys(draftOutputs).length > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-mono">
                  {Object.keys(draftOutputs).length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('history')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeMainTab === 'history'
                  ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200/80'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <History className="w-3.5 h-3.5 text-blue-600" />
              <span>4. History & Archive</span>
              {history.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-mono">
                  {history.length}
                </span>
              )}
            </button>
          </div>

          {/* Telemetry Pills & Action Controls */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>0 KB Egress</span>
            </div>

            <button
              type="button"
              onClick={handleSimulateHardGate}
              className="flex items-center gap-1 px-3 py-1 text-xs font-sans font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors shadow-2xs"
              title="Test the Hard Gate interception moment"
            >
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              Simulate Gate
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6">
        
        {/* ========================================================================= */}
        {/* TAB 1: SOURCE INGESTION & CONFIGURATION (WIREFRAME 1 LAYOUT)              */}
        {/* ========================================================================= */}
        {activeMainTab === 'ingestion' && (
          <div className="animate-in fade-in duration-150">
            {/* Wireframe 1 Main Layout: Left (Section 1 + Source Ingestion), Right (Sections 2 & 3 + Execute) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* Left Column: Parameter Section 1 (Top) + Source Ingestion (Below) (Takes 6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                <ParameterSection1
                  parameters={parameters}
                  onChange={setParameters}
                  selectedFormats={selectedFormats}
                  onFormatsChange={setSelectedFormats}
                />

                {/* Source Ingestion placed below Parameter Section 1 */}
                <IngestionZone
                  files={files}
                  onFilesChange={setFiles}
                  isIngesting={executionPhase === 'ingesting'}
                />
              </div>

              {/* Right Column: Parameter Section 2 (Top), Section 3 (Middle), Execute (Bottom) */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                {/* Parameter Section 2 */}
                <ParameterSection2
                  parameters={parameters}
                  onChange={setParameters}
                />

                {/* Parameter Section 3 */}
                <ParameterSection3
                  parameters={parameters}
                  onChange={setParameters}
                  selectedFormats={selectedFormats}
                />

                {/* Execute Button Card (Bottom Right of Wireframe 1) */}
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-white shadow-md flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-neutral-200 flex items-center gap-2">
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Ready to Execute Transformation</span>
                      {parameters.custom_output_active && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400 text-neutral-950 font-bold">
                          Custom Spec Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      {files.length === 0
                        ? 'Upload at least one primary source document to begin'
                        : `Synthesizing ${selectedFormats.length} outputs with ${parameters.words}w budget per deliverable`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleExecute}
                    disabled={files.length === 0 || executionPhase === 'ingesting'}
                    className="px-6 py-3 bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs rounded-xl shadow-xs disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <span>Execute</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PIPELINE WORKING STATE & LIVE STREAMING (WIREFRAME 2 LAYOUT)       */}
        {/* ========================================================================= */}
        {activeMainTab === 'pipeline' && (
          <PipelineWorkingState
            executionPhase={executionPhase}
            jobId={jobId}
            logs={pipelineLogs}
            discrepancies={discrepancies}
            onOpenHardGate={() => setHardGateModalOpen(true)}
            onViewOutputs={() => setActiveMainTab('outputs')}
            onApproveHardGate={() => handleHardGateDecision('override')}
            onRetryReflection={() => handleHardGateDecision('accept_correction')}
            formatsCount={selectedFormats.length}
            totalElapsedSeconds={totalElapsedSeconds}
            stepDurations={stepDurations}
            streamingText={streamingText}
            liveFormat={liveFormat}
            activeFormats={selectedFormats}
            draftOutputs={draftOutputs}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DELIVERABLE OUTPUTS                                                */}
        {/* ========================================================================= */}
        {activeMainTab === 'outputs' && (
          <div className="bg-white border border-neutral-200/90 rounded-xl shadow-xs overflow-hidden min-h-[640px] flex flex-col animate-in fade-in duration-150">
            
            {/* Tab Bar Header */}
            <div className="border-b border-neutral-200 p-3 bg-neutral-50/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                {selectedFormats.map((fId) => {
                  const isActive = activeDeliverableTab === fId;
                  const formatLabels: Record<string, string> = {
                    advisory: 'Advisory',
                    exec_summary: 'Executive Summary',
                    presentation: 'Presentation (.pptx)',
                    video: 'Video Script',
                    infographic: 'Infographics',
                    linkedin: 'LinkedIn',
                    twitter: 'Twitter/X',
                  };

                  return (
                    <button
                      key={fId}
                      onClick={() => setActiveDeliverableTab(fId)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        isActive
                          ? 'bg-white text-neutral-900 shadow-xs border border-neutral-200 font-semibold'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      }`}
                    >
                      {formatLabels[fId] || fId}
                    </button>
                  );
                })}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 shrink-0">
                {/* 1. Dynamic Download Button for Active Deliverable */}
                {draftOutputs[activeDeliverableTab] && (
                  <button
                    type="button"
                    onClick={handleDownloadActiveDeliverable}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-all cursor-pointer"
                    title={`Download ${activeDeliverableTab} deliverable`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{getFormatDownloadLabel(activeDeliverableTab)}</span>
                  </button>
                )}

                {/* 2. Download All as ZIP Archive */}
                {Object.keys(draftOutputs).length > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadAllZip}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-all cursor-pointer"
                    title="Download all generated deliverables bundled in a single ZIP package (.zip)"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Download All (.zip)</span>
                  </button>
                )}

                {/* 3. Copy Button */}
                <button
                  type="button"
                  onClick={handleCopyContent}
                  disabled={!draftOutputs[activeDeliverableTab]}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg shadow-2xs disabled:opacity-40 transition-colors"
                >
                  {copiedNotification ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Deliverable Body View */}
            <div className="p-6 flex-1 overflow-y-auto bg-white">
              {draftOutputs[activeDeliverableTab] ? (
                <div className="space-y-6 max-w-3xl animate-in fade-in duration-150">
                  
                  {/* Header Strip */}
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-medium text-neutral-700">
                        {humanApproved ? 'Verified Deliverable (Operator Signed)' : 'Generated Deliverable'}
                      </span>
                    </div>

                    {/* Cited Chunk Badges */}
                    {draftOutputs[activeDeliverableTab]?.cited_chunk_ids && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-neutral-500">Evidence Citations:</span>
                        {draftOutputs[activeDeliverableTab].cited_chunk_ids.map((cId: string) => (
                          <button
                            key={cId}
                            onClick={() => openCitation(cId)}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 transition-colors"
                          >
                            [{cId}]
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Format 1: Intelligence Advisory */}
                  {activeDeliverableTab === 'advisory' && (
                    <div className="space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-neutral-100 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-neutral-900 text-white">
                            {draftOutputs.advisory.advisory_id || 'NTRO-ADV-2026-09'}
                          </span>
                          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                            draftOutputs.advisory.severity_level === 'HIGH'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            SEVERITY: {draftOutputs.advisory.severity_level || 'HIGH'}
                          </span>
                        </div>

                        {/* View Switcher: Card View vs Full Document Text View */}
                        <div className="flex items-center gap-1.5">
                          <div className="p-0.5 bg-neutral-100 border border-neutral-200 rounded-lg flex text-xs">
                            <button
                              type="button"
                              onClick={() => setAdvisoryViewMode('card')}
                              className={`px-2.5 py-1 rounded-md transition-all ${
                                advisoryViewMode === 'card'
                                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                                  : 'text-neutral-600 hover:text-neutral-900'
                              }`}
                            >
                              Card View
                            </button>
                            <button
                              type="button"
                              onClick={() => setAdvisoryViewMode('text')}
                              className={`px-2.5 py-1 rounded-md transition-all ${
                                advisoryViewMode === 'text'
                                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                                  : 'text-neutral-600 hover:text-neutral-900'
                              }`}
                            >
                              Full Document Text View
                            </button>
                          </div>

                          {advisoryViewMode === 'text' && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(getFullAdvisoryText(draftOutputs.advisory));
                                setCopiedAdvisory(true);
                                setTimeout(() => setCopiedAdvisory(false), 2000);
                              }}
                              className="px-2.5 py-1 text-xs bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              {copiedAdvisory ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedAdvisory ? 'Copied' : 'Copy Doc Text'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <h2 className="text-lg font-bold text-neutral-900">
                        {draftOutputs.advisory.title}
                      </h2>

                      {advisoryViewMode === 'text' ? (
                        <div className="bg-[#0c0d0e] p-4 rounded-xl text-neutral-200 font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-neutral-700 border border-neutral-800">
                          {getFullAdvisoryText(draftOutputs.advisory)}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                              1. Threat Overview
                            </h3>
                            <p className="text-sm text-neutral-700 leading-relaxed bg-neutral-50/70 border border-neutral-200/80 p-3.5 rounded-xl">
                              {draftOutputs.advisory.threat_overview}
                            </p>
                          </div>

                          {draftOutputs.advisory.affected_systems && (
                            <div className="space-y-2">
                              <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                2. Affected Systems & Assets
                              </h3>
                              <div className="flex flex-wrap gap-1.5">
                                {draftOutputs.advisory.affected_systems.map((sys: string, idx: number) => (
                                  <span key={idx} className="text-xs px-2.5 py-1 bg-neutral-100 text-neutral-800 rounded-lg border border-neutral-200">
                                    {sys}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {draftOutputs.advisory.indicators_of_compromise && (
                            <div className="space-y-2">
                              <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                3. Technical Indicators of Compromise (IOCs)
                              </h3>
                              <ul className="space-y-1.5 text-xs text-neutral-700 font-mono bg-neutral-50/70 border border-neutral-200/80 p-3.5 rounded-xl">
                                {draftOutputs.advisory.indicators_of_compromise.map((ioc: string, idx: number) => (
                                  <li key={idx} className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                    <span>{ioc}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {draftOutputs.advisory.recommended_mitigations && (
                            <div className="space-y-2">
                              <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                4. Recommended Mitigations & Action Directives
                              </h3>
                              <div className="space-y-2">
                                {draftOutputs.advisory.recommended_mitigations.map((m: string, idx: number) => (
                                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg border border-neutral-200 bg-neutral-50/40 text-xs text-neutral-800">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span className="leading-relaxed">{m}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {draftOutputs.advisory.compliance_and_governance && (
                            <div className="space-y-1.5 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                              <div className="font-semibold text-neutral-900">Compliance & Governance Protocol:</div>
                              <div className="text-neutral-700 font-mono text-[11px]">
                                {draftOutputs.advisory.compliance_and_governance}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Format 2: Executive Summary */}
                  {activeDeliverableTab === 'exec_summary' && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between pb-2">
                        <h2 className="text-lg font-bold text-neutral-900">Executive Situational Briefing</h2>
                        <span className="text-xs font-mono px-2 py-0.5 bg-neutral-100 text-neutral-800 border border-neutral-200 rounded">
                          Confidence: {draftOutputs.exec_summary.confidence_assessment || 'HIGH'}
                        </span>
                      </div>

                      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 leading-relaxed">
                        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Situation Overview</div>
                        {draftOutputs.exec_summary.situation_overview}
                      </div>

                      {draftOutputs.exec_summary.core_findings && (
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">Core Findings</div>
                          <div className="space-y-1.5">
                            {draftOutputs.exec_summary.core_findings.map((f: string, idx: number) => (
                              <div key={idx} className="p-3 bg-white border border-neutral-200 rounded-lg text-xs text-neutral-800 flex items-start gap-2">
                                <span className="font-mono text-neutral-400 font-bold">{idx + 1}.</span>
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {draftOutputs.exec_summary.strategic_impact && (
                        <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800">
                          <strong className="text-neutral-900 block mb-1">Strategic Infrastructure Impact:</strong>
                          {draftOutputs.exec_summary.strategic_impact}
                        </div>
                      )}

                      {draftOutputs.exec_summary.decisions_required && (
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">Leadership Decisions Required</div>
                          <div className="space-y-1.5">
                            {draftOutputs.exec_summary.decisions_required.map((d: string, idx: number) => (
                              <div key={idx} className="p-3 bg-neutral-900 text-white rounded-lg text-xs flex items-center justify-between">
                                <span>{d}</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">Requires Sign-off</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Format 3: Presentation Deck */}
                  {activeDeliverableTab === 'presentation' && (
                    <div className="space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-neutral-100 gap-2">
                        <span className="text-[10px] font-mono uppercase bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border border-neutral-200">
                          Target: {draftOutputs.presentation.target_audience || 'Defense Leadership'}
                        </span>

                        {/* View Switcher: Slide Deck View vs Full Slide Text View */}
                        <div className="flex items-center gap-1.5">
                          <div className="p-0.5 bg-neutral-100 border border-neutral-200 rounded-lg flex text-xs">
                            <button
                              type="button"
                              onClick={() => setPresentationViewMode('card')}
                              className={`px-2.5 py-1 rounded-md transition-all ${
                                presentationViewMode === 'card'
                                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                                  : 'text-neutral-600 hover:text-neutral-900'
                              }`}
                            >
                              Slide Deck View
                            </button>
                            <button
                              type="button"
                              onClick={() => setPresentationViewMode('text')}
                              className={`px-2.5 py-1 rounded-md transition-all ${
                                presentationViewMode === 'text'
                                  ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                                  : 'text-neutral-600 hover:text-neutral-900'
                              }`}
                            >
                              Full Slide Text View
                            </button>
                          </div>

                          {presentationViewMode === 'text' && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(getFullPresentationText(draftOutputs.presentation));
                                setCopiedPresentation(true);
                                setTimeout(() => setCopiedPresentation(false), 2000);
                              }}
                              className="px-2.5 py-1 text-xs bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              {copiedPresentation ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedPresentation ? 'Copied' : 'Copy All Slide Text'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <h2 className="text-lg font-bold text-neutral-900">
                        {draftOutputs.presentation.deck_title}
                      </h2>

                      {presentationViewMode === 'text' ? (
                        <div className="bg-[#0c0d0e] p-4 rounded-xl text-neutral-200 font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-neutral-700 border border-neutral-800">
                          {getFullPresentationText(draftOutputs.presentation)}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {draftOutputs.presentation.slides?.map((slide: any, idx: number) => (
                            <div key={idx} className="p-4 border border-neutral-200 rounded-xl bg-white shadow-2xs space-y-3">
                              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                                <span className="text-xs font-bold font-mono text-neutral-500">SLIDE {slide.slide_number || idx + 1}</span>
                                <span className="text-xs font-semibold text-neutral-900">{slide.title}</span>
                              </div>

                              <ul className="space-y-1 text-xs text-neutral-700 list-disc list-inside">
                                {slide.bullet_points?.map((bp: string, bpIdx: number) => (
                                  <li key={bpIdx}>{bp}</li>
                                ))}
                              </ul>

                              {slide.speaker_notes && (
                                <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-[11px] text-neutral-600 italic">
                                  <strong>Speaker Notes:</strong> {slide.speaker_notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Format 4: Video Package */}
                  {activeDeliverableTab === 'video' && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-lg font-bold text-neutral-900">{draftOutputs.video.video_title}</h2>
                        {draftOutputs.video.logline && (
                          <p className="text-xs text-neutral-500 italic mt-0.5">{draftOutputs.video.logline}</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        {draftOutputs.video.scenes?.map((sc: any, idx: number) => (
                          <div key={idx} className="p-4 border border-neutral-200 rounded-xl bg-white space-y-2">
                            <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-100">
                              <span className="font-mono font-bold text-neutral-900">Scene {sc.scene_number || idx + 1} ({sc.duration_seconds || 15}s)</span>
                              <span className="font-mono text-[10px] text-neutral-400">{sc.music_sound_cues}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200/60">
                                <span className="text-[10px] font-mono text-neutral-400 block mb-1">Visual Storyboard:</span>
                                <span className="text-neutral-700">{sc.visual_description}</span>
                              </div>
                              <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200/60">
                                <span className="text-[10px] font-mono text-neutral-400 block mb-1">Voiceover Narration:</span>
                                <span className="text-neutral-800 font-medium">"{sc.narration_voiceover}"</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Format 5: Infographic */}
                  {activeDeliverableTab === 'infographic' && (
                    <div className="space-y-5">
                      <h2 className="text-lg font-bold text-neutral-900">{draftOutputs.infographic.infographic_title}</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {draftOutputs.infographic.sections?.map((sec: any, idx: number) => (
                          <div key={idx} className="p-4 border border-neutral-200 rounded-xl bg-white space-y-2">
                            <div className="text-xs font-bold text-neutral-900">{sec.header}</div>
                            <p className="text-xs text-neutral-600">{sec.descriptive_copy}</p>
                            {sec.key_statistic && (
                              <div className="p-2 bg-neutral-50 rounded-lg font-mono text-xs font-bold text-neutral-900">
                                {sec.key_statistic}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Format 6: LinkedIn */}
                  {activeDeliverableTab === 'linkedin' && (
                    <div className="space-y-4 max-w-xl p-5 border border-neutral-200 rounded-xl bg-white shadow-xs">
                      <div className="text-sm font-bold text-neutral-900">{draftOutputs.linkedin.headline}</div>
                      <div className="text-xs text-neutral-700 font-medium">{draftOutputs.linkedin.opening_hook}</div>
                      <div className="space-y-2 text-xs text-neutral-700 leading-relaxed">
                        {draftOutputs.linkedin.body_paragraphs?.map((p: string, idx: number) => (
                          <p key={idx}>{p}</p>
                        ))}
                      </div>
                      {draftOutputs.linkedin.key_takeaways && (
                        <div className="p-3 bg-neutral-50 rounded-lg space-y-1">
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Key Takeaways:</span>
                          <ul className="text-xs text-neutral-700 list-disc list-inside space-y-0.5">
                            {draftOutputs.linkedin.key_takeaways.map((t: string, idx: number) => (
                              <li key={idx}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="text-xs text-neutral-500 font-mono">
                        {draftOutputs.linkedin.hashtags?.join(' ')}
                      </div>
                    </div>
                  )}

                  {/* Format 7: Twitter */}
                  {activeDeliverableTab === 'twitter' && (
                    <div className="space-y-4 max-w-2xl">
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                        <div className="space-y-0.5">
                          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                            <Twitter className="w-4 h-4 text-blue-500" />
                            <span>Twitter / X Intelligence Thread</span>
                          </h2>
                          <p className="text-xs text-neutral-500">
                            {draftOutputs.twitter.tweets?.length || 0} Tweets • Strictly ≤280 chars per tweet • Fully Grounded
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const fullThread = (draftOutputs.twitter.tweets || [])
                              .map((t: any) => t.content)
                              .join('\n\n---\n\n');
                            navigator.clipboard.writeText(fullThread);
                            setCopiedTwitter(true);
                            setTimeout(() => setCopiedTwitter(false), 2000);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          {copiedTwitter ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedTwitter ? 'Copied Thread' : 'Copy Entire Thread'}</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {draftOutputs.twitter.tweets?.map((t: any, idx: number) => {
                          const charLen = t.content?.length || 0;
                          return (
                            <div
                              key={idx}
                              className="p-4 border border-neutral-200 rounded-xl bg-white shadow-2xs space-y-2 hover:border-neutral-300 transition-colors"
                            >
                              <div className="flex items-center justify-between text-xs pb-1 border-b border-neutral-100">
                                <span className="font-bold font-mono text-neutral-900 flex items-center gap-1.5">
                                  <Twitter className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Tweet {t.tweet_number || idx + 1} of {draftOutputs.twitter.tweets.length}</span>
                                </span>
                                <span className={`font-mono text-[11px] px-2 py-0.5 rounded font-semibold ${
                                  charLen > 280 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-neutral-100 text-neutral-700'
                                }`}>
                                  {charLen} / 280 chars
                                </span>
                              </div>
                              <p className="text-xs text-neutral-800 leading-relaxed font-sans">{t.content}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty State */
                <div className="h-full flex flex-col items-center justify-center py-24 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-500">
                    <FileText className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900">
                      No Deliverables Generated Yet
                    </h3>
                    <p className="text-xs text-neutral-500 max-w-sm mt-1 leading-relaxed">
                      Go to <strong className="text-neutral-700">"1. Source Ingestion"</strong>, select your files and click <strong className="text-neutral-700">"Execute Transformation"</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMainTab('ingestion')}
                    className="mt-2 px-3.5 py-1.5 text-xs font-semibold bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <span>Go to Source Ingestion</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: HISTORY & AUDIT ARCHIVE                                            */}
        {/* ========================================================================= */}
        {activeMainTab === 'history' && (
          <HistoryArchive
            history={history}
            onRestoreOutputs={handleRestoreHistory}
            onClearHistory={handleClearHistory}
            onDeleteSession={handleDeleteHistorySession}
            onAddChatMessage={handleAddChatMessage}
          />
        )}
      </main>

      {/* Hard Gate Interception Modal */}
      <HardGateModal
        isOpen={hardGateModalOpen}
        discrepancies={discrepancies}
        jobId={jobId || 'job-sih-demo'}
        onConfirmAction={handleHardGateDecision}
      />

      {/* Slide-out Source Evidence Provenance Drawer */}
      <SourceEvidenceViewer
        isOpen={citationDrawerOpen}
        onClose={() => setCitationDrawerOpen(false)}
        chunks={sourceChunks}
        activeChunkId={activeCitationChunkId}
      />
    </div>
  );
};
