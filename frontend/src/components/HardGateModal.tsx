import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, ArrowRight, Edit3, XCircle, FileWarning, Lock, BookOpen } from 'lucide-react';
import { EntityDiscrepancy } from '../api/client';

interface HardGateModalProps {
  isOpen: boolean;
  discrepancies: EntityDiscrepancy[];
  jobId: string;
  onConfirmAction: (action: 'accept_correction' | 'override' | 'manual_edit', customText?: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const HardGateModal: React.FC<HardGateModalProps> = ({
  isOpen,
  discrepancies,
  jobId,
  onConfirmAction,
  isSubmitting = false,
}) => {
  const [analystSigned, setAnalystSigned] = useState(false);
  const [activeTab, setActiveTab] = useState<'decision' | 'edit'>('decision');
  
  // Default to first discrepancy or fallback
  const discrepancy = discrepancies.length > 0 ? discrepancies[0] : {
    draft_entity: "Directorate of Grid Power Resilience",
    suggested_source_entity: "Directorate of Power Grid Resilience",
    similarity_score: 98.2,
    status: "FLAGGED_MISMATCH" as const,
    deliverable_name: "Intelligence Advisory",
    section_title: "Compliance & Governance Protocol",
    source_excerpt: "The Directorate of Power Grid Resilience confirmed that all affected substations have since been remediated with emergency firmware patches.",
    page_number: 3
  };

  const [manualEditText, setManualEditText] = useState(
    discrepancy.suggested_source_entity || discrepancy.draft_entity
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#180d12] via-[#0d131f] to-[#0d131f] border-2 border-rose-500/80 rounded-2xl shadow-2xl shadow-rose-950/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Emergency Red Banner */}
        <div className="bg-rose-950/90 border-b border-rose-800/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-600/30 border border-rose-500 rounded-xl text-rose-400 animate-pulse">
              <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-rose-900/90 text-rose-200 border border-rose-700">
                  National Security Guardrail Active
                </span>
                <span className="text-[11px] font-mono text-rose-400">
                  Ref: PS 26154 Hard Gate
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                MANDATORY HUMAN REVIEW GATE TRIGGERED
              </h1>
            </div>
          </div>
          <div className="text-right font-mono text-xs text-rose-300/80">
            <div>Job ID: {jobId}</div>
            <div className="text-[11px] text-rose-400">STATUS: PUBLICATION HALTED</div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Explanation Alert */}
          <div className="bg-rose-950/30 border border-rose-900/60 rounded-xl p-3.5 text-xs text-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Deterministic Entity Verification Gate:</strong> spaCy statistical NER and RapidFuzz token matching caught an entity transposition between the generated draft and the authoritative source document. Automated exports are <strong>physically locked</strong> until operator review.
            </p>
          </div>

          {/* Target Deliverable Info */}
          <div className="flex items-center justify-between text-xs px-1 text-slate-400">
            <span>
              Affected Deliverable: <strong className="text-slate-200">{discrepancy.deliverable_name || 'Intelligence Advisory'}</strong>
            </span>
            <span>
              Section: <strong className="text-slate-200">{discrepancy.section_title || 'Threat Overview'}</strong>
            </span>
          </div>

          {/* Visual Diff Card */}
          <div className="bg-[#090e17] border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Draft Output (Flagged) */}
              <div className="bg-rose-950/20 border border-rose-900/50 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-mono tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" />
                    Detected in Generated Draft
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-900/80 text-rose-200">
                    Transposition Error
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950/90 border border-rose-950 rounded font-mono text-sm font-semibold text-rose-300">
                  "{discrepancy.draft_entity}"
                </div>
                <p className="text-[11px] text-rose-400/80">
                  Model hallucinated word order transposition.
                </p>
              </div>

              {/* Source Document Truth */}
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-mono tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified in Source Document
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-200">
                    {discrepancy.similarity_score}% Match
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950/90 border border-emerald-950 rounded font-mono text-sm font-semibold text-emerald-300">
                  "{discrepancy.suggested_source_entity}"
                </div>
                <p className="text-[11px] text-emerald-400/80">
                  Authoritative entity from Primary Source (Page {discrepancy.page_number || 3}).
                </p>
              </div>
            </div>

            {/* Source Evidence Excerpt */}
            <div className="bg-slate-950/70 border border-slate-800/90 rounded-lg p-3 space-y-1.5">
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                Source Evidence Context (Page {discrepancy.page_number || 3}, Paragraph 2):
              </div>
              <div className="text-xs text-slate-300 italic pl-3 border-l-2 border-cyan-500/50">
                "{discrepancy.source_excerpt || '...The Directorate of Power Grid Resilience confirmed that all affected substations have since been remediated with emergency firmware patches...'}"
              </div>
            </div>
          </div>

          {/* Mode Switch: Standard Review vs Manual Inline Editor */}
          {activeTab === 'edit' && (
            <div className="bg-slate-950 border border-cyan-800/60 rounded-xl p-4 space-y-2">
              <label className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                Manual Entity Replacement Editor:
              </label>
              <input
                type="text"
                value={manualEditText}
                onChange={(e) => setManualEditText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
              />
              <p className="text-[11px] text-slate-400">
                The updated string will be deterministically injected into all generated deliverable drafts.
              </p>
            </div>
          )}

          {/* The 3 Protocol Actions per Hard Gate Specification */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Operational Protocol Decisions (Select One):
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              
              {/* Action 1: Accept Source Correction (Recommended) */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onConfirmAction('accept_correction', discrepancy.suggested_source_entity || undefined)}
                className="flex flex-col items-center justify-center p-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-950/40 text-center group"
              >
                <div className="flex items-center gap-1 text-xs">
                  <CheckCircle className="w-4 h-4" />
                  Accept Source Correction
                </div>
                <span className="text-[10px] font-normal text-emerald-950 mt-0.5">
                  Replace with "{discrepancy.suggested_source_entity}"
                </span>
              </button>

              {/* Action 2: Manual Edit */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  if (activeTab === 'edit') {
                    onConfirmAction('manual_edit', manualEditText);
                  } else {
                    setActiveTab('edit');
                  }
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition text-center border font-semibold text-xs ${
                  activeTab === 'edit'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Edit3 className="w-4 h-4" />
                  {activeTab === 'edit' ? 'Apply Custom Edit' : 'Edit Manually'}
                </div>
                <span className="text-[10px] font-normal text-slate-400 mt-0.5">
                  Refine with custom text
                </span>
              </button>

              {/* Action 3: Override & Keep Draft */}
              <button
                type="button"
                disabled={!analystSigned || isSubmitting}
                onClick={() => onConfirmAction('override')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition text-center border font-semibold text-xs ${
                  analystSigned
                    ? 'bg-rose-700 hover:bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-950/50'
                    : 'bg-slate-900/60 text-slate-500 border-slate-800 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Override & Keep Draft
                </div>
                <span className="text-[10px] font-normal text-slate-500 mt-0.5">
                  Requires Signed Auth
                </span>
              </button>
            </div>

            {/* Mandatory Analyst Signature Checkbox for Override */}
            <div className="mt-3 p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-start gap-2.5">
              <input
                id="analyst-signed-checkbox"
                type="checkbox"
                checked={analystSigned}
                onChange={(e) => setAnalystSigned(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 text-rose-600 focus:ring-rose-500 bg-slate-950 cursor-pointer"
              />
              <label htmlFor="analyst-signed-checkbox" className="text-xs text-slate-300 cursor-pointer leading-tight">
                <strong className="text-white">Analyst Signed Authorization:</strong> I certify that the ungrounded or transposed entity name in the draft is operationally intentional and assume full institutional responsibility.
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
