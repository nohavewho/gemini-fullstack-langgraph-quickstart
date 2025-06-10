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
      
      // Parse the query to understand user intent
      let targetCountries = ['AZ']; // Default target
      let sourceCountries = [];
      let dateRange = '';
      
      // Extract preset/mode from query like "Анализ прессы: neighbors_priority, период: 02.06.2025 - 09.06.2025"
      const presetMatch = searchQuery.match(/(?:Press analysis|Анализ прессы|Basın analizi|Mətbuat təhlili):\s*(\w+)/i);
      const periodMatch = searchQuery.match(/(?:period|период|dönem|dövr):\s*([\d\.\-\s]+)/i);
      
      if (presetMatch) {
        const presetMode = presetMatch[1];
        // Map preset modes to countries
        const presetMappings = {
          'neighbors_priority': ['TR', 'RU', 'IR', 'GE', 'AM'],
          'turkic_world': ['TR', 'KZ', 'UZ', 'KG', 'TM', 'TJ'],
          'central_asia': ['KZ', 'UZ', 'TM', 'KG', 'TJ'],
          'caspian_states': ['RU', 'IR', 'KZ', 'TM'],
          'arabic_world': ['SA', 'EG', 'JO', 'LB', 'MA', 'AE', 'QA', 'KW', 'BH', 'OM', 'SY', 'IQ', 'YE'],
          'europe': ['DE', 'FR', 'UK', 'IT', 'ES', 'PT'],
          'major_powers': ['US', 'CN', 'RU', 'DE', 'FR', 'UK'],
          'asia': ['CN', 'JP', 'KR', 'IN', 'PK', 'TH', 'MY', 'ID']
        };
        sourceCountries = presetMappings[presetMode] || [];
      }
      
      if (periodMatch) {
        dateRange = periodMatch[1];
      }
      
      // Use custom countries if provided
      if (mode === 'custom' && options.countries) {
        sourceCountries = options.countries;
      }
      
      // Country names mapping for better output
      const countryNames = {
        'TR': 'Turkey', 'RU': 'Russia', 'IR': 'Iran', 'GE': 'Georgia', 'AM': 'Armenia',
        'KZ': 'Kazakhstan', 'UZ': 'Uzbekistan', 'TM': 'Turkmenistan', 'KG': 'Kyrgyzstan', 'TJ': 'Tajikistan',
        'US': 'United States', 'CN': 'China', 'DE': 'Germany', 'FR': 'France', 'UK': 'United Kingdom',
        'SA': 'Saudi Arabia', 'EG': 'Egypt', 'AE': 'UAE', 'JP': 'Japan', 'KR': 'South Korea',
        'IN': 'India', 'PK': 'Pakistan', 'IT': 'Italy', 'ES': 'Spain', 'PT': 'Portugal'
      };
      
      const sourcesText = sourceCountries.map(c => countryNames[c] || c).join(', ');
      const languageInstructions = {
        'ru': 'Пиши ВЕСЬ анализ ТОЛЬКО на русском языке! Включая заголовки, выводы и все секции.',
        'en': 'Write the ENTIRE analysis in English only.',
        'tr': 'TÜM analizi SADECE Türkçe yaz! Başlıklar, sonuçlar ve tüm bölümler dahil.',
        'az': 'BÜTÜN təhlili YALNIZ Azərbaycan dilində yaz!'
      };
      
      const { text } = await generateText({
        model: google('gemini-2.5-flash-preview-05-20'),
        system: `You are an expert press monitoring analyst specializing in Azerbaijan's international media coverage.
                 ${dateRange ? `Focus on the period: ${dateRange}` : 'Focus on the most recent news (last 7 days)'}
                 
                 CRITICAL: ${languageInstructions[userLanguage] || languageInstructions['en']}`,
        prompt: `Analyze press coverage about Azerbaijan from these countries: ${sourcesText}

${searchQuery}

Create a COMPREHENSIVE press monitoring report with:

# 📊 EXECUTIVE SUMMARY
Key findings and overall sentiment from ${sourcesText}

# 🌍 COVERAGE BY COUNTRY
For each country (${sourcesText}), provide:
- 3-5 most important recent articles/news
- Sentiment analysis (positive/negative/neutral)
- Key themes and narratives
- Direct quotes from media sources

# 📈 SENTIMENT ANALYSIS
Visual representation using emoji charts:
- Overall sentiment distribution
- Country-by-country sentiment
- Trend analysis

# 🔍 KEY THEMES & TOPICS
- Most discussed topics about Azerbaijan
- Emerging narratives
- Regional perspectives

# 💡 STRATEGIC INSIGHTS
- Opportunities identified
- Risks and challenges
- Recommendations for decision-makers

# 📅 TEMPORAL ANALYSIS
- How coverage evolved over time
- Key events that shaped narratives

Use markdown formatting, emoji indicators, and create visual charts using text/emoji.
Base your analysis on REAL recent news and actual media coverage.
${languageInstructions[userLanguage] || languageInstructions['en']}`,
        temperature: 0.7,
        maxTokens: 8000,
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