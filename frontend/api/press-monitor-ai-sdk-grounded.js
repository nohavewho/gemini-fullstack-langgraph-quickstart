/**
 * Press Monitor API with AI SDK and Google Search Grounding
 * Using Gemini's built-in web search capability
 */

import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const config = {
  runtime: 'edge',
  maxDuration: 300,
};

// Initialize Google provider with API key
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
});

// Country and language configurations (same as before)
const LANGUAGE_NAMES = {
  'en': 'English', 'ru': 'Russian', 'tr': 'Turkish', 'ar': 'Arabic',
  'fa': 'Persian', 'zh': 'Chinese', 'ja': 'Japanese', 'ko': 'Korean',
  'de': 'German', 'fr': 'French', 'es': 'Spanish', 'pt': 'Portuguese',
  'it': 'Italian', 'ka': 'Georgian', 'hy': 'Armenian', 'kk': 'Kazakh',
  'uz': 'Uzbek', 'tk': 'Turkmen', 'ky': 'Kyrgyz', 'tg': 'Tajik', 'uk': 'Ukrainian'
};

const COUNTRY_NAMES = {
  "AZ": "Azerbaijan", "GE": "Georgia", "AM": "Armenia", "TR": "Turkey",
  "RU": "Russia", "IR": "Iran", "US": "United States", "CN": "China",
  "DE": "Germany", "FR": "France", "KZ": "Kazakhstan", "UZ": "Uzbekistan",
  "TM": "Turkmenistan", "KG": "Kyrgyzstan", "TJ": "Tajikistan",
  "IN": "India", "PK": "Pakistan", "JP": "Japan", "KR": "South Korea",
  "SA": "Saudi Arabia", "EG": "Egypt", "JO": "Jordan", "LB": "Lebanon",
  "MA": "Morocco", "AE": "UAE", "QA": "Qatar", "KW": "Kuwait",
  "BH": "Bahrain", "OM": "Oman", "SY": "Syria", "IQ": "Iraq",
  "YE": "Yemen", "IL": "Israel", "UK": "United Kingdom", "IT": "Italy",
  "ES": "Spain", "PT": "Portugal", "UA": "Ukraine"
};

const COUNTRY_MODES = {
  'neighbors_priority': {
    countries: ['TR', 'RU', 'IR', 'GE', 'AM']
  },
  'central_asia_focus': {
    countries: ['KZ', 'UZ', 'TM', 'KG', 'TJ', 'TR']
  },
  'europe_monitor': {
    countries: ['DE', 'FR', 'UK', 'IT', 'ES', 'PT']
  },
  'asia_comprehensive': {
    countries: ['CN', 'IN', 'JP', 'KR', 'PK', 'TH']
  },
  'arabic_world': {
    countries: ['SA', 'EG', 'JO', 'LB', 'MA', 'AE', 'QA', 'KW', 'BH', 'OM', 'SY', 'IQ', 'YE']
  },
  'custom': {
    countries: []
  }
};

function getCountryLanguageCode(countryCode) {
  const countryLanguageMap = {
    "TR": "tr", "RU": "ru", "IR": "fa", "GE": "ka", "AM": "hy",
    "US": "en", "UK": "en", "CN": "zh", "DE": "de", "FR": "fr",
    "KZ": "kk", "UZ": "uz", "TM": "tk", "KG": "ky", "TJ": "tg",
    "IN": "en", "PK": "en", "JP": "ja", "KR": "ko",
    "SA": "ar", "EG": "ar", "JO": "ar", "LB": "ar", "MA": "ar",
    "AE": "ar", "QA": "ar", "KW": "ar", "BH": "ar", "OM": "ar",
    "SY": "ar", "IQ": "ar", "YE": "ar", "IL": "en",
    "IT": "it", "ES": "es", "PT": "pt", "UA": "uk"
  };
  return countryLanguageMap[countryCode] || "en";
}

// Call Gemini API directly with grounding for web search
async function searchWithGemini(prompt, model = 'gemini-2.5-flash-preview-05-20') {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
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
      tools: [{
        googleSearch: {}
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data;
}

async function analyzeUserQuery(searchQuery, model, defaultTarget = 'AZ') {
  const prompt = `Analyze this user query: "${searchQuery}"
  
Determine:
- Target countries (what the user wants information ABOUT) 
- Source countries (where to search for information FROM)

Default target: ${defaultTarget}
Available countries: ${Object.keys(COUNTRY_NAMES).join(', ')}

Return JSON: { "targetCountries": ["XX"], "sourceCountries": ["YY", "ZZ"] }`;

  const { text } = await generateText({
    model: google(model),
    prompt,
    temperature: 0.3,
    maxTokens: 500,
  });
  
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      result.targetCountries = result.targetCountries.filter(code => COUNTRY_NAMES[code]);
      result.sourceCountries = result.sourceCountries.filter(code => COUNTRY_NAMES[code]);
      return result;
    }
  } catch (error) {
    console.error('Query analysis error:', error);
  }
  return { targetCountries: [defaultTarget], sourceCountries: [] };
}

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
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  try {
    const body = await request.json();
    const { 
      mode = 'neighbors_priority', 
      options = {},
      effortLevel = 3,
      model = 'gemini-2.5-flash-preview-05-20',
      searchQuery = '',
      userLanguage = 'en',
      stream = false
    } = body;

    // Determine countries to analyze
    let sourceCountries = [];
    let targetCountries = ['AZ'];
    
    // AI-powered query understanding
    if (searchQuery) {
      const queryAnalysis = await analyzeUserQuery(searchQuery, model);
      if (queryAnalysis.targetCountries?.length > 0) {
        targetCountries = queryAnalysis.targetCountries.slice(0, 3);
      }
      if (queryAnalysis.sourceCountries?.length > 0) {
        sourceCountries = queryAnalysis.sourceCountries.slice(0, 3);
      }
    }
    
    // If no source countries specified, use mode
    if (sourceCountries.length === 0) {
      if (mode === 'custom' && options.countries) {
        sourceCountries = options.countries.slice(0, Math.min(3, options.countries.length));
      } else if (COUNTRY_MODES[mode]) {
        sourceCountries = COUNTRY_MODES[mode].countries.slice(0, 3);
      }
    }
    
    // Fallback to neighbors if still no countries
    if (sourceCountries.length === 0) {
      sourceCountries = COUNTRY_MODES.neighbors_priority.countries.slice(0, 3);
    }

    // Create a comprehensive search prompt with grounding
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const targetNames = targetCountries.map(c => COUNTRY_NAMES[c]).join(", ");
    const languageName = LANGUAGE_NAMES[userLanguage] || 'English';
    
    const searchPrompt = `ANALYZE RECENT NEWS ABOUT ${targetNames}

Search the web for the most recent news articles (last 7 days) about ${targetNames} from these countries: ${sourceCountries.map(c => COUNTRY_NAMES[c]).join(', ')}

${searchQuery ? `Focus on: ${searchQuery}` : ''}

Find and analyze:
1. Political developments and diplomatic relations
2. Economic news and trade agreements
3. Regional cooperation and conflicts
4. Cultural exchanges and social issues
5. Energy and infrastructure projects

For each source country (${sourceCountries.join(', ')}), find 2-3 recent articles.

Create a comprehensive digest in ${languageName} with:
- Executive summary
- Key findings by country
- Sentiment analysis
- Important quotes and statistics

Today's date: ${today}`;

    console.log('Searching with grounding for:', sourceCountries);
    
    // Use Gemini with grounding to search and analyze
    const searchResult = await searchWithGemini(searchPrompt, model);
    
    // Extract the generated text
    let digest = '';
    if (searchResult.candidates?.[0]?.content?.parts?.[0]?.text) {
      digest = searchResult.candidates[0].content.parts[0].text;
    } else {
      throw new Error('No content generated from search');
    }
    
    // Extract grounding metadata if available
    let sources = [];
    if (searchResult.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      sources = searchResult.candidates[0].groundingMetadata.groundingChunks.map(chunk => ({
        title: chunk.web?.title || 'Unknown',
        url: chunk.web?.uri || '',
        snippet: chunk.retrievedContent?.text || ''
      }));
    }

    return new Response(JSON.stringify({
      success: true,
      digest,
      metadata: {
        targetCountries,
        sourceCountries,
        sourcesCount: sources.length,
        timestamp: new Date().toISOString(),
        sources: sources.slice(0, 10) // Limit sources in response
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
    
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