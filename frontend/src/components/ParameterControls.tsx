import React, { useState } from 'react';
import { Sliders, Clock, ChevronDown, ChevronUp, Globe, Sparkles, Tag, ShieldCheck, Cpu } from 'lucide-react';
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
  const baseTimePerFormatRtx = 2.5;
  const wordMultiplier = parameters.words / 400;
  const estimatedRtxSeconds = Math.max(
    3,
    Math.round(selectedFormatCount * baseTimePerFormatRtx * (parameters.objective === 'heuristic' ? 0.6 : 1.0) * wordMultiplier)
  );

  return (
    <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-900">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              Transformation Parameters
              <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-neutral-100 text-neutral-700 border border-neutral-200">
                11 Controls
              </span>
            </h2>
            <p className="text-xs text-neutral-500">
              Style, audience, length, and deterministic grounding constraints
            </p>
          </div>
        </div>

        {/* Expected Latency Readout */}
        <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-lg">
          <Clock className="w-3.5 h-3.5 text-neutral-600" />
          <div className="text-right">
            <div className="text-[10px] text-neutral-500 uppercase font-mono">Est. Latency (Local)</div>
            <div className="text-xs font-semibold text-neutral-900 font-mono">
              ~{estimatedRtxSeconds}s ({selectedFormatCount} formats)
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* 1. Tone Control */}
        <div className="bg-neutral-50/70 border border-neutral-200/80 p-3 rounded-lg space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-neutral-700">1. Tone</span>
            <span className="text-neutral-900 font-mono text-[11px] font-semibold">{parameters.tone}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {['Authoritative', 'Objective', 'Casual'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => updateField('tone', t)}
                className={`py-1 text-xs rounded-md transition-all font-medium ${
                  parameters.tone === t
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Target Audience */}
        <div className="bg-neutral-50/70 border border-neutral-200/80 p-3 rounded-lg space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-neutral-700">2. Target Audience</span>
            <span className="text-neutral-900 font-mono text-[11px] font-semibold">{parameters.audience}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {['Executive', 'Technical', 'General'].map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => updateField('audience', a)}
                className={`py-1 text-xs rounded-md transition-all font-medium ${
                  parameters.audience === a
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Level of Detail */}
        <div className="bg-neutral-50/70 border border-neutral-200/80 p-3 rounded-lg space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-neutral-700">3. Level of Detail</span>
            <span className="text-neutral-900 font-mono text-[11px] font-semibold">{parameters.detail}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {['Concise', 'Standard', 'Deep Forensic'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => updateField('detail', d)}
                className={`py-1 text-xs rounded-md transition-all font-medium ${
                  parameters.detail === d
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Word Budget Slider */}
        <div className="bg-neutral-50/70 border border-neutral-200/80 p-3 rounded-lg space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-neutral-700">4. Target Word Budget</span>
            <span className="text-neutral-900 font-mono text-[11px] font-semibold">{parameters.words} words</span>
          </div>
          <input
            type="range"
            min="100"
            max="1500"
            step="50"
            value={parameters.words}
            onChange={(e) => updateField('words', parseInt(e.target.value))}
            className="w-full accent-neutral-900 cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>100w (Executive)</span>
            <span>500w (Advisory)</span>
            <span>1500w (Comprehensive)</span>
          </div>
        </div>
      </div>

      {/* Advanced Collapsible Section */}
      <div className="mt-3.5 pt-3 border-t border-neutral-200">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            Advanced Grounding & Verification Controls (Parameters #5–#10)
          </span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="mt-3 space-y-3.5 pt-1 animate-in fade-in duration-150">
            {/* 5. Objective & Engine Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-neutral-50/70 border border-neutral-200/80 p-3 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-700 block">5. Synthesis Engine</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    MANDATORY LOCAL LLM
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-white border border-neutral-200 text-xs">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-neutral-700" />
                    <span className="font-semibold text-neutral-900">Ollama qwen2.5:3b</span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500">0 KB Cloud Egress</span>
                </div>
              </div>

              {/* 6. Language */}
              <div className="bg-neutral-50/70 border border-neutral-200/80 p-3 rounded-lg space-y-1.5">
                <span className="text-xs font-medium text-neutral-700 block">6. Output Language</span>
                <select
                  value={parameters.language}
                  onChange={(e) => updateField('language', e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-md p-1.5 text-xs text-neutral-900 focus:outline-hidden focus:border-neutral-900"
                >
                  <option value="English">English (National Security Standard)</option>
                  <option value="Hindi">Hindi (Official Defense Inter-Agency)</option>
                </select>
              </div>
            </div>

            {/* 7. Required Technical Keywords */}
            <div className="bg-neutral-50/70 border border-neutral-200/80 p-3 rounded-lg space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-neutral-700">7. Mandatory Keywords / IOCs</span>
                <span className="text-neutral-500 text-[11px]">Type term and press Enter</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {parameters.keywords_must.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white border border-neutral-300 text-neutral-800"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => removeKeyword(kw)}
                      className="text-neutral-400 hover:text-neutral-700"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="e.g. CVE-2026-0921, SCADA..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={addKeyword}
                  className="text-xs bg-white border border-neutral-200 rounded-md px-2.5 py-1 text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-900 min-w-[160px]"
                />
              </div>
            </div>

            {/* 8. Operator Add-on Directives */}
            <div className="bg-neutral-50/70 border border-neutral-200/80 p-3 rounded-lg space-y-1.5">
              <span className="text-xs font-medium text-neutral-700 block">8. Special Operator Directives</span>
              <input
                type="text"
                placeholder="e.g. Include MITRE ATT&CK mitigation alignment..."
                value={parameters.add_on_instruction}
                onChange={(e) => updateField('add_on_instruction', e.target.value)}
                className="w-full text-xs bg-white border border-neutral-200 rounded-md p-2 text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-900"
              />
            </div>

            {/* 9. Fact Matching Hard Gate Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-neutral-50">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-semibold text-neutral-900">
                    9. Fact Matching Hard Gate (Sub-10ms NER)
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Halts export on entity transpositions (75–99% similarity band)
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={parameters.fact_matching_gate}
                  onChange={(e) => updateField('fact_matching_gate', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-900"></div>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
