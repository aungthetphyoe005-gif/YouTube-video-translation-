import { GoogleGenAI } from "@google/genai";

export interface Env {
  GEMINI_API_KEY: string;
}

// CORS Helper headers helper to allow cross-origin requests from Cloudflare Pages static site
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    // Handle CORS Preflight / Preflight checks
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    // Helper to send json response
    const jsonResponse = (data: any, status = 200) => {
      return new Response(JSON.stringify(data), {
        status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    };

    try {
      // 1. Health check routing endpoint
      if (pathname === "/api/health" && request.method === "GET") {
        return jsonResponse({
          status: "ok",
          platform: "Cloudflare Workers",
          time: new Date().toISOString(),
        });
      }

      // 2. Fetch YouTube metadata oEmbed info
      if (pathname === "/api/youtube-info" && request.method === "POST") {
        const body = await request.json() as any;
        const videoUrl = body.url;

        if (!videoUrl) {
          return jsonResponse({ error: "YouTube URL is required" }, 400);
        }

        const videoIdMatch = videoUrl.match(
          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/||user\/[^\/]+\/|embed\/|watch\?(?:.*&)?v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/
        );
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        if (!videoId) {
          return jsonResponse({ error: "Invalid YouTube URL format. Please provide a valid watch link or video ID" }, 400);
        }

        // Fetch oEmbed details
        const oembedUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
        const response = await fetch(oembedUrl);

        if (!response.ok) {
          throw new Error("Failed to fetch metadata from oEmbed service");
        }

        const data = await response.json() as any;

        if (data.error) {
          // Metadata fallback
          return jsonResponse({
            success: true,
            videoId,
            title: `YouTube Video (${videoId})`,
            author: "Unknown Creator",
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            duration: "4:32",
            category: "Entertainment"
          });
        }

        return jsonResponse({
          success: true,
          videoId,
          title: data.title || `Video ${videoId}`,
          author: data.author_name || "YouTube Creator",
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          duration: "5:40",
          category: "Education & Tech"
        });
      }

      // 3. Translate API Endpoint via Gemini
      if (pathname === "/api/translate" && request.method === "POST") {
        const body = await request.json() as any;
        const { text, targetLanguage, sourceLanguage = "Auto-Detect", toneStyle = "Standard", explanation = false } = body;

        if (!text) {
          return jsonResponse({ error: "Text to translate is empty." }, 400);
        }

        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
          return jsonResponse({ error: "GEMINI_API_KEY secret is not declared in Cloudflare Worker environment variables." }, 500);
        }

        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });

        const systemInstruction = `You are an expert bilingual subtitle and professional translator. 
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

        const resG = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });

        const fullResponseText = resG.text || "";
        let translatedText = fullResponseText;
        let expSection = "";

        if (explanation && fullResponseText.includes("---EXPLANATION---")) {
          const parts = fullResponseText.split("---EXPLANATION---");
          translatedText = parts[0].trim();
          expSection = parts[1].trim();
        }

        return jsonResponse({
          success: true,
          translatedText,
          explanation: expSection || undefined
        });
      }

      // 4. Summarize & Translate Video Concept
      if (pathname === "/api/ai-summarize-translate" && request.method === "POST") {
        const body = await request.json() as any;
        const { title, author, targetLanguage } = body;

        if (!title) {
          return jsonResponse({ error: "Video Title is required" }, 400);
        }

        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
          return jsonResponse({ error: "GEMINI_API_KEY secret is not declared in Cloudflare Worker environment." }, 500);
        }

        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });

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

        const resG = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.5,
          },
        });

        const parsedData = JSON.parse(resG.text || "{}");
        return jsonResponse({
          success: true,
          data: parsedData
        });
      }

      // Route fallback handler (404)
      return jsonResponse({ error: "Not found" }, 404);

    } catch (err: any) {
      return jsonResponse({
        error: err.message || "An internal error occurred",
        success: false
      }, 500);
    }
  },
};
