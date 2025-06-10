import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export const config = {
  runtime: "edge"
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

    // Call our press monitor API internally - use working version for faster response
    const endpoint = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}/api/press-monitor-working`
      : "http://localhost:3000/api/press-monitor-working";
      
    const pressResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: mode || "custom",
        options: mode === "custom" ? { countries: selectedCountries } : {},
        effortLevel: effortLevel || 2,
        model: model || "gemini-2.0-flash-thinking-exp",
        searchQuery: lastMessage.content,
        userLanguage: "ru"
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
      model: google("gemini-2.0-flash-thinking-exp"),
      messages: [
        { role: "system", content: "You are a press monitoring assistant. Return the analysis as-is without modification." },
        { role: "user", content: data.result }
      ],
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}