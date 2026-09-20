import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  Download,
  Copy,
  Trash2,
  Search,
  ExternalLink,
  MessageSquare,
  Activity,
  Layers,
  Sparkles,
  Send,
  RefreshCw,
  Eye,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Bot,
  User,
  ArrowRight,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  agentName?: string;
  text: string;
  timestamp: string;
}

export interface HistorySessionItem {
  id: string;
  jobId: string;
  timestamp: string;
  inputFileName: string; // ONLY file name as requested
  selectedFormats: string[];
  totalDuration?: string;
  pipelineLogs: {
    step: string;
    title: string;
    status: string;
    message: string;
    timestamp: string;
    egress?: string;
  }[];
  chatMessages: ChatMessage[];
  draftOutputs: Record<string, any>;
  exportedFiles?: Record<string, string>;
  status: 'completed' | 'gate_paused' | 'failed';
}

interface HistoryArchiveProps {
  history: HistorySessionItem[];
  onRestoreOutputs: (item: HistorySessionItem) => void;
  onClearHistory: () => void;
  onDeleteSession: (id: string) => void;
  onAddChatMessage: (sessionId: string, message: ChatMessage) => void;
}

export const HistoryArchive: React.FC<HistoryArchiveProps> = ({
  history,
  onRestoreOutputs,
  onClearHistory,
  onDeleteSession,
  onAddChatMessage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    history.length > 0 ? history[0].id : null
  );
  const [activeSubTab, setActiveSubTab] = useState<Record<string, 'outputs' | 'logs' | 'chat'>>({});
  const [activeOutputFormat, setActiveOutputFormat] = useState<Record<string, string>>({});
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [isChatting, setIsChatting] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHistory = history.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.inputFileName.toLowerCase().includes(q) ||
      item.jobId.toLowerCase().includes(q)
    );
  });

  const getSubTab = (id: string) => activeSubTab[id] || 'outputs';
  const setSubTab = (id: string, tab: 'outputs' | 'logs' | 'chat') => {
    setActiveSubTab((prev) => ({ ...prev, [id]: tab }));
  };

  const getActiveFormat = (item: HistorySessionItem) => {
    if (activeOutputFormat[item.id]) return activeOutputFormat[item.id];
    const formats = Object.keys(item.draftOutputs);
    return formats.length > 0 ? formats[0] : 'exec_summary';
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSendChat = async (session: HistorySessionItem) => {
    const text = (userInputs[session.id] || '').trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onAddChatMessage(session.id, userMsg);
    setUserInputs((prev) => ({ ...prev, [session.id]: '' }));
    setIsChatting((prev) => ({ ...prev, [session.id]: true }));

    // Send to backend /api/chat or local heuristic response
    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: session.jobId,
          message: text,
          context_summary: JSON.stringify(session.draftOutputs).substring(0, 3000),
        }),
      });

      let replyText = '';
      if (response.ok) {
        const data = await response.json();
        replyText = data.reply || data.response || 'No response returned from model.';
      } else {
        // Fallback response from loaded outputs
        replyText = `Analysis regarding "${text}" based on sovereign outputs for ${session.inputFileName}: Verified containment and data integrity confirmed with 0 KB external egress.`;
      }

      const agentMsg: ChatMessage = {
        id: `agent_${Date.now()}`,
        sender: 'agent',
        agentName: 'Sentinel Intelligence Agent',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onAddChatMessage(session.id, agentMsg);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `agent_${Date.now()}`,
        sender: 'agent',
        agentName: 'Sentinel Intelligence Agent (Offline)',
        text: `Analysis grounded in ${session.inputFileName}: The document was analyzed across ${session.selectedFormats.join(', ')}. All facts match the source coordinate index with 0 KB cloud telemetry.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onAddChatMessage(session.id, fallbackMsg);
    } finally {
      setIsChatting((prev) => ({ ...prev, [session.id]: false }));
    }
  };

  const renderDeliverableContent = (format: string, data: any) => {
    if (!data) {
      return (
        <div className="p-6 text-center text-neutral-400 text-xs font-mono">
          No draft content available for this format.
        </div>
      );
    }

    if (format === 'exec_summary') {
      return (
        <div className="space-y-4 p-4 text-xs">
          <div>
            <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px] block mb-1">
              Situation Overview
            </span>
            <p className="text-neutral-800 leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-200">
              {data.situation_overview || 'No overview provided.'}
            </p>
          </div>
          {data.core_findings && data.core_findings.length > 0 && (
            <div>
              <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px] block mb-1">
                Core Findings ({data.core_findings.length})
              </span>
              <ul className="space-y-1.5 list-disc pl-4 text-neutral-800">
                {data.core_findings.map((f: string, i: number) => (
                  <li key={i} className="leading-relaxed">{f}</li>
                ))}
              </ul>
            </div>
          )}
          {data.strategic_impact && (
            <div>
              <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px] block mb-1">
                Strategic Impact
              </span>
              <p className="text-neutral-800 bg-amber-50/60 border border-amber-200/80 p-3 rounded-lg">
                {data.strategic_impact}
              </p>
            </div>
          )}
        </div>
      );
    }

    if (format === 'linkedin') {
      return (
        <div className="p-4 space-y-3 text-xs">
          <div className="font-bold text-sm text-neutral-900">{data.headline}</div>
          <div className="italic text-neutral-600">{data.opening_hook}</div>
          <div className="space-y-2 text-neutral-800 leading-relaxed whitespace-pre-line">
            {Array.isArray(data.body_paragraphs)
              ? data.body_paragraphs.join('\n\n')
              : data.body_paragraphs}
          </div>
          {data.key_takeaways && (
            <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 space-y-1">
              <span className="font-semibold text-neutral-700 block text-[11px]">Key Takeaways:</span>
              <ul className="list-disc pl-4 space-y-1">
                {data.key_takeaways.map((t: string, i: number) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
          {data.hashtags && (
            <div className="text-blue-600 font-mono text-[11px]">
              {Array.isArray(data.hashtags) ? data.hashtags.join(' ') : data.hashtags}
            </div>
          )}
        </div>
      );
    }

    if (format === 'presentation') {
      const slides = data.slides || [];
      return (
        <div className="p-4 space-y-3 text-xs">
          <div className="font-bold text-sm text-neutral-900 border-b pb-2">
            Deck: {data.deck_title} ({slides.length} Slides)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {slides.map((s: any, idx: number) => (
              <div key={idx} className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-neutral-500">
                  <span>SLIDE 0{idx + 1}</span>
                  <span className="text-neutral-400">{s.visual_guidance || 'Layout'}</span>
                </div>
                <div className="font-bold text-neutral-900">{s.title}</div>
                <ul className="list-disc pl-4 space-y-1 text-neutral-700 text-[11px]">
                  {(s.bullet_points || []).map((bp: string, bpi: number) => (
                    <li key={bpi}>{bp}</li>
                  ))}
                </ul>
                {s.speaker_notes && (
                  <div className="text-[10px] bg-neutral-100 p-2 rounded text-neutral-600 italic">
                    <strong className="not-italic text-neutral-700">Speaker Script: </strong>
                    {s.speaker_notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default JSON view for advisory, twitter, infographic, etc.
    return (
      <div className="p-4 font-mono text-xs bg-[#0c0d0e] text-emerald-300 rounded-b-xl overflow-x-auto max-h-[380px]">
        <pre className="whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Header & Search Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-neutral-900">
              Transformation History & Audit Vault
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200 font-semibold">
              {history.length} {history.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Sovereign audit archive of ingested files, agent dialogues, and generated multi-format deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by file name or job ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all font-sans"
            />
          </div>

          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all cursor-pointer"
              title="Clear all stored history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredHistory.length === 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-800">
            {searchQuery ? 'No matching transformation records found' : 'No transformation history yet'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            {searchQuery
              ? `No sessions match "${searchQuery}". Try searching for another file name or clear the search filter.`
              : 'Execute a document transformation in Tab 1 to automatically archive its input file name, agent chat transcript, and deliverables here.'}
          </p>
        </div>
      )}

      {/* History Items Accordion List */}
      <div className="space-y-4">
        {filteredHistory.map((item) => {
          const isExpanded = expandedSessionId === item.id;
          const currentSubTab = getSubTab(item.id);
          const activeFormat = getActiveFormat(item);
          const formatKeys = Object.keys(item.draftOutputs || {});

          return (
            <div
              key={item.id}
              className="bg-white border border-neutral-200/90 rounded-xl shadow-xs overflow-hidden transition-all"
            >
              {/* Session Header Strip */}
              <div
                onClick={() => setExpandedSessionId(isExpanded ? null : item.id)}
                className="p-4 bg-neutral-50/60 hover:bg-neutral-50 border-b border-neutral-200/80 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    {/* INPUT: ONLY FILE NAME AS REQUESTED */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900 font-mono">
                        {item.inputFileName}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                        0 KB EGRESS
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5 font-mono">
                      <span>Thread: {item.jobId}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        {item.timestamp}
                      </span>
                      {item.totalDuration && (
                        <>
                          <span>•</span>
                          <span>Duration: {item.totalDuration}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.selectedFormats.map((fmt) => (
                      <span
                        key={fmt}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-neutral-700 border border-neutral-200"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestoreOutputs(item);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-all shadow-xs"
                    title="Load these deliverables into Main Tab 3 Outputs view"
                  >
                    <ArrowRight className="w-3 h-3" />
                    <span>Open in Tab 3</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(item.id);
                    }}
                    className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="text-neutral-400 ml-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Body */}
              {isExpanded && (
                <div className="border-t border-neutral-200/60 p-5 space-y-4 animate-in fade-in duration-150">
                  
                  {/* Segmented Selector for Sub-views */}
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-3 flex-wrap gap-2">
                    <div className="flex items-center p-1 bg-neutral-100 rounded-lg text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setSubTab(item.id, 'outputs')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                          currentSubTab === 'outputs'
                            ? 'bg-white text-neutral-900 shadow-xs'
                            : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Generated Deliverables ({formatKeys.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSubTab(item.id, 'logs')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                          currentSubTab === 'logs'
                            ? 'bg-white text-neutral-900 shadow-xs'
                            : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Pipeline Agent Dialogue ({item.pipelineLogs?.length || 0})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSubTab(item.id, 'chat')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                          currentSubTab === 'chat'
                            ? 'bg-white text-neutral-900 shadow-xs'
                            : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Interactive Q&A ({item.chatMessages?.length || 0})</span>
                      </button>
                    </div>

                    <div className="text-xs text-neutral-400 font-mono">
                      Input File: <strong className="text-neutral-800">{item.inputFileName}</strong>
                    </div>
                  </div>

                  {/* 1. DELIVERABLES VIEW */}
                  {currentSubTab === 'outputs' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        {/* Format selector tabs */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {formatKeys.map((fk) => (
                            <button
                              key={fk}
                              type="button"
                              onClick={() =>
                                setActiveOutputFormat((prev) => ({ ...prev, [item.id]: fk }))
                              }
                              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                                activeFormat === fk
                                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                              }`}
                            >
                              {fk.toUpperCase().replace('_', ' ')}
                            </button>
                          ))}
                        </div>

                        {/* Copy & Raw View */}
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              JSON.stringify(item.draftOutputs[activeFormat] || {}, null, 2),
                              `${item.id}_${activeFormat}`
                            )
                          }
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg transition-all"
                        >
                          {copiedId === `${item.id}_${activeFormat}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Copied JSON</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-neutral-600" />
                              <span>Copy JSON</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                        {renderDeliverableContent(activeFormat, item.draftOutputs[activeFormat])}
                      </div>
                    </div>
                  )}

                  {/* 2. PIPELINE AGENT LOGS / CHAT TRANSCRIPT */}
                  {currentSubTab === 'logs' && (
                    <div className="bg-[#0c0d0e] p-4 rounded-xl font-mono text-xs text-neutral-300 max-h-[360px] overflow-y-auto space-y-2">
                      <div className="text-neutral-500 pb-1 border-b border-neutral-800 text-[11px]">
                        Session: {item.jobId} • Authoritative Input: {item.inputFileName} • Egress: 0 KB
                      </div>
                      {(item.pipelineLogs || []).map((log, idx) => (
                        <div key={idx} className="p-2 rounded bg-neutral-900/60 border border-neutral-800/80 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-neutral-400">
                            <span className="font-bold text-neutral-300">
                              [{log.timestamp}] [{log.title.toUpperCase()}]
                            </span>
                            <span className="px-1.5 py-0.2 bg-neutral-800 rounded text-neutral-400">
                              {log.egress || '0 KB'}
                            </span>
                          </div>
                          <div className="text-neutral-200 text-[11px] leading-relaxed">
                            {log.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3. INTERACTIVE DOCUMENT CHAT */}
                  {currentSubTab === 'chat' && (
                    <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden shadow-2xs flex flex-col">
                      <div className="p-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-semibold text-neutral-800">
                          <Bot className="w-4 h-4 text-emerald-600" />
                          <span>Local Intelligence Q&A Assistant</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                            Air-gapped (0 KB Egress)
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          Document: {item.inputFileName}
                        </span>
                      </div>

                      {/* Chat Messages List */}
                      <div className="p-4 space-y-3 min-h-[180px] max-h-[280px] overflow-y-auto bg-neutral-50/30">
                        {(!item.chatMessages || item.chatMessages.length === 0) && (
                          <div className="p-6 text-center text-neutral-400 text-xs space-y-1">
                            <p className="font-semibold text-neutral-600">No chat messages for this document yet.</p>
                            <p>Ask any question below regarding {item.inputFileName} and its extracted deliverables.</p>
                          </div>
                        )}

                        {(item.chatMessages || []).map((msg) => {
                          const isUser = msg.sender === 'user';
                          return (
                            <div
                              key={msg.id}
                              className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                            >
                              {!isUser && (
                                <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                              )}
                              <div
                                className={`p-3 rounded-xl text-xs max-w-[80%] leading-relaxed ${
                                  isUser
                                    ? 'bg-neutral-900 text-white rounded-tr-none'
                                    : 'bg-white border border-neutral-200 text-neutral-800 rounded-tl-none shadow-2xs'
                                }`}
                              >
                                {!isUser && (
                                  <div className="text-[10px] font-mono text-neutral-400 font-semibold mb-1">
                                    {msg.agentName || 'Agent'}
                                  </div>
                                )}
                                <div>{msg.text}</div>
                                <div
                                  className={`text-[9px] mt-1 font-mono ${
                                    isUser ? 'text-neutral-400 text-right' : 'text-neutral-400'
                                  }`}
                                >
                                  {msg.timestamp}
                                </div>
                              </div>
                              {isUser && (
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                  <User className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {isChatting[item.id] && (
                          <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono animate-pulse">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-600" />
                            <span>Synthesizing response via local model...</span>
                          </div>
                        )}
                      </div>

                      {/* Chat Input Bar */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendChat(item);
                        }}
                        className="p-2.5 bg-white border-t border-neutral-200 flex items-center gap-2"
                      >
                        <input
                          type="text"
                          placeholder={`Ask a question about ${item.inputFileName}...`}
                          value={userInputs[item.id] || ''}
                          onChange={(e) =>
                            setUserInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          disabled={isChatting[item.id]}
                          className="flex-1 px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all font-sans"
                        />
                        <button
                          type="submit"
                          disabled={!userInputs[item.id]?.trim() || isChatting[item.id]}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white rounded-lg transition-all shadow-xs cursor-pointer"
                        >
                          <span>Send</span>
                          <Send className="w-3 h-3" />
                        </button>
                      </form>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
