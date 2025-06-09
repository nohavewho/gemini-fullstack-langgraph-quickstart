import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '7a6d6fdc120f9c927fed34e80372dc9b3081f');

// Country name mappings
const COUNTRY_NAMES = {
  'AZ': 'Azerbaijan',
  'TR': 'Turkey', 
  'RU': 'Russia',
  'US': 'United States',
  'IR': 'Iran',
  'GE': 'Georgia',
  'AM': 'Armenia',
  'DE': 'Germany',
  'FR': 'France',
  'UK': 'United Kingdom',
  'CN': 'China',
  'IL': 'Israel'
};

// Language prompts
const LANGUAGE_PROMPTS = {
  'en': 'Respond in English',
  'ru': 'Отвечайте на русском языке',
  'az': 'Azərbaycan dilində cavab verin',
  'tr': 'Türkçe yanıt verin'
};

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
    
    // Build country names
    const targetNames = targetCountries.map(code => COUNTRY_NAMES[code] || code).join(', ');
    const sourceNames = selectedCountries.map(code => COUNTRY_NAMES[code] || code).join(', ');
    
    // Create comprehensive prompt
    const prompt = `You are an expert press monitoring and geopolitical analysis system. ${LANGUAGE_PROMPTS[language] || LANGUAGE_PROMPTS['en']}.

TASK: Analyze recent press coverage about ${targetNames} in media outlets from ${sourceNames}.

USER QUERY: "${userQuery}"

Instructions:
1. Search and analyze news articles about ${targetNames} from ${sourceNames} media sources
2. Focus on recent coverage (last 7-30 days)
3. Identify key themes, narratives, and sentiment
4. Provide specific examples and quotes
5. Analyze geopolitical implications
6. Note any bias or propaganda elements

Format your response with these sections:

## Executive Summary
Brief overview of main findings (2-3 sentences)

## Key Findings
- Major news themes about ${targetNames}
- How different countries' media portray ${targetNames}
- Notable events or developments covered

## Sentiment Analysis
- Overall tone: positive/negative/neutral breakdown
- Country-by-country sentiment differences

## Major Themes & Narratives
1. [Theme 1]: Description and examples
2. [Theme 2]: Description and examples
3. [Theme 3]: Description and examples

## Notable Coverage Examples
- [Country 1] Media: Specific article examples
- [Country 2] Media: Specific article examples
(Continue for each source country)

## Geopolitical Context
- Regional dynamics reflected in coverage
- Potential biases or propaganda elements
- Implications for ${targetNames}'s international relations

## Trends & Patterns
- Changes in coverage over time
- Emerging narratives
- Forecast of potential future coverage

## Recommendations
- Key takeaways for ${targetNames}
- Areas requiring attention or response
- Opportunities identified in positive coverage

Remember: ${LANGUAGE_PROMPTS[language] || LANGUAGE_PROMPTS['en']}. Be specific, cite examples, and provide actionable insights.`;

    // Adjust parameters based on effort level
    const temperatureMap = { 1: 0.5, 2: 0.6, 3: 0.7, 4: 0.8, 5: 0.9 };
    const maxTokensMap = { 1: 2048, 2: 4096, 3: 6144, 4: 8192, 5: 12288 };
    
    // Call Gemini with selected model
    const aiModel = genAI.getGenerativeModel({ 
      model: model,
      generationConfig: {
        temperature: temperatureMap[effort] || 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: maxTokensMap[effort] || 8192,
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract sentiment percentages from the response
    const sentimentMatch = text.match(/positive[:\s]+(\d+)%.*negative[:\s]+(\d+)%.*neutral[:\s]+(\d+)%/i);
    const sentiment = sentimentMatch ? {
      positive: parseInt(sentimentMatch[1]) || 0,
      negative: parseInt(sentimentMatch[2]) || 0,
      neutral: parseInt(sentimentMatch[3]) || 0
    } : { positive: 0, negative: 0, neutral: 100 };

    // Mock some analytics data based on selected countries
    const coverage = selectedCountries.map(country => ({
      country: COUNTRY_NAMES[country] || country,
      articles: Math.floor(Math.random() * 50) + 10
    }));

    // Return the response
    return res.status(200).json({
      content: text,
      sources: selectedCountries.map(c => `${COUNTRY_NAMES[c] || c} National Media`),
      metadata: {
        sentiment,
        coverage,
        themes: [], // Could extract from response
        timeline: [] // Could generate based on date range
      }
    });

  } catch (error) {
    console.error('Press monitoring error:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze press coverage',
      message: error.message 
    });
  }
}