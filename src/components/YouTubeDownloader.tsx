import { useState } from "react";
import { 
  Download, Youtube, RefreshCw, AlertCircle, Sparkles, Check, Play, 
  Clock, Tag, Globe, ListChecks, FileAudio, FileVideo, ChevronRight, Copy
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SUPPORTED_LANGUAGES, VideoMetadata, AISummaryData, HistoryItem } from "../types";

const API_BASE = (import.meta as any).env?.VITE_API_URL || "";

// Helpful pre-defined video samples for quick testing
interface SampleLink {
  label: string;
  url: string;
}

const SAMPLE_LINKS: SampleLink[] = [
  { label: "🎵 Chill Lofi Study", url: "https://www.youtube.com/watch?v=5qap5aO4i9A" },
  { label: "🚀 NASA Mars Science", url: "https://www.youtube.com/watch?v=tOM-nwp9V6E" },
  { label: "📱 Modern Future Tech", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
];

interface YouTubeDownloaderProps {
  onAddHistory: (item: HistoryItem) => void;
}

export default function YouTubeDownloader({ onAddHistory }: YouTubeDownloaderProps) {
  const [urlInput, setUrlInput] = useState("");
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [metaData, setMetaData] = useState<VideoMetadata | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Download Conversion state machine
  const [selectedFormat, setSelectedFormat] = useState<string>("1080p-mp4");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStep, setDownloadStep] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(0);

  // AI Summary State
  const [aiLang, setAiLang] = useState("Myanmar");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiData, setAiData] = useState<AISummaryData | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleFetchMetadata = async (targetUrl = urlInput) => {
    if (!targetUrl.trim()) return;
    setIsLoadingMeta(true);
    setErrorMessage(null);
    setMetaData(null);
    setAiData(null);
    setAiError(null);

    try {
      const response = await fetch(`${API_BASE}/api/youtube-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load YouTube metadata.");
      }

      setMetaData({
        videoId: data.videoId,
        title: data.title,
        author: data.author,
        thumbnailUrl: data.thumbnailUrl,
        duration: data.duration,
        category: data.category
      });
      
      // Auto fill input field if clicked from sample
      if (urlInput !== targetUrl) {
        setUrlInput(targetUrl);
      }

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Unable to extract YouTube information. Verify your link format.");
    } finally {
      setIsLoadingMeta(false);
    }
  };

  const handleSimulateDownload = () => {
    if (!metaData) return;
    setIsDownloading(true);
    setDownloadProgress(0);

    const steps = [
      { text: "Establishing handshake with stream servers...", duration: 15 },
      { text: "Decoding video payload and audio channels...", duration: 40 },
      { text: "Converting codecs to unified file container format...", duration: 75 },
      { text: "Adding title ID container metadata tags and wrapping...", duration: 95 },
      { text: "File constructed. Handing download to browser...", duration: 100 }
    ];

    let stepIndex = 0;
    
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setDownloadStep(steps[stepIndex].text);
        setDownloadProgress(steps[stepIndex].duration);
        stepIndex++;
      } else {
        clearInterval(interval);
        
        // Construct small dummy file with correct downloader filename
        const ext = selectedFormat.includes("mp3") ? "mp3" : "mp4";
        const dummyContent = `TubeTranslate AI - YouTube Downloader Simulator\n\nTitle: ${metaData.title}\nCreator: ${metaData.author}\nVideo Link: https://www.youtube.com/watch?v=${metaData.videoId}\nFormat Chosen: ${selectedFormat}\n\nThank you for utilizing TubeTranslate AI. This file dummy download has been generated locally from the stream packet buffers. Enjoy!`;
        
        const blob = new Blob([dummyContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        
        // Replace invalid filename characters
        const safeTitle = metaData.title.replace(/[\\/:*?"<>|]/g, "_");
        link.href = url;
        link.download = `${safeTitle}_(${selectedFormat}).${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setIsDownloading(false);
        
        // Add to history list
        onAddHistory({
          id: Math.random().toString(36).substr(2, 9),
          type: "youtube",
          timestamp: new Date().toLocaleTimeString(),
          title: metaData.title,
          inputUrl: `https://www.youtube.com/watch?v=${metaData.videoId}`,
          targetLanguage: aiLang,
          data: {
            format: selectedFormat,
            author: metaData.author
          }
        });
      }
    }, 1000);
  };

  const handleAISummarizeAndTranslate = async () => {
    if (!metaData) return;
    setIsLoadingAI(true);
    setAiError(null);
    setAiData(null);

    try {
      const response = await fetch(`${API_BASE}/api/ai-summarize-translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: metaData.title,
          author: metaData.author,
          targetLanguage: aiLang
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "AI translation analysis failed.");
      }

      setAiData(result.data);

    } catch (err: any) {
      console.error(err);
      if (err.message.includes("GEMINI_API_KEY") || err.message.includes("not configured")) {
        setAiError("Gemini API key is missing. Please go to Settings > Secrets in the AI Studio sidebar to activate Gemini core.");
      } else {
        setAiError(err.message || "An error occurred during AI Video transcription.");
      }
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. URL Entry Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 text-indigo-600">
          <Youtube className="w-5 h-5 text-rose-500" />
          <span className="text-xs font-bold font-display uppercase tracking-wider text-slate-700">Video Link Downloader Helper</span>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... သို့မဟုတ် Shorts video link ရေးထည့်ပါ"
              className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 py-3.5 pl-4 pr-10 rounded-xl text-xs font-medium border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              onKeyDown={(e) => e.key === "Enter" && handleFetchMetadata()}
            />
            {urlInput && (
              <button
                onClick={() => setUrlInput("")}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-800 text-xs py-0.5 px-1.5 bg-slate-200/70 rounded cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={() => handleFetchMetadata()}
            disabled={isLoadingMeta || !urlInput.trim()}
            className={`py-3.5 px-6 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              isLoadingMeta || !urlInput.trim()
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm active:scale-[0.98]"
            }`}
          >
            {isLoadingMeta ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            <span>LOAD VIDEO</span>
          </button>
        </div>

        {/* Clickable Quick Sample links */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] text-slate-400 font-mono">Test Samples:</span>
          {SAMPLE_LINKS.map((sample) => (
            <button
              key={sample.label}
              onClick={() => handleFetchMetadata(sample.url)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 hover:border-indigo-500/50 rounded-lg text-[10px] font-semibold text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
            >
              {sample.label}
            </button>
          ))}
        </div>

        {/* URL Parser standard errors */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2"
            >
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Main video details panels rendering */}
      <AnimatePresence>
        {metaData && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left video stats and downloader pane */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                {/* Embedded thumbnail representation */}
                <div className="relative aspect-video bg-slate-950 group">
                  <img
                    referrerPolicy="no-referrer"
                    src={metaData.thumbnailUrl}
                    alt={metaData.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
                  
                  {/* Decorative Play floating logo */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center border border-red-400/40 group-hover:bg-red-500 group-hover:scale-110 transition-all duration-300 shadow-md">
                      <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                    </div>
                  </div>

                  {/* Channel tag badges */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] bg-black/70 backdrop-blur-md text-slate-300 py-1 px-2 rounded-lg font-mono tracking-tight flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {metaData.duration || "4:15"}
                    </span>
                    <span className="text-[10px] bg-black/70 backdrop-blur-md text-red-400 py-1 px-2 rounded-lg font-bold flex items-center gap-1 capitalize">
                      <Tag className="w-3 h-3 text-red-500" />
                      {metaData.category || "General"}
                    </span>
                  </div>
                </div>

                {/* Sub Metadata text details info */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-100 font-display line-clamp-2 leading-snug">
                      {metaData.title}
                    </h3>
                    <p className="text-xs text-rose-400 mt-1 font-semibold hover:underline cursor-pointer">
                      @{metaData.author}
                    </p>
                  </div>
                </div>
              </div>

              {/* Downloader File format panel */}
              <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider font-display border-b border-slate-800 pb-2.5">
                  Available Formats & Resolution
                </span>

                <div className="space-y-2">
                  {/* MP4 high quality */}
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedFormat === "1080p-mp4"
                      ? "bg-slate-900 border-red-500 text-rose-300"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400"
                  }`}>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="format"
                        value="1080p-mp4"
                        checked={selectedFormat === "1080p-mp4"}
                        onChange={() => setSelectedFormat("1080p-mp4")}
                        className="accent-red-600 w-4 h-4"
                      />
                      <FileVideo className="w-4 h-4 text-red-500" />
                      <div className="text-left leading-none">
                        <span className="text-xs font-bold text-slate-200 block">Full HD Video (1080p)</span>
                        <span className="text-[10px] text-slate-500 font-mono">Format: MP4 | High Fidelity AAC</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-400">~14.5 MB</span>
                  </label>

                  {/* MP4 medium quality */}
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedFormat === "720p-mp4"
                      ? "bg-slate-900 border-red-500 text-rose-300"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400"
                  }`}>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="format"
                        value="720p-mp4"
                        checked={selectedFormat === "720p-mp4"}
                        onChange={() => setSelectedFormat("720p-mp4")}
                        className="accent-red-600 w-4 h-4"
                      />
                      <FileVideo className="w-4 h-4 text-slate-400" />
                      <div className="text-left leading-none">
                        <span className="text-xs font-bold text-slate-200 block">Standard HD Video (720p)</span>
                        <span className="text-[10px] text-slate-500 font-mono">Format: MP4 | Fast download</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-400">~8.2 MB</span>
                  </label>

                  {/* MP3 high quality */}
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedFormat === "320kbps-mp3"
                      ? "bg-slate-900 border-red-500 text-rose-300"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400"
                  }`}>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="format"
                        value="320kbps-mp3"
                        checked={selectedFormat === "320kbps-mp3"}
                        onChange={() => setSelectedFormat("320kbps-mp3")}
                        className="accent-red-600 w-4 h-4"
                      />
                      <FileAudio className="w-4 h-4 text-amber-500" />
                      <div className="text-left leading-none">
                        <span className="text-xs font-bold text-slate-200 block">High Quality Audio (320kbps)</span>
                        <span className="text-[10px] text-slate-500 font-mono">Format: MP3 | Studio Masters</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-400">~4.8 MB</span>
                  </label>
                </div>

                {/* Conversion Trigger Button */}
                <button
                  onClick={handleSimulateDownload}
                  disabled={isDownloading}
                  className={`w-full py-3 px-5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                    isDownloading
                      ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                      : "bg-slate-100 hover:bg-white text-slate-950 shadow-md active:scale-[0.98]"
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? "CONVERTING PACKETS..." : "EXTRACT & DOWNLOAD FILE"}</span>
                </button>

                {/* Download Step State progress rendering */}
                <AnimatePresence>
                  {isDownloading && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2.5 overflow-hidden"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono select-none">
                        <span className="text-rose-400 animate-pulse">🛠️ {downloadStep}</span>
                        <span className="text-slate-400">{downloadProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${downloadProgress}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right translation and AI Summarizer Pane */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-xl space-y-5">
                {/* Header title badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <Sparkles className="w-4.5 h-4.5" />
                    <span className="text-xs font-bold font-display uppercase tracking-wider">AI Video Translator & Summaries</span>
                  </div>

                  {/* Language choices */}
                  <div className="flex items-center space-x-1.5 self-start">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={aiLang}
                      onChange={(e) => setAiLang(e.target.value)}
                      className="bg-slate-900 text-slate-300 py-1.5 px-2.5 rounded-lg text-[10px] font-bold border border-slate-800 focus:border-indigo-500 outline-none cursor-pointer"
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Summarize Call Trigger */}
                {!aiData && !isLoadingAI && (
                  <div className="text-center py-12 px-6 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-550/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="max-w-xs mx-auto">
                      <p className="text-xs font-bold text-slate-200">Generate translated transcripts</p>
                      <p className="text-[11px] text-slate-400 mt-1">Queries Gemini core to generate video concept analysis, takeaways, and precise translated subtitles in <span className="text-indigo-400 font-semibold">{aiLang}</span>.</p>
                    </div>
                    <button
                      onClick={handleAISummarizeAndTranslate}
                      className="py-2.5 px-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer active:scale-95 transition-transform"
                    >
                      Analyze & Translate Video
                    </button>
                  </div>
                )}

                {/* Loader screen state */}
                {isLoadingAI && (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-800 border-t-indigo-500 animate-spin mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-indigo-400 font-mono animate-pulse">Retrieving video context headers...</p>
                      <p className="text-[10px] text-slate-500">Gemini is structuring translations in {aiLang}. Please wait.</p>
                    </div>
                  </div>
                )}

                {/* Error handling */}
                {aiError && (
                  <div className="p-4 bg-rose-950/30 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start space-x-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">AI Core Notice</p>
                      <p className="mt-1 leading-relaxed opacity-95">{aiError}</p>
                    </div>
                  </div>
                )}

                {/* Gemini Output Data Summary rendering */}
                {aiData && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* Executive Summary */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-display">Executive Summary ({aiLang})</span>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/90 p-4 rounded-xl border border-slate-800/80">
                        {aiData.summary}
                      </p>
                    </div>

                    {/* Key takeaways bullet items */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-display flex items-center gap-1">
                        <ListChecks className="w-4 h-4 text-emerald-400" />
                        Core Video Takeaways
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {aiData.takeaways.map((takeaway, idx) => (
                          <div key={idx} className="flex items-start space-x-2.5 bg-slate-950 p-3 rounded-lg border border-slate-900">
                            <span className="flex items-center justify-center w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold text-xs select-none">
                              {idx + 1}
                            </span>
                            <span className="text-xs text-slate-300 leading-tight block pt-0.5">{takeaway}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline of subtitles transcript */}
                    <div className="space-y-2.5">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-display">Video Captions Timeline (စကားတန်းဘာသာပြန်)</span>
                      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-900/60 font-mono">
                        {aiData.subtitles.map((sub, idx) => (
                          <div key={idx} className="p-3.5 flex items-start space-x-4 hover:bg-slate-900/40 transition-colors">
                            <span className="px-2 py-0.5 bg-slate-800 text-rose-400 text-[10px] font-bold rounded-md font-mono select-none">
                              {sub.time}
                            </span>
                            <p className="text-xs text-slate-200 font-sans leading-relaxed">{sub.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Trigger translate again */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleAISummarizeAndTranslate}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Recalculate or Change Language
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
