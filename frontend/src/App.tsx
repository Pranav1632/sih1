import React, { useState, useEffect } from 'react';
import {
  Shield,
  Cpu,
  Download,
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
} from 'lucide-react';

import { IngestionZone, UploadedItem } from './components/IngestionZone';
import { ParameterControls } from './components/ParameterControls';
import { FormatSelector } from './components/FormatSelector';
import { HardGateModal } from './components/HardGateModal';
import { SourceEvidenceViewer } from './components/SourceEvidenceViewer';
import { PipelineWorkingState } from './components/PipelineWorkingState';

import {
  GlobalParams,
  SourceChunk,
  EntityDiscrepancy,
  PipelineLogEvent,
  ingestFiles,
  generateDeliverables,
  getStatus,
  confirmReview,
  getExportUrl,
} from './api/client';

export const App: React.FC = () => {
  // 1. Top-Level Main Tabs: 'ingestion' | 'pipeline' | 'outputs'
  const [activeMainTab, setActiveMainTab] = useState<'ingestion' | 'pipeline' | 'outputs'>('ingestion');

  // 2. Files & Ingestion State
  const [files, setFiles] = useState<UploadedItem[]>([]);

  // 3. Parameters State (11 Matrix Controls)
  const [parameters, setParameters] = useState<GlobalParams>({
    tone: 'Authoritative',
    audience: 'Technical',
    detail: 'Standard',
    words: 400,
    objective: 'heuristic',
    language: 'English',
    formality: 9,
    keywords_must: [],
    add_on_instruction: '',
    fact_matching_gate: true,
  });

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
    'idle' | 'ingesting' | 'generating' | 'evaluating_gate' | 'hard_gate_halted' | 'completed'
  >('idle');
  const [sourceChunks, setSourceChunks] = useState<SourceChunk[]>([]);
  const [draftOutputs, setDraftOutputs] = useState<Record<string, any>>({});
  const [exportedFiles, setExportedFiles] = useState<Record<string, string>>({});
  const [pipelineLogs, setPipelineLogs] = useState<PipelineLogEvent[]>([]);

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

    // Initialize real-time streaming logs
    const initialLogs: PipelineLogEvent[] = [
      {
        step: 'ingestion_node',
        title: 'Ingestion & Normalizer Node',
        status: 'running',
        message: `Ingesting ${files.length} document(s)... Resolving PRIMARY authority baseline.`,
        timestamp: '0.05s',
        egress: '0 KB',
      },
    ];
    setPipelineLogs(initialLogs);

    try {
      // Step 1: Ingest
      const filesToIngest = files.map((f) => ({
        file: f.file || new File(['sample report text'], f.name, { type: f.type }),
        role: f.role,
      }));
      const ingestRes = await ingestFiles(filesToIngest);
      setJobId(ingestRes.job_id);
      if (ingestRes.source_chunks && ingestRes.source_chunks.length > 0) {
        setSourceChunks(ingestRes.source_chunks);
      }

      setPipelineLogs((prev) => [
        ...prev,
        {
          step: 'ingestion_node',
          title: 'Ingestion & Normalizer Node',
          status: 'completed',
          message: `Indexed ${ingestRes.source_chunks.length} coordinate chunks into SQLite SEI store.`,
          timestamp: '0.22s',
          egress: '0 KB',
        },
        {
          step: 'generator_node',
          title: 'Parallel Multi-Format Generation Node',
          status: 'running',
          message: `Dispatched parallel workers for [${selectedFormats.join(', ')}].`,
          timestamp: '0.45s',
          egress: '0 KB',
        },
      ]);

      // Step 2: Generate
      setExecutionPhase('generating');
      await generateDeliverables(ingestRes.job_id, parameters, selectedFormats);

      // Step 3: Fetch Status & Evaluate Gate
      setExecutionPhase('evaluating_gate');
      const statusRes = await getStatus(ingestRes.job_id);

      if (statusRes.logs && statusRes.logs.length > 0) {
        setPipelineLogs(statusRes.logs);
      }

      if (statusRes.hard_gate_triggered && !statusRes.human_approved) {
        setExecutionPhase('hard_gate_halted');
        setDiscrepancies(statusRes.entity_discrepancies || []);
        setDraftOutputs(statusRes.draft_outputs || {});
        setHardGateModalOpen(true);
      } else {
        setExecutionPhase('completed');
        setDraftOutputs(statusRes.draft_outputs || {});
        setExportedFiles(statusRes.exported_files || {});
        setHumanApproved(true);
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
  };

  // Open Citation Drawer
  const openCitation = (chunkId: string) => {
    setActiveCitationChunkId(chunkId);
    setCitationDrawerOpen(true);
  };

  // Copy Active Deliverable
  const handleCopyContent = () => {
    const content = JSON.stringify(draftOutputs[activeDeliverableTab] || {}, null, 2);
    navigator.clipboard.writeText(content);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
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
        {/* TAB 1: SOURCE INGESTION & CONFIGURATION                                   */}
        {/* ========================================================================= */}
        {activeMainTab === 'ingestion' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-150">
            {/* Left Column: Ingestion Zone (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <IngestionZone
                files={files}
                onFilesChange={setFiles}
                isIngesting={executionPhase === 'ingesting'}
              />

              {/* Action Banner */}
              <div className="p-4 bg-neutral-100/70 border border-neutral-200 rounded-xl space-y-2">
                <div className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-neutral-800" />
                  Ready to Transform
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Executing will parse coordinate chunks, dispatch parallel Pydantic generation, run the 2-pass reflection audit, and evaluate the verification gate.
                </p>
                <button
                  type="button"
                  onClick={handleExecute}
                  disabled={files.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-lg shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                >
                  <span>Execute Transformation ({selectedFormats.length} Formats)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Column: Parameters & Formats (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <ParameterControls
                parameters={parameters}
                onChange={setParameters}
                selectedFormatCount={selectedFormats.length}
                primaryDocName={primaryDoc}
              />

              <FormatSelector
                selectedFormats={selectedFormats}
                onChange={setSelectedFormats}
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PIPELINE WORKING STATE & LIVE STREAMING                            */}
        {/* ========================================================================= */}
        {activeMainTab === 'pipeline' && (
          <PipelineWorkingState
            executionPhase={executionPhase}
            jobId={jobId}
            logs={pipelineLogs}
            discrepancies={discrepancies}
            onOpenHardGate={() => setHardGateModalOpen(true)}
            onViewOutputs={() => setActiveMainTab('outputs')}
            formatsCount={selectedFormats.length}
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
                {jobId && humanApproved && (
                  <>
                    <a
                      href={getExportUrl('pptx', jobId)}
                      download
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-800 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg shadow-2xs transition-colors"
                      title="Download Editable PowerPoint"
                    >
                      <Download className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Download .pptx</span>
                    </a>

                    <a
                      href={getExportUrl('docx', jobId)}
                      download
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-800 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg shadow-2xs transition-colors"
                      title="Download Formal Advisory DOCX"
                    >
                      <Download className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Download .docx</span>
                    </a>
                  </>
                )}

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
                      <div>
                        <div className="flex items-center gap-2 mb-1">
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
                        <h2 className="text-lg font-bold text-neutral-900">
                          {draftOutputs.advisory.title}
                        </h2>
                      </div>

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
                      <div>
                        <span className="text-[10px] font-mono uppercase bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border border-neutral-200">
                          Target: {draftOutputs.presentation.target_audience || 'Defense Leadership'}
                        </span>
                        <h2 className="text-lg font-bold text-neutral-900 mt-1">
                          {draftOutputs.presentation.deck_title}
                        </h2>
                      </div>

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
                    <div className="space-y-3 max-w-md">
                      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                        Twitter Thread ({draftOutputs.twitter.tweets?.length || 0} Tweets)
                      </div>
                      {draftOutputs.twitter.tweets?.map((t: any, idx: number) => (
                        <div key={idx} className="p-4 border border-neutral-200 rounded-xl bg-white space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                            <span>Tweet {t.tweet_number || idx + 1}</span>
                            <span>{t.character_count || t.content?.length} / 280 chars</span>
                          </div>
                          <p className="text-xs text-neutral-800 leading-relaxed">{t.content}</p>
                        </div>
                      ))}
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
