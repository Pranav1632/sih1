import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, Shield, Trash2, Plus, Sparkles, FileAudio, Image as ImageIcon } from 'lucide-react';

export interface UploadedItem {
  id: string;
  name: string;
  size: number;
  type: string;
  role: 'PRIMARY' | 'SUPPORTING';
  file?: File;
}

interface IngestionZoneProps {
  files: UploadedItem[];
  onFilesChange: (files: UploadedItem[]) => void;
  onIngestSubmit?: () => void;
  isIngesting?: boolean;
}

export const IngestionZone: React.FC<IngestionZoneProps> = ({
  files,
  onFilesChange,
  onIngestSubmit,
  isIngesting = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (newFiles: File[]) => {
    const hasExistingPrimary = files.some(f => f.role === 'PRIMARY');
    const mapped: UploadedItem[] = newFiles.map((file, idx) => ({
      id: `file_${Date.now()}_${idx}`,
      name: file.name,
      size: file.size,
      type: file.type || file.name.split('.').pop() || 'unknown',
      role: !hasExistingPrimary && idx === 0 ? 'PRIMARY' : 'SUPPORTING',
      file: file,
    }));
    onFilesChange([...files, ...mapped]);
  };

  const setPrimary = (targetId: string) => {
    const updated = files.map(f => ({
      ...f,
      role: (f.id === targetId ? 'PRIMARY' : 'SUPPORTING') as 'PRIMARY' | 'SUPPORTING',
    }));
    onFilesChange(updated);
  };

  const removeFile = (targetId: string) => {
    const remaining = files.filter(f => f.id !== targetId);
    // If we removed the primary document and have remaining files, promote first to primary
    if (remaining.length > 0 && !remaining.some(f => f.role === 'PRIMARY')) {
      remaining[0].role = 'PRIMARY';
    }
    onFilesChange(remaining);
  };

  const loadDemoPreset = () => {
    const demoItems: UploadedItem[] = [
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
      {
        id: 'demo_03',
        name: 'OpenSource_News_Summary.txt',
        size: 14200,
        type: 'text/plain',
        role: 'SUPPORTING',
      }
    ];
    onFilesChange(demoItems);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf' || ext === 'docx' || ext === 'txt') return <FileText className="w-5 h-5 text-cyan-400" />;
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') return <ImageIcon className="w-5 h-5 text-emerald-400" />;
    if (ext === 'mp4' || ext === 'wav' || ext === 'mp3') return <FileAudio className="w-5 h-5 text-amber-400" />;
    return <FileText className="w-5 h-5 text-slate-400" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-[#0f172a]/80 backdrop-blur border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-cyan-950/70 border border-cyan-500/30 rounded-lg text-cyan-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              1. Sovereign Multimodal Ingestion
              <span className="text-xs px-2 py-0.5 rounded font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                0 KB Egress
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              PDF, DOCX, Tactical Scans (OCR), Audio/Video Intercepts (Whisper)
            </p>
          </div>
        </div>

        <button
          onClick={loadDemoPreset}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-700/50 rounded-md transition"
          title="Load GhostLatch incident report demo fixtures"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Demo Preset
        </button>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition cursor-pointer ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/30'
            : 'border-slate-700/80 hover:border-slate-600 bg-slate-900/40'
        }`}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-cyan-400 border border-slate-700">
            <Plus className="w-5 h-5" />
          </div>
          <div className="text-sm font-medium text-slate-200">
            Drag & drop intelligence sources here, or <span className="text-cyan-400 underline">browse files</span>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Local coordinate-aware chunking • Extracted into Source Evidence Index
          </div>
        </div>
      </div>

      {/* Source Governance Rules Info */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-2 rounded-lg">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <strong className="text-slate-300">Deterministic Source Governance:</strong> Exactly 1 file designated as Primary Authority
        </span>
        <span className="font-mono text-[11px] text-cyan-400">
          Primary = 1.0 weight | Supporting = 0.5 weight
        </span>
      </div>

      {/* Uploaded Files Table */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider px-1">
            Ingested Sources ({files.length})
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {files.map((item) => {
              const isPrimary = item.role === 'PRIMARY';
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition ${
                    isPrimary
                      ? 'bg-cyan-950/20 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate mr-3">
                    <div className="p-1.5 bg-slate-800/80 rounded border border-slate-700">
                      {getFileIcon(item.name)}
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-medium text-slate-200 truncate flex items-center gap-2">
                        {item.name}
                        {isPrimary && (
                          <span className="px-1.5 py-0.2 text-[10px] uppercase font-mono font-semibold bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 rounded">
                            Authoritative Baseline
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {formatSize(item.size)} • {item.type}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPrimary(item.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md font-medium transition ${
                        isPrimary
                          ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isPrimary ? 'text-slate-950' : 'text-slate-500'}`} />
                      {isPrimary ? 'PRIMARY (1.0)' : 'Set Primary'}
                    </button>

                    <button
                      type="button"
                      onClick={() => removeFile(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition"
                      title="Remove source"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
