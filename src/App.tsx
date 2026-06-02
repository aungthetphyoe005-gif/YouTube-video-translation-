import { useState, useEffect } from "react";
import Header from "./components/Header";
import YouTubeDownloader from "./components/YouTubeDownloader";
import TextTranslator from "./components/TextTranslator";
import HistorySidebar from "./components/HistorySidebar";
import { HistoryItem } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Languages, Shield, Info } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"youtube" | "translator">("youtube");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // 1. Initial Load of Local History
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tubetranslate_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Unable to load search history", e);
    }
  }, []);

  // 2. Persist history list changes
  const handleAddHistory = (item: HistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev].slice(0, 30); // Cap at latest 30 items
      localStorage.setItem("tubetranslate_history", JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("tubetranslate_history");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900">
      {/* Visual background gradient lights */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-slate-300/10 blur-[120px] pointer-events-none" />

      {/* Polish Geometric Grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(148,163,184,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.035)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] pointer-events-none" />

      {/* Header component navigation */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container Layout */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full z-10 space-y-6">
        
        {/* Localization welcome banners */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 text-left">
            <h2 className="text-lg font-bold font-display flex items-center gap-2 text-slate-800">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>TubeTranslate AI က ကြိုဆိုပါသည်</span>
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed font-sans max-w-2xl">
              YouTube ဗီဒီယိုလင့်ခ်များကို လွယ်ကူစွာဒေါင်းလုတ်ဆွဲရန်နှင့် Gemini 3.5 AI ၏ အစွမ်းထက်စွမ်းရည်ဖြင့် နိုင်ငံတကာဘာသာစကား သို့မဟုတ် <span className="text-indigo-600 font-semibold">မြန်မာဘာသာသို့</span> တိုက်ရိုက်ဘာသာပြန်ဆို၊ အနှစ်ချုပ်ဖတ်ရှုနိုင်ပါသည်။
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[10px] text-indigo-700 font-mono self-start md:self-auto select-none">
            <Shield className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span className="font-semibold">Secure Server Proxy Configured</span>
          </div>
        </div>

        {/* Dynamic Grid Layout splitter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Actions Panel Tab content */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === "youtube" ? (
                <motion.div
                  key="youtube-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                >
                  <YouTubeDownloader onAddHistory={handleAddHistory} />
                </motion.div>
              ) : (
                <motion.div
                  key="translator-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                >
                  <TextTranslator onAddHistory={handleAddHistory} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Session History List sidebar */}
          <div className="lg:col-span-3">
            <HistorySidebar 
              history={history} 
              onClearHistory={handleClearHistory} 
            />
          </div>

        </div>

        {/* Footer info disclosure bar */}
        <div className="border-t border-slate-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-[10px] font-medium leading-none">
          <p className="flex items-center gap-1.5 leading-none">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Note: Direct server downloading of video streams may run compiled buffers according to sandbox security terms.</span>
          </p>
          <p className="font-mono text-slate-400">
            &copy; 2026 TubeTranslate AI • Developed with Google Gemini
          </p>
        </div>

      </main>
    </div>
  );
}
