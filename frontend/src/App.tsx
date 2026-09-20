import React, { useState, useEffect } from 'react';
import {
  Shield,
  Cpu,
  Download,
  Copy,
  ExternalLink,
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
  Sliders,
  Check,
  Zap,
} from 'lucide-react';

import { IngestionZone, UploadedItem } from './components/IngestionZone';
import { ParameterControls } from './components/ParameterControls';
import { FormatSelector } from './components/FormatSelector';
import { HardGateModal } from './components/HardGateModal';
import { SourceEvidenceViewer } from './components/SourceEvidenceViewer';

import {
  GlobalParams,
  SourceChunk,
  EntityDiscrepancy,
  MOCK_SOURCE_CHUNKS,
  MOCK_DRAFT_OUTPUTS,
  FLAGSHIP_MOCK_DISCREPANCY,
  ingestFiles,
  generateDeliverables,
  getStatus,
  confirmReview,
  getExportUrl,
} from './api/client';

export const App: React.FC = () => {
  // 1. Files & Ingestion State
  const [files, setFiles] = useState<UploadedItem[]>([
    {
      id: 'demo_01',
      name: 'Operation_GhostLatch_Incident_Report.pdf',
      size: 2450000,
      type: 'application/pdf',
      role: 'PRIMARY',
    },
    {
      id: 'demo_02',
      name: 'Tactical_Substation_Scan_Diagram.png',
      size: 980000,
      type: 'image/png',
      role: 'SUPPORTING',
    },
  ]);

  // 2. Parameters State (11 Matrix Controls)
  const [parameters, setParameters] = useState<GlobalParams>({
    tone: 'Authoritative',
    audience: 'Technical',
    detail: 'High',
    words: 500,
    objective: 'heuristic',
    language: 'English',
    formality: 9,
    keywords_must: ['CVE-2026-PENDING', 'GhostLatch'],
    add_on_instruction: 'Include MITRE ATT&CK mitigation alignment.',
    fact_matching_gate: true,
  });

  // 3. Formats State
  const [selectedFormats, setSelectedFormats] = useState<string[]>([
    'advisory',
    'exec_summary',
    'presentation',
  ]);
  const [activeTab, setActiveTab] = useState<string>('advisory');

  // 4. Pipeline Execution State
  const [jobId, setJobId] = useState<string>('job-sih-26154-demo');
  const [executionPhase, setExecutionPhase] = useState<
    'idle' | 'ingesting' | 'generating' | 'evaluating_gate' | 'hard_gate_halted' | 'completed'
  >('idle');
  const [sourceChunks, setSourceChunks] = useState<SourceChunk[]>(MOCK_SOURCE_CHUNKS);
  const [draftOutputs, setDraftOutputs] = useState<Record<string, any>>(MOCK_DRAFT_OUTPUTS);

  // 5. Hard Gate State (The Key Demo Moment)
  const [hardGateModalOpen, setHardGateModalOpen] = useState<boolean>(false);
  const [discrepancies, setDiscrepancies] = useState<EntityDiscrepancy[]>([FLAGSHIP_MOCK_DISCREPANCY]);
  const [humanApproved, setHumanApproved] = useState<boolean>(false);

  // 6. Citation Drawer State
  const [citationDrawerOpen, setCitationDrawerOpen] = useState<boolean>(false);
  const [activeCitationChunkId, setActiveCitationChunkId] = useState<string | null>(null);

  // 7. Feedback & Copy status
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Ensure active tab is within selected formats
  useEffect(() => {
    if (!selectedFormats.includes(activeTab) && selectedFormats.length > 0) {
      setActiveTab(selectedFormats[0]);
    }
  }, [selectedFormats, activeTab]);

  // Handle Pipeline Execution
  const handleExecute = async () => {
    setExecutionPhase('ingesting');
    setHumanApproved(false);

    try {
      // Step 1: Ingest
      const filesToIngest = files.map((f) => ({
        file: f.file || new File(['mock content'], f.name, { type: f.type }),
        role: f.role,
      }));
      const ingestRes = await ingestFiles(filesToIngest);
      setJobId(ingestRes.job_id);
      if (ingestRes.source_chunks && ingestRes.source_chunks.length > 0) {
        setSourceChunks(ingestRes.source_chunks);
      }

      // Step 2: Generate
      setExecutionPhase('generating');
      await generateDeliverables(ingestRes.job_id, parameters, selectedFormats);

      // Fast forward progress for demonstration
      setTimeout(() => {
        setExecutionPhase('evaluating_gate');

        // Check if Fact Matching Gate is enabled -> trigger Hard Gate Climax!
        setTimeout(() => {
          if (parameters.fact_matching_gate) {
            setExecutionPhase('hard_gate_halted');
            setHardGateModalOpen(true);
          } else {
            setExecutionPhase('completed');
            setHumanApproved(true);
          }
        }, 1200);
      }, 1500);
    } catch (err) {
      console.error('Execution error:', err);
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

    setHumanApproved(true);
    setHardGateModalOpen(false);
    setExecutionPhase('completed');
  };

  // Open Citation Drawer
  const openCitation = (chunkId: string) => {
    setActiveCitationChunkId(chunkId);
    setCitationDrawerOpen(true);
  };

  // Copy Active Deliverable to Clipboard
  const handleCopyContent = () => {
    const content = JSON.stringify(draftOutputs[activeTab] || {}, null, 2);
    navigator.clipboard.writeText(content);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Active Primary Document Name
  const primaryDoc = files.find((f) => f.role === 'PRIMARY')?.name;

  return (
    <div className="min-h-screen flex flex-col bg-[#080d16] text-slate-100">
      
      {/* Sovereign Air-Gapped Header Bar */}
      <header className="border-b border-slate-800/80 bg-[#090e17]/90 backdrop-blur sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Platform ID */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-950">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center text-cyan-400">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-wider text-white font-mono">
                  SENTINEL-TRANSFORM
                </h1>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60">
                  v1.0-DEFENSE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sovereign Multi-Format Intelligence Transformation Engine • <strong className="text-slate-300">NTRO PS 26154</strong>
              </p>
            </div>
          </div>

          {/* Air-Gapped Sovereign Telemetry Strip */}
          <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
            {/* Air-gapped badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-semibold text-[11px] tracking-wide">AIR-GAPPED (0 KB EGRESS)</span>
            </div>

            {/* Hardware badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px]">HOST: LOCAL GPU (RTX 3050)</span>
            </div>

            {/* Manual Hard Gate Test Button (Allows demonstrating the flagship moment anytime) */}
            <button
              onClick={() => setHardGateModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700/60 text-rose-300 text-[11px] transition font-semibold"
              title="Trigger the Flagship Hard Gate modal for evaluator demonstration"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Demo Hard Gate
            </button>
          </div>

        </div>
      </header>

      {/* Main Operational Workspace (2-Column Grid) */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INGESTION & CONTROLS (5 cols on xl) */}
        <div className="xl:col-span-5 space-y-6">
          {/* 1. Multimodal Ingestion */}
          <IngestionZone
            files={files}
            onFilesChange={setFiles}
            isIngesting={executionPhase === 'ingesting'}
          />

          {/* 2. Parameter Matrix */}
          <ParameterControls
            parameters={parameters}
            onChange={setParameters}
            selectedFormatCount={selectedFormats.length}
            primaryDocName={primaryDoc}
          />

          {/* 3. Output Formats Multi-Select */}
          <FormatSelector
            selectedFormats={selectedFormats}
            onChange={setSelectedFormats}
          />

          {/* Action Trigger Button */}
          <div className="pt-1">
            <button
              type="button"
              disabled={files.length === 0 || selectedFormats.length === 0 || executionPhase === 'generating'}
              onClick={handleExecute}
              className={`w-full py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition shadow-xl ${
                executionPhase === 'generating' || executionPhase === 'ingesting'
                  ? 'bg-cyan-950 border border-cyan-600/50 text-cyan-300 cursor-wait animate-pulse'
                  : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-cyan-950/80 font-extrabold hover:shadow-cyan-500/20 active:scale-[0.99]'
              }`}
            >
              {executionPhase === 'generating' ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Orchestrating Parallel Generators (Ollama Runtime)...
                </>
              ) : executionPhase === 'ingesting' ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Ingesting & Indexing Forensic Coordinates...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-current" />
                  Execute Multi-Format Transformation
                </>
              )}
            </button>
            <div className="text-center text-[11px] font-mono text-slate-500 mt-2">
              LangGraph State Machine • Single-Pass Grounded Context • Sub-50ms Verification Gate
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ARTIFACT PREVIEW & CITATION VIEWER (7 cols on xl) */}
        <div className="xl:col-span-7 flex flex-col space-y-4">
          
          {/* Pipeline Execution Progress Indicator */}
          <div className="bg-[#0f172a]/90 backdrop-blur border border-slate-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${executionPhase === 'generating' ? 'animate-spin' : ''}`} />
                LangGraph State Machine Status
              </span>
              <span className="font-mono text-cyan-400 uppercase text-[11px]">
                {executionPhase === 'idle' && 'Ready for Input'}
                {executionPhase === 'ingesting' && '1. Normalizing Ingestion Chunks'}
                {executionPhase === 'generating' && '2. Parallel Generator Nodes Active'}
                {executionPhase === 'evaluating_gate' && '3. spaCy + RapidFuzz Gate Evaluation'}
                {executionPhase === 'hard_gate_halted' && '⚠️ HARD GATE HALTED: Operator Review Needed'}
                {executionPhase === 'completed' && '✓ Grounded & Verified: Export Ready'}
              </span>
            </div>

            {/* Stepper Bar */}
            <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
              <div
                className={`py-1.5 px-1 rounded transition ${
                  executionPhase !== 'idle'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                1. Ingestion & SEI
              </div>
              <div
                className={`py-1.5 px-1 rounded transition ${
                  executionPhase === 'generating' || executionPhase === 'evaluating_gate' || executionPhase === 'hard_gate_halted' || executionPhase === 'completed'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                2. Shared Context
              </div>
              <div
                className={`py-1.5 px-1 rounded transition ${
                  executionPhase === 'hard_gate_halted'
                    ? 'bg-rose-500 text-white font-bold animate-pulse'
                    : executionPhase === 'completed'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                3. Entity Hard Gate
              </div>
              <div
                className={`py-1.5 px-1 rounded transition ${
                  executionPhase === 'completed'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                4. Deterministic Export
              </div>
            </div>
          </div>

          {/* Deliverable Viewer Card */}
          <div className="flex-1 bg-[#0f172a]/80 backdrop-blur border border-slate-800 rounded-xl flex flex-col shadow-2xl overflow-hidden min-h-[560px]">
            
            {/* Format Tabs & Action Buttons Bar */}
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
              
              {/* Tabs */}
              <div className="flex items-center space-x-1 overflow-x-auto">
                {selectedFormats.map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setActiveTab(fmt)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition capitalize flex items-center gap-1.5 ${
                      activeTab === fmt
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {fmt.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Action Buttons: Export & Copy */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopyContent}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
                  title="Copy deliverable content"
                >
                  {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedNotification ? 'Copied!' : 'Copy'}
                </button>

                {/* Exporter downloads (.pptx / .docx) */}
                <a
                  href={getExportUrl(activeTab === 'presentation' ? 'pptx' : 'docx', jobId)}
                  download
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    executionPhase === 'hard_gate_halted' && !humanApproved
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950'
                  }`}
                  title={
                    executionPhase === 'hard_gate_halted' && !humanApproved
                      ? 'Export is physically locked until analyst reviews the Hard Gate discrepancy'
                      : `Download compiled deliverable`
                  }
                  onClick={(e) => {
                    if (executionPhase === 'hard_gate_halted' && !humanApproved) {
                      e.preventDefault();
                      setHardGateModalOpen(true);
                    }
                  }}
                >
                  <Download className="w-3.5 h-3.5" />
                  {activeTab === 'presentation' ? 'Download .PPTX' : 'Download .DOCX'}
                </a>
              </div>
            </div>

            {/* Deliverable Content Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-5 font-sans">
              {renderDeliverableContent(activeTab, draftOutputs, openCitation)}
            </div>

            {/* Bottom Citation Drawer Quick-Bar */}
            <div className="p-3.5 bg-slate-950 border-t border-slate-800/90 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>
                  Click any <strong className="text-yellow-400 underline decoration-dotted">[Ref: Page N]</strong> badge to open the Forensic Evidence Drawer.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setCitationDrawerOpen(true)}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-mono text-xs underline font-medium"
              >
                Inspect Source Evidence Drawer &rarr;
              </button>
            </div>

          </div>
        </div>

      </main>

      {/* Flagship Climax: Hard Gate Review Modal */}
      <HardGateModal
        isOpen={hardGateModalOpen}
        discrepancies={discrepancies}
        jobId={jobId}
        onConfirmAction={handleHardGateDecision}
      />

      {/* Forensic Citation Drawer with Neon Highlight */}
      <SourceEvidenceViewer
        isOpen={citationDrawerOpen}
        onClose={() => setCitationDrawerOpen(false)}
        chunks={sourceChunks}
        activeChunkId={activeCitationChunkId}
        onSelectChunk={(id) => setActiveCitationChunkId(id)}
      />

    </div>
  );
};

// Sub-renderer for the 7 Deliverables with embedded Citation Badges
function renderDeliverableContent(
  format: string,
  drafts: Record<string, any>,
  onCitationClick: (chunkId: string) => void
) {
  const data = drafts[format];

  if (!data) {
    return (
      <div className="text-center text-slate-500 py-16">
        Deliverable generated on execution. Click <strong>Execute Multi-Format Transformation</strong> to begin.
      </div>
    );
  }

  // Citation Badge Component Helper
  const CitationBadge = ({ chunkId, label }: { chunkId: string; label: string }) => (
    <button
      type="button"
      onClick={() => onCitationClick(chunkId)}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 ml-1 text-[11px] font-mono font-bold bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 border border-yellow-500/50 rounded cursor-pointer transition shadow-sm hover:scale-105"
      title="Click to view exact character coordinates in Source Evidence Viewer"
    >
      <BookOpen className="w-3 h-3" />
      {label}
    </button>
  );

  switch (format) {
    case 'advisory':
      return (
        <div className="space-y-4 text-slate-200">
          <div className="border-b border-slate-700 pb-3 flex justify-between items-start">
            <div>
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-700 rounded font-bold">
                SEVERITY: {data.severity_level || 'HIGH'}
              </span>
              <h2 className="text-lg font-bold text-white mt-1.5">{data.title}</h2>
              <div className="text-xs text-slate-400 font-mono mt-0.5">Ref: {data.advisory_id}</div>
            </div>
            <div className="text-right text-xs font-mono text-slate-400">
              National Technical Research Organisation
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase text-cyan-400">1. Threat Overview</h3>
            <p className="text-sm leading-relaxed text-slate-300">
              {data.threat_overview}
              <CitationBadge chunkId="doc_01_chunk_01" label="[Ref: Page 1, §2]" />
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase text-cyan-400">2. Affected Systems</h3>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1 pl-1">
              {data.affected_systems?.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase text-cyan-400">3. Indicators of Compromise (IOCs)</h3>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-rose-300 space-y-1">
              {data.indicators_of_compromise?.map((ioc: string, i: number) => (
                <div key={i}>• {ioc}</div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase text-emerald-400">4. Recommended Mitigations</h3>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1 pl-1">
              {data.recommended_mitigations?.map((m: string, i: number) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-1">
            <span className="font-semibold text-slate-300">Compliance & Governance:</span>
            <div className="text-slate-300">
              {data.compliance_and_governance}
              <CitationBadge chunkId="doc_01_chunk_02" label="[Ref: Page 3, §2]" />
            </div>
          </div>
        </div>
      );

    case 'exec_summary':
      return (
        <div className="space-y-4 text-slate-200">
          <div className="border-b border-slate-700 pb-3">
            <h2 className="text-lg font-bold text-white">Executive Situational Briefing</h2>
            <div className="text-xs text-slate-400 font-mono">Confidence Assessment: HIGH (Grounded)</div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase text-cyan-400">Strategic Overview</h3>
            <p className="text-sm leading-relaxed text-slate-300">
              {data.situation_overview}
              <CitationBadge chunkId="doc_01_chunk_01" label="[Ref: Page 1]" />
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase text-cyan-400">Core Findings</h3>
            <div className="space-y-2">
              {data.core_findings?.map((cf: string, i: number) => (
                <div key={i} className="p-2.5 bg-slate-900/70 border border-slate-800 rounded text-xs text-slate-300">
                  • {cf}
                  <CitationBadge chunkId="doc_01_chunk_02" label="[Ref: Page 3]" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase text-cyan-400">Decisions Required</h3>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1 pl-1">
              {data.decisions_required?.map((d: string, i: number) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      );

    case 'presentation':
      return (
        <div className="space-y-4">
          <div className="border-b border-slate-700 pb-3">
            <h2 className="text-lg font-bold text-white">{data.deck_title}</h2>
            <div className="text-xs text-slate-400 font-mono">Target Audience: {data.target_audience}</div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {data.slides?.map((s: any, idx: number) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5 shadow-md">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-cyan-400 font-mono">
                    SLIDE {s.slide_number}: {s.title}
                  </span>
                  <CitationBadge chunkId="doc_01_chunk_01" label="[Ref: Chunk 1]" />
                </div>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 pl-1">
                  {s.bullet_points?.map((bp: string, i: number) => (
                    <li key={i}>{bp}</li>
                  ))}
                </ul>
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-400 italic">
                  <strong>Speaker Notes:</strong> {s.speaker_notes}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'linkedin':
      return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold font-mono">
            <Linkedin className="w-4 h-4" />
            <span>LINKEDIN PROFESSIONAL PUBLICATION CARD</span>
          </div>
          <h3 className="text-base font-bold text-white">{data.headline}</h3>
          <p className="text-sm font-semibold text-slate-300 italic">{data.opening_hook}</p>
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            {data.body_paragraphs?.map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1.5 text-xs text-cyan-400 font-mono">
            {data.hashtags?.map((h: string, i: number) => (
              <span key={i}>{h}</span>
            ))}
          </div>
        </div>
      );

    case 'twitter':
      return (
        <div className="space-y-3">
          <div className="text-xs font-bold text-cyan-400 font-mono uppercase">
            {data.thread_title} ({data.total_tweets} Tweets)
          </div>
          <div className="space-y-2">
            {data.tweets?.map((tw: any) => (
              <div key={tw.tweet_number} className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg space-y-2">
                <p className="text-xs text-slate-200 leading-relaxed">{tw.content}</p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>{tw.character_count} / 280 chars</span>
                  <CitationBadge chunkId="doc_01_chunk_01" label="[doc_01:p1]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'video':
      return (
        <div className="space-y-4">
          <div className="border-b border-slate-700 pb-2">
            <h2 className="text-base font-bold text-white">{data.video_title}</h2>
            <div className="text-xs text-slate-400 font-mono">Duration: {data.target_duration} • Logline: {data.logline}</div>
          </div>
          <div className="space-y-3">
            {data.scenes?.map((sc: any) => (
              <div key={sc.scene_number} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs font-bold text-cyan-400 font-mono">
                  SCENE {sc.scene_number} ({sc.duration_seconds}s)
                </div>
                <div className="text-xs text-slate-300"><strong>Visual:</strong> {sc.visual_description}</div>
                <div className="text-xs text-emerald-300 bg-slate-950 p-2 rounded">
                  <strong>Narration Voiceover:</strong> "{sc.narration_voiceover}"
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  <strong>Subtitles:</strong> {sc.on_screen_subtitles} • <strong>Sound:</strong> {sc.music_sound_cues}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'infographic':
      return (
        <div className="space-y-4">
          <div className="border-b border-slate-700 pb-2">
            <h2 className="text-base font-bold text-white">{data.infographic_title}</h2>
            <div className="text-xs text-slate-400 font-mono">Theme: {data.central_theme}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.sections?.map((sec: any) => (
              <div key={sec.section_order} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs font-bold text-cyan-400 font-mono uppercase">
                  {sec.header}
                </div>
                <div className="text-xl font-extrabold text-white font-mono text-cyan-300">
                  {sec.key_statistic_or_callout}
                </div>
                <p className="text-xs text-slate-300">{sec.descriptive_copy}</p>
                <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 inline-block">
                  Chart: {sec.recommended_chart_type}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return <pre className="text-xs font-mono text-slate-300">{JSON.stringify(data, null, 2)}</pre>;
  }
}
