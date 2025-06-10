// Direct streaming from press-monitor-langgraph API

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

    // Call our press monitor API - use LangGraph integration with AI SDK v5
    const url = new URL(request.url);
    const endpoint = `${url.protocol}//${url.host}/api/press-monitor-langgraph`;
      
    console.log("Calling press monitor working endpoint:", endpoint);
    
    const pressResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: mode || "custom",
        options: mode === "custom" ? { countries: selectedCountries } : {},
        searchQuery: lastMessage.content,
        userLanguage: "ru",
        stream: true
      })
    });

    if (!pressResponse.ok) {
      throw new Error(`Press Monitor API error: ${pressResponse.status}`);
    }

    // Since we're calling with stream: true, the response is already a stream
    // Just return it directly - no need to re-process
    return pressResponse;
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}