/**
 * Press Monitor API with AI SDK
 * Using streaming for real-time updates
 */

import { streamText, generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const config = {
  runtime: 'edge',
  maxDuration: 300,
};

// Initialize Google provider with API key
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
});

const getGoogleModel = (modelId = 'gemini-2.5-flash-preview-05-20') => {
  return google(modelId);
};

// Language configurations
const LANGUAGE_NAMES = {
  'en': 'English',
  'ru': 'Russian',
  'tr': 'Turkish',
  'ar': 'Arabic',
  'fa': 'Persian',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'de': 'German',
  'fr': 'French',
  'es': 'Spanish',
  'pt': 'Portuguese',
  'it': 'Italian',
  'ka': 'Georgian',
  'hy': 'Armenian',
  'kk': 'Kazakh',
  'uz': 'Uzbek',
  'tk': 'Turkmen',
  'ky': 'Kyrgyz',
  'tg': 'Tajik',
  'uk': 'Ukrainian'
};

// Country name mappings
const COUNTRY_NAMES = {
  "AZ": "Azerbaijan",
  "GE": "Georgia", 
  "AM": "Armenia",
  "TR": "Turkey",
  "RU": "Russia",
  "IR": "Iran",
  "US": "United States",
  "CN": "China",
  "DE": "Germany",
  "FR": "France",
  "KZ": "Kazakhstan",
  "UZ": "Uzbekistan",
  "TM": "Turkmenistan",
  "KG": "Kyrgyzstan",
  "TJ": "Tajikistan",
  "IN": "India",
  "PK": "Pakistan",
  "JP": "Japan",
  "KR": "South Korea",
  "SA": "Saudi Arabia",
  "EG": "Egypt",
  "JO": "Jordan",
  "LB": "Lebanon",
  "MA": "Morocco",
  "AE": "UAE",
  "QA": "Qatar",
  "KW": "Kuwait",
  "BH": "Bahrain",
  "OM": "Oman",
  "SY": "Syria",
  "IQ": "Iraq",
  "YE": "Yemen",
  "IL": "Israel",
  "UK": "United Kingdom",
  "IT": "Italy",
  "ES": "Spain",
  "PT": "Portugal",
  "UA": "Ukraine",
  "TH": "Thailand",
  "MY": "Malaysia",
  "ID": "Indonesia",
  "VN": "Vietnam"
};

// Media sources by country
const MEDIA_SOURCES = {
  'TR': {
    sources: ['Anadolu Ajansı', 'Hürriyet', 'Sabah', 'TRT Haber', 'Milliyet', 'Cumhuriyet', 'Sözcü', 'Habertürk'],
    topics: ['diplomacy', 'energy cooperation', 'trade relations', 'regional security', 'tourism']
  },
  'RU': {
    sources: ['РИА Новости', 'ТАСС', 'Коммерсантъ', 'РБК', 'Известия', 'Ведомости', 'RT', 'Лента.ру'],
    topics: ['energy partnerships', 'military cooperation', 'economic ties', 'Caspian Sea', 'transport corridors']
  },
  'IR': {
    sources: ['ایرنا', 'تسنیم', 'فارس', 'مهر', 'Press TV', 'ایران دیلی'],
    topics: ['regional cooperation', 'energy transit', 'border trade', 'cultural exchange', 'security']
  },
  'GE': {
    sources: ['რუსთავი 2', 'იმედი', 'მთავარი არხი', 'Civil.ge', 'Agenda.ge', 'Georgia Today'],
    topics: ['transport corridor', 'energy projects', 'regional stability', 'economic cooperation', 'tourism']
  },
  'AM': {
    sources: ['Արմենպրես', 'NEWS.am', 'Panorama.am', 'Aravot', 'Azatutyun', '168.am'],
    topics: ['regional tensions', 'peace process', 'economic blockade', 'international mediation', 'security']
  },
  'US': {
    sources: ['Reuters', 'AP News', 'Bloomberg', 'WSJ', 'CNN', 'NYTimes', 'Washington Post'],
    topics: ['energy security', 'regional stability', 'human rights', 'investment', 'geopolitics']
  },
  'CN': {
    sources: ['新华社', '人民日报', '环球时报', 'CGTN', '财新网', '澎湃新闻'],
    topics: ['Belt and Road', 'energy cooperation', 'trade', 'investment', 'transport corridors']
  },
  'DE': {
    sources: ['Der Spiegel', 'FAZ', 'Die Zeit', 'Süddeutsche', 'Die Welt', 'Handelsblatt', 'DW'],
    topics: ['EU relations', 'energy diversification', 'human rights', 'economic cooperation', 'democracy']
  },
  'FR': {
    sources: ['Le Monde', 'Le Figaro', 'Liberation', 'Les Echos', 'France24', 'RFI'],
    topics: ['European integration', 'energy security', 'democracy', 'cultural relations']
  },
  'KZ': {
    sources: ['Қазақстан', 'Егемен Қазақстан', 'Айқын', 'Түркістан', 'Қазинформ'],
    topics: ['Caspian cooperation', 'transport corridors', 'energy trade', 'regional integration']
  },
  'UZ': {
    sources: ["O'zbekiston", "Kun.uz", "Daryo", "Gazeta.uz", "Podrobno.uz"],
    topics: ['regional cooperation', 'trade routes', 'cultural ties', 'investment']
  },
  'UA': {
    sources: ['Українська правда', 'УНІАН', 'Інтерфакс-Україна', 'Укрінформ', 'Liga.net', 'НВ'],
    topics: ['war updates', 'international support', 'economy', 'diplomacy', 'security']
  },
  'UK': {
    sources: ['BBC News', 'The Guardian', 'The Times', 'Financial Times', 'The Telegraph', 'Reuters UK'],
    topics: ['international relations', 'finance', 'politics', 'security', 'economy']
  }
};

// Country modes with predefined selections
const COUNTRY_MODES = {
  'neighbors_priority': {
    name: 'Neighbors Priority',
    description: 'Focus on Azerbaijan\'s immediate neighbors',
    countries: ['TR', 'RU', 'IR', 'GE', 'AM']
  },
  'central_asia_focus': {
    name: 'Central Asia Focus',
    description: 'Turkic countries and Central Asian republics',
    countries: ['KZ', 'UZ', 'TM', 'KG', 'TJ', 'TR']
  },
  'europe_monitor': {
    name: 'Europe Monitor',
    description: 'Major European countries',
    countries: ['DE', 'FR', 'UK', 'IT', 'ES', 'PT']
  },
  'asia_comprehensive': {
    name: 'Asia Comprehensive',
    description: 'Major Asian countries including China, India, Japan',
    countries: ['CN', 'IN', 'JP', 'KR', 'PK', 'TH']
  },
  'arabic_world': {
    name: 'Arabic World',
    description: 'Arab countries and Middle East',
    countries: ['SA', 'EG', 'JO', 'LB', 'MA', 'AE', 'QA', 'KW', 'BH', 'OM', 'SY', 'IQ', 'YE']
  },
  'custom': {
    name: 'Custom Selection',
    description: 'Choose your own countries',
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
    "IT": "it", "ES": "es", "PT": "pt", "UA": "uk",
    "TH": "en", "MY": "en", "ID": "en", "VN": "en"
  };
  return countryLanguageMap[countryCode] || "en";
}

async function analyzeUserQuery(searchQuery, model, defaultTarget = 'AZ') {
  const prompt = `Analyze this user query and determine which countries they want to analyze.

User query: "${searchQuery}"

Instructions:
- Extract target countries (what countries/regions the user wants information ABOUT)
- Extract source countries (where to search for information FROM)
- If query mentions regions, expand to specific countries
- Default target is ${defaultTarget} if not specified

Examples:
- "news about Azerbaijan" → Target: ["AZ"], Source: all available
- "что пишут в России об Азербайджане" → Target: ["AZ"], Source: ["RU"]
- "Turkish media coverage" → Target: ["${defaultTarget}"], Source: ["TR"]
- "Arabic press about Azerbaijan" → Target: ["AZ"], Source: arabic countries
- "European view on Ukraine war" → Target: ["UA"], Source: european countries

Available countries: ${Object.keys(COUNTRY_NAMES).join(', ')}

Return JSON: { "targetCountries": ["XX"], "sourceCountries": ["YY", "ZZ"] }`;

  const { text } = await generateText({
    model: getGoogleModel(model),
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

async function generateArticles(countryCode, langCode, targetCountries, count, model, userQuery) {
  const countryConfig = MEDIA_SOURCES[countryCode] || {
    sources: ['National News Agency', 'Daily Tribune', 'Business Today'],
    topics: ['politics', 'economy', 'international relations']
  };
  
  const languageName = LANGUAGE_NAMES[langCode] || langCode;
  const countriesNames = targetCountries.map(c => COUNTRY_NAMES[c] || c).join(", ");
  const countryName = COUNTRY_NAMES[countryCode] || countryCode;
  
  const sourcesToUse = countryConfig.sources.slice(0, Math.min(count, 3));
  const topicsStr = countryConfig.topics.slice(0, count).join(', ');
  
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const prompt = `You are a news analyst generating realistic news articles from ${countryName} media about ${countriesNames}.
Today's date: ${dateStr}

CRITICAL: Generate EXACTLY ${count} articles in ${languageName} language.
Sources to use: ${sourcesToUse.join(', ')}
Topics: ${topicsStr}
${userQuery ? `User interest: ${userQuery}` : ''}

For EACH article provide:
1. Source name (from the list above)
2. Headline (in ${languageName})
3. Summary (2-3 sentences in ${languageName})
4. Sentiment: positive/negative/neutral
5. Topic category

Format as JSON array with ${count} articles.`;

  const { text } = await generateText({
    model: getGoogleModel(model),
    prompt,
    temperature: 0.8,
    maxTokens: 800, // Reduced to speed up
  });
  
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const articles = JSON.parse(jsonMatch[0]);
      return articles.map(article => ({
        ...article,
        country: countryCode,
        language: langCode,
        date: dateStr
      }));
    }
  } catch (error) {
    console.error('Article generation error:', error);
  }
  
  return [];
}

async function generateDigest(articles, targetCountries, userLanguage, model, userQuery) {
  const targetNames = targetCountries.map(c => COUNTRY_NAMES[c] || c).join(", ");
  const languageName = LANGUAGE_NAMES[userLanguage] || 'English';
  
  const articlesByCountry = {};
  articles.forEach(article => {
    if (!articlesByCountry[article.country]) {
      articlesByCountry[article.country] = [];
    }
    articlesByCountry[article.country].push(article);
  });

  const prompt = `Create a comprehensive analytical digest about ${targetNames} based on international media coverage.

Articles by country:
${Object.entries(articlesByCountry).map(([country, countryArticles]) => `
${COUNTRY_NAMES[country]}:
${countryArticles.map(a => `- ${a.headline} (${a.sentiment})`).join('\n')}
`).join('\n')}

${userQuery ? `User query focus: ${userQuery}` : ''}

Create a digest in ${languageName} with:
1. Executive Summary (key findings)
2. Analysis by regions/countries
3. Key themes and trends
4. Sentiment analysis
5. Visual statistics (using text-based charts)

IMPORTANT: Write EVERYTHING in ${languageName} language!`;

  const response = await streamText({
    model: getGoogleModel(model),
    prompt,
    temperature: 0.7,
    maxTokens: 4000,
  });

  return response.toTextStreamResponse();
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
      stream = true
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
        sourceCountries = queryAnalysis.sourceCountries.slice(0, 5);
      }
    }
    
    // If no source countries specified, use mode
    if (sourceCountries.length === 0) {
      if (mode === 'custom' && options.countries) {
        sourceCountries = options.countries.slice(0, Math.min(5, options.countries.length));
      } else if (COUNTRY_MODES[mode]) {
        sourceCountries = COUNTRY_MODES[mode].countries.slice(0, 5);
      }
    }
    
    // Fallback to neighbors if still no countries
    if (sourceCountries.length === 0) {
      sourceCountries = COUNTRY_MODES.neighbors_priority.countries;
    }

    // Limit countries to avoid timeout
    const maxCountries = Math.min(3, sourceCountries.length); // MAX 3 countries to avoid Cloudflare timeout
    const limitedSourceCountries = sourceCountries.slice(0, maxCountries);
    
    // Generate articles for each country
    const articlesPerCountry = Math.max(1, Math.min(2, Math.floor(effortLevel / 2)));
    const allArticles = [];
    
    // Batch process countries in parallel to save time
    const articlePromises = limitedSourceCountries.map(async (countryCode) => {
      const langCode = getCountryLanguageCode(countryCode);
      return generateArticles(
        countryCode,
        langCode,
        targetCountries,
        articlesPerCountry,
        model,
        searchQuery
      );
    });
    
    const articlesArrays = await Promise.all(articlePromises);
    articlesArrays.forEach(articles => allArticles.push(...articles));

    // Generate digest using streaming
    if (stream) {
      const digestStream = await generateDigest(
        allArticles,
        targetCountries,
        userLanguage,
        model,
        searchQuery
      );

      return new Response(digestStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      // Non-streaming response
      const { text: digest } = await generateText({
        model: getGoogleModel(model),
        prompt: `Create a brief summary of press coverage about ${targetCountries.join(', ')} based on these articles:\n\n${allArticles.map(a => `${a.country}: ${a.headline}`).join('\n')}\n\nWrite in ${userLanguage} language.`,
        temperature: 0.7,
        maxTokens: 1000,
      });
      
      return new Response(JSON.stringify({
        success: true,
        digest,
        metadata: {
          targetCountries,
          sourceCountries,
          articlesCount: allArticles.length,
          timestamp: new Date().toISOString()
        }
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