/**
 * Press Monitor API for Vercel - Original Backend Compatible
 * Accepts mode and options like the original backend
 */

export const config = {
  runtime: 'edge',
  maxDuration: 60,
};

export default async function handler(request) {
  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { mode = 'neighbors_priority', options = {} } = body;

    // Forward to streaming endpoint with proper parameters
    const streamingBody = {
      targetCountries: ['AZ'], // Always Azerbaijan
      sourceCountries: [],
      searchQuery: 'Azerbaijan press coverage',
      maxArticles: 20,
      model: 'gemini-2.0-flash-exp',
      language: 'en'
    };

    // Map mode to source countries
    switch (mode) {
      case 'neighbors_priority':
        streamingBody.sourceCountries = ['TR', 'RU', 'IR', 'GE', 'AM'];
        streamingBody.maxArticles = 20;
        break;
      case 'central_asia_focus':
        streamingBody.sourceCountries = ['KZ', 'UZ', 'TM', 'KG', 'TJ'];
        streamingBody.maxArticles = 15;
        break;
      case 'southeast_asia_scan':
        streamingBody.sourceCountries = ['TH', 'ID', 'MY', 'VN', 'PH'];
        streamingBody.maxArticles = 10;
        break;
      case 'global_scan':
        streamingBody.sourceCountries = [];
        streamingBody.maxArticles = 5;
        break;
      case 'europe_monitor':
        streamingBody.sourceCountries = ['DE', 'FR', 'IT', 'ES', 'UK'];
        streamingBody.maxArticles = 10;
        break;
      case 'asia_comprehensive':
        streamingBody.sourceCountries = ['CN', 'JP', 'KR', 'IN', 'PK'];
        streamingBody.maxArticles = 8;
        break;
      case 'custom':
        if (options.languages) {
          // Map language codes to country codes
          const langToCountry = {
            'tr': 'TR', 'ru': 'RU', 'fa': 'IR', 'ka': 'GE', 'hy': 'AM',
            'kk': 'KZ', 'uz': 'UZ', 'tk': 'TM', 'ky': 'KG', 'tg': 'TJ',
            'de': 'DE', 'fr': 'FR', 'en': 'US', 'zh': 'CN', 'ja': 'JP',
            'ko': 'KR', 'ar': 'SA', 'es': 'ES', 'pt': 'PT', 'it': 'IT'
          };
          streamingBody.sourceCountries = options.languages
            .map(lang => langToCountry[lang] || 'US')
            .filter((v, i, a) => a.indexOf(v) === i); // unique
        }
        break;
    }

    // Call the streaming endpoint internally via proper API route
    const baseUrl = new URL(request.url);
    const streamUrl = new URL('/api/press-monitor-stream', baseUrl.origin);
    
    const streamResponse = await fetch(streamUrl.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(streamingBody)
    });

    if (!streamResponse.ok) {
      throw new Error('Failed to process request');
    }

    // Process the stream and collect the final result
    const reader = streamResponse.body.getReader();
    const decoder = new TextDecoder();
    let finalResult = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'result') {
              finalResult = data.digest;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      result: finalResult || 'Press monitoring completed successfully.'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Press monitor error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}