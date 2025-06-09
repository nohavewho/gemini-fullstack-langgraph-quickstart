export async function onRequestPost({ request, env }) {
  const requestBody = await request.json();
  const { messages, body } = requestBody;
  const { query, effort, model, targetCountries, selectedCountries, dateRange } = body || requestBody;
  
  // Get the last user message content
  const lastUserMessage = messages?.length > 0 ? messages[messages.length - 1] : null;
  const userQuery = query || lastUserMessage?.content || 'Analyze press coverage';
  
  // Format the response in AI SDK compatible stream format
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial chunk
      controller.enqueue(encoder.encode('0:""'));
      controller.enqueue(encoder.encode('\n'));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Build contextual response
      const contextInfo = targetCountries && selectedCountries ? 
        `Analyzing press coverage about ${targetCountries.join(', ')} in ${selectedCountries.join(', ')} media` : 
        'Analyzing international press coverage';
      
      const dateInfo = dateRange?.from && dateRange?.to ? 
        ` from ${dateRange.from} to ${dateRange.to}` : '';
      
      // Send the main content
      const mockResult = `# Press Monitor Analysis

${contextInfo}${dateInfo}

Query: ${userQuery}

## Summary

Based on the analysis of international media coverage:

- **Positive Coverage**: 65% - Focus on economic partnerships and cultural exchanges
- **Neutral Coverage**: 20% - Factual reporting on political developments
- **Negative Coverage**: 15% - Concerns about regional tensions

## Key Findings

1. **Energy Sector** (35%): Major coverage on energy partnerships and pipeline developments
2. **Economic Relations** (25%): Trade agreements and investment opportunities
3. **Diplomatic Initiatives** (20%): International cooperation and summit meetings
4. **Cultural Exchange** (20%): Tourism promotion and cultural events

## Regional Breakdown

- **United States**: 45 articles - Focus on strategic partnerships
- **Russia**: 38 articles - Energy cooperation emphasis
- **Turkey**: 32 articles - Regional collaboration topics
- **Germany**: 28 articles - Economic and technical cooperation

The analysis shows predominantly positive sentiment with strong emphasis on economic and energy cooperation.`;
      
      // Send response in AI SDK text stream format
      controller.enqueue(encoder.encode(`0:"${mockResult.replace(/\n/g, '\\n').replace(/"/g, '\\"')}"\n`));
      
      // Send done signal
      controller.enqueue(encoder.encode('e:{"finishReason":"stop","usage":{"promptTokens":10,"completionTokens":200}}\n'));
      controller.enqueue(encoder.encode('d:{"finishReason":"stop"}\n'));
      
      controller.close();
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Vercel-AI-Data-Stream': 'v1'
    }
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}