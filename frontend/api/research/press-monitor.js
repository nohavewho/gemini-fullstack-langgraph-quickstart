import { create_press_monitor_graph } from '../../backend/src/agent/press_monitor_graph.py';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      messages, 
      targetCountries = ['AZ'], 
      selectedCountries = ['TR', 'RU', 'US', 'GE'],
      dateRange,
      effort = 3,
      model = 'gemini-2.0-flash-exp',
      language = 'en' 
    } = req.body;

    // Get the user's query
    const userQuery = messages[messages.length - 1].content;
    
    // Map countries to language codes
    const countryToLang = {
      'TR': 'tr', 'RU': 'ru', 'US': 'en', 'GE': 'ka',
      'IR': 'fa', 'AM': 'hy', 'DE': 'de', 'FR': 'fr',
      'UK': 'en', 'CN': 'zh', 'IL': 'he'
    };
    
    const targetLanguages = selectedCountries.map(c => countryToLang[c] || 'en');
    
    // Map effort to max articles
    const effortToArticles = {
      1: 5, 2: 10, 3: 15, 4: 20, 5: 30
    };
    
    // Call the actual press monitor endpoint from your backend
    const BACKEND_URL = process.env.PRESS_MONITOR_BACKEND_URL || 'https://your-backend.vercel.app';
    
    const response = await fetch(`${BACKEND_URL}/api/press-monitor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'custom',
        options: {
          languages: targetLanguages,
          max_articles: effortToArticles[effort] || 15,
          date_filter: dateRange ? `from ${dateRange.from} to ${dateRange.to}` : 'last 7 days',
          translation_enabled: true,
          model: model
        },
        query: userQuery,
        response_language: language
      })
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const result = await response.json();
    
    // Extract data from the press monitor response
    const executiveSummary = result.executive_summary || result.final_summary || '';
    const sentimentData = result.sentiment_analysis || {};
    const temporalData = result.temporal_analysis || {};
    const sources = result.articles || [];
    
    // Format the response
    return res.status(200).json({
      content: executiveSummary,
      sources: sources.map(a => a.source || a.url),
      metadata: {
        sentiment: {
          positive: sentimentData.positive_percentage || 0,
          negative: sentimentData.negative_percentage || 0,
          neutral: sentimentData.neutral_percentage || 0
        },
        coverage: Object.entries(result.language_results || {}).map(([lang, data]) => ({
          country: lang,
          articles: data.articles_found || 0
        })),
        themes: result.key_themes || [],
        timeline: temporalData.timeline || []
      }
    });

  } catch (error) {
    console.error('Press monitor error:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze press coverage',
      message: error.message 
    });
  }
}