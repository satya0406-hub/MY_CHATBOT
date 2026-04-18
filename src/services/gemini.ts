import { GoogleGenAI } from "@google/genai";
import { streamGenerateContent, QuotaExceededError, GlobalQuotaExceededError } from "./auth-utils";
import { APP_CONFIG } from "../config";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const model = "gemini-flash-latest";
export const globalModel = "gemini-flash-latest";

export interface Message {
  role: "user" | "model";
  content: string;
  id: string;
  timestamp: Date;
}

export interface ChatMessageInput {
  role: "user" | "model";
  content: string;
}

const getSystemInstruction = () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  return `You are ${APP_CONFIG.name}, ${APP_CONFIG.tagline}. 

Knowledge Context:
- Current Date: ${dateStr}
- IMPORTANT: Use the current date/day ONLY if the user's query is time-sensitive or explicitly asks about "today", "now", or current events. 
- For general knowledge, historical, or conceptual questions (e.g., "7 wonders of the world", "what is AI"), do NOT mention the current date or day in your response.

Expertise:
You possess expert-level knowledge across all fields. Your goal is to provide exceptionally accurate, detailed, and comprehensive answers. 

CRITICAL: For any questions about current events, live sports scores (like Cricket, Football, etc.), news, or weather, you MUST use the Google Search tool to provide real-time, LIVE information. Do not rely on your internal training data for events happening in 2025 or 2026. Always verify the latest scores and news via Google Search before answering.

Formatting:
When providing code, ensure it is clean and ready for production. When providing text, aim for depth and clarity. You are also capable of structuring your responses for Word document export. Always prioritize thoroughness over brevity.`;
};

export async function* streamChat(messages: ChatMessageInput[], accessToken: string | null, signal?: AbortSignal) {
  const systemInstruction = getSystemInstruction();
  
  // If we have an accessToken, use Gemini Connect (Per User Quota)
  if (accessToken) {
    try {
      const contents = messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }));

      const stream = streamGenerateContent(accessToken, { 
        model: model,
        contents: contents
      }, {
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        tools: [{ googleSearch: {} }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 4096,
        }
      });

      for await (const chunk of stream) {
        if (signal?.aborted) throw new Error("AbortError");
        yield chunk;
      }
      return;
    } catch (error: any) {
      if (error instanceof QuotaExceededError || error.message === "AbortError") throw error;
      console.error("Gemini Connect Error:", error);
      throw error;
    }
  }

  // Fallback: Use Global API Key with official SDK
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Please connect your Google account.");
  }

  try {
    const stream = await ai.models.generateContentStream({
      model: globalModel,
      contents: messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      })),
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 4096,
      }
    });

    for await (const chunk of stream) {
      if (signal?.aborted) throw new Error("AbortError");
      const text = chunk.text;
      if (text) yield text;
    }
  } catch (error: any) {
    if (error.name === "AbortError" || error.message === "AbortError") throw error;
    
    console.error("Global Gemini Stream Error:", error);
    
    // The SDK might throw different error types
    const errorMsg = error.message || "";
    if (errorMsg.includes("429") || errorMsg.toLowerCase().includes("quota")) {
      throw new GlobalQuotaExceededError("The global API key has reached its limit.");
    }
    
    if (errorMsg.includes("404")) {
      throw new Error("The AI model was not found. This might be a regional restriction or an invalid API key.");
    }
    
    throw new Error(errorMsg || "Failed to generate response from AI.");
  }
}
