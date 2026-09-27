import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Cpu,
  Layers,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  ArrowRight,
  Terminal,
  Activity,
  Check,
  Clock,
  Zap,
  RotateCcw,
  Eye,
  Copy,
  ChevronDown,
  GitCommit,
  GitBranch,
  Radio,
  FileCheck,
  Sliders,
} from 'lucide-react';
import { PipelineLogEvent, EntityDiscrepancy } from '../api/client';

export interface PipelineWorkingStateProps {
  executionPhase:
    | 'idle'
    | 'ingesting'
    | 'extracting'
    | 'generating'
    | 'reflecting'
    | 'evaluating_gate'
    | 'exporting'
    | 'hard_gate_halted'
    | 'completed';
  jobId: string;
  logs: PipelineLogEvent[];
  discrepancies: EntityDiscrepancy[];
  onOpenHardGate: () => void;
  onViewOutputs: () => void;
  onApproveHardGate?: () => void;
  onRetryReflection?: () => void;
  formatsCount: number;
  totalElapsedSeconds?: number;
  stepDurations?: Record<string, string>;
  streamingText?: string;
  liveFormat?: string;
  activeFormats?: string[];
  draftOutputs?: Record<string, any>;
}

export const PipelineWorkingState: React.FC<PipelineWorkingStateProps> = ({
  executionPhase,
  jobId,
  logs,
  discrepancies,
  onOpenHardGate,
  onViewOutputs,
  onApproveHardGate,
  onRetryReflection,
  formatsCount,
  totalElapsedSeconds = 0,
  stepDurations = {},
  streamingText = '',
  liveFormat = '',
  activeFormats = ['advisory', 'exec_summary', 'presentation'],
  draftOutputs = {},
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const streamEndRef = useRef<HTMLDivElement>(null);
  const [pipelineGraphView, setPipelineGraphView] = useState<'vertical_mermaid' | 'grid'>('grid');
  const [selectedStreamFormat, setSelectedStreamFormat] = useState<string>(liveFormat || activeFormats[0] || 'advisory');
  const [copiedStream, setCopiedStream] = useState(false);

  useEffect(() => {
    if (liveFormat) {
      setSelectedStreamFormat(liveFormat);
    }
  }, [liveFormat]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, executionPhase]);

  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [streamingText]);

  const handleCopyStreamingText = () => {
    const textToCopy = streamingText || (draftOutputs[selectedStreamFormat] ? JSON.stringify(draftOutputs[selectedStreamFormat], null, 2) : '');
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedStream(true);
      setTimeout(() => setCopiedStream(false), 2000);
    }
  };

  // 6 Pipeline Nodes
  const nodes = [
    {
      id: 'ingestion_node',
      number: '01',
      title: 'Ingestion & Normalizer',
      subtitle: 'Coordinate chunking & SQLite SEI vault',
      shape: 'circle',
      checkpoint: 'CHECKPOINT 1/6',
      isCompleted: !['idle', 'ingesting'].includes(executionPhase),
      isRunning: executionPhase === 'ingesting',
      isPaused: false,
    },
    {
      id: 'context_node',
      number: '02',
      title: 'Context & spaCy NER',
      subtitle: 'ORG, GPE, TECH entity coordinate linking',
      shape: 'circle',
      checkpoint: 'CHECKPOINT 2/6',
      isCompleted: !['idle', 'ingesting', 'extracting'].includes(executionPhase),
      isRunning: executionPhase === 'extracting',
      isPaused: false,
    },
    {
      id: 'generator_node',
      number: '03',
      title: 'Parallel Format Generator',
      subtitle: `Pydantic schema synthesis (${formatsCount} formats)`,
      shape: 'rect',
      checkpoint: 'CHECKPOINT 3/6',
      isCompleted: !['idle', 'ingesting', 'extracting', 'generating'].includes(executionPhase),
      isRunning: executionPhase === 'generating',
      isPaused: false,
    },
    {
      id: 'reflection_node',
      number: '04',
      title: '2-Pass Bounded Reflection',
      subtitle: 'Structural audit & 0 cloud telemetry (<=1 retry)',
      shape: 'rect',
      checkpoint: 'CHECKPOINT 4/6',
      isCompleted: !['idle', 'ingesting', 'extracting', 'generating', 'reflecting'].includes(executionPhase),
      isRunning: executionPhase === 'reflecting',
      isPaused: false,
    },
    {
      id: 'verification_gate_node',
      number: '05',
      title: 'Verification Hard Gate',
      subtitle: 'Sub-10ms CPU RapidFuzz matching (75–99% band)',
      shape: 'diamond',
      checkpoint: 'CHECKPOINT 5/6',
      isCompleted: ['exporting', 'completed'].includes(executionPhase),
      isRunning: executionPhase === 'evaluating_gate',
      isPaused: executionPhase === 'hard_gate_halted',
    },
    {
      id: 'export_node',
      number: '06',
      title: 'Deterministic Exporters',
      subtitle: 'python-pptx & python-docx compiler',
      shape: 'rect',
      checkpoint: 'CHECKPOINT 6/6',
      isCompleted: executionPhase === 'completed',
      isRunning: executionPhase === 'exporting',
      isPaused: executionPhase === 'hard_gate_halted',
    },
  ];

  // Active text to display in the right panel
  const currentDisplayText = streamingText.length > 0 && executionPhase === 'generating'
    ? streamingText
    : draftOutputs[selectedStreamFormat]
    ? (typeof draftOutputs[selectedStreamFormat] === 'string'
        ? draftOutputs[selectedStreamFormat]
        : JSON.stringify(draftOutputs[selectedStreamFormat], null, 2))
    : streamingText;

  const displayLines = currentDisplayText ? currentDisplayText.split('\n') : [];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* TOP HEADER: Pipeline status & Telemetry Bar                               */}
      {/* ========================================================================= */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-neutral-900 font-sans tracking-tight">
                Pipeline status
              </h1>
              <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                executionPhase === 'completed'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : executionPhase === 'hard_gate_halted'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                  : executionPhase === 'idle'
                  ? 'bg-neutral-100 text-neutral-600 border-neutral-200'
                  : 'bg-orange-600 text-white border-orange-600'
              }`}>
                {executionPhase.toUpperCase().replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              StateGraph engine • Persistent checkpointing • Strict air-gap execution
            </p>
          </div>
        </div>

        {/* Telemetry Pills */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>0 KB Egress</span>
          </div>
          <div className="px-3 py-1 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-700">
            <span className="text-neutral-400 text-[10px] block leading-none">CPU NER</span>
            <strong className="text-neutral-900 font-bold">9.21 ms</strong>
          </div>
          <div className="px-3 py-1 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-orange-600" />
            <strong className="text-neutral-900 font-bold">{formatSeconds(totalElapsedSeconds)}</strong>
          </div>
          <div className="px-3 py-1 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-700">
            <span className="text-neutral-400 text-[10px] block leading-none">Job</span>
            <strong className="text-neutral-900 truncate max-w-[90px]">{jobId || 'local-demo'}</strong>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2-COLUMN WIREFRAME LAYOUT (Image 2: Left Graph+Terminal, Right Live Output)*/}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* ======================================================================= */}
        {/* LEFT COLUMN: Pipeline Graph (Top) & Terminal (Bottom) (Takes 6 cols)     */}
        {/* ======================================================================= */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          
          {/* ── TOP BOX: Pipeline Graph (with Vertical Mermaid tab) ── */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-orange-600" />
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Pipeline Execution Graph
                </h3>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center p-0.5 bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setPipelineGraphView('vertical_mermaid')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    pipelineGraphView === 'vertical_mermaid'
                      ? 'bg-white text-orange-600 shadow-2xs font-semibold'
                      : 'text-neutral-600 hover:text-orange-600'
                  }`}
                >
                  Vertical Mermaid Pipeline
                </button>
                <button
                  type="button"
                  onClick={() => setPipelineGraphView('grid')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    pipelineGraphView === 'grid'
                      ? 'bg-white text-orange-600 shadow-2xs font-semibold'
                      : 'text-neutral-600 hover:text-orange-600'
                  }`}
                >
                  Node Grid Flow
                </button>
              </div>
            </div>

            {/* TAB 1: VERTICAL MERMAID PIPELINE GRAPH */}
            {pipelineGraphView === 'vertical_mermaid' && (
              <div className="p-3 bg-neutral-50/70 border border-neutral-200/80 rounded-xl space-y-2 font-sans">
                <div className="space-y-1">
                  {nodes.map((node, idx) => {
                    const isLast = idx === nodes.length - 1;
                    return (
                      <div key={node.id} className="relative">
                        {/* Mermaid Node Card */}
                        <div
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                            node.isPaused
                              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300 shadow-xs'
                              : node.isRunning
                              ? 'bg-orange-600 text-white border-orange-600 ring-2 ring-orange-400 shadow-xs'
                              : node.isCompleted
                              ? 'bg-white border-emerald-300 text-neutral-900'
                              : 'bg-white/80 border-neutral-200 text-neutral-500 opacity-60'
                          }`}
                        >
                          {/* Node Icon & Shape Indicator */}
                          <div className="flex items-center space-x-3">
                            {/* Shape indicator matching wireframe (Circle, Circle, Rounded Rect, etc.) */}
                            <div className={`w-7 h-7 flex items-center justify-center font-mono text-[10px] font-bold border transition-colors ${
                              node.shape === 'circle'
                                ? 'rounded-full'
                                : node.shape === 'diamond'
                                ? 'rounded-md rotate-45 scale-90'
                                : 'rounded-lg'
                            } ${
                              node.isRunning
                                ? 'bg-white text-orange-600 border-white'
                                : node.isCompleted
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : node.isPaused
                                ? 'bg-amber-200 text-amber-900 border-amber-400'
                                : 'bg-neutral-100 text-neutral-500 border-neutral-300'
                            }`}>
                              <span className={node.shape === 'diamond' ? '-rotate-45' : ''}>
                                {node.number}
                              </span>
                            </div>

                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold ${node.isRunning ? 'text-white' : 'text-neutral-900'}`}>
                                  {node.title}
                                </span>
                                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                                  node.isRunning
                                    ? 'bg-orange-700 text-white'
                                    : 'bg-neutral-100 text-neutral-500'
                                }`}>
                                  {node.checkpoint}
                                </span>
                              </div>
                              <div className={`text-[10px] ${node.isRunning ? 'text-orange-100' : 'text-neutral-500'}`}>
                                {node.subtitle}
                              </div>
                            </div>
                          </div>

                          {/* Node Status Badge */}
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                              node.isPaused
                                ? 'bg-amber-200 text-amber-900 font-bold animate-pulse'
                                : node.isRunning
                                ? 'bg-white text-orange-600 font-bold flex items-center gap-1'
                                : node.isCompleted
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'text-neutral-400'
                            }`}>
                              {node.isPaused ? (
                                'HALTED (423)'
                              ) : node.isRunning ? (
                                <>
                                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                  <span>RUNNING</span>
                                </>
                              ) : node.isCompleted ? (
                                '✓ PASSED'
                              ) : (
                                'QUEUED'
                              )}
                            </span>
                            <span className={`text-[10px] font-mono ${node.isRunning ? 'text-orange-100' : 'text-neutral-400'}`}>
                              {stepDurations[node.id] || (node.isRunning ? 'Active' : node.isCompleted ? 'Done' : '—')}
                            </span>
                          </div>
                        </div>

                        {/* Mermaid Directional Connecting Arrow (↓) */}
                        {!isLast && (
                          <div className="flex justify-center py-1">
                            <div className="flex flex-col items-center">
                              <div className={`w-0.5 h-2.5 ${node.isCompleted ? 'bg-emerald-400' : 'bg-neutral-300'}`} />
                              <div className={`w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[5px] ${
                                node.isCompleted ? 'border-t-emerald-400' : 'border-t-neutral-300'
                              }`} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: COMPACT NODE GRID */}
            {pipelineGraphView === 'grid' && (
              <div className="grid grid-cols-2 gap-2">
                {nodes.map((node) => (
                  <div
                    key={node.id}
                    className={`p-2.5 rounded-xl border text-xs transition-all ${
                      node.isPaused
                        ? 'bg-amber-50 border-amber-400'
                        : node.isRunning
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : node.isCompleted
                        ? 'bg-neutral-50/80 border-neutral-200'
                        : 'bg-white opacity-50 border-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span>{node.number}</span>
                      <span>{node.isPaused ? 'HALTED' : node.isRunning ? 'RUNNING' : node.isCompleted ? 'DONE' : 'WAITING'}</span>
                    </div>
                    <div className="font-bold truncate">{node.title}</div>
                    <div className={`text-[10px] truncate ${node.isRunning ? 'text-orange-100' : 'text-neutral-400'}`}>{node.subtitle}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── BOTTOM BOX: Live Terminal with Inline Human-In-The-Loop Checkpoint ── */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs flex-1 flex flex-col">
            <div className="bg-neutral-900 px-4 py-2.5 flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center space-x-2 text-white text-xs font-mono">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">terminal_telemetry.log</span>
                <span className="text-[10px] text-neutral-400 px-1.5 py-0.2 bg-neutral-800 rounded">
                  STREAMING STDOUT
                </span>
              </div>
              <div className="text-[10px] font-mono text-neutral-400">
                <span>Checkpoints: 6 active</span>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="bg-[#0c0d0e] p-3.5 font-mono text-xs text-neutral-300 flex-1 min-h-[280px] max-h-[420px] overflow-y-auto space-y-2">
              <div className="text-neutral-500 text-[11px]">
                [00:00:00.00] [SYSTEM] Sentinel-Transform air-gap state machine initialized. 0 KB cloud egress enforced.
              </div>

              {logs.map((log, idx) => {
                const isGatePause = log.status === 'paused';
                return (
                  <div
                    key={idx}
                    className={`p-2 rounded text-[11px] leading-relaxed transition-all ${
                      isGatePause
                        ? 'bg-amber-950/40 border border-amber-500/40 text-amber-200'
                        : 'bg-neutral-900/50 text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-0.5">
                      <span className="font-semibold text-neutral-300">
                        [{log.timestamp}] [{log.title.toUpperCase()}]
                      </span>
                      <span className="px-1.5 py-0.2 bg-neutral-800 rounded text-neutral-300">
                        EGRESS: {log.egress || '0 KB'}
                      </span>
                    </div>
                    <div>
                      {isGatePause ? (
                        <span className="text-amber-300 font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                          {log.message}
                        </span>
                      ) : (
                        <span>{log.message}</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* ================================================================= */}
              {/* HUMAN-IN-THE-LOOP CHECKPOINT: POP-UP DIRECTLY INSIDE TERMINAL     */}
              {/* ================================================================= */}
              {executionPhase === 'hard_gate_halted' && (
                <div className="p-3 bg-amber-950/70 border-2 border-amber-500 rounded-xl text-amber-200 space-y-2.5 my-2 shadow-lg animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-amber-500/40 pb-2">
                    <div className="font-bold flex items-center gap-1.5 text-xs text-amber-300">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>&gt;&gt; HUMAN-IN-THE-LOOP INTERVENTION REQUIRED (HTTP 423)</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400 text-neutral-950 font-bold">
                      CHECKPOINT 5 HALT
                    </span>
                  </div>

                  <p className="text-[11px] text-amber-200/90 leading-snug">
                    Deterministic RapidFuzz NER verification detected an entity discrepancy in the 75–99% similarity band. Automated export nodes are locked until operator confirmation.
                  </p>

                  {/* Discrepancy Preview inside Terminal */}
                  {discrepancies.length > 0 && (
                    <div className="bg-black/60 p-2 rounded-lg border border-amber-500/30 text-[10px] space-y-1">
                      <div className="text-amber-400 font-semibold uppercase">Flagged Discrepancy:</div>
                      <div className="grid grid-cols-2 gap-2 text-neutral-300">
                        <div>
                          <span className="text-neutral-400">Generated: </span>
                          <span className="text-red-300 font-bold">{discrepancies[0].draft_entity}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400">Suggested Source: </span>
                          <span className="text-emerald-300 font-bold">{discrepancies[0].suggested_source_entity || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="text-neutral-400">
                        Similarity Score: <span className="text-amber-300">{discrepancies[0].similarity_score}%</span>
                      </div>
                    </div>
                  )}

                  {/* Interactive Operator Decision Buttons Right in Terminal */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onApproveHardGate ? onApproveHardGate() : onOpenHardGate()}
                      className="px-3 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>✓ Override & Approve Export</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onRetryReflection ? onRetryReflection() : onOpenHardGate()}
                      className="px-3 py-1.5 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-amber-200 border border-amber-500/50 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>↺ Trigger Reflection Re-roll</span>
                    </button>

                    <button
                      type="button"
                      onClick={onOpenHardGate}
                      className="px-2.5 py-1.5 text-xs font-medium text-amber-300 hover:text-white underline transition-colors"
                    >
                      Open Full Gate Modal &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Execution Completed Notification in Terminal */}
              {executionPhase === 'completed' && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-500/50 rounded-xl text-emerald-200 flex items-center justify-between my-2">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>All 6 pipeline checkpoints passed. Deliverables compiled & verified.</span>
                  </div>
                  <button
                    type="button"
                    onClick={onViewOutputs}
                    className="px-3 py-1 text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-neutral-950 rounded-lg transition-all flex items-center gap-1"
                  >
                    <span>View Outputs</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: Output Live Running with Line Numbering (Takes 6 cols)    */}
        {/* ======================================================================= */}
        <div className="lg:col-span-6 bg-white border border-neutral-200 rounded-2xl shadow-xs overflow-hidden flex flex-col h-full min-h-[620px]">
          
          {/* Top Bar for Output Live Running */}
          <div className="bg-[#0f1117] px-4 py-3 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-xs font-bold font-mono tracking-tight">
                output live running
              </span>

              {executionPhase === 'generating' && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE GENERATING
                </span>
              )}
            </div>

            {/* Metrics & Copy Button */}
            <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
              <span className="bg-neutral-800/80 px-2 py-0.5 rounded text-neutral-300">
                {displayLines.length} lines
              </span>
              <span className="bg-neutral-800/80 px-2 py-0.5 rounded text-neutral-300">
                {(currentDisplayText || '').length.toLocaleString()} chars
              </span>
              <button
                type="button"
                onClick={handleCopyStreamingText}
                className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors flex items-center gap-1 cursor-pointer"
                title="Copy live output text"
              >
                {copiedStream ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedStream ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Format Selection Tab Strip for Live Output */}
          <div className="bg-[#15171e] px-3 py-1.5 border-b border-neutral-800 flex items-center gap-1 overflow-x-auto">
            {activeFormats.map((fmt) => {
              const isSelected = selectedStreamFormat === fmt;
              const hasContent = !!draftOutputs[fmt];
              const isLive = liveFormat === fmt && executionPhase === 'generating';
              return (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setSelectedStreamFormat(fmt)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-neutral-800 text-white font-semibold border border-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span>{fmt.toUpperCase()}</span>
                  {isLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  )}
                  {hasContent && !isLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Live Running Loading UI */}
          {executionPhase === 'generating' && (
            <div className="bg-[#1a1d27] px-4 py-2 border-b border-neutral-800 flex items-center justify-between text-xs font-mono text-emerald-300">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                <span>Ollama local synthesis active: [{selectedStreamFormat.toUpperCase()}]</span>
              </div>
              <span className="text-[10px] text-neutral-400">~24 tok/s</span>
            </div>
          )}

          {/* Live Streaming Body with Line Numbering Gutter */}
          <div className="bg-[#0c0d0e] flex-1 p-0 font-mono text-xs overflow-y-auto min-h-[460px] flex">
            {displayLines.length === 0 ? (
              /* Idle / Loading State */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-600 space-y-3">
                {executionPhase === 'generating' ? (
                  <div className="space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto" />
                    <div className="text-xs text-emerald-400">
                      Generating schema & streaming tokens...
                    </div>
                  </div>
                ) : (
                  <>
                    <FileText className="w-8 h-8 stroke-[1.5] text-neutral-700" />
                    <div>
                      <p className="text-xs text-neutral-400 font-semibold">Live Output Buffer Ready</p>
                      <p className="text-[11px] text-neutral-600 mt-1 max-w-xs">
                        When the pipeline generates deliverables, live streamed tokens will render here in real time with line numbers.
                      </p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Line-Numbered Editor View */
              <div className="w-full flex">
                {/* Line Numbers Gutter */}
                <div className="bg-[#090a0b] py-3 px-2 text-right text-neutral-600 font-mono text-[11px] select-none border-r border-neutral-800/80 min-w-[45px]">
                  {displayLines.map((_, i) => (
                    <div key={i} className="leading-relaxed">
                      {(i + 1).toString().padStart(3, '0')}
                    </div>
                  ))}
                </div>

                {/* Text Output Content */}
                <div className="flex-1 p-3 text-neutral-200 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all overflow-x-hidden">
                  {currentDisplayText}
                  {executionPhase === 'generating' && (
                    <span className="inline-block w-2 h-3.5 bg-emerald-400 ml-0.5 animate-pulse align-text-bottom" />
                  )}
                  <div ref={streamEndRef} />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
