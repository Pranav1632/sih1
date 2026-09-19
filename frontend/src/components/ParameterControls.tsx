import React, { useState } from 'react';
import { Sliders, Cpu, ShieldAlert, Clock, ChevronDown, ChevronUp, Globe, Sparkles, Tag } from 'lucide-react';
import { GlobalParams } from '../api/client';

interface ParameterControlsProps {
  parameters: GlobalParams;
  onChange: (parameters: GlobalParams) => void;
  selectedFormatCount: number;
  primaryDocName?: string;
}

export const ParameterControls: React.FC<ParameterControlsProps> = ({
  parameters,
  onChange,
  selectedFormatCount,
  primaryDocName,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  const updateField = <K extends keyof GlobalParams>(field: K, value: GlobalParams[K]) => {
    onChange({
      ...parameters,
      [field]: value,
    });
  };

  const addKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      if (!parameters.keywords_must.includes(keywordInput.trim())) {
        updateField('keywords_must', [...parameters.keywords_must, keywordInput.trim()]);
      }
      setKeywordInput('');
    }
  };

  const removeKeyword = (tag: string) => {
    updateField(
      'keywords_must',
      parameters.keywords_must.filter((k) => k !== tag)
    );
  };

  // Dynamic Latency Calculation (Parameter #11)
  // RTX 3050 produces ~35-45 tok/s, ~3-4s per format; CPU takes ~10-14s per format
  const baseTimePerFormatRtx = 3.5;
  const wordMultiplier = parameters.words / 400;
  const estimatedRtxSeconds = Math.max(
    4,
    Math.round(selectedFormatCount * baseTimePerFormatRtx * (parameters.objective === 'heuristic' ? 0.8 : 1.1) * wordMultiplier)
  );

  return (
    <div className="bg-[#0f172a]/80 backdrop-blur border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-950/70 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              2. Transformation Parameters
              <span className="text-xs px-2 py-0.5 rounded font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                11-Control Matrix
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Deterministic prompt & grounding constraints mapped directly to generator agents
            </p>
          </div>
        </div>

        {/* Expected Output Time Readout (#11) */}
        <div className="flex items-center gap-2 bg-slate-900 border border-cyan-800/50 px-3 py-1.5 rounded-lg">
          <Clock className="w-4 h-4 text-cyan-400" />
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Est. Latency (RTX 3050)</div>
            <div className="text-xs font-semibold text-cyan-300 font-mono">
              ~{estimatedRtxSeconds}s ({selectedFormatCount} formats)
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Tone Control */}
        <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-300">1. Tone</span>
            <span className="text-cyan-400 font-mono">{parameters.tone}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {['Authoritative', 'Objective', 'Casual'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => updateField('tone', t)}
                className={`py-1 text-xs rounded transition font-medium ${
                  parameters.tone === t
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Custom tone override prompt..."
            value={parameters.tone_prompt || ''}
            onChange={(e) => updateField('tone_prompt', e.target.value)}
            className="w-full text-xs bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* 2. Audience Targeting */}
        <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-300">2. Target Audience</span>
            <span className="text-indigo-400 font-mono">{parameters.audience}</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {['Technical', 'Executive', 'Media', 'General'].map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => updateField('audience', a)}
                className={`py-1 text-xs rounded transition font-medium ${
                  parameters.audience === a
                    ? 'bg-indigo-500 text-slate-950 font-semibold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Custom target persona description..."
            value={parameters.audience_persona || ''}
            onChange={(e) => updateField('audience_persona', e.target.value)}
            className="w-full text-xs bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* 3. Level of Detail & 4. Target Word Length */}
        <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-300">3. Level of Detail</span>
              <span className="text-emerald-400 font-mono">{parameters.detail}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {['Low', 'Medium', 'High'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => updateField('detail', d)}
                  className={`py-1 text-xs rounded transition font-medium ${
                    parameters.detail === d
                      ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-slate-300">4. Target Length</span>
              <span className="text-cyan-400 font-mono">{parameters.words} words</span>
            </div>
            <input
              type="range"
              min="150"
              max="1500"
              step="50"
              value={parameters.words}
              onChange={(e) => updateField('words', parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>150w (Summary)</span>
              <span>500w</span>
              <span>1500w (Deep Brief)</span>
            </div>
          </div>
        </div>

        {/* 6. Objective & 10. Fact Matching Gate */}
        <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-300">6. Generation Objective</span>
              <span className="text-amber-400 font-mono capitalize">{parameters.objective}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => updateField('objective', 'heuristic')}
                className={`py-1.5 px-2 text-xs rounded transition font-medium text-center ${
                  parameters.objective === 'heuristic'
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Strict Heuristic-Fill
              </button>
              <button
                type="button"
                onClick={() => updateField('objective', 'generative')}
                className={`py-1.5 px-2 text-xs rounded transition font-medium text-center ${
                  parameters.objective === 'generative'
                    ? 'bg-indigo-500 text-slate-950 font-semibold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Generative Creative
              </button>
            </div>
          </div>

          {/* 10. Fact Matching Hard Gate */}
          <div className="flex items-center justify-between p-2 bg-rose-950/20 border border-rose-900/40 rounded">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <div>
                <div className="text-xs font-medium text-slate-200">10. Fact Matching Gate</div>
                <div className="text-[10px] text-slate-400">spaCy + RapidFuzz 50ms Hard Gate</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={parameters.fact_matching_gate}
                onChange={(e) => updateField('fact_matching_gate', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Advanced Parameters Toggle */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showAdvanced ? 'Hide Extended Controls' : 'Show Extended Controls (Language, Mandatory Terms, Catch-All Add-On)'}
        </button>

        {showAdvanced && (
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 7. Language & Formality */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                7. Language & Formality
              </label>
              <select
                value={parameters.language}
                onChange={(e) => updateField('language', e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="English">English (Standard NTRO)</option>
                <option value="Hindi">Hindi (Regional Dissemination)</option>
                <option value="Bengali">Bengali</option>
                <option value="Tamil">Tamil</option>
                <option value="French">French (Inter-Agency)</option>
              </select>
            </div>

            {/* 8. Keywords Must (Mandatory Terms) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                8. Mandatory Keywords (Press Enter)
              </label>
              <input
                type="text"
                placeholder="e.g. CVE-2026, GhostLatch..."
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={addKeyword}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <div className="flex flex-wrap gap-1 mt-1 max-h-16 overflow-y-auto">
                {parameters.keywords_must.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-200 border border-slate-700"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => removeKeyword(kw)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* 9. Catch-All Operator Add-On Instruction */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                9. Add-On Instruction
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Include MITRE ATT&CK technique IDs in recommendations..."
                value={parameters.add_on_instruction}
                onChange={(e) => updateField('add_on_instruction', e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
