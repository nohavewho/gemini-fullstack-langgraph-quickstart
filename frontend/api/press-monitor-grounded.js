/**
 * Press Monitor with Google Search Grounding
 * Uses Gemini's grounding feature to search real news
 */

export const config = {
  runtime: 'edge',
  maxDuration: 300, // Pro account limit - 5 minutes
};

// Language configurations from backend
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
  'hi': 'Hindi',
  'ka': 'Georgian',
  'hy': 'Armenian',
  'az': 'Azerbaijani',
  'kk': 'Kazakh',
  'uz': 'Uzbek',
  'tk': 'Turkmen',
  'ky': 'Kyrgyz',
  'tg': 'Tajik'
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
  "UK": "United Kingdom",
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
  "YE": "Yemen",
  "UA": "Ukraine",
  "BY": "Belarus",
  "ES": "Spain",
  "IT": "Italy",
  "PT": "Portugal",
  "JP": "Japan",
  "KR": "South Korea",
  "IN": "India",
  "PK": "Pakistan",
  "TH": "Thailand",
  "ID": "Indonesia",
  "MY": "Malaysia",
  "VN": "Vietnam",
  "PH": "Philippines"
};

// Prompts from backend
const PROMPTS = {
  multiLanguageSearch: `Generate search queries in {language_name} for {target_countries_names}.

YOU MUST:
1. Translate country names to {language_name} YOURSELF
2. Use ONLY {language_name} for ALL search terms
3. Create natural queries a local would use

Target countries: {target_countries_names}
Date: {current_date}

Output 3-5 queries, one per line.`,

  headlineFilter: `HEADLINE ANALYSIS: Look at these headlines and decide - do they show {country_name}'s OPINION/PERSPECTIVE about {target_countries}?

Language: {language_code} 
Country/Region: {country_name}

Headlines found:
{headlines_text}

QUESTION: Which headlines show how {country_name} VIEWS or DISCUSSES {target_countries}?

INCLUDE headlines that show:
✅ {country_name}'s diplomatic position on {target_countries}
✅ {country_name}'s economic relations with {target_countries}  
✅ {country_name}'s political commentary about {target_countries}
✅ How {country_name} media analyzes {target_countries}'s actions
✅ {country_name}'s stance on {target_countries} conflicts/policies

EXCLUDE headlines about:
❌ Sports matches/results (football, UEFA, etc.)
❌ Weather/tourism
❌ Internal {target_countries} news (we want EXTERNAL view)
❌ Headlines that don't actually mention {target_countries}
❌ Entertainment/celebrity news
❌ Technical/economic data without political context

Focus: Does this headline reflect {country_name}'s PERSPECTIVE on {target_countries}?

Return only the numbers separated by commas (e.g. "1,3,7")
If NO headlines show country's opinion about {target_countries}, return "NONE"`,

  sentimentAnalysis: `Analyze sentiment for: {title}
About countries: {target_countries_names}

Score from -1.0 (critical) to 1.0 (positive):
- Critical: -1.0 to -0.3
- Neutral: -0.2 to 0.2  
- Positive: 0.3 to 1.0

Provide:
SENTIMENT: [Critical/Neutral/Positive]
SCORE: [-1.0 to 1.0]
EVIDENCE: [Key phrases supporting score]
COUNTRY_SCORES: [Individual scores per country if multiple]`
};

export default async function handler(request) {
  console.log('Press monitor grounded handler called');
  console.log('Request method:', request.method);
  console.log('Environment check - GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
  console.log('Environment check - GOOGLE_AI_API_KEY exists:', !!process.env.GOOGLE_AI_API_KEY);
  
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
    console.log('Request body:', JSON.stringify(body));
    
    const { 
      mode = 'neighbors_priority', 
      options = {},
      effortLevel = 3,
      model = 'gemini-2.0-flash',
      searchQuery = '',
      userLanguage = 'en'
    } = body;

    // Default target country is Azerbaijan
    let targetCountries = ['AZ'];
    let sourceCountries = [];
    let maxArticles = Math.min(effortLevel, 5); // Max 5 articles for real search to stay under 60s
    
    // AI-powered query understanding if searchQuery provided
    if (searchQuery) {
      try {
        const queryAnalysis = await analyzeUserQuery(
          searchQuery, 
          process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
          model
        );
        if (queryAnalysis.targetCountries && queryAnalysis.targetCountries.length > 0) {
          targetCountries = queryAnalysis.targetCountries;
        }
        if (queryAnalysis.sourceCountries && queryAnalysis.sourceCountries.length > 0) {
          sourceCountries = queryAnalysis.sourceCountries;
        }
      } catch (error) {
        console.error('Error analyzing query:', error);
      }
    }

    // Map mode to source countries if not set by query
    if (sourceCountries.length === 0) {
      switch (mode) {
      case 'neighbors_priority':
        sourceCountries = ['TR', 'RU', 'IR', 'GE', 'AM'];
        maxArticles = 20;
        break;
      case 'central_asia_focus':
        sourceCountries = ['KZ', 'UZ', 'TM', 'KG', 'TJ'];
        maxArticles = 15;
        break;
      case 'southeast_asia_scan':
        sourceCountries = ['TH', 'ID', 'MY', 'VN', 'PH'];
        maxArticles = 10;
        break;
      case 'global_scan':
        sourceCountries = [];
        maxArticles = 5;
        break;
      case 'europe_monitor':
        sourceCountries = ['DE', 'FR', 'IT', 'ES', 'UK'];
        maxArticles = 10;
        break;
      case 'asia_comprehensive':
        sourceCountries = ['CN', 'JP', 'KR', 'IN', 'PK'];
        maxArticles = 8;
        break;
      case 'custom':
        if (options.countries && options.countries.length > 0) {
          sourceCountries = options.countries;
        }
        break;
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

    // Run the press monitoring
    console.log('Starting press monitor with:', { targetCountries, sourceCountries, maxArticles });
    const result = await runPressMonitor(targetCountries, sourceCountries, maxArticles, model, userLanguage);
    console.log('Press monitor completed');
    
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
    console.error('Error stack:', error.stack);
    console.error('Error type:', error.constructor.name);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack,
      type: error.constructor.name
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}

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

// Main press monitoring logic
async function runPressMonitor(targetCountries, sourceCountries, maxArticles, model, userLanguage) {
  const startTime = Date.now();
  // In Vercel Edge Runtime, env vars are available via process.env
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  // Determine languages to search
  let languagesToSearch = [];
  if (sourceCountries.length > 0) {
    languagesToSearch = sourceCountries.map(c => getCountryLanguageCode(c));
  } else {
    languagesToSearch = ['en', 'ru', 'tr', 'ar', 'fa', 'zh', 'de', 'fr'];
  }
  languagesToSearch = [...new Set(languagesToSearch)];

  // Get current date filter
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dateFilter = `after:${today} before:${tomorrow}`;

  // Phase 1: Search articles with grounding
  const allArticles = [];
  for (const langCode of languagesToSearch) {
    try {
      const queries = await createSearchQueries(langCode, targetCountries, GEMINI_API_KEY, model);
      
      for (const query of queries) {
        const articles = await searchNewsWithGrounding(query, langCode, dateFilter, GEMINI_API_KEY, model);
        allArticles.push(...articles);
      }
    } catch (error) {
      console.error(`Error processing ${langCode}:`, error);
    }
  }

  // Filter articles by headlines
  const filteredArticles = await filterArticlesByHeadlines(allArticles, targetCountries, GEMINI_API_KEY, model);
  
  // Limit articles
  const articlesToAnalyze = filteredArticles.slice(0, maxArticles);

  // Phase 2: Sentiment Analysis
  const analyzedArticles = [];
  for (const article of articlesToAnalyze) {
    const analyzed = await analyzeArticleSentiment(article, targetCountries, GEMINI_API_KEY, model);
    analyzedArticles.push(analyzed);
  }

  // Phase 3: Generate Digest
  const digest = await generateDigest(analyzedArticles, targetCountries, GEMINI_API_KEY, model, userLanguage);
  
  return digest;
}

// Helper function for delays
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Call Gemini with grounding
async function callGeminiWithGrounding(prompt, apiKey, model = 'gemini-2.0-flash') {
  await delay(1000); // Small delay to avoid rate limits
  
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
        maxOutputTokens: 2048,
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

// Regular Gemini call without grounding
async function callGemini(prompt, temperature = 0.7, apiKey, model = 'gemini-2.0-flash') {
  await delay(1000);
  
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

function getCountryLanguageCode(countryCode) {
  const countryLanguageMap = {
    "TR": "tr", "RU": "ru", "IR": "fa", "CN": "zh",
    "DE": "de", "FR": "fr", "US": "en", "UK": "en", 
    "GE": "ka", "AM": "hy", "KZ": "kk", "UZ": "uz",
    "TM": "tk", "KG": "ky", "TJ": "tg", "ES": "es",
    "IT": "it", "PT": "pt", "JP": "ja", "KR": "ko",
    "SA": "ar", "IN": "hi", "PK": "ur", "TH": "th",
    "ID": "id", "MY": "ms", "VN": "vi", "PH": "tl"
  };
  return countryLanguageMap[countryCode] || "en";
}

async function createSearchQueries(languageCode, targetCountries, apiKey, model) {
  const countriesNames = targetCountries.map(c => COUNTRY_NAMES[c] || c).join(", ");
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  const prompt = PROMPTS.multiLanguageSearch
    .replace(/{language_name}/g, LANGUAGE_NAMES[languageCode] || languageCode)
    .replace(/{target_countries_names}/g, countriesNames)
    .replace('{current_date}', currentDate);
  
  try {
    const response = await callGemini(prompt, 0.7, apiKey, model);
    const queries = response.split('\n').filter(q => q.trim()).slice(0, 5);
    return queries;
  } catch (error) {
    console.error(`Error creating queries for ${languageCode}:`, error);
    return [countriesNames];
  }
}

async function searchNewsWithGrounding(query, languageCode, dateFilter, apiKey, model) {
  const searchPrompt = `${query} ${dateFilter}`;
  
  try {
    const response = await callGeminiWithGrounding(searchPrompt, apiKey, model);
    console.log('Search performed:', response.candidates?.[0]?.content?.parts?.[0]?.text || 'No text');
    
    const articles = [];
    
    // Extract articles from grounding metadata
    if (response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];
      
      // Check grounding metadata
      if (candidate.groundingMetadata && candidate.groundingMetadata.groundingChunks) {
        for (const chunk of candidate.groundingMetadata.groundingChunks) {
          if (chunk.web) {
            const web = chunk.web;
            articles.push({
              url: web.uri || '',
              title: web.title || 'No title',
              source_name: extractSourceName(web.uri || ''),
              language_code: languageCode,
              language_name: LANGUAGE_NAMES[languageCode] || languageCode,
              search_query: query,
              content: candidate.content?.parts?.[0]?.text || ''
            });
          }
        }
      }
      
      // Also check search entry point if available
      if (candidate.groundingMetadata && candidate.groundingMetadata.searchEntryPoint) {
        console.log('Search performed:', candidate.groundingMetadata.searchEntryPoint.renderedContent);
      }
    }
    
    return articles;
  } catch (error) {
    console.error(`Error searching for "${query}":`, error);
    return [];
  }
}

function extractSourceName(url) {
  try {
    const urlObj = new URL(url);
    let domain = urlObj.hostname;
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
  } catch {
    return 'Unknown Source';
  }
}

async function filterArticlesByHeadlines(articles, targetCountries, apiKey, model) {
  if (!articles.length) return articles;
  
  // Group articles by language
  const articlesByLang = {};
  for (const article of articles) {
    const lang = article.language_code;
    if (!articlesByLang[lang]) {
      articlesByLang[lang] = [];
    }
    articlesByLang[lang].push(article);
  }
  
  const filteredArticles = [];
  
  // Filter each language group
  for (const [langCode, langArticles] of Object.entries(articlesByLang)) {
    const countriesNames = targetCountries.map(c => COUNTRY_NAMES[c] || c).join(", ");
    const countryName = getCountryNameForLanguage(langCode);
    
    const headlinesText = langArticles.map((a, i) => `${i+1}. [${a.source_name}] ${a.title}`).join('\n');
    
    const prompt = PROMPTS.headlineFilter
      .replace(/{country_name}/g, countryName)
      .replace(/{target_countries}/g, countriesNames)
      .replace('{language_code}', langCode)
      .replace('{headlines_text}', headlinesText);
    
    try {
      const response = await callGemini(prompt, 0.3, apiKey, model);
      const result = response.trim();
      
      if (result !== "NONE") {
        const indices = result.split(',').map(x => parseInt(x.trim()) - 1).filter(i => i >= 0 && i < langArticles.length);
        for (const i of indices) {
          filteredArticles.push(langArticles[i]);
        }
      }
    } catch (error) {
      console.error(`Error filtering headlines for ${langCode}:`, error);
      // Keep all articles if filtering fails
      filteredArticles.push(...langArticles);
    }
  }
  
  return filteredArticles;
}

function getCountryNameForLanguage(langCode) {
  const langToCountry = {
    "uk": "Ukraine", "ru": "Russia", "tr": "Turkey", "de": "Germany", 
    "fr": "France", "es": "Spain", "it": "Italy", "pl": "Poland",
    "en": "International English-speaking media", "ar": "Arab countries",
    "fa": "Iran", "az": "Azerbaijan itself", "ka": "Georgia", "hy": "Armenia",
    "kk": "Kazakhstan", "uz": "Uzbekistan", "tk": "Turkmenistan",
    "ky": "Kyrgyzstan", "tg": "Tajikistan", "zh": "China", "ja": "Japan",
    "ko": "South Korea", "th": "Thailand", "id": "Indonesia", "ms": "Malaysia",
    "vi": "Vietnam", "tl": "Philippines"
  };
  return langToCountry[langCode] || `country using ${langCode} language`;
}

async function analyzeArticleSentiment(article, targetCountries, apiKey, model) {
  const countriesNames = targetCountries.map(c => COUNTRY_NAMES[c] || c).join(", ");
  
  const prompt = PROMPTS.sentimentAnalysis
    .replace('{title}', article.title)
    .replace('{target_countries_names}', countriesNames);
  
  try {
    const response = await callGemini(prompt, 0.3, apiKey, model);
    const lines = response.split('\n');
    
    let sentiment = 'neutral';
    let score = 0.0;
    let evidence = '';
    
    for (const line of lines) {
      if (line.includes('SENTIMENT:')) {
        sentiment = line.split(':')[1].trim().toLowerCase();
      } else if (line.includes('SCORE:')) {
        score = parseFloat(line.split(':')[1].trim());
      } else if (line.includes('EVIDENCE:')) {
        evidence = line.split(':')[1].trim();
      }
    }
    
    return {
      ...article,
      sentiment,
      sentiment_score: score,
      sentiment_explanation: evidence
    };
  } catch (error) {
    console.error(`Error analyzing sentiment:`, error);
    return {
      ...article,
      sentiment: 'neutral',
      sentiment_score: 0.0,
      sentiment_explanation: 'Analysis failed'
    };
  }
}

async function generateDigest(articles, targetCountries, apiKey, model, userLanguage = 'en') {
  const positiveArticles = articles.filter(a => a.sentiment === 'positive');
  const negativeArticles = articles.filter(a => a.sentiment === 'negative' || a.sentiment === 'critical');
  const neutralArticles = articles.filter(a => a.sentiment === 'neutral');
  
  const languages = [...new Set(articles.map(a => a.language_name))];
  const sources = [...new Set(articles.map(a => a.source_name))];
  
  const digestPrompt = `Generate a comprehensive press monitoring digest for ${targetCountries.map(c => COUNTRY_NAMES[c] || c).join(", ")} based on the following data:

## STATISTICS
- Total Articles: ${articles.length}
- Languages: ${languages.length} (${languages.join(', ')})
- Sources: ${sources.length}

## SENTIMENT ANALYSIS
- Positive: ${positiveArticles.length} articles (${(positiveArticles.length / articles.length * 100).toFixed(1)}%)
- Negative: ${negativeArticles.length} articles (${(negativeArticles.length / articles.length * 100).toFixed(1)}%)
- Neutral: ${neutralArticles.length} articles (${(neutralArticles.length / articles.length * 100).toFixed(1)}%)

## POSITIVE COVERAGE (${positiveArticles.length} articles)
${positiveArticles.slice(0, 3).map((a, i) => `${i+1}. **${a.title}** - ${a.source_name} (${a.language_name})`).join('\n')}

## NEGATIVE COVERAGE (${negativeArticles.length} articles)
${negativeArticles.slice(0, 3).map((a, i) => `${i+1}. **${a.title}** - ${a.source_name} (${a.language_name})`).join('\n')}

## NEUTRAL COVERAGE (${neutralArticles.length} articles)
${neutralArticles.slice(0, 3).map((a, i) => `${i+1}. **${a.title}** - ${a.source_name} (${a.language_name})`).join('\n')}

TASK: Create a comprehensive, executive-level digest that:
1. Provides clear overview of ${targetCountries.map(c => COUNTRY_NAMES[c] || c).join(", ")}'s image in global press
2. Highlights key themes and regional perspectives
3. Identifies concerning trends and opportunities
4. Gives actionable insights for decision makers

Format with clear sections and executive summary.

${userLanguage === 'ru' ? 'ВАЖНО: Пиши весь дайджест на русском языке!' : ''}
${userLanguage === 'tr' ? 'ÖNEMLİ: Tüm özeti Türkçe yaz!' : ''}
${userLanguage === 'az' ? 'VACIB: Bütün xülasəni Azərbaycan dilində yaz!' : ''}`;

  try {
    const digest = await callGemini(digestPrompt, 0.4, apiKey, model);
    
    const footer = `

---

## 📊 ANALYSIS STATISTICS

- **Articles Analyzed**: ${articles.length} from ${sources.length} sources
- **Languages Covered**: ${languages.length} languages
- **Date**: ${new Date().toLocaleDateString()}
- **Sentiment Distribution**:
  - Positive: ${'█'.repeat(Math.min(20, Math.floor(positiveArticles.length / articles.length * 20)))} ${(positiveArticles.length / articles.length * 100).toFixed(1)}%
  - Negative: ${'█'.repeat(Math.min(20, Math.floor(negativeArticles.length / articles.length * 20)))} ${(negativeArticles.length / articles.length * 100).toFixed(1)}%
  - Neutral: ${'█'.repeat(Math.min(20, Math.floor(neutralArticles.length / articles.length * 20)))} ${(neutralArticles.length / articles.length * 100).toFixed(1)}%

---
*🤖 Powered by Google Gemini with Grounding • Running on Vercel Edge*`;

    return digest + footer;
  } catch (error) {
    console.error('Error generating digest:', error);
    return 'Error generating digest';
  }
}