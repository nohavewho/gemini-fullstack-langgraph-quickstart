/**
 * Test endpoint for debugging press monitor
 */

export const config = {
  runtime: 'edge',
  maxDuration: 30,
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

  try {
    const body = await request.json();
    console.log('Test endpoint received:', body);

    // Check if API key is available
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const hasApiKey = !!apiKey;
    
    // Test query parsing
    let queryAnalysis = null;
    let parseError = null;
    
    if (body.searchQuery) {
      try {
        // Parse the query to understand what countries to search
        const prompt = `Analyze this press monitoring query: "${body.searchQuery}"

Extract:
1. TARGET countries (what countries to monitor news ABOUT) - use ISO codes
2. SOURCE countries (what countries' media to search IN) - use ISO codes

Examples:
- "казахстан об украине" → Target: [UA], Source: [KZ]
- "что пишут об Азербайджане в Армении" → Target: [AZ], Source: [AM]
- "казахстан об украине за вчера" → Target: [UA], Source: [KZ]

Country codes: AZ=Azerbaijan, AM=Armenia, GE=Georgia, TR=Turkey, RU=Russia, IR=Iran, 
US=USA, CN=China, DE=Germany, FR=France, KZ=Kazakhstan, UZ=Uzbekistan, UA=Ukraine

Return JSON:
{
  "targetCountries": ["XX"],
  "sourceCountries": ["YY", "ZZ"]
}`;

        if (apiKey) {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${body.selectedModel || 'gemini-2.0-flash'}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 512,
              }
            })
          });

          if (!response.ok) {
            const error = await response.text();
            parseError = `Gemini API error: ${response.status} - ${error}`;
          } else {
            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              queryAnalysis = JSON.parse(jsonMatch[0]);
            }
          }
        } else {
          queryAnalysis = { error: "No API key available" };
        }
      } catch (error) {
        parseError = error.message;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      debug: {
        receivedBody: body,
        hasApiKey: hasApiKey,
        apiKeySource: apiKey ? (
          process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY' :
          process.env.GOOGLE_AI_API_KEY ? 'GOOGLE_AI_API_KEY' :
          'GOOGLE_GENERATIVE_AI_API_KEY'
        ) : 'none',
        queryAnalysis: queryAnalysis,
        parseError: parseError,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          VERCEL_ENV: process.env.VERCEL_ENV,
        }
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}