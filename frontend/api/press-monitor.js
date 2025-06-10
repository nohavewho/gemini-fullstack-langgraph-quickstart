/**
 * Press Monitor API - AI SDK v5 + LangGraph Integration
 * Calls backend graph for real press monitoring with web search
 */

import { streamText, generateText } from 'ai';
import { google } from '@ai-sdk/google';

export const config = {
  runtime: 'edge',
  maxDuration: 300,
};

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json();
    const { 
      mode = 'neighbors_priority', 
      options = {},
      searchQuery = '',
      userLanguage = 'en',
      stream = true
    } = body;

    // Try to call LangGraph backend for real press monitoring
    let result = null;
    const backendUrl = process.env.LANGGRAPH_BACKEND_URL;
    
    if (backendUrl && backendUrl !== 'undefined') {
      try {
        console.log('Calling backend:', backendUrl);
        const backendResponse = await fetch(`${backendUrl}/api/press-monitor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode,
            options,
            query: searchQuery,
            language: userLanguage
          }),
        });

        if (backendResponse.ok) {
          result = await backendResponse.json();
        } else {
          console.error(`Backend error: ${backendResponse.status}`);
        }
      } catch (error) {
        console.error('Backend call failed:', error);
      }
    }

    // If backend failed or not configured, generate using AI
    if (!result) {
      console.log('Generating analysis with AI...');
      const { text } = await generateText({
        model: google('gemini-2.5-flash-preview-05-20'),
        system: `You are an expert press monitoring analyst. Analyze recent media coverage about Azerbaijan from ${mode === 'custom' ? options.countries?.join(', ') : mode} countries.
                 Search and analyze recent news, provide sentiment analysis, key themes, and strategic insights.
                 Use web search to find real recent articles.
                 Write in ${userLanguage} language.`,
        prompt: searchQuery || `Analyze recent press coverage about Azerbaijan from international media`,
        temperature: 0.7,
        maxTokens: 4000,
      });
      
      result = { digest: text };
    }
    
    // Format the result with AI SDK streaming
    if (stream) {
      const response = streamText({
        model: google('gemini-2.5-flash-preview-05-20'),
        system: `You are a press monitoring assistant. Present this comprehensive analysis about Azerbaijan from international media.
                 Maintain all formatting, statistics, visual elements, and insights.
                 Keep the original language (${userLanguage}).`,
        prompt: result.digest || result.result || 'No analysis available',
      });

      return response.toTextStreamResponse();
    } else {
      return new Response(JSON.stringify({
        success: true,
        digest: result.digest || result.result,
        metadata: result.metadata || {}
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  } catch (error) {
    console.error('Press monitor error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}