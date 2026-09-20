import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, ArrowRight, Edit3, XCircle, FileWarning, Lock } from 'lucide-react';
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
  const [selectedAction, setSelectedAction] = useState<'accept_correction' | 'override' | 'manual_edit'>('accept_correction');
  
  const discrepancy = discrepancies.length > 0 ? discrepancies[0] : {
    draft_entity: "Directorate of Grid Power Resilience",
    suggested_source_entity: "Directorate of Power Grid Resilience",
    similarity_score: 86.1,
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

  const handleSubmit = async () => {
    if (selectedAction === 'override' && !analystSigned) {
      alert("Override requires checking the 'Analyst Sign-off' confirmation.");
      return;
    }
    await onConfirmAction(selectedAction, selectedAction === 'manual_edit' ? manualEditText : undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-neutral-200/90 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Warning Banner */}
        <div className="bg-amber-50/80 border-b border-amber-200 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-100 border border-amber-200 rounded-lg text-amber-900">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Verification Guardrail Active
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  Job: {jobId}
                </span>
              </div>
              <h2 className="text-sm font-bold text-neutral-900 mt-0.5">
                Human-in-the-Loop Review Gate Triggered
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-amber-800 bg-amber-100/70 border border-amber-300/60 px-2.5 py-1 rounded-md">
            <Lock className="w-3.5 h-3.5" />
            <span>EXPORT LOCKED (423)</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-600 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Entity Discrepancy Intercepted:</strong> The deterministic verification engine detected an entity transposition or ungrounded entity between the generated draft and the source document. Automatic export is paused until operator sign-off.
            </p>
          </div>

          {/* Discrepancy Diff Box */}
          <div className="border border-neutral-200 rounded-xl p-3.5 bg-white space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>Similarity Score: <strong className="text-neutral-900 font-mono">{discrepancy.similarity_score}%</strong></span>
              <span className="font-mono text-[11px] px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded">
                {discrepancy.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Draft Entity */}
              <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-lg space-y-1">
                <div className="text-[10px] font-mono uppercase text-rose-600 font-semibold flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Generated Draft Text
                </div>
                <div className="text-xs font-semibold text-rose-950">
                  "{discrepancy.draft_entity}"
                </div>
              </div>

              {/* Source Truth */}
              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-1">
                <div className="text-[10px] font-mono uppercase text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Authoritative Source Truth
                </div>
                <div className="text-xs font-semibold text-emerald-950">
                  "{discrepancy.suggested_source_entity || 'Unmatched in source text'}"
                </div>
              </div>
            </div>

            {discrepancy.source_excerpt && (
              <div className="text-[11px] text-neutral-500 bg-neutral-50 border border-neutral-200 p-2.5 rounded-lg leading-relaxed">
                <strong className="text-neutral-700">Source Evidence:</strong> "{discrepancy.source_excerpt}"
              </div>
            )}
          </div>

          {/* Action Radio Options */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-neutral-800">
              Select Operator Decision:
            </div>

            {/* Option 1: Accept Correction */}
            <label
              onClick={() => setSelectedAction('accept_correction')}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                selectedAction === 'accept_correction'
                  ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                  : 'border-neutral-200 bg-white hover:bg-neutral-50'
              }`}
            >
              <input
                type="radio"
                name="hardgate_action"
                checked={selectedAction === 'accept_correction'}
                onChange={() => setSelectedAction('accept_correction')}
                className="mt-0.5 accent-neutral-900"
              />
              <div className="text-xs">
                <div className="font-semibold text-neutral-900">
                  Accept Source Correction (Recommended)
                </div>
                <div className="text-neutral-500 text-[11px] mt-0.5">
                  Replaces "{discrepancy.draft_entity}" with verified source truth "{discrepancy.suggested_source_entity}".
                </div>
              </div>
            </label>

            {/* Option 2: Edit Manually */}
            <label
              onClick={() => setSelectedAction('manual_edit')}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                selectedAction === 'manual_edit'
                  ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                  : 'border-neutral-200 bg-white hover:bg-neutral-50'
              }`}
            >
              <input
                type="radio"
                name="hardgate_action"
                checked={selectedAction === 'manual_edit'}
                onChange={() => setSelectedAction('manual_edit')}
                className="mt-0.5 accent-neutral-900"
              />
              <div className="text-xs w-full">
                <div className="font-semibold text-neutral-900">
                  Edit Manually
                </div>
                <div className="text-neutral-500 text-[11px] mt-0.5">
                  Specify custom replacement string for this deliverable.
                </div>
                {selectedAction === 'manual_edit' && (
                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={manualEditText}
                      onChange={(e) => setManualEditText(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-300 rounded-md p-2 text-neutral-900 focus:outline-hidden focus:border-neutral-900"
                      placeholder="Enter verified entity string..."
                    />
                  </div>
                )}
              </div>
            </label>

            {/* Option 3: Override */}
            <label
              onClick={() => setSelectedAction('override')}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                selectedAction === 'override'
                  ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                  : 'border-neutral-200 bg-white hover:bg-neutral-50'
              }`}
            >
              <input
                type="radio"
                name="hardgate_action"
                checked={selectedAction === 'override'}
                onChange={() => setSelectedAction('override')}
                className="mt-0.5 accent-neutral-900"
              />
              <div className="text-xs w-full">
                <div className="font-semibold text-neutral-900">
                  Override & Retain Draft Text
                </div>
                <div className="text-neutral-500 text-[11px] mt-0.5">
                  Keeps the draft as generated. Requires operator sign-off.
                </div>
                {selectedAction === 'override' && (
                  <div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      id="analyst_sign"
                      checked={analystSigned}
                      onChange={(e) => setAnalystSigned(e.target.checked)}
                      className="accent-neutral-900 rounded"
                    />
                    <label htmlFor="analyst_sign" className="text-[11px] text-neutral-700 font-medium">
                      Analyst Signed Authorization: I confirm this entity is acceptable.
                    </label>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-neutral-50 border-t border-neutral-200 px-5 py-3.5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-lg transition-all shadow-xs"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {isSubmitting ? 'Resuming Pipeline...' : 'Confirm Decision & Unlock Exporters'}
          </button>
        </div>
      </div>
    </div>
  );
};
