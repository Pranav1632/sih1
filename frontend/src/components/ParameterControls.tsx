import React, { useState } from 'react';
import {
  Sliders,
  Clock,
  ChevronDown,
  ChevronUp,
  Globe,
  Sparkles,
  Tag,
  ShieldCheck,
  Cpu,
  Lock,
  Unlock,
  RotateCcw,
  Plus,
  AlertCircle,
  ExternalLink,
  Presentation,
  Shield,
  FileText,
  Twitter,
  Linkedin,
  Video,
  BarChart3,
  Layers,
  Check,
  Zap,
} from 'lucide-react';
import { GlobalParams, FormatCustomSpec } from '../api/client';
import { FORMAT_CATALOG } from './FormatSelector';

// Indian Geography Languages for UI display
export const INDIAN_LANGUAGES = [
  { id: 'English', name: 'English (National Security Standard)' },
  { id: 'Hindi', name: 'Hindi (Official Defense Inter-Agency)' },
  { id: 'Bengali', name: 'Bengali (Eastern Command)' },
  { id: 'Tamil', name: 'Tamil (Southern Command)' },
  { id: 'Telugu', name: 'Telugu (Defense Communications)' },
  { id: 'Marathi', name: 'Marathi (Western Command)' },
  { id: 'Gujarati', name: 'Gujarati (Border Intelligence)' },
  { id: 'Punjabi', name: 'Punjabi (Northern Command)' },
  { id: 'Kannada', name: 'Kannada (Strategic Electronics)' },
  { id: 'Malayalam', name: 'Malayalam (Southern Naval)' },
  { id: 'Odia', name: 'Odia (Eastern Coastal Command)' },
  { id: 'Assamese', name: 'Assamese (North-East Command)' },
];

export const MODEL_OPTIONS = [
  { id: 'qwen2.5:3b', name: 'Ollama qwen2.5:3b (Active Local Air-Gapped)', badge: 'Local Active' },
  { id: 'llama3.2:3b', name: 'Ollama llama3.2:3b (Edge Sovereign)', badge: 'Local' },
  { id: 'mistral-7b', name: 'Mistral-7B-Instruct (Defense Spec v2)', badge: 'Air-Gapped' },
  { id: 'deepseek-r1-7b', name: 'DeepSeek-R1-Distill-Qwen (Reasoning Engine)', badge: 'Air-Gapped' },
  { id: 'sovereign-70b', name: 'Sovereign-Defense-70B (High-Assurance Cluster)', badge: 'Secure Node' },
  { id: 'claude-3-5', name: 'Claude 3.5 Sonnet (Simulated Gateway)', badge: 'Simulated' },
];

// ============================================================================
// PARAMETER SECTION 1: GLOBAL MATRICES & PER-DELIVERABLE WORD BUDGET
// ============================================================================
interface ParameterSection1Props {
  parameters: GlobalParams;
  onChange: (parameters: GlobalParams) => void;
  selectedFormats: string[];
  onFormatsChange: (formats: string[]) => void;
}

export const ParameterSection1: React.FC<ParameterSection1Props> = ({
  parameters,
  onChange,
  selectedFormats,
  onFormatsChange,
}) => {
  const updateField = <K extends keyof GlobalParams>(field: K, value: GlobalParams[K]) => {
    onChange({
      ...parameters,
      [field]: value,
    });
  };

  const handleResetToGlobal = () => {
    onChange({
      ...parameters,
      custom_output_active: false,
      format_customizations: {},
    });
  };

  const toggleFormat = (id: string) => {
    if (selectedFormats.includes(id)) {
      if (selectedFormats.length > 1) {
        onFormatsChange(selectedFormats.filter((f) => f !== id));
      }
    } else {
      onFormatsChange([...selectedFormats, id]);
    }
  };

  // Dynamic Latency Calculation
  const baseTimePerFormatRtx = 2.5;
  const wordMultiplier = (parameters.words || 400) / 400;
  const estimatedRtxSeconds = Math.max(
    3,
    Math.round(selectedFormats.length * baseTimePerFormatRtx * wordMultiplier)
  );

  return (
    <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs transition-all h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-orange-600 text-white rounded-xl shadow-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                Parameter Section 1: Core Controls
                <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-orange-50 text-orange-700 border border-orange-200 font-semibold">
                  Global Matrix
                </span>
              </h2>
              <p className="text-xs text-neutral-500">
                Primary style, audience, target length, and deliverable selection
              </p>
            </div>
          </div>

          {/* Expected Latency */}
          <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-neutral-600" />
            <div className="text-right">
              <div className="text-[9px] text-neutral-400 uppercase font-mono tracking-wider">Est. Latency</div>
              <div className="text-xs font-bold text-neutral-900 font-mono">
                ~{estimatedRtxSeconds}s ({selectedFormats.length} outputs)
              </div>
            </div>
          </div>
        </div>

        {/* 1. Tone Control */}
        <div className="space-y-4">
          <div className="bg-neutral-50/80 border border-neutral-200/80 p-3.5 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-neutral-800">1. Synthesis Tone</span>
              <span className="text-orange-700 font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-orange-50 border border-orange-200">
                {parameters.tone}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {['Authoritative', 'Objective', 'Casual', 'Tactical'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => updateField('tone', t)}
                  className={`py-1.5 text-xs rounded-lg transition-all font-medium cursor-pointer ${
                    parameters.tone === t
                      ? 'bg-orange-600 text-white shadow-xs font-semibold'
                      : 'bg-white text-neutral-700 hover:bg-orange-50 hover:text-orange-700 border border-neutral-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Target Audience */}
          <div className="bg-neutral-50/80 border border-neutral-200/80 p-3.5 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-neutral-800">2. Target Audience</span>
              <span className="text-orange-700 font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-orange-50 border border-orange-200">
                {parameters.audience}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {['Executive', 'Technical', 'General', 'Command'].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => updateField('audience', a)}
                  className={`py-1.5 text-xs rounded-lg transition-all font-medium cursor-pointer ${
                    parameters.audience === a
                      ? 'bg-orange-600 text-white shadow-xs font-semibold'
                      : 'bg-white text-neutral-700 hover:bg-orange-50 hover:text-orange-700 border border-neutral-200'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Level of Detail */}
          <div className="bg-neutral-50/80 border border-neutral-200/80 p-3.5 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-neutral-800">3. Level of Detail</span>
              <span className="text-orange-700 font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-orange-50 border border-orange-200">
                {parameters.detail}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {['Concise', 'Standard', 'Deep Forensic'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => updateField('detail', d)}
                  className={`py-1.5 text-xs rounded-lg transition-all font-medium cursor-pointer ${
                    parameters.detail === d
                      ? 'bg-orange-600 text-white shadow-xs font-semibold'
                      : 'bg-white text-neutral-700 hover:bg-orange-50 hover:text-orange-700 border border-neutral-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Target Word Budget Slider (50 to 2000 words, Per Deliverable) */}
          <div className={`p-4 rounded-xl border transition-all ${
            parameters.custom_output_active
              ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300'
              : 'bg-neutral-50/80 border-neutral-200/80'
          }`}>
            <div className="flex justify-between items-center text-xs mb-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-neutral-900">4. Target Word Budget</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-600 text-white font-semibold">
                  PER OUTPUT
                </span>
                {parameters.custom_output_active && (
                  <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
                    <Lock className="w-3 h-3" />
                    LOCKED BY SECTION 3
                  </span>
                )}
              </div>
              <span className="text-orange-600 font-mono text-sm font-bold">
                {parameters.words} words / deliverable
              </span>
            </div>

            <p className="text-[11px] text-neutral-500 mb-2 leading-tight">
              Each generated deliverable independently aims for this depth (e.g. 1000 words per output, <strong className="text-neutral-700">not</strong> combined total).
            </p>

            <input
              type="range"
              min="50"
              max="2000"
              step="25"
              value={parameters.words || 400}
              disabled={parameters.custom_output_active}
              onChange={(e) => updateField('words', parseInt(e.target.value))}
              className={`w-full accent-orange-600 h-2 bg-neutral-200 rounded-lg cursor-pointer ${
                parameters.custom_output_active ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            />

            <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1.5">
              <span>50w (Flash Brief)</span>
              <span>400w (Standard)</span>
              <span>1000w (In-Depth)</span>
              <span>2000w (Full Dossier)</span>
            </div>

            {parameters.custom_output_active && (
              <div className="mt-2.5 pt-2 border-t border-amber-200/80 flex items-center justify-between">
                <span className="text-[11px] text-amber-800 font-medium">
                  Section 3 per-format overrides are active.
                </span>
                <button
                  type="button"
                  onClick={handleResetToGlobal}
                  className="px-2.5 py-1 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to Global Slider</span>
                </button>
              </div>
            )}
          </div>

          {/* Target Deliverables Selector Grid */}
          <div className="bg-neutral-50/80 border border-neutral-200/80 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-orange-600" />
                Target Deliverables ({selectedFormats.length} Active)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onFormatsChange(['advisory', 'exec_summary', 'presentation'])}
                  className="text-[10px] px-2 py-0.5 bg-white border border-neutral-200 rounded text-neutral-700 hover:bg-orange-50 hover:text-orange-700 cursor-pointer"
                >
                  Core 3
                </button>
                <button
                  type="button"
                  onClick={() => onFormatsChange(FORMAT_CATALOG.map((f) => f.id))}
                  className="text-[10px] px-2 py-0.5 bg-white border border-neutral-200 rounded text-neutral-700 hover:bg-orange-50 hover:text-orange-700 cursor-pointer"
                >
                  All 7
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FORMAT_CATALOG.map((fmt) => {
                const isSelected = selectedFormats.includes(fmt.id);
                const Icon = fmt.icon;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => toggleFormat(fmt.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-orange-50/50 hover:border-orange-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <div className="truncate">
                      <div className="text-[11px] font-semibold truncate leading-tight">{fmt.name}</div>
                      <div className={`text-[9px] font-mono truncate ${isSelected ? 'text-orange-100' : 'text-neutral-400'}`}>
                        {fmt.badge}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-400 flex items-center justify-between font-mono">
        <span>Air-Gap Local Node • NTRO Sovereign</span>
        <span>Word scaling enabled</span>
      </div>
    </div>
  );
};

// ============================================================================
// PARAMETER SECTION 2: ADVANCED GROUNDING, MODELS & DEFENSE AIR-GAP CONTROLS
// ============================================================================
interface ParameterSection2Props {
  parameters: GlobalParams;
  onChange: (parameters: GlobalParams) => void;
}

export const ParameterSection2: React.FC<ParameterSection2Props> = ({
  parameters,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [scrapeLinkInput, setScrapeLinkInput] = useState(parameters.url_scrape_input || '');

  const updateField = <K extends keyof GlobalParams>(field: K, value: GlobalParams[K]) => {
    onChange({
      ...parameters,
      [field]: value,
    });
  };

  const handleAddKeyword = () => {
    const term = keywordInput.trim();
    if (term && !parameters.keywords_must.includes(term)) {
      updateField('keywords_must', [...parameters.keywords_must, term]);
      setKeywordInput('');
    }
  };

  const handleKeyDownKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const removeKeyword = (tag: string) => {
    updateField(
      'keywords_must',
      parameters.keywords_must.filter((k) => k !== tag)
    );
  };

  return (
    <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-xs transition-all overflow-hidden">
      {/* Clickable Dropdown Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4.5 flex items-center justify-between hover:bg-neutral-50/80 transition-colors cursor-pointer select-none group"
        title={isOpen ? 'Click to collapse Advanced Features' : 'Click to expand Advanced Features'}
      >
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 shrink-0 group-hover:bg-orange-100 transition-colors">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-neutral-900">
                Parameter Section 2: Advanced Features
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shrink-0">
                Air-Gap Bounded
              </span>
            </div>
            <p className="text-xs text-neutral-500 truncate">
              Local LLM profiles, Indian regional languages, IOC tags & scraping guardrail
            </p>
          </div>
        </div>

        {/* Right side: Quick selection pills & Chevron Dropdown Indicator */}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {!isOpen && (
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 font-medium">
                {parameters.model_selected || 'qwen2.5:3b'}
              </span>
              <span className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-700 font-medium">
                {parameters.language || 'English'}
              </span>
              {parameters.keywords_must.length > 0 && (
                <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-medium">
                  {parameters.keywords_must.length} IOCs
                </span>
              )}
            </div>
          )}
          <div className={`p-1.5 rounded-lg border transition-all ${
            isOpen
              ? 'bg-orange-600 text-white border-orange-600'
              : 'bg-white text-neutral-600 border-neutral-200 group-hover:bg-orange-50 group-hover:text-orange-700 group-hover:border-orange-200'
          }`}>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Dropdown Content Area (When Expanded) */}
      {isOpen && (
        <div className="p-5 pt-3 border-t border-neutral-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Model Selection Dropdown */}
        <div className="bg-neutral-50/80 border border-neutral-200/80 p-3 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-neutral-600" />
              Local Model Profile
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-orange-600 text-white rounded">
              0 KB Egress
            </span>
          </div>
          <select
            value={parameters.model_selected || 'qwen2.5:3b'}
            onChange={(e) => updateField('model_selected', e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-lg p-2 text-xs font-semibold text-neutral-900 focus:outline-hidden focus:border-neutral-900"
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Indian Geography Languages Dropdown */}
        <div className="bg-neutral-50/80 border border-neutral-200/80 p-3 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-neutral-600" />
              Indian Regional Language
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
              Defense Regional
            </span>
          </div>
          <select
            value={parameters.language || 'English'}
            onChange={(e) => updateField('language', e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-lg p-2 text-xs font-semibold text-neutral-900 focus:outline-hidden focus:border-neutral-900"
          >
            {INDIAN_LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 7. Mandatory Keywords / IOCs with explicit "+ Add" button */}
      <div className="bg-neutral-50/80 border border-neutral-200/80 p-3.5 rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-neutral-600" />
            7. Mandatory Keywords / Technical IOCs
          </span>
          <span className="text-neutral-500 text-[11px] font-mono">
            {parameters.keywords_must.length} Active Keywords
          </span>
        </div>

        {/* Input + Dedicated "+ Add" Button */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. CVE-2026-0921, SCADA, Zero-Day, Firmware..."
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={handleKeyDownKeyword}
            className="flex-1 text-xs bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:border-orange-500 shadow-2xs"
          />
          <button
            type="button"
            onClick={handleAddKeyword}
            disabled={!keywordInput.trim()}
            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Active Tag Chips */}
        {parameters.keywords_must.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {parameters.keywords_must.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white border border-neutral-300 text-neutral-800 font-mono shadow-2xs"
              >
                <span>{kw}</span>
                <button
                  type="button"
                  onClick={() => removeKeyword(kw)}
                  className="text-neutral-400 hover:text-red-600 font-bold ml-1 transition-colors"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1 text-[11px] text-neutral-400 pt-0.5">
          <span>Quick add:</span>
          {['CVE-2026-0921', 'SCADA', 'Firmware-Patch', 'NTRO-Vault'].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                if (!parameters.keywords_must.includes(suggestion)) {
                  updateField('keywords_must', [...parameters.keywords_must, suggestion]);
                }
              }}
              className="text-neutral-600 hover:text-neutral-900 bg-neutral-200/60 hover:bg-neutral-200 px-2 py-0.5 rounded text-[10px] font-mono transition-colors"
            >
              +{suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Internet Search Scraping Input (BY DEFAULT DISABLED) */}
      <div className="bg-neutral-50/80 border border-neutral-200/80 p-3.5 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-neutral-500" />
            <span className="font-semibold text-neutral-800">Internet Search & External URL Scraping</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700 border border-neutral-300 font-semibold flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" />
            DISABLED (Air-Gap Protection)
          </span>
        </div>

        <p className="text-[11px] text-neutral-500 leading-tight">
          External HTTP scraping is disabled by default to enforce the strict 0 KB egress air-gap boundary.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://cert-in.org.in/advisories/... (External Link Disabled)"
            value={scrapeLinkInput}
            onChange={(e) => {
              setScrapeLinkInput(e.target.value);
              updateField('url_scrape_input', e.target.value);
            }}
            disabled
            className="flex-1 text-xs bg-neutral-100 border border-neutral-200 text-neutral-400 rounded-lg px-3 py-2 cursor-not-allowed"
          />
          <button
            type="button"
            disabled
            className="px-3 py-2 bg-neutral-200 text-neutral-400 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-not-allowed shrink-0"
            title="External ingestion disabled under Air-Gap defense rules"
          >
            <Lock className="w-3 h-3" />
            <span>Scrape & Ingest</span>
          </button>
        </div>
      </div>

      {/* 8. Special Operator Directives & 9. Fact Matching Gate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-neutral-50/80 border border-neutral-200/80 p-3 rounded-xl space-y-1.5">
          <span className="text-xs font-semibold text-neutral-800 block">8. Operator Directives</span>
          <input
            type="text"
            placeholder="e.g. Align to MITRE ATT&CK mitigation table..."
            value={parameters.add_on_instruction}
            onChange={(e) => updateField('add_on_instruction', e.target.value)}
            className="w-full text-xs bg-white border border-neutral-200 rounded-lg p-2 text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:border-neutral-900"
          />
        </div>

        <div className="bg-neutral-50/80 border border-neutral-200/80 p-3 rounded-xl flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              9. Sub-10ms NER Gate
            </div>
            <div className="text-[10px] text-neutral-500">
              Halts on 75–99% entity shifts
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
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PARAMETER SECTION 3: PER-OUTPUT CUSTOMIZATION STUDIO (SLIDES, SECTIONS, TWEETS)
// ============================================================================
interface ParameterSection3Props {
  parameters: GlobalParams;
  onChange: (parameters: GlobalParams) => void;
  selectedFormats: string[];
}

export const ParameterSection3: React.FC<ParameterSection3Props> = ({
  parameters,
  onChange,
  selectedFormats,
}) => {
  const [activeCustomTab, setActiveCustomTab] = useState<string>(
    selectedFormats.includes('presentation')
      ? 'presentation'
      : selectedFormats[0] || 'advisory'
  );

  // Per-format spec state
  const customSpecs = parameters.format_customizations || {};
  const currentSpec: FormatCustomSpec = customSpecs[activeCustomTab] || {
    slide_count: 5,
    slide_density: 'standard',
    include_speaker_notes: true,
    theme: 'Defense Minimalist (16:9)',
    thread_tweets_count: 6,
    core_findings_count: 4,
    advisory_depth: 'standard',
  };

  const updateSpec = (newSpec: Partial<FormatCustomSpec>) => {
    const updated = {
      ...currentSpec,
      ...newSpec,
      customized: true,
    };
    onChange({
      ...parameters,
      custom_output_active: true,
      format_customizations: {
        ...customSpecs,
        [activeCustomTab]: updated,
      },
    });
  };

  const resetAllCustomizations = () => {
    onChange({
      ...parameters,
      custom_output_active: false,
      format_customizations: {},
    });
  };

  return (
    <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs transition-all space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-700">
            <Presentation className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              Parameter Section 3: Output Customization Studio
              {parameters.custom_output_active ? (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-amber-100 text-amber-900 border border-amber-300 font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-600" />
                  Custom Mode (Section 1 Locked)
                </span>
              ) : (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-neutral-100 text-neutral-600 border border-neutral-200">
                  Default Unified Mode
                </span>
              )}
            </h2>
            <p className="text-xs text-neutral-500">
              Customize slide counts, per-slide bullet depth, thread volume, and section structures
            </p>
          </div>
        </div>

        {parameters.custom_output_active && (
          <button
            type="button"
            onClick={resetAllCustomizations}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-lg transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Global Slider</span>
          </button>
        )}
      </div>

      {/* Format Switcher Tabs for Customization */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {selectedFormats.map((fmtId) => {
          const cat = FORMAT_CATALOG.find((c) => c.id === fmtId);
          const isCurrent = activeCustomTab === fmtId;
          const isFmtCustom = !!customSpecs[fmtId]?.customized;
          return (
            <button
              key={fmtId}
              type="button"
              onClick={() => setActiveCustomTab(fmtId)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isCurrent
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-orange-50 hover:text-orange-700 border border-neutral-200/80'
              }`}
            >
              <span>{cat?.name || fmtId}</span>
              {isFmtCustom && (
                <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-amber-300' : 'bg-orange-600'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Format-Specific Customization Controls */}
      <div className="bg-neutral-50/80 border border-neutral-200/80 p-4 rounded-xl space-y-4">
        {/* ========================================================================= */}
        {/* PRESENTATION PPTX CUSTOMIZATION                                          */}
        {/* ========================================================================= */}
        {activeCustomTab === 'presentation' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-900">Presentation Slides & Content Spec</span>
              <span className="text-[11px] font-mono text-neutral-600 bg-white px-2 py-0.5 rounded border border-neutral-200">
                Target: {currentSpec.slide_count || 5} Slides
              </span>
            </div>

            {/* Slide Count Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-neutral-700">
                <span>Total Slide Count:</span>
                <strong className="font-mono text-orange-600">{currentSpec.slide_count || 5} Slides</strong>
              </div>
              <input
                type="range"
                min="3"
                max="15"
                step="1"
                value={currentSpec.slide_count || 5}
                onChange={(e) => updateSpec({ slide_count: parseInt(e.target.value) })}
                className="w-full accent-orange-600 cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                <span>3 (Exec Brief)</span>
                <span>5 (Standard)</span>
                <span>10 (Comprehensive)</span>
                <span>15 (Full Briefing)</span>
              </div>
            </div>

            {/* Content & Text Density Per Slide */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-neutral-800 block">
                Slide Text Density & Bullets
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'concise', label: 'Concise', desc: '3 bullets, ~50 words/slide' },
                  { id: 'standard', label: 'Standard', desc: '4-5 bullets, ~100 words/slide' },
                  { id: 'dense', label: 'Deep Forensic', desc: '6+ bullets, ~180 words/slide' },
                ].map((den) => (
                  <button
                    key={den.id}
                    type="button"
                    onClick={() => updateSpec({ slide_density: den.id as any })}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      (currentSpec.slide_density || 'standard') === den.id
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-white text-neutral-800 border-neutral-200 hover:bg-orange-50/50 hover:border-orange-200'
                    }`}
                  >
                    <div className="text-xs font-semibold">{den.label}</div>
                    <div className={`text-[10px] leading-tight mt-0.5 ${
                      (currentSpec.slide_density || 'standard') === den.id ? 'text-orange-100' : 'text-neutral-500'
                    }`}>
                      {den.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Speaker Notes Toggle & Theme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 p-2.5 bg-white border border-neutral-200 rounded-lg text-xs font-medium text-neutral-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentSpec.include_speaker_notes ?? true}
                  onChange={(e) => updateSpec({ include_speaker_notes: e.target.checked })}
                  className="rounded text-neutral-900"
                />
                <span>Generate Spoken Script / Speaker Notes</span>
              </label>

              <div className="p-2.5 bg-white border border-neutral-200 rounded-lg text-xs flex items-center justify-between">
                <span className="text-neutral-700 font-medium">Deck Theme:</span>
                <span className="font-mono text-neutral-900 font-semibold">Defense 16:9 Dark</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ADVISORY DOCX CUSTOMIZATION                                               */}
        {/* ========================================================================= */}
        {activeCustomTab === 'advisory' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-900">Intelligence Advisory Document Layout</span>
              <span className="text-[11px] font-mono text-neutral-600 bg-white px-2 py-0.5 rounded border border-neutral-200">
                Format: .docx
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                'Executive Threat Overview',
                'Affected Infrastructure Scope',
                'Indicators of Compromise (IOC)',
                'Mitigation & Action Playbook',
                'MITRE ATT&CK Mapping',
                'Compliance & Inter-Agency Rules',
              ].map((sec) => (
                <div key={sec} className="flex items-center gap-2 p-2 bg-white border border-neutral-200 rounded-lg">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-neutral-800 font-medium truncate">{sec}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-neutral-600">Forensic Investigation Depth:</span>
              <div className="flex gap-1.5">
                {['Standard', 'Deep Forensic'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => updateSpec({ advisory_depth: d.toLowerCase() as any })}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                      (currentSpec.advisory_depth || 'standard') === d.toLowerCase()
                        ? 'bg-orange-600 text-white'
                        : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-orange-50 hover:text-orange-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TWITTER/X THREAD CUSTOMIZATION                                            */}
        {/* ========================================================================= */}
        {activeCustomTab === 'twitter' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-900">Twitter / X Thread Depth & Volume</span>
              <span className="text-[11px] font-mono text-neutral-600 bg-white px-2 py-0.5 rounded border border-neutral-200">
                {currentSpec.thread_tweets_count || 6} Tweets
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-neutral-700">
                <span>Thread Length:</span>
                <strong className="font-mono text-orange-600">{currentSpec.thread_tweets_count || 6} Tweets</strong>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                step="1"
                value={currentSpec.thread_tweets_count || 6}
                onChange={(e) => updateSpec({ thread_tweets_count: parseInt(e.target.value) })}
                className="w-full accent-orange-600 cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                <span>3 (Brief Alert)</span>
                <span>6 (Detailed Analysis)</span>
                <span>9 (Forensic Thread)</span>
                <span>12 (Comprehensive)</span>
              </div>
            </div>

            <div className="p-2.5 bg-white border border-neutral-200 rounded-lg text-xs text-neutral-600">
              💡 <strong className="text-neutral-800">Fixed Output Quality:</strong> Thread now outputs comprehensive 6+ tweets with exact character counts (&le;280 chars), coordinate citations, and strategic hashtags.
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* EXECUTIVE SUMMARY CUSTOMIZATION                                           */}
        {/* ========================================================================= */}
        {activeCustomTab === 'exec_summary' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-900">Executive Briefing Structure</span>
              <span className="text-[11px] font-mono text-neutral-600 bg-white px-2 py-0.5 rounded border border-neutral-200">
                {currentSpec.core_findings_count || 4} Core Findings
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-neutral-700">
                <span>Core Findings Count:</span>
                <strong className="font-mono text-orange-600">{currentSpec.core_findings_count || 4} Findings</strong>
              </div>
              <input
                type="range"
                min="3"
                max="8"
                step="1"
                value={currentSpec.core_findings_count || 4}
                onChange={(e) => updateSpec({ core_findings_count: parseInt(e.target.value) })}
                className="w-full accent-orange-600 cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Other formats fallback */}
        {!['presentation', 'advisory', 'twitter', 'exec_summary'].includes(activeCustomTab) && (
          <div className="text-xs text-neutral-600 p-2 bg-white rounded-lg border border-neutral-200">
            Selected deliverable will be generated with standard defense intelligence specifications (~{parameters.words} words).
          </div>
        )}

        {/* Action Button: Apply Custom Specification */}
        <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
          <div className="text-[11px] text-neutral-500">
            {parameters.custom_output_active
              ? '✓ Section 1 word slider is locked while custom output specs are active'
              : 'Click below to lock custom specifications for this format'}
          </div>

          <button
            type="button"
            onClick={() => updateSpec({})}
            className="px-3.5 py-1.5 text-xs font-semibold bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Lock className="w-3 h-3 text-white" />
            <span>Apply Custom Specification</span>
          </button>
        </div>
      </div>
    </div>
  );
};
