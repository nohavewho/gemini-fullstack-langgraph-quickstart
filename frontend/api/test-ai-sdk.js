/**
 * Test endpoint for AI SDK v5 integration
 */

import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export const config = {
  runtime: 'edge',
  maxDuration: 60,
};

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { prompt = 'Tell me about Azerbaijan in 2 sentences' } = await request.json();
    
    console.log('[Test AI SDK] Starting generation...');
    
    const result = await streamText({
      model: google('gemini-2.5-flash-preview-05-20'),
      prompt,
      temperature: 0.7,
      maxTokens: 200,
    });

    console.log('[Test AI SDK] Returning stream response');
    
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('[Test AI SDK] Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}