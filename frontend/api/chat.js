import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export const config = {
  runtime: "edge",
  maxDuration: 300
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

    // Call our press monitor API - use minimal version for stability
    const url = new URL(request.url);
    const endpoint = `${url.protocol}//${url.host}/api/press-monitor-minimal`;
      
    console.log("Calling press monitor minimal endpoint:", endpoint);
    
    const pressResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: mode || "custom",
        options: mode === "custom" ? { countries: selectedCountries } : {},
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

    // Use streamText to format the response properly for AI SDK client
    const result = streamText({
      model: google("gemini-2.5-flash-preview-05-20"),
      prompt: data.digest,
      system: "You are a press monitoring assistant. Present this analysis exactly as provided, maintaining all formatting, visual elements, and language.",
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