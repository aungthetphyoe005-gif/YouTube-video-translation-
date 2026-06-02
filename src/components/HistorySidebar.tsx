import { History, Trash2, Copy, FileText, Youtube, Check, Clock } from "lucide-react";
import { useState } from "react";
import { HistoryItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface HistorySidebarProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onSelectHistory?: (item: HistoryItem) => void;
}

export default function HistorySidebar({ history, onClearHistory, onSelectHistory }: HistorySidebarProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm h-full flex flex-col">
      {/* Top action header info */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
        <div className="flex items-center space-x-2 text-slate-700">
          <History className="w-4 h-4 text-indigo-650" />
          <span className="text-xs font-bold font-display uppercase tracking-wider">Local History</span>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-[10px] text-rose-600 hover:text-rose-700 flex items-center space-x-1 font-semibold transition-colors cursor-pointer"
            title="Clear all saved history items"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* History Items Container */}
      <div className="flex-1 overflow-y-auto max-h-[32rem] space-y-2.5 pr-1 select-none">
        {history.length === 0 ? (
          <div className="text-center py-10">
            <Clock className="w-6 h-6 text-slate-300 mx-auto" />
            <p className="text-[11px] text-slate-400 italic mt-2">No history items recorded in this session</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-left relative group hover:border-indigo-200 hover:bg-slate-50 transition-all"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  {/* Type Badge */}
                  <div className="flex items-center space-x-2">
                    {item.type === "youtube" ? (
                      <span className="flex items-center space-x-1 text-[9px] font-bold text-red-700 bg-red-50 border border-red-100 py-0.5 px-2 rounded-full w-max uppercase">
                        <Youtube className="w-2.5 h-2.5" />
                        <span>Downloader</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 py-0.5 px-2 rounded-full w-max uppercase">
                        <FileText className="w-2.5 h-2.5" />
                        <span>Translation</span>
                      </span>
                    )}

                    <span className="text-[9px] text-slate-400 font-mono font-medium">
                      {item.timestamp}
                    </span>
                  </div>

                  {/* Summary Title text */}
                  {item.type === "youtube" ? (
                    <div>
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono italic">Format: {item.data?.format}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                        {item.inputText}
                      </p>
                      <p className="text-[10px] text-indigo-600 font-mono font-semibold mt-1">→ Translated to {item.targetLanguage} ({item.data?.tone})</p>
                    </div>
                  )}
                </div>

                {/* Quick copy text button in history item */}
                {item.type === "text-translate" && item.data?.translatedText && (
                  <button
                    onClick={() => handleCopyText(item.id, item.data?.translatedText)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-xs"
                    title="Copy this translated result"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-650" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
