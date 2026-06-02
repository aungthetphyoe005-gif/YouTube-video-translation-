import { Sparkles, Languages, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

interface HeaderProps {
  activeTab: "youtube" | "translator";
  setActiveTab: (tab: "youtube" | "translator") => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Headline */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 shadow-sm border border-indigo-700/10 overflow-hidden">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="flex items-center justify-center text-white"
              >
                <Sparkles className="w-4.5 h-4.5" />
              </motion.div>
              {/* Gloss effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
            </div>
            <div>
              <h1 className="text-base font-bold font-display text-slate-800 tracking-tight leading-none">
                TubeTranslate <span className="text-indigo-600 font-medium">AI</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 leading-none mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Active Gemini 2.0 Engine</span>
              </p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab("youtube")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === "youtube"
                  ? "bg-white text-slate-800 shadow-xs border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <svg
                id="svg-yt-icon"
                className="w-3.5 h-3.5 text-rose-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.524 3.545 12 3.545 12 3.545s-7.525 0-9.387.51A3.003 3.003 0 0 0 .502 6.163C0 8.04 0 12 0 12s0 3.96.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.476 20.455 12 20.455 12 20.455s7.524 0 9.387-.51a3.002 3.002 0 0 0 2.11-2.108C24 15.96 24 12 24 12s0-3.96-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>Video Downloader</span>
            </button>

            <button
              onClick={() => setActiveTab("translator")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === "translator"
                  ? "bg-white text-slate-800 shadow-xs border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Languages className="w-3.5 h-3.5 text-indigo-500" />
              <span>Universal AI Translator</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
