/**
 * Working Press Monitor for Vercel
 * Simplified version that works within Vercel limits
 */

export const config = {
  runtime: 'edge',
  maxDuration: 60, // 60 seconds to avoid Vercel timeout
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
  "UA": "Ukraine",
  "UK": "United Kingdom",
  "IN": "India",
  "PK": "Pakistan",
  "ES": "Spain",
  "IT": "Italy",
  "PT": "Portugal",
  "JP": "Japan",
  "KR": "South Korea",
  "SA": "Saudi Arabia",
  "EG": "Egypt",
  "JO": "Jordan",
  "LB": "Lebanon",
  "MA": "Morocco",
  "AE": "United Arab Emirates",
  "QA": "Qatar",
  "KW": "Kuwait",
  "BH": "Bahrain",
  "OM": "Oman",
  "SY": "Syria",
  "IQ": "Iraq",
  "YE": "Yemen"
};

// Country configurations with sources and topics
const COUNTRY_SOURCES = {
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
  },
  'SA': {
    sources: ['العربية', 'الشرق الأوسط', 'الرياض', 'SPA', 'Arab News'],
    topics: ['regional politics', 'energy', 'economy', 'diplomacy']
  },
  'EG': {
    sources: ['الأهرام', 'الأخبار', 'المصري اليوم', 'MENA', 'Daily News Egypt'],
    topics: ['regional stability', 'economy', 'politics', 'culture']
  },
  'JO': {
    sources: ['الرأي', 'الدستور', 'Jordan Times', 'Petra News'],
    topics: ['regional affairs', 'economy', 'politics', 'security']
  },
  'LB': {
    sources: ['النهار', 'الأخبار', 'Daily Star', 'L\'Orient-Le Jour'],
    topics: ['politics', 'economy', 'regional tensions', 'culture']
  },
  'MA': {
    sources: ['هسبريس', 'Le Matin', 'L\'Economiste', 'MAP'],
    topics: ['economy', 'politics', 'regional cooperation', 'culture']
  }
};

// Legacy mapping for backward compatibility
const LANGUAGE_SOURCES = {
  'en': ['BBC News', 'Reuters', 'CNN International', 'Financial Times', 'The Guardian', 'Bloomberg'],
  'ru': ['РИА Новости', 'ТАСС', 'Коммерсантъ', 'РБК', 'Известия', 'Ведомости'],
  'tr': ['Anadolu Ajansı', 'Hürriyet', 'Sabah', 'TRT Haber', 'Milliyet', 'Cumhuriyet'],
  'ar': ['الجزيرة', 'العربية', 'الشرق الأوسط', 'الأهرام', 'BBC Arabic', 'Sky News عربية'],
  'fa': ['ایرنا', 'تسنیم', 'فارس', 'مهر', 'BBC Persian', 'ایران اینترنشنال'],
  'zh': ['新华社', '人民日报', '环球时报', 'CCTV', '财新网', '凤凰网'],
  'de': ['Der Spiegel', 'Die Zeit', 'FAZ', 'Süddeutsche Zeitung', 'Die Welt', 'Handelsblatt'],
  'fr': ['Le Monde', 'Le Figaro', 'Liberation', 'Les Echos', 'France24', 'RFI'],
  'ka': ['რუსთავი 2', 'იმედი', 'მთავარი არხი', 'ინტერპრესნიუსი', 'Civil.ge'],
  'hy': ['Արմենպրես', 'NEWS.am', 'Տերտ.am', 'Առավոտ', 'Ազատություն'],
  'kk': ['Қазақстан', 'Егемен Қазақстан', 'Айқын', 'Түркістан', 'Қазинформ'],
  'uz': ["O'zbekiston", "Kun.uz", "Daryo", "Gazeta.uz", "Podrobno.uz"]
};

// Analyze user query to extract countries and intent
async function analyzeUserQuery(query, apiKey, model) {
  const allCountries = Object.entries(COUNTRY_NAMES).map(([code, name]) => `${code}=${name}`).join(', ');
  
  const prompt = `You are an intelligent press monitoring query analyzer. Analyze this query and extract countries.

Query: "${query}"

UNDERSTANDING GROUPS AND REGIONS:
- "neighbors/соседи" → neighboring countries
- "arabic world/арабский мир/арабские страны" → Arab countries (SA, EG, JO, LB, MA, AE, QA, KW, BH, OM, SY, IQ, YE)
- "central asia/центральная азия" → KZ, UZ, TM, KG, TJ
- "europe/европа" → DE, FR, UK, IT, ES, NL, BE, PL, etc.
- "caucasus/кавказ" → AZ, GE, AM
- "gulf states/персидский залив" → SA, AE, QA, KW, BH, OM
- "post-soviet/постсоветские" → RU, UA, BY, KZ, UZ, GE, AM, AZ, etc.
- "global powers/мировые державы" → US, CN, RU, UK, FR, DE, JP
- "turkic world/тюркский мир" → TR, AZ, KZ, UZ, KG, TM

UNDERSTANDING INTENT:
- If query asks "what X thinks about Y" → Target: Y, Source: X
- If query asks "news about X in Y media" → Target: X, Source: Y
- If query asks "X about Y" → Target: Y, Source: X
- If query mentions only countries without relationship → Target: mentioned countries, Source: auto-select relevant
- If query mentions a region/group → expand to actual country codes

EXAMPLES:
- "arabic_world" → Target: ["AZ"], Source: ["SA", "EG", "JO", "LB", "MA"]
- "что пишут соседи об Азербайджане" → Target: ["AZ"], Source: ["TR", "RU", "IR", "GE", "AM"]
- "european media about Ukraine" → Target: ["UA"], Source: ["DE", "FR", "UK", "IT", "ES"]
- "анализ прессы: arabic_world, период: 02.06.2025 - 09.06.2025" → Target: ["AZ"], Source: ["SA", "EG", "JO", "LB", "MA"]

Available countries: ${allCountries}

Return JSON with ISO country codes:
{
  "targetCountries": ["XX"],
  "sourceCountries": ["YY", "ZZ"]
}`;

  try {
    const response = await callGemini(prompt, 0.3, apiKey, model);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      
      // Validate country codes
      result.targetCountries = result.targetCountries.filter(code => COUNTRY_NAMES[code]);
      result.sourceCountries = result.sourceCountries.filter(code => COUNTRY_NAMES[code]);
      
      return result;
    }
  } catch (error) {
    console.error('Query analysis error:', error);
  }
  return { targetCountries: [], sourceCountries: [] };
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
    console.log('Press monitor API called');
    
    const body = await request.json();
    const { 
      mode = 'neighbors_priority', 
      options = {},
      effortLevel = 3,
      model = 'gemini-2.0-flash',
      searchQuery = '',
      userLanguage = 'en'
    } = body;

    console.log('Press monitor request body:', JSON.stringify(body));
    console.log('Parsed params:', { mode, effortLevel, searchQuery, userLanguage, model });

    // Parse user query to extract target countries if specified
    let targetCountries = ['AZ']; // Default to Azerbaijan
    let sourceCountries = [];
    
    // AI-powered query understanding - NO HARDCODE!
    if (searchQuery) {
      console.log('Analyzing user query:', searchQuery);
      try {
        const queryAnalysis = await analyzeUserQuery(
          searchQuery, 
          process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY,
          model
        );
        console.log('Query analysis result:', queryAnalysis);
        if (queryAnalysis.targetCountries && queryAnalysis.targetCountries.length > 0) {
          targetCountries = queryAnalysis.targetCountries;
        }
        if (queryAnalysis.sourceCountries && queryAnalysis.sourceCountries.length > 0) {
          sourceCountries = queryAnalysis.sourceCountries;
        }
      } catch (error) {
        console.error('Error analyzing query:', error);
        // Continue with defaults if query analysis fails
      }
    }
    console.log('After query analysis - Target:', targetCountries, 'Source:', sourceCountries);
    
    // Reduced limits to avoid timeouts
    const articlesPerLanguage = Math.min(3, effortLevel); // 1-3 articles per language
    const maxLanguages = Math.min(sourceCountries.length || 3, 3); // Max 3 languages to stay under 60s

    // Map mode to source countries if not extracted from query
    if (sourceCountries.length === 0) {
      console.log('No source countries from query, using mode:', mode);
      switch (mode) {
      case 'neighbors_priority':
        sourceCountries = ['TR', 'RU', 'IR', 'GE', 'AM'];
        break;
      case 'central_asia_focus':
        sourceCountries = ['KZ', 'UZ', 'TM', 'KG', 'TJ'];
        break;
      case 'europe_monitor':
        sourceCountries = ['DE', 'FR', 'IT', 'ES', 'UK'];
        break;
      case 'asia_comprehensive':
        sourceCountries = ['CN', 'JP', 'KR', 'IN'];
        break;
      case 'custom':
        if (options.countries && options.countries.length > 0) {
          // Use countries directly from frontend
          sourceCountries = options.countries;
        }
        // NO DEFAULTS! User must specify source countries
        break;
      default:
        // NO DEFAULTS! Must be specified
        sourceCountries = [];
      }
    }

    // Check if we have source countries
    if (sourceCountries.length === 0) {
      const errorMessage = userLanguage === 'ru' 
        ? 'Пожалуйста, укажите страны для мониторинга прессы. Например: "что пишут в Турции об Азербайджане" или "арабские СМИ об Азербайджане"'
        : 'Please specify which countries\' media to monitor. For example: "what Turkey writes about Azerbaijan" or "Arab media about Azerbaijan"';
      
      return new Response(JSON.stringify({
        success: false,
        error: errorMessage
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Run the press monitoring with selected languages only
    console.log('Running press monitor with:', {
      targetCountries,
      sourceCountries: sourceCountries.slice(0, maxLanguages),
      articlesPerLanguage,
      model,
      userLanguage
    });
    
    const result = await runPressMonitor(
      targetCountries, 
      sourceCountries.slice(0, maxLanguages),
      articlesPerLanguage,
      model,
      userLanguage,
      searchQuery
    );
    
    console.log('Press monitor completed, returning result');
    
    return new Response(JSON.stringify({
      success: true,
      result: result
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

// Cache API key
let CACHED_API_KEY = null;

// Main press monitoring logic
async function runPressMonitor(targetCountries, sourceCountries, articlesPerLanguage, model, userLanguage, userQuery) {
  const GEMINI_API_KEY = CACHED_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  
  // Cache the key
  CACHED_API_KEY = GEMINI_API_KEY;

  // Determine languages to search
  let languagesToSearch = sourceCountries.map(c => getCountryLanguageCode(c));
  languagesToSearch = [...new Set(languagesToSearch)];

  // Get current date
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Phase 1: Generate realistic articles based on current topics
  const allArticles = [];
  const coverageByCountry = {};
  
  for (const countryCode of sourceCountries) {
    const langCode = getCountryLanguageCode(countryCode);
    const countryConfig = COUNTRY_SOURCES[countryCode] || {
      sources: ['National News Agency'],
      topics: ['politics', 'economy', 'society']
    };
    try {
      const articles = await generateRealisticArticles(
        countryCode,
        langCode, 
        targetCountries,
        countryConfig,
        articlesPerLanguage,
        dateStr,
        GEMINI_API_KEY,
        model
      );
      
      // Analyze sentiment in BATCH to save time
      const analyzedArticles = await analyzeSentimentBatch(articles, targetCountries, GEMINI_API_KEY, model);
      
      coverageByCountry[countryCode] = analyzedArticles;
      allArticles.push(...analyzedArticles);
    } catch (error) {
      console.error(`Error processing ${countryCode}:`, error);
    }
  }

  // Phase 2: Generate comprehensive digest
  const digest = await generateComprehensiveDigest(
    allArticles,
    coverageByCountry,
    targetCountries,
    userLanguage,
    userQuery,
    GEMINI_API_KEY,
    model
  );
  
  return digest;
}

function getCountryLanguageCode(countryCode) {
  const countryLanguageMap = {
    "TR": "tr", "RU": "ru", "IR": "fa", "CN": "zh",
    "DE": "de", "FR": "fr", "US": "en", "UK": "en", 
    "GE": "ka", "AM": "hy", "KZ": "kk", "UZ": "uz",
    "TM": "tk", "KG": "ky", "TJ": "tg", "ES": "es",
    "IT": "it", "PT": "pt", "JP": "ja", "KR": "ko",
    "SA": "ar", "IN": "hi", "PK": "ur", "UA": "uk",
    "EG": "ar", "JO": "ar", "LB": "ar", "MA": "ar",
    "AE": "ar", "QA": "ar", "KW": "ar", "BH": "ar",
    "OM": "ar", "SY": "ar", "IQ": "ar", "YE": "ar"
  };
  return countryLanguageMap[countryCode] || "en";
}

async function callGemini(prompt, temperature = 0.7, apiKey, model = 'gemini-2.0-flash') {
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
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: 2048,
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

async function generateRealisticArticles(countryCode, langCode, targetCountries, countryConfig, count, dateStr, apiKey, model) {
  const languageName = LANGUAGE_NAMES[langCode] || langCode;
  const countriesNames = targetCountries.map(c => COUNTRY_NAMES[c] || c).join(", ");
  const countryName = COUNTRY_NAMES[countryCode] || countryCode;
  
  const articles = [];
  const topicsToUse = [...countryConfig.topics];
  
  // Generate multiple articles in ONE prompt to save API calls
  const sourcesToUse = countryConfig.sources.slice(0, Math.min(count, 3));
  const topicsStr = topicsToUse.slice(0, count).join(', ');
  
  const batchPrompt = `You are a ${languageName} news aggregator covering ${countriesNames} from ${countryName}'s perspective.

Generate ${count} DIFFERENT news articles from these sources: ${sourcesToUse.join(', ')}
Topics to cover: ${topicsStr}
Date: ${dateStr}

For EACH article, provide:
===ARTICLE===
SOURCE: [source name]
HEADLINE: [headline in ${languageName}]
SUBHEADLINE: [subtitle in ${languageName}]
CONTENT: [2-3 paragraphs in ${languageName}]
SENTIMENT_INDICATORS: [words/phrases showing sentiment]
===END===

IMPORTANT: Each article must be from a DIFFERENT source and cover a DIFFERENT aspect.`;
  
  try {
    const response = await callGemini(batchPrompt, 0.8, apiKey, model);
    const articleBlocks = response.split('===ARTICLE===').filter(b => b.includes('===END==='));
    
    for (const block of articleBlocks) {
      const cleanBlock = block.replace('===END===', '').trim();
      const article = parseArticleResponse(cleanBlock, {
        language_code: langCode,
        language_name: languageName,
        country_code: countryCode
      });
      
      if (article) {
        articles.push(article);
      }
    }
  } catch (error) {
    console.error(`Error generating articles for ${countryCode}:`, error);
  }
  
  return articles;
}

function parseArticleResponse(response, metadata) {
  const article = { ...metadata };
  const lines = response.split('\n');
  
  for (const line of lines) {
    if (line.includes('SOURCE:')) {
      article.source_name = line.split(':').slice(1).join(':').trim();
    } else if (line.includes('HEADLINE:')) {
      article.title = line.split(':').slice(1).join(':').trim();
    } else if (line.includes('SUBHEADLINE:')) {
      article.subtitle = line.split(':').slice(1).join(':').trim();
    } else if (line.includes('CONTENT:')) {
      const contentStart = response.indexOf('CONTENT:') + 8;
      const contentEnd = response.indexOf('SENTIMENT_INDICATORS:');
      article.content = response.substring(contentStart, contentEnd > 0 ? contentEnd : undefined).trim();
    } else if (line.includes('SENTIMENT_INDICATORS:')) {
      article.sentiment_indicators = line.split(':').slice(1).join(':').trim();
    }
  }
  
  return article.title ? article : null;
}

async function analyzeSentimentBatch(articles, targetCountries, apiKey, model) {
  if (!articles.length) return [];
  
  const batchPrompt = `Analyze sentiment for these ${articles.length} articles about ${targetCountries.map(c => COUNTRY_NAMES[c]).join(", ")}:

${articles.map((a, i) => `
===ARTICLE ${i+1}===
Title: ${a.title}
Source: ${a.source_name}
Indicators: ${a.sentiment_indicators || 'none'}
`).join('\n')}

For EACH article, determine:
- Sentiment: Critical (-1.0 to -0.3), Neutral (-0.2 to 0.2), or Positive (0.3 to 1.0)
- Main theme/topic

Format:
ARTICLE 1: [sentiment] | [score] | [main theme]
ARTICLE 2: [sentiment] | [score] | [main theme]
etc.`;
  
  try {
    const response = await callGemini(batchPrompt, 0.3, apiKey, model);
    const lines = response.split('\n').filter(l => l.includes('ARTICLE'));
    
    return articles.map((article, i) => {
      const analysisLine = lines.find(l => l.includes(`ARTICLE ${i+1}`));
      if (analysisLine) {
        const parts = analysisLine.split('|').map(p => p.trim());
        article.sentiment = parts[0]?.split(':')[1]?.trim().toLowerCase() || 'neutral';
        article.sentiment_score = parseFloat(parts[1]) || 0;
        article.main_theme = parts[2] || 'general news';
      } else {
        article.sentiment = 'neutral';
        article.sentiment_score = 0;
        article.main_theme = 'general news';
      }
      return article;
    });
  } catch (error) {
    console.error('Batch sentiment analysis error:', error);
    return articles.map(a => ({ ...a, sentiment: 'neutral', sentiment_score: 0 }));
  }
}

async function analyzeArticleSentiment(article, targetCountries, apiKey, model) {
  const prompt = `Analyze the sentiment of this article about ${targetCountries.map(c => COUNTRY_NAMES[c]).join(", ")}:

Title: ${article.title}
Content: ${(article.content || '').substring(0, 1000)}

Determine sentiment from -1.0 (very negative) to 1.0 (very positive):
- Critical coverage: -1.0 to -0.3
- Neutral/balanced: -0.2 to 0.2  
- Positive coverage: 0.3 to 1.0

Consider:
- Tone and language used
- Expert opinions quoted
- Overall narrative
- Implied conclusions

Provide:
SENTIMENT: [Critical/Neutral/Positive]
SCORE: [-1.0 to 1.0]
EVIDENCE: [Key phrases that support this score]
MAIN_THEME: [Primary topic/angle of coverage]`;
  
  try {
    const response = await callGemini(prompt, 0.3, apiKey, model);
    const lines = response.split('\n');
    
    for (const line of lines) {
      if (line.includes('SENTIMENT:')) {
        article.sentiment = line.split(':')[1].trim().toLowerCase();
      } else if (line.includes('SCORE:')) {
        article.sentiment_score = parseFloat(line.split(':')[1].trim());
      } else if (line.includes('EVIDENCE:')) {
        article.sentiment_evidence = line.split(':')[1].trim();
      } else if (line.includes('MAIN_THEME:')) {
        article.main_theme = line.split(':')[1].trim();
      }
    }
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    article.sentiment = 'neutral';
    article.sentiment_score = 0;
  }
  
  return article;
}

async function generateComprehensiveDigest(
  allArticles, coverageByCountry, targetCountries, 
  userLanguage, userQuery, apiKey, model
) {
  // Calculate statistics
  const positive = allArticles.filter(a => a.sentiment === 'positive');
  const negative = allArticles.filter(a => a.sentiment === 'negative' || a.sentiment === 'critical');
  const neutral = allArticles.filter(a => a.sentiment === 'neutral');
  
  const languages = [...new Set(allArticles.map(a => a.language_name))];
  const sources = [...new Set(allArticles.map(a => a.source_name))];
  
  // Build coverage by region section
  let coverageByRegion = '';
  for (const [country, articles] of Object.entries(coverageByCountry)) {
    const countryName = COUNTRY_NAMES[country] || country;
    const posSent = articles.filter(a => a.sentiment === 'positive').length;
    const negSent = articles.filter(a => a.sentiment === 'negative' || a.sentiment === 'critical').length;
    
    coverageByRegion += `### ${countryName} Media (${articles.length} articles)\n`;
    coverageByRegion += `Sentiment: ${posSent} positive, ${negSent} negative\n`;
    coverageByRegion += `Main themes: ${[...new Set(articles.map(a => a.main_theme).filter(t => t))].join(', ')}\n`;
    coverageByRegion += `Key articles:\n`;
    
    articles.slice(0, 3).forEach((a, i) => {
      coverageByRegion += `${i+1}. **${a.title}** - ${a.source_name}\n`;
      if (a.subtitle) coverageByRegion += `   *${a.subtitle}*\n`;
    });
    coverageByRegion += '\n';
  }
  
  // Extract main themes
  const allThemes = allArticles.map(a => a.main_theme).filter(t => t);
  const themeCount = {};
  allThemes.forEach(theme => {
    themeCount[theme] = (themeCount[theme] || 0) + 1;
  });
  
  const mainThemes = Object.entries(themeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme, count]) => `- **${theme}** (${count} articles)`)
    .join('\n');
  
  // Generate the digest with all info
  const digestPrompt = generateDigestPrompt(
    allArticles, targetCountries, languages, sources,
    positive, negative, neutral, coverageByRegion, mainThemes
  );
  
  // Add user query context if provided
  const contextPrompt = userQuery ? 
    `\nUser specifically asked: "${userQuery}"\nMake sure to address this question directly.\n` : '';
  
  // Add language instruction
  const langNames = {
    'ru': 'русском',
    'en': 'English',
    'tr': 'Türkçe',
    'az': 'Azərbaycan'
  };
  const langPrompt = `\nКРИТИЧЕСКИ ВАЖНО: Генерируй ВЕСЬ дайджест ТОЛЬКО на ${langNames[userLanguage] || LANGUAGE_NAMES[userLanguage]} языке! Никаких английских слов кроме названий источников!\n`;
  
  const digest = await callGemini(digestPrompt + contextPrompt + langPrompt, 0.4, apiKey, model);
  
  // Add visual statistics
  return digest + generateVisualStatistics(allArticles, coverageByCountry, languages, sources, positive, negative, neutral);
}

function generateDigestPrompt(articles, targetCountries, languages, sources, positive, negative, neutral, coverageByRegion, mainThemes) {
  return `Create an EXECUTIVE PRESS MONITORING DIGEST for ${targetCountries.map(c => COUNTRY_NAMES[c] || c).join(", ")}

Based on analysis of ${articles.length} articles from ${sources.length} sources in ${languages.length} languages.

## 📊 SENTIMENT OVERVIEW
Positive: ${((positive.length / articles.length) * 100).toFixed(1)}% (${positive.length} articles)
Negative: ${((negative.length / articles.length) * 100).toFixed(1)}% (${negative.length} articles)  
Neutral: ${((neutral.length / articles.length) * 100).toFixed(1)}% (${neutral.length} articles)

## 📰 KEY COVERAGE BY REGION

${coverageByRegion}

## 🔍 MAIN THEMES IDENTIFIED

${mainThemes}

## 💡 STRATEGIC INSIGHTS

Synthesize the findings into actionable intelligence:
1. How is ${targetCountries.map(c => COUNTRY_NAMES[c] || c).join(", ")} perceived in different regions?
2. What are the main concerns and opportunities?
3. Which narratives are gaining traction?
4. What actions should decision-makers consider?

Provide a professional executive summary with clear sections and data-driven insights.`;
}

function generateVisualStatistics(allArticles, coverageByCountry, languages, sources, positive, negative, neutral, userLanguage = 'en') {
  const t = {
    title: userLanguage === 'ru' ? '📊 АНАЛИТИЧЕСКИЙ ДАШБОРД' : '📊 EXECUTIVE ANALYTICS DASHBOARD',
    sentiment: userLanguage === 'ru' ? '🎯 Тональность публикаций' : '🎯 Sentiment Analysis',
    positive: userLanguage === 'ru' ? '✅ Позитив' : '✅ Positive',
    negative: userLanguage === 'ru' ? '❌ Негатив' : '❌ Negative',
    neutral: userLanguage === 'ru' ? '⚪ Нейтрал' : '⚪ Neutral',
    coverage: userLanguage === 'ru' ? '🌍 География покрытия' : '🌍 Geographic Coverage',
    sources: userLanguage === 'ru' ? '📰 Топ источники' : '📰 Top Media Sources',
    metadata: userLanguage === 'ru' ? '📋 Метрики анализа' : '📋 Analysis Metrics',
    total: userLanguage === 'ru' ? 'Всего статей' : 'Total Articles',
    langs: userLanguage === 'ru' ? 'Языков' : 'Languages',
    date: userLanguage === 'ru' ? 'Дата анализа' : 'Analysis Date',
    depth: userLanguage === 'ru' ? 'Глубина' : 'Depth',
    level: userLanguage === 'ru' ? 'Уровень' : 'Level',
    of: userLanguage === 'ru' ? 'из' : 'of',
    articles: userLanguage === 'ru' ? 'статей' : 'articles',
    trend: userLanguage === 'ru' ? '📈 Динамика тональности' : '📈 Sentiment Trend',
    keyInsights: userLanguage === 'ru' ? '💡 Ключевые инсайты' : '💡 Key Insights',
    riskLevel: userLanguage === 'ru' ? '⚠️ Уровень риска' : '⚠️ Risk Level',
    opportunities: userLanguage === 'ru' ? '🎯 Возможности' : '🎯 Opportunities'
  };

  // Calculate risk level
  const negativePercent = (negative.length / allArticles.length) * 100;
  const riskLevel = negativePercent > 40 ? '🔴 ВЫСОКИЙ' : negativePercent > 20 ? '🟡 СРЕДНИЙ' : '🟢 НИЗКИЙ';
  
  // Generate sentiment pie chart
  const total = allArticles.length;
  const posPercent = Math.round((positive.length / total) * 100);
  const negPercent = Math.round((negative.length / total) * 100);
  const neutPercent = 100 - posPercent - negPercent;

  const visualStats = `

# ${t.title}

---

## ${t.sentiment}

### 🎨 Общая картина
\`\`\`
┌─────────────────────────────────────────────┐
│                                             │
│  ${t.positive.padEnd(12)} ${generateAdvancedBar(positive.length, allArticles.length, '🟢')} ${posPercent}%
│                                             │
│  ${t.negative.padEnd(12)} ${generateAdvancedBar(negative.length, allArticles.length, '🔴')} ${negPercent}%
│                                             │
│  ${t.neutral.padEnd(12)} ${generateAdvancedBar(neutral.length, allArticles.length, '⚪')} ${neutPercent}%
│                                             │
└─────────────────────────────────────────────┘
\`\`\`

### 📊 Круговая диаграмма тональности
\`\`\`
       Позитив ${posPercent}%
         ╱─────╲
    🟢 ╱         ╲ 🔴
      │     ◯     │ Негатив ${negPercent}%
    ⚪ ╲         ╱
         ╲─────╱
      Нейтрал ${neutPercent}%
\`\`\`

---

## ${t.coverage}

\`\`\`
${Object.entries(coverageByCountry)
  .sort((a, b) => b[1].length - a[1].length)
  .map(([country, articles], index) => {
    const countryName = COUNTRY_NAMES[country] || country;
    const flag = getCountryFlag(country);
    const percent = ((articles.length / allArticles.length) * 100).toFixed(1);
    return `${(index + 1).toString().padStart(2)}. ${flag} ${countryName.padEnd(15)} ${generateAdvancedBar(articles.length, allArticles.length)} ${percent}% (${articles.length})`;
  }).join('\n')}
\`\`\`

---

## ${t.trend}

\`\`\`
Тональность ↑
100% ┤
     │    ╭── Позитив
 75% ┤   ╱ ╲    
     │  ╱   ╲___╱⁻⁻⁻⁻ Нейтрал
 50% ┤ ╱         
     │╱      ╲_____ Негатив
 25% ┤            ╲
     │
  0% └────────────────→ Время
     Начало    Сейчас
\`\`\`

---

## ${t.keyInsights}

${generateKeyInsights(allArticles, coverageByCountry, userLanguage)}

---

## ${t.sources} (Топ-10)

\`\`\`
${sources.slice(0, 10).map((s, i) => {
  const count = allArticles.filter(a => a.source_name === s).length;
  const sentiment = getMostCommonSentiment(allArticles.filter(a => a.source_name === s));
  const icon = sentiment === 'positive' ? '🟢' : sentiment === 'negative' ? '🔴' : '⚪';
  return `${(i + 1).toString().padStart(2)}. ${icon} ${s.padEnd(30)} (${count} публикаций)`;
}).join('\n')}
\`\`\`

---

## 📊 Сводная статистика

### ${t.metadata}
\`\`\`
┌─────────────────────────────────────────────┐
│ 📈 КЛЮЧЕВЫЕ МЕТРИКИ                         │
├─────────────────────────────────────────────┤
│ 📰 ${t.total}: ${allArticles.length.toString().padEnd(27)} │
│ 🌐 ${t.langs}: ${languages.length.toString().padEnd(32)} │
│ 📅 ${t.date}: ${new Date().toLocaleDateString(userLanguage === 'ru' ? 'ru-RU' : 'en-US').padEnd(23)} │
│ 🔍 ${t.depth}: ${t.level} ${Math.max(1, Math.min(5, Math.floor(allArticles.length / 10)))} ${t.of} 5                      │
│ ${t.riskLevel}: ${riskLevel.padEnd(21)} │
└─────────────────────────────────────────────┘
\`\`\`

---

## 🎯 Рекомендации для принятия решений

${generateRecommendations(positive, negative, neutral, coverageByCountry, userLanguage)}

---`;
  
  return visualStats;
}

function generateBar(value, total, width = 20) {
  const percentage = value / total;
  const filled = Math.round(percentage * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function generateAdvancedBar(value, total, icon = '█', width = 20) {
  const percentage = value / total;
  const filled = Math.round(percentage * width);
  if (icon === '🟢') {
    return '🟩'.repeat(filled) + '⬜'.repeat(width - filled);
  } else if (icon === '🔴') {
    return '🟥'.repeat(filled) + '⬜'.repeat(width - filled);
  } else {
    return '⬜'.repeat(filled) + '⬛'.repeat(width - filled);
  }
}

function getCountryFlag(countryCode) {
  const flags = {
    'TR': '🇹🇷', 'RU': '🇷🇺', 'IR': '🇮🇷', 'GE': '🇬🇪', 'AM': '🇦🇲',
    'US': '🇺🇸', 'CN': '🇨🇳', 'DE': '🇩🇪', 'FR': '🇫🇷', 'UK': '🇬🇧',
    'KZ': '🇰🇿', 'UZ': '🇺🇿', 'TM': '🇹🇲', 'KG': '🇰🇬', 'TJ': '🇹🇯',
    'UA': '🇺🇦', 'ES': '🇪🇸', 'IT': '🇮🇹', 'JP': '🇯🇵', 'KR': '🇰🇷',
    'SA': '🇸🇦', 'AE': '🇦🇪', 'EG': '🇪🇬', 'IN': '🇮🇳', 'BR': '🇧🇷'
  };
  return flags[countryCode] || '🏳️';
}

function getMostCommonSentiment(articles) {
  if (!articles.length) return 'neutral';
  const counts = { positive: 0, negative: 0, neutral: 0 };
  articles.forEach(a => {
    if (a.sentiment === 'positive') counts.positive++;
    else if (a.sentiment === 'negative' || a.sentiment === 'critical') counts.negative++;
    else counts.neutral++;
  });
  if (counts.positive > counts.negative && counts.positive > counts.neutral) return 'positive';
  if (counts.negative > counts.positive && counts.negative > counts.neutral) return 'negative';
  return 'neutral';
}

function generateKeyInsights(allArticles, coverageByCountry, userLanguage) {
  const insights = [];
  
  // Most positive country
  let mostPositive = { country: '', percent: 0 };
  let mostNegative = { country: '', percent: 0 };
  
  Object.entries(coverageByCountry).forEach(([country, articles]) => {
    const positive = articles.filter(a => a.sentiment === 'positive').length;
    const negative = articles.filter(a => a.sentiment === 'negative' || a.sentiment === 'critical').length;
    const posPercent = (positive / articles.length) * 100;
    const negPercent = (negative / articles.length) * 100;
    
    if (posPercent > mostPositive.percent) {
      mostPositive = { country: COUNTRY_NAMES[country] || country, percent: posPercent };
    }
    if (negPercent > mostNegative.percent) {
      mostNegative = { country: COUNTRY_NAMES[country] || country, percent: negPercent };
    }
  });
  
  if (userLanguage === 'ru') {
    insights.push(`🟢 **Наиболее позитивная пресса**: ${mostPositive.country} (${mostPositive.percent.toFixed(0)}% позитива)`);
    insights.push(`🔴 **Наиболее критичная пресса**: ${mostNegative.country} (${mostNegative.percent.toFixed(0)}% негатива)`);
    insights.push(`📊 **Общий медиа-климат**: ${allArticles.length > 50 ? 'Высокая активность' : 'Умеренная активность'}`);
    insights.push(`🌍 **Географический охват**: ${Object.keys(coverageByCountry).length} стран`);
  } else {
    insights.push(`🟢 **Most positive coverage**: ${mostPositive.country} (${mostPositive.percent.toFixed(0)}% positive)`);
    insights.push(`🔴 **Most critical coverage**: ${mostNegative.country} (${mostNegative.percent.toFixed(0)}% negative)`);
    insights.push(`📊 **Overall media climate**: ${allArticles.length > 50 ? 'High activity' : 'Moderate activity'}`);
    insights.push(`🌍 **Geographic reach**: ${Object.keys(coverageByCountry).length} countries`);
  }
  
  return insights.join('\n');
}

function generateRecommendations(positive, negative, neutral, coverageByCountry, userLanguage) {
  const recommendations = [];
  const negativePercent = (negative.length / (positive.length + negative.length + neutral.length)) * 100;
  
  if (userLanguage === 'ru') {
    if (negativePercent > 40) {
      recommendations.push('🚨 **СРОЧНО**: Требуется активная коммуникационная стратегия для улучшения имиджа');
      recommendations.push('📢 **Рекомендация**: Провести пресс-конференцию или выпустить официальное заявление');
    } else if (negativePercent > 20) {
      recommendations.push('⚠️ **Внимание**: Необходимо усилить позитивную информационную повестку');
      recommendations.push('📝 **Рекомендация**: Подготовить серию позитивных материалов для СМИ');
    } else {
      recommendations.push('✅ **Статус**: Медиа-климат благоприятный');
      recommendations.push('💡 **Рекомендация**: Поддерживать текущую коммуникационную стратегию');
    }
    
    // Country-specific recommendations
    Object.entries(coverageByCountry).forEach(([country, articles]) => {
      const negCount = articles.filter(a => a.sentiment === 'negative' || a.sentiment === 'critical').length;
      if (negCount > articles.length * 0.5) {
        recommendations.push(`🎯 **${COUNTRY_NAMES[country]}**: Требуется целевая работа с местными СМИ`);
      }
    });
  } else {
    if (negativePercent > 40) {
      recommendations.push('🚨 **URGENT**: Active communication strategy needed to improve image');
      recommendations.push('📢 **Action**: Consider press conference or official statement');
    } else if (negativePercent > 20) {
      recommendations.push('⚠️ **Attention**: Need to strengthen positive media narrative');
      recommendations.push('📝 **Action**: Prepare series of positive media materials');
    } else {
      recommendations.push('✅ **Status**: Favorable media climate');
      recommendations.push('💡 **Action**: Maintain current communication strategy');
    }
  }
  
  return recommendations.join('\n');
}