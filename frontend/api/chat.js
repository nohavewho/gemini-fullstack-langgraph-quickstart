import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export const config = {
  runtime: "edge",
  maxDuration: 300
};

// Initialize Google provider with API key
const getGoogleModel = (modelId = 'gemini-2.5-flash-preview-05-20') => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Google API key not found in environment variables');
  }
  return google(modelId, {
    apiKey: apiKey
  });
};

export default async function handler(request) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { messages, mode, selectedCountries, effortLevel, model } = await request.json();
    
    // Get the latest user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      throw new Error("No user message found");
    }

    // Call our press monitor API internally - use AI SDK version
    const baseUrl = process.env.VERCEL_URL 
      ? (process.env.VERCEL_URL.startsWith('http') ? process.env.VERCEL_URL : `https://${process.env.VERCEL_URL}`)
      : "http://localhost:3000";
    const endpoint = `${baseUrl}/api/press-monitor-ai-sdk`;
      
    console.log("Calling press monitor endpoint:", endpoint);
    
    const pressResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: mode || "custom",
        options: mode === "custom" ? { countries: selectedCountries } : {},
        effortLevel: effortLevel || 2,
        model: "gemini-2.5-flash-preview-05-20",
        searchQuery: lastMessage.content,
        userLanguage: "ru",
        stream: false
      })
    });

    if (!pressResponse.ok) {
      throw new Error(`Press Monitor API error: ${pressResponse.status}`);
    }

    const data = await pressResponse.json();
    
    if (!data.success) {
      throw new Error(data.error || "Failed to get analysis");
    }

    // Stream the result using AI SDK
    const result = await streamText({
      model: getGoogleModel("gemini-2.5-flash-preview-05-20"),
      messages: [
        { role: "system", content: "You are a press monitoring assistant. Return the analysis as-is without modification." },
        { role: "user", content: data.digest }
      ],
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}