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
    if (ext === 'pdf' || ext === 'docx' || ext === 'txt') return <FileText className="w-4 h-4 text-neutral-600" />;
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') return <ImageIcon className="w-4 h-4 text-neutral-600" />;
    if (ext === 'mp4' || ext === 'wav' || ext === 'mp3') return <FileAudio className="w-4 h-4 text-neutral-600" />;
    return <FileText className="w-4 h-4 text-neutral-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs transition-all space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-neutral-900 text-white rounded-xl shadow-xs">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              Source Ingestion
              <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                Air-Gapped
              </span>
            </h2>
            <p className="text-xs text-neutral-500">
              PDF, DOCX, Images (OCR), and Audio/Video transcripts
            </p>
          </div>
        </div>

        <button
          onClick={loadDemoPreset}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
          title="Populate with sample intelligence report"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Sample Intel</span>
        </button>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border border-dashed rounded-xl p-3.5 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-neutral-900 bg-neutral-100/50'
            : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50/50 hover:bg-neutral-50'
        }`}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex items-center justify-center gap-3">
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-neutral-700 border border-neutral-200 shadow-2xs shrink-0">
            <Plus className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <div className="text-xs font-medium text-neutral-800">
              Drop intelligence files here, or <span className="text-neutral-900 underline underline-offset-2 font-semibold">browse files</span>
            </div>
            <div className="text-[10px] text-neutral-500">
              Files remain strictly local on device • No cloud egress
            </div>
          </div>
        </div>
      </div>

      {/* Source Governance Rules Indicator */}
      <div className="mt-3 flex items-center justify-between text-xs text-neutral-600 bg-neutral-50 border border-neutral-200/80 px-3.5 py-2 rounded-lg">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-neutral-700" />
          <span><strong>Source Governance:</strong> Exactly 1 primary authority</span>
        </span>
        <span className="font-mono text-[11px] text-neutral-500">
          Primary (1.0) • Supporting (0.5)
        </span>
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-1">
            Uploaded Sources ({files.length})
          </div>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {files.map((item) => {
              const isPrimary = item.role === 'PRIMARY';
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    isPrimary
                      ? 'bg-neutral-50/80 border-neutral-400 shadow-xs'
                      : 'bg-white border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate mr-3">
                    <div className="p-2 bg-neutral-100 rounded-md border border-neutral-200">
                      {getFileIcon(item.name)}
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-medium text-neutral-900 truncate flex items-center gap-2">
                        {item.name}
                        {isPrimary && (
                          <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-neutral-900 text-white rounded">
                            PRIMARY AUTHORITY
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500 font-mono">
                        {formatSize(item.size)} • {item.type}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPrimary(item.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                        isPrimary
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isPrimary ? 'text-white' : 'text-neutral-400'}`} />
                      {isPrimary ? 'Primary (1.0)' : 'Make Primary'}
                    </button>

                    <button
                      type="button"
                      onClick={() => removeFile(item.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Remove file"
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
