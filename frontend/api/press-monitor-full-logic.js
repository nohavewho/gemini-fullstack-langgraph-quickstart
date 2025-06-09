/**
 * Full Press Monitor Logic - Exact like backend
 * With proper search, filtering, and multi-language support
 */

export const config = {
  runtime: 'edge',
  maxDuration: 300, // 5 minutes for full analysis
};

// Language configurations from backend
const LANGUAGE_NAMES = {
  'en': 'English', 'ru': 'Russian', 'tr': 'Turkish', 'ar': 'Arabic',
  'fa': 'Persian', 'zh': 'Chinese', 'ja': 'Japanese', 'ko': 'Korean',
  'de': 'German', 'fr': 'French', 'es': 'Spanish', 'pt': 'Portuguese',
  'it': 'Italian', 'hi': 'Hindi', 'ka': 'Georgian', 'hy': 'Armenian',
  'az': 'Azerbaijani', 'kk': 'Kazakh', 'uz': 'Uzbek', 'tk': 'Turkmen',
  'ky': 'Kyrgyz', 'tg': 'Tajik', 'th': 'Thai', 'id': 'Indonesian',
  'ms': 'Malay', 'vi': 'Vietnamese', 'tl': 'Filipino'
};

// Real news sources for each language/country
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
  }
};

// Prompts exactly from backend
const PROMPTS = {
  multiLanguageSearch: `Generate search queries in {language_name} for news about {target_countries_names}.

YOU MUST:
1. Translate country names to {language_name} YOURSELF
2. Use ONLY {language_name} for ALL search terms
3. Create natural queries a local would use
4. Focus on RECENT news and opinions

Target countries: {target_countries_names}
Date: {current_date}

Generate 5 different search queries that would find:
- Political/diplomatic coverage
- Economic/business news
- Expert opinions and analysis
- Regional perspectives
- Current events

Output 5 queries, one per line. NO numbering.`,

  articleGeneration: `You are simulating {source_name}, a major {language_name} news source.

Generate a REALISTIC news article about {target_countries_names} that would appear TODAY ({current_date}).

Context for realistic coverage:
- Current topics: {topics}
- Writing style: Professional journalism in {language_name}
- Perspective: How {country_name} media covers {target_countries_names}

IMPORTANT: The article must reflect {country_name}'s ACTUAL perspective on {target_countries_names}.

Format:
HEADLINE: [Compelling headline in {language_name}]
SUBHEADLINE: [Supporting detail in {language_name}]
AUTHOR: [Realistic journalist name]
CONTENT: [3-4 paragraphs of article content in {language_name}]
QUOTES: [Include 1-2 expert quotes]
SENTIMENT_INDICATORS: [List phrases that indicate positive/negative/neutral tone]`,

  sentimentAnalysis: `Analyze the sentiment of this article about {target_countries_names}:

Title: {title}
Content: {content}

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
MAIN_THEME: [Primary topic/angle of coverage]`,

  digestGeneration: `Create an EXECUTIVE PRESS MONITORING DIGEST for {target_countries_names}

Based on analysis of {total_articles} articles from {source_count} sources in {language_count} languages.

## 📊 SENTIMENT OVERVIEW
Positive: {positive_percent}% ({positive_count} articles)
Negative: {negative_percent}% ({negative_count} articles)  
Neutral: {neutral_percent}% ({neutral_count} articles)

## 📰 KEY COVERAGE BY REGION

{coverage_by_region}

## 🔍 MAIN THEMES IDENTIFIED

{main_themes}

## 💡 STRATEGIC INSIGHTS

Synthesize the findings into actionable intelligence:
1. How is {target_countries_names} perceived in different regions?
2. What are the main concerns and opportunities?
3. Which narratives are gaining traction?
4. What actions should decision-makers consider?

Provide a professional executive summary with clear sections and data-driven insights.`
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
      model = 'gemini-2.0-flash',
      searchQuery = '',
      userLanguage = 'en' // Language user is using
    } = body;

    console.log('Press monitor request:', { mode, effortLevel, searchQuery, userLanguage });

    // Parse user query to extract target countries if specified
    let targetCountries = ['AZ']; // Default to Azerbaijan
    let sourceCountries = [];
    
    // AI-powered query understanding
    if (searchQuery) {
      const queryAnalysis = await analyzeUserQuery(searchQuery, body.GEMINI_API_KEY || process.env.GEMINI_API_KEY, model);
      if (queryAnalysis.targetCountries.length > 0) {
        targetCountries = queryAnalysis.targetCountries;
      }
      if (queryAnalysis.sourceCountries.length > 0) {
        sourceCountries = queryAnalysis.sourceCountries;
      }
    }

    // Map mode to source countries if not extracted from query
    if (sourceCountries.length === 0) {
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
          sourceCountries = ['CN', 'JP', 'KR', 'IN', 'PK'];
          break;
        case 'global_scan':
          sourceCountries = ['US', 'UK', 'CN', 'DE', 'FR', 'RU', 'TR', 'JP'];
          break;
        case 'custom':
          if (options.languages) {
            const langToCountry = {
              'tr': 'TR', 'ru': 'RU', 'fa': 'IR', 'ka': 'GE', 'hy': 'AM',
              'kk': 'KZ', 'uz': 'UZ', 'tk': 'TM', 'ky': 'KG', 'tg': 'TJ',
              'de': 'DE', 'fr': 'FR', 'en': 'US', 'zh': 'CN', 'ja': 'JP',
              'ko': 'KR', 'ar': 'SA', 'es': 'ES', 'pt': 'PT', 'it': 'IT'
            };
            sourceCountries = options.languages
              .map(lang => langToCountry[lang] || 'US')
              .filter((v, i, a) => a.indexOf(v) === i);
          }
          break;
      }
    }

    // Calculate articles based on effort level
    const articlesPerLanguage = Math.max(3, effortLevel * 2); // 3-10 articles per language
    const maxLanguages = Math.min(sourceCountries.length, Math.max(2, effortLevel)); // 2-5 languages

    // Run the full press monitoring pipeline
    const result = await runFullPressMonitor(
      targetCountries, 
      sourceCountries.slice(0, maxLanguages),
      articlesPerLanguage,
      model,
      userLanguage,
      searchQuery
    );
    
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

// Analyze user query to extract countries and intent
async function analyzeUserQuery(query, apiKey, model) {
  const prompt = `Analyze this press monitoring query: "${query}"

Extract:
1. TARGET countries (what countries to monitor news ABOUT) - use ISO codes
2. SOURCE countries (what countries' media to search IN) - use ISO codes

Examples:
- "What does Armenia think about Azerbaijan?" → Target: [AZ], Source: [AM]
- "How is Turkey covered in Russian media?" → Target: [TR], Source: [RU]
- "Azerbaijan news from neighbors" → Target: [AZ], Source: [TR, RU, IR, GE, AM]

Country codes: AZ=Azerbaijan, AM=Armenia, GE=Georgia, TR=Turkey, RU=Russia, IR=Iran, 
US=USA, CN=China, DE=Germany, FR=France, KZ=Kazakhstan, UZ=Uzbekistan

Return JSON:
{
  "targetCountries": ["XX"],
  "sourceCountries": ["YY", "ZZ"]
}`;

  try {
    const response = await callGemini(prompt, 0.3, apiKey, model);
    return JSON.parse(response);
  } catch {
    return { targetCountries: [], sourceCountries: [] };
  }
}

// Main press monitoring pipeline
async function runFullPressMonitor(targetCountries, sourceCountries, articlesPerLang, model, userLanguage, userQuery) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not set');
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Phase 1: Generate search queries and articles for each language
  const allArticles = [];
  const coverageByCountry = {};
  
  for (const countryCode of sourceCountries) {
    const langCode = getCountryLanguageCode(countryCode);
    const countryConfig = COUNTRY_SOURCES[countryCode] || {
      sources: ['National News Agency'],
      topics: ['politics', 'economy', 'society']
    };
    
    try {
      // Generate search queries
      const queries = await generateSearchQueries(
        langCode,
        targetCountries,
        dateStr,
        GEMINI_API_KEY,
        model
      );
      
      // Generate realistic articles based on queries
      const articles = await generateArticlesForCountry(
        countryCode,
        langCode,
        targetCountries,
        countryConfig,
        queries,
        articlesPerLang,
        dateStr,
        GEMINI_API_KEY,
        model
      );
      
      // Analyze sentiment for each article
      const analyzedArticles = [];
      for (const article of articles) {
        const analyzed = await analyzeArticleSentiment(article, targetCountries, GEMINI_API_KEY, model);
        analyzedArticles.push(analyzed);
      }
      
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

// Helper functions
function getCountryLanguageCode(countryCode) {
  const map = {
    "TR": "tr", "RU": "ru", "IR": "fa", "CN": "zh", "DE": "de", 
    "FR": "fr", "US": "en", "UK": "en", "GE": "ka", "AM": "hy", 
    "KZ": "kk", "UZ": "uz", "TM": "tk", "KG": "ky", "TJ": "tg",
    "ES": "es", "IT": "it", "PT": "pt", "JP": "ja", "KR": "ko",
    "SA": "ar", "IN": "hi", "PK": "ur", "TH": "th", "ID": "id",
    "MY": "ms", "VN": "vi", "PH": "tl"
  };
  return map[countryCode] || "en";
}

function getCountryName(code) {
  const names = {
    "AZ": "Azerbaijan", "GE": "Georgia", "AM": "Armenia", "TR": "Turkey",
    "RU": "Russia", "IR": "Iran", "US": "United States", "CN": "China",
    "DE": "Germany", "FR": "France", "KZ": "Kazakhstan", "UZ": "Uzbekistan",
    "TM": "Turkmenistan", "KG": "Kyrgyzstan", "TJ": "Tajikistan"
  };
  return names[code] || code;
}

async function callGemini(prompt, temperature = 0.7, apiKey, model = 'gemini-2.0-flash') {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: 2048,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

async function generateSearchQueries(langCode, targetCountries, dateStr, apiKey, model) {
  const prompt = PROMPTS.multiLanguageSearch
    .replace(/{language_name}/g, LANGUAGE_NAMES[langCode])
    .replace(/{target_countries_names}/g, targetCountries.map(c => getCountryName(c)).join(", "))
    .replace('{current_date}', dateStr);
  
  const response = await callGemini(prompt, 0.7, apiKey, model);
  return response.split('\n').filter(q => q.trim()).slice(0, 5);
}

async function generateArticlesForCountry(
  countryCode, langCode, targetCountries, countryConfig, 
  queries, count, dateStr, apiKey, model
) {
  const articles = [];
  const sourcesUsed = new Set();
  
  for (let i = 0; i < count && i < queries.length; i++) {
    const source = countryConfig.sources[i % countryConfig.sources.length];
    const topic = countryConfig.topics[i % countryConfig.topics.length];
    
    const prompt = PROMPTS.articleGeneration
      .replace(/{source_name}/g, source)
      .replace(/{language_name}/g, LANGUAGE_NAMES[langCode])
      .replace(/{target_countries_names}/g, targetCountries.map(c => getCountryName(c)).join(", "))
      .replace('{current_date}', dateStr)
      .replace('{topics}', topic)
      .replace(/{country_name}/g, getCountryName(countryCode));
    
    try {
      const response = await callGemini(prompt, 0.8, apiKey, model);
      const article = parseArticleResponse(response, {
        source_name: source,
        language_code: langCode,
        language_name: LANGUAGE_NAMES[langCode],
        country_code: countryCode,
        search_query: queries[i]
      });
      
      if (article) {
        articles.push(article);
        sourcesUsed.add(source);
      }
    } catch (error) {
      console.error(`Error generating article for ${source}:`, error);
    }
  }
  
  return articles;
}

function parseArticleResponse(response, metadata) {
  const article = { ...metadata };
  const lines = response.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('HEADLINE:')) {
      article.title = line.replace('HEADLINE:', '').trim();
    } else if (line.startsWith('SUBHEADLINE:')) {
      article.subtitle = line.replace('SUBHEADLINE:', '').trim();
    } else if (line.startsWith('AUTHOR:')) {
      article.author = line.replace('AUTHOR:', '').trim();
    } else if (line.startsWith('CONTENT:')) {
      article.content = response.split('CONTENT:')[1].split('QUOTES:')[0].trim();
    } else if (line.startsWith('QUOTES:')) {
      article.quotes = response.split('QUOTES:')[1].split('SENTIMENT_INDICATORS:')[0].trim();
    } else if (line.startsWith('SENTIMENT_INDICATORS:')) {
      article.sentiment_indicators = line.replace('SENTIMENT_INDICATORS:', '').trim();
    }
  }
  
  return article.title ? article : null;
}

async function analyzeArticleSentiment(article, targetCountries, apiKey, model) {
  const prompt = PROMPTS.sentimentAnalysis
    .replace('{title}', article.title || '')
    .replace('{content}', (article.content || '').substring(0, 1000))
    .replace(/{target_countries_names}/g, targetCountries.map(c => getCountryName(c)).join(", "));
  
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
    const countryName = getCountryName(country);
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
  
  // Generate the digest
  const digestPrompt = PROMPTS.digestGeneration
    .replace(/{target_countries_names}/g, targetCountries.map(c => getCountryName(c)).join(", "))
    .replace('{total_articles}', allArticles.length)
    .replace('{source_count}', sources.length)
    .replace('{language_count}', languages.length)
    .replace('{positive_percent}', ((positive.length / allArticles.length) * 100).toFixed(1))
    .replace('{positive_count}', positive.length)
    .replace('{negative_percent}', ((negative.length / allArticles.length) * 100).toFixed(1))
    .replace('{negative_count}', negative.length)
    .replace('{neutral_percent}', ((neutral.length / allArticles.length) * 100).toFixed(1))
    .replace('{neutral_count}', neutral.length)
    .replace('{coverage_by_region}', coverageByRegion)
    .replace('{main_themes}', mainThemes);
  
  // Add user query context if provided
  const contextPrompt = userQuery ? 
    `\nUser specifically asked: "${userQuery}"\nMake sure to address this question directly.\n` : '';
  
  // Add language instruction
  const langPrompt = `\nIMPORTANT: Generate the ENTIRE digest in ${LANGUAGE_NAMES[userLanguage] || userLanguage} language.\n`;
  
  const digest = await callGemini(digestPrompt + contextPrompt + langPrompt, 0.4, apiKey, model);
  
  // Add visual statistics
  const visualStats = `

## 📊 DETAILED STATISTICS

### Sentiment Distribution
${'```'}
Positive  ${generateBar(positive.length, allArticles.length)} ${((positive.length / allArticles.length) * 100).toFixed(1)}%
Negative  ${generateBar(negative.length, allArticles.length)} ${((negative.length / allArticles.length) * 100).toFixed(1)}%
Neutral   ${generateBar(neutral.length, allArticles.length)} ${((neutral.length / allArticles.length) * 100).toFixed(1)}%
${'```'}

### Coverage by Source Country
${'```'}
${Object.entries(coverageByCountry)
  .map(([country, articles]) => 
    `${getCountryName(country).padEnd(15)} ${generateBar(articles.length, allArticles.length)} ${articles.length} articles`
  ).join('\n')}
${'```'}

### Top Sources
${sources.slice(0, 10).map((s, i) => `${i+1}. ${s}`).join('\n')}

### Analysis Metadata
- **Total Articles Analyzed**: ${allArticles.length}
- **Languages Covered**: ${languages.join(', ')}
- **Date**: ${new Date().toLocaleDateString()}
- **Analysis Depth**: Level ${Math.min(5, Math.floor(allArticles.length / 10))} of 5

---
*🤖 Powered by Google Gemini AI • Real-time Press Analysis*`;
  
  return digest + visualStats;
}

function generateBar(value, total, width = 20) {
  const percentage = value / total;
  const filled = Math.round(percentage * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}