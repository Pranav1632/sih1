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
    description: 'Formal security advisory with IOCs & mitigations (.docx / .pdf)',
    badge: 'Institutional',
    icon: Shield,
  },
  {
    id: 'exec_summary',
    name: 'Executive Summary',
    description: 'High-level strategic situational briefing with decision vectors',
    badge: 'Strategic',
    icon: FileText,
  },
  {
    id: 'presentation',
    name: 'Presentation Deck',
    description: 'Editable PowerPoint slides with speaker notes & citations (.pptx)',
    badge: 'Slides (.pptx)',
    icon: Presentation,
  },
  {
    id: 'video',
    name: 'Video Production Package',
    description: 'Scene-by-scene storyboard, narration script, and lower-third subtitles',
    badge: 'Media Script',
    icon: Video,
  },
  {
    id: 'infographic',
    name: 'Infographic Spec',
    description: 'Modular content blocks, callout statistics, and chart layout specs',
    badge: 'Visual Spec',
    icon: BarChart3,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Post',
    description: 'Professional thought-leadership article with hashtags & takeaways',
    badge: 'Public Post',
    icon: Linkedin,
  },
  {
    id: 'twitter',
    name: 'Twitter/X Thread',
    description: 'Ordered multi-tweet sequence strictly respecting 280-char limits',
    badge: 'Micro Thread',
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
    <div className="bg-[#0f172a]/80 backdrop-blur border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-emerald-950/70 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              3. Target Output Deliverables
              <span className="text-xs px-2 py-0.5 rounded font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                {selectedFormats.length} / 7 Selected
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Parallel generator nodes anchored to immutable shared context
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={selectTopThree}
            className="text-xs text-slate-400 hover:text-cyan-300 px-2 py-1 bg-slate-900 border border-slate-800 rounded transition"
          >
            Demo 3
          </button>
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-cyan-400 hover:text-cyan-300 px-2.5 py-1 bg-cyan-950/40 border border-cyan-700/40 rounded transition"
          >
            Select All (7)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {FORMAT_CATALOG.map((item) => {
          const isSelected = selectedFormats.includes(item.id);
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => toggleFormat(item.id)}
              className={`p-3.5 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900/90 border-cyan-500/60 shadow-md shadow-cyan-950/50'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`p-2 rounded-md ${
                        isSelected
                          ? 'bg-cyan-950 text-cyan-400 border border-cyan-600/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                        {item.name}
                      </div>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {item.badge}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                      isSelected
                        ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
