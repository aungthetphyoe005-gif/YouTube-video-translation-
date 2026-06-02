import { useState } from "react";
import { 
  Languages, Sparkles, Copy, Trash2, Check, ArrowLeftRight, Play, Volume2, 
  HelpCircle, AlertCircle, RefreshCw 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SUPPORTED_LANGUAGES, TONE_STYLES, HistoryItem } from "../types";

const API_BASE = (import.meta as any).env?.VITE_API_URL || "";

interface TextTranslatorProps {
  onAddHistory: (item: HistoryItem) => void;
}

export default function TextTranslator({ onAddHistory }: TextTranslatorProps) {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [explanationText, setExplanationText] = useState("");
  const [sourceLang, setSourceLang] = useState("Auto-Detect");
  const [targetLang, setTargetLang] = useState("Myanmar");
  const [tone, setTone] = useState("Standard");
  const [needExplanation, setNeedExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [spoken, setSpoken] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setTranslatedText("");
    setExplanationText("");

    try {
      const response = await fetch(`${API_BASE}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          targetLanguage: targetLang,
          sourceLanguage: sourceLang,
          toneStyle: tone,
          explanation: needExplanation
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Translation request failed.");
      }

      setTranslatedText(data.translatedText);
      if (data.explanation) {
        setExplanationText(data.explanation);
      }

      // Add to session history
      const historyItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: "text-translate",
        timestamp: new Date().toLocaleTimeString(),
        inputText: inputText,
        targetLanguage: targetLang,
        data: {
          translatedText: data.translatedText,
          explanation: data.explanation,
          tone,
          sourceLang
        }
      };
      onAddHistory(historyItem);

    } catch (error: any) {
      console.error(error);
      if (error.message.includes("GEMINI_API_KEY") || error.message.includes("not configured")) {
        setErrorMessage(
          "Gemini API key is not active. Please open 'Settings' ⚙️ in the AI Studio UI, go to 'Secrets', and configure a valid GEMINI_API_KEY."
        );
      } else {
        setErrorMessage(error.message || "An unexpected translation error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!translatedText) return;
    try {
      window.speechSynthesis.cancel();
      // Detect language tag for voice synthesizer
      const langMap: Record<string, string> = {
        English: "en-US",
        Japanese: "ja-JP",
        Thai: "th-TH",
        Korean: "ko-KR",
        Chinese: "zh-CN",
        Spanish: "es-ES",
        French: "fr-FR",
        Myanmar: "my-MM"
      };
      const utterance = new SpeechSynthesisUtterance(translatedText);
      utterance.lang = langMap[targetLang] || "my-MM";
      
      utterance.onstart = () => setSpoken(true);
      utterance.onend = () => setSpoken(false);
      utterance.onerror = () => setSpoken(false);
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech synthesis error", e);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLang === "Auto-Detect") {
      setSourceLang(targetLang);
      setTargetLang("English");
    } else {
      const prevSource = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(prevSource);
    }
    // Swap texts too if they exist
    if (translatedText) {
      const prevInput = inputText;
      setInputText(translatedText);
      setTranslatedText(prevInput);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Action Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Source Language selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-display">Source Language</label>
          <div className="relative">
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="w-full bg-slate-50 text-slate-700 py-2.5 px-3 rounded-xl text-xs font-medium border border-slate-200 outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
            >
              <option value="Auto-Detect">✨ Auto-Detect (အလိုအလျောက်ရှာရန်)</option>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              ▼
            </div>
          </div>
        </div>

        {/* Swap action button */}
        <div className="flex justify-center md:pt-4">
          <button
            onClick={handleSwapLanguages}
            className="flex items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-500 hover:text-indigo-600 transition-all border border-slate-200 cursor-pointer"
            title="Swap Languages"
          >
            <ArrowLeftRight className="w-4 h-4 md:rotate-0 rotate-90" />
          </button>
        </div>

        {/* Target Language selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-display">Target Language</label>
          <div className="relative">
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full bg-slate-50 text-slate-700 py-2.5 px-3 rounded-xl text-xs font-medium border border-slate-200 outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Two Pane translation box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Input Pane */}
        <div className="flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 border-b border-slate-200/60">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500 font-display">Input Text / Transcript</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setInputText("")}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 transition-all cursor-pointer"
                title="Clear input"
                disabled={!inputText}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-4 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="သီချင်းစာသား၊ ဗီဒီယို စာတန်းများ သို့မဟုတ် မည်သည့်စာသားမဆို ရေးထည့်ပါ... (Paste subtitles, lyrics, or transcripts here to translate...)"
              className="w-full h-64 bg-transparent text-slate-800 placeholder-slate-400 resize-none outline-none leading-relaxed text-sm font-sans"
              maxLength={4000}
            />
            <div className="absolute bottom-3 right-4 text-[10px] text-slate-400 font-mono">
              {inputText.length} / 4000 chars
            </div>
          </div>
        </div>

        {/* Right Output Pane */}
        <div className="flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm relative min-h-[16rem]">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 border-b border-slate-200/60">
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 font-display">Translated Result</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSpeak}
                disabled={!translatedText}
                className={`p-1.5 rounded-lg text-slate-400 transition-all ${
                  translatedText ? "hover:text-indigo-600 hover:bg-slate-100 cursor-pointer" : "opacity-30 cursor-not-allowed"
                } ${spoken ? "text-indigo-700 bg-indigo-50" : ""}`}
                title="Speak text"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                disabled={!translatedText}
                className={`p-1.5 rounded-lg text-slate-400 transition-all ${
                  translatedText ? "hover:text-indigo-600 hover:bg-slate-100 cursor-pointer" : "opacity-30 cursor-not-allowed"
                }`}
                title="Copy translated output"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="p-4 flex-1 relative bg-gradient-to-br from-indigo-50/10 to-transparent">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-white/80 backdrop-blur-xs">
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-indigo-600 animate-spin" />
                <p className="text-xs text-indigo-600 font-semibold font-mono animate-pulse">Gemini Translating text...</p>
              </div>
            ) : translatedText ? (
              <div className="whitespace-pre-wrap text-slate-800 text-sm leading-relaxed font-sans">{translatedText}</div>
            ) : (
              <div className="text-slate-400 text-sm italic flex items-center justify-center h-full min-h-[14rem] select-none text-center px-4">
                စတင်ဘာသာပြန်ရန် ဘယ်ဘက်အကွက်တွင် စာသားရေးထည့်ပြီး "Translate" ကို နှိပ်ပါ
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tones, Explain & Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tone Setting selector */}
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-display">Translation Tone Style</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {TONE_STYLES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`px-3 py-2 text-left rounded-xl transition-all duration-200 border text-xs flex flex-col justify-between h-14 cursor-pointer ${
                    tone === t.id
                      ? "bg-indigo-50 border-indigo-400 text-indigo-700 font-semibold"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-500"
                  }`}
                >
                  <span className="font-bold block tracking-tight line-clamp-1">{t.name}</span>
                  <span className="text-[10px] opacity-80 font-mono italic">{t.myLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grammar Explainer / Cultural details */}
          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-display">Advanced Insights</span>
              <label className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={needExplanation}
                  onChange={(e) => setNeedExplanation(e.target.checked)}
                  className="w-4.5 h-4.5 rounded text-indigo-600 bg-white border-slate-300 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <div className="text-left select-none">
                  <span className="text-xs font-semibold text-slate-800 block">Provide Grammar & Context Explanations</span>
                  <span className="text-[10px] text-slate-500 block leading-tight">Gemini will generate grammatical breakdowns and vocabulary nuance insights underneath.</span>
                </div>
              </label>
            </div>

            {/* Translate Submit Action */}
            <div className="pt-2">
              <button
                onClick={handleTranslate}
                disabled={isLoading || !inputText.trim()}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  isLoading || !inputText.trim()
                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:scale-[1.01] active:scale-[0.99]"
                }`}
              >
                <Languages className="w-4 h-4 animate-pulse" />
                <span>AI TRANSLATE (စာသားဘာသာပြန်မည်)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error notification message */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2.5 max-w-full"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
              <div>
                <p className="font-bold">Database / Configuration Notice</p>
                <p className="mt-1 leading-relaxed opacity-90">{errorMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grammar Explanation Box output */}
      <AnimatePresence>
        {explanationText && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 overflow-hidden shadow-sm"
          >
            <div className="flex items-center space-x-2 text-amber-600">
              <HelpCircle className="w-4.5 h-4.5" />
              <span className="text-xs font-bold font-display uppercase tracking-wider">AI Grammatical & Cultural Translation Insights</span>
            </div>
            <div className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-80 overflow-y-auto">
              {explanationText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
