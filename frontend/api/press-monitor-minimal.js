/**
 * Minimal Press Monitor API - Direct AI SDK v5 implementation
 */

import { generateText } from 'ai';
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
    const { searchQuery = '', userLanguage = 'en' } = await request.json();
    
    const languageMap = {
      'ru': 'Russian',
      'en': 'English', 
      'tr': 'Turkish',
      'az': 'Azerbaijani'
    };
    
    const { text } = await generateText({
      model: google('gemini-2.5-flash-preview-05-20'),
      prompt: `Analyze international press coverage about Azerbaijan. ${searchQuery}
      
Write a comprehensive press monitoring report in ${languageMap[userLanguage] || 'English'} with:
- Executive summary
- Coverage by country (3-5 key articles per country)
- Sentiment analysis
- Key themes
- Strategic insights

Focus on real recent news from the last week.`,
      temperature: 0.7,
      maxTokens: 4000,
    });
    
    return new Response(JSON.stringify({
      success: true,
      digest: text
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}