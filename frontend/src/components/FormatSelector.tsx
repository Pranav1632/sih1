import React from 'react';
import { Layers, Shield, FileText, Presentation, Video, BarChart3, Linkedin, Twitter, Check } from 'lucide-react';

export interface FormatOption {
  id: string;
  name: string;
  description: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const FORMAT_CATALOG: FormatOption[] = [
  {
    id: 'advisory',
    name: 'Intelligence Advisory',
    description: 'Formal defense advisory with IOCs, CVEs & mitigations (.docx)',
    badge: 'Institutional',
    icon: Shield,
  },
  {
    id: 'exec_summary',
    name: 'Executive Summary',
    description: 'High-level situational briefing with strategic decisions',
    badge: 'Strategic',
    icon: FileText,
  },
  {
    id: 'presentation',
    name: 'Presentation Deck',
    description: 'Editable 16:9 widescreen slides with speaker notes (.pptx)',
    badge: 'PowerPoint',
    icon: Presentation,
  },
  {
    id: 'video',
    name: 'Video Production Package',
    description: 'Scene-by-scene visual cues, voiceover narration, and subtitles',
    badge: 'Storyboard',
    icon: Video,
  },
  {
    id: 'infographic',
    name: 'Infographic Spec',
    description: 'Modular content blocks, callout statistics & chart recommendations',
    badge: 'Visual Spec',
    icon: BarChart3,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Post',
    description: 'Professional industry update with hashtags and takeaways',
    badge: 'Article',
    icon: Linkedin,
  },
  {
    id: 'twitter',
    name: 'Twitter/X Thread',
    description: 'Ordered multi-tweet sequence strictly within 280 characters',
    badge: 'Thread',
    icon: Twitter,
  },
];

interface FormatSelectorProps {
  selectedFormats: string[];
  onChange: (formats: string[]) => void;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  selectedFormats,
  onChange,
}) => {
  const toggleFormat = (id: string) => {
    if (selectedFormats.includes(id)) {
      if (selectedFormats.length > 1) {
        onChange(selectedFormats.filter((f) => f !== id));
      }
    } else {
      onChange([...selectedFormats, id]);
    }
  };

  const selectAll = () => {
    onChange(FORMAT_CATALOG.map((f) => f.id));
  };

  const selectTopThree = () => {
    onChange(['advisory', 'exec_summary', 'presentation']);
  };

  return (
    <div className="bg-white border border-neutral-200/90 rounded-xl p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-900">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              Target Output Deliverables
              <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-neutral-100 text-neutral-700 border border-neutral-200">
                {selectedFormats.length} Selected
              </span>
            </h2>
            <p className="text-xs text-neutral-500">
              Select one or more outputs to synthesize from the authoritative source
            </p>
          </div>
        </div>

        {/* Quick Selection Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={selectTopThree}
            className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors shadow-2xs"
          >
            Core 3
          </button>
          <button
            type="button"
            onClick={selectAll}
            className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors shadow-2xs"
          >
            All 7 Formats
          </button>
        </div>
      </div>

      {/* Formats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {FORMAT_CATALOG.map((format) => {
          const isSelected = selectedFormats.includes(format.id);
          const Icon = format.icon;

          return (
            <div
              key={format.id}
              onClick={() => toggleFormat(format.id)}
              className={`relative flex flex-col justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-neutral-50/70 border-neutral-900 ring-1 ring-neutral-900 shadow-xs'
                  : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                  }`}>
                    {format.badge}
                  </span>
                </div>

                <div className="text-xs font-semibold text-neutral-900 mb-1">
                  {format.name}
                </div>
                <div className="text-[11px] text-neutral-500 leading-snug line-clamp-2">
                  {format.description}
                </div>
              </div>

              {/* Selection Checkmark */}
              <div className="mt-2.5 pt-2 border-t border-neutral-200/60 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 font-mono">
                  {isSelected ? 'Ready for render' : 'Click to add'}
                </span>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                  isSelected ? 'bg-neutral-900 text-white' : 'border border-neutral-300 bg-white'
                }`}>
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
