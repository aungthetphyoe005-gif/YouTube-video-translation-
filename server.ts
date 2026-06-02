import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client lazily to avoid startup crashes if key is initially empty
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not configured yet. Please configure it in the AI Studio Settings secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// 1. Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Fetch YouTube Info using oEmbed
app.post("/api/youtube-info", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "YouTube URL is required" });
  }

  try {
    // Standard YouTube link matches
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/||user\/[^\/]+\/|embed\/|watch\?(?:.*&)?v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL format. Please provide a valid watch link or video ID" });
    }

    // Call noembed/oembed to get metadata cleanly
    const oembedUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error("Failed to fetch metadata from oEmbed service");
    }

    const data = await response.json() as any;

    if (data.error) {
      // Return metadata fallback if oEmbed fails to resolve
      return res.json({
        success: true,
        videoId,
        title: `YouTube Video (${videoId})`,
        author: "Unknown Creator",
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        duration: "4:32",
        category: "Entertainment"
      });
    }

    return res.json({
      success: true,
      videoId,
      title: data.title || `Video ${videoId}`,
      author: data.author_name || "YouTube Creator",
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration: "5:40", // Fallback info placeholder
      category: "Education & Tech"
    });

  } catch (error: any) {
    console.error("Error in fetching YouTube info:", error);
    res.status(500).json({ error: error.message || "An error occurred while fetching video details" });
  }
});

// 3. AI translation endpoint
app.post("/api/translate", async (req, res) => {
  const { text, targetLanguage, sourceLanguage = "Auto-Detect", toneStyle = "Standard", explanation = false } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text to translate is empty." });
  }

  try {
    const ai = getGeminiClient();
    
    let systemInstruction = `You are an expert bilingual subtitle and professional translator. 
Your goal is to provide high-quality, natural-sounding, and culturally appropriate translations. 
Always respect the requesting text structure. Just output the translation itself or the specific sections requested.`;

    let userPrompt = `Translate the following text into ${targetLanguage}.
Source Language: ${sourceLanguage || "Auto-detected"}
Style / Tone constraint: ${toneStyle || "Standard"}

Text to translate:
"""
${text}
"""
`;

    if (explanation) {
      userPrompt += `\nAdditionally, please provide a short explanation about grammatical keys or cultural definitions underneath the translation. Use the target language "${targetLanguage}" or Myanmar for the explanations to help the user understand the nuance. Output this under a section header "---EXPLANATION---".`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    const fullResponseText = response.text || "";
    let translatedText = fullResponseText;
    let expSection = "";

    if (explanation && fullResponseText.includes("---EXPLANATION---")) {
      const parts = fullResponseText.split("---EXPLANATION---");
      translatedText = parts[0].trim();
      expSection = parts[1].trim();
    }

    return res.json({
      success: true,
      translatedText,
      explanation: expSection || undefined
    });

  } catch (error: any) {
    console.error("Gemini Translation Error:", error);
    res.status(500).json({ 
      error: error.message || "Translation service failed", 
      isConfigError: error.message.includes("GEMINI_API_KEY") 
    });
  }
});

// 4. AI Video summarization & transcription endpoint
app.post("/api/ai-summarize-translate", async (req, res) => {
  const { title, author, targetLanguage } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Video Title is required for AI generation" });
  }

  try {
    const ai = getGeminiClient();

    const systemInstruction = `You are YouTubeAI, an advanced analyzer. 
Based in-depth on the provided metadata (Title and Creator details) of a video, you generate an incredibly smart, high-accuracy conceptual summary, 3 core bullet item takeaways, and a high-fidelity mock excerpt transcript (with timestamps) that reads exactly like authentic subtitles of such a video, fully translated into the requested target language.`;

    const userPrompt = `Analyze this YouTube video concept:
Title: "${title}"
Creator/Channel: "${author}"
Target Language for analysis, summary, takeaways, and subtitles: ${targetLanguage}

Based on this information, please provide:
1. A concise, professional executive summary outlining what the video is about (approx. 3-4 sentences).
2. Code: 3 Key bullet points summarizing the core educational takeaways or lessons.
3. A mock high-fidelity 4-line subtitle sequence transcript with timestamps (e.g. [00:15], [00:43], etc.) representing typical translation subtitles from the video.

Please use JSON format for your response, strictly conforming to the following structure so the application can render it perfectly:
{
  "summary": "Full summary text here...",
  "takeaways": [
    "Key takeaway point 1",
    "Key takeaway point 2",
    "Key takeaway point 3"
  ],
  "subtitles": [
    { "time": "00:00", "text": "Subtitle lyric line 1" },
    { "time": "00:25", "text": "Subtitle lyric line 2" },
    { "time": "01:05", "text": "Subtitle lyric line 3" },
    { "time": "01:45", "text": "Subtitle lyric line 4" }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      data: parsedData
    });

  } catch (error: any) {
    console.error("Gemini AI Analyze & Translate Error:", error);
    res.status(500).json({ 
      error: error.message || "AI Summarization service failed", 
      isConfigError: error.message.includes("GEMINI_API_KEY") 
    });
  }
});

// Setup Vite Dev server or Serve Build static file
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
