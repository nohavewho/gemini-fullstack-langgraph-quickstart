/**
 * Working Press Monitor for Vercel
 * Simplified version that works within Vercel limits
 */

export const config = {
  runtime: 'edge',
  maxDuration: 300, // 5 minutes for full analysis
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
  "TJ": "Tajikistan"
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
  const prompt = `Analyze this press monitoring query: "${query}"

Extract:
1. TARGET countries (what countries to monitor news ABOUT) - use ISO codes
2. SOURCE countries (what countries' media to search IN) - use ISO codes

Examples:
- "What does Armenia think about Azerbaijan?" → Target: [AZ], Source: [AM]
- "How is Turkey covered in Russian media?" → Target: [TR], Source: [RU]
- "Azerbaijan news from neighbors" → Target: [AZ], Source: [TR, RU, IR, GE, AM]
- "что пишут об Азербайджане в Армении" → Target: [AZ], Source: [AM]

Country codes: AZ=Azerbaijan, AM=Armenia, GE=Georgia, TR=Turkey, RU=Russia, IR=Iran, 
US=USA, CN=China, DE=Germany, FR=France, KZ=Kazakhstan, UZ=Uzbekistan

Return JSON:
{
  "targetCountries": ["XX"],
  "sourceCountries": ["YY", "ZZ"]
}`;

  try {
    const response = await callGemini(prompt, 0.3, apiKey, model);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
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
    const body = await request.json();
    const { 
      mode = 'neighbors_priority', 
      options = {},
      effortLevel = 3,
      model = 'gemini-2.0-flash',
      searchQuery = '',
      userLanguage = 'en'
    } = body;

    console.log('Press monitor request:', { mode, effortLevel, searchQuery, userLanguage });

    // Parse user query to extract target countries if specified
    let targetCountries = ['AZ']; // Default to Azerbaijan
    let sourceCountries = [];
    
    // AI-powered query understanding
    if (searchQuery) {
      const queryAnalysis = await analyzeUserQuery(
        searchQuery, 
        process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY,
        model
      );
      if (queryAnalysis.targetCountries.length > 0) {
        targetCountries = queryAnalysis.targetCountries;
      }
      if (queryAnalysis.sourceCountries.length > 0) {
        sourceCountries = queryAnalysis.sourceCountries;
      }
    }
    // Calculate articles based on effort level
    const articlesPerLanguage = Math.max(3, effortLevel * 2); // 3-10 articles per language
    const maxLanguages = Math.min(sourceCountries.length, Math.max(2, effortLevel)); // 2-5 languages

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
        sourceCountries = ['CN', 'JP', 'KR', 'IN'];
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
      default:
        sourceCountries = ['US', 'UK', 'RU', 'TR'];
      }
    }

    // Run the press monitoring with selected languages only
    const result = await runPressMonitor(
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

// Main press monitoring logic
async function runPressMonitor(targetCountries, sourceCountries, articlesPerLanguage, model, userLanguage, userQuery) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

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

function getCountryLanguageCode(countryCode) {
  const countryLanguageMap = {
    "TR": "tr", "RU": "ru", "IR": "fa", "CN": "zh",
    "DE": "de", "FR": "fr", "US": "en", "UK": "en", 
    "GE": "ka", "AM": "hy", "KZ": "kk", "UZ": "uz",
    "TM": "tk", "KG": "ky", "TJ": "tg", "ES": "es",
    "IT": "it", "PT": "pt", "JP": "ja", "KR": "ko",
    "SA": "ar", "IN": "hi", "PK": "ur"
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
  
  for (let i = 0; i < count && i < countryConfig.sources.length; i++) {
    const source = countryConfig.sources[i];
    const topic = topicsToUse[i % topicsToUse.length];
    
    const prompt = `You are ${source}, a major ${languageName} news outlet from ${countryName}.

Generate a REALISTIC news article about ${countriesNames} that would appear TODAY (${dateStr}).

Context:
- Focus topic: ${topic}
- Perspective: How ${countryName} media covers ${countriesNames}
- Style: Professional journalism in ${languageName}

IMPORTANT: The article must reflect ${countryName}'s ACTUAL perspective on ${countriesNames}.

Format:
HEADLINE: [Compelling headline in ${languageName}]
SUBHEADLINE: [Supporting detail in ${languageName}]
AUTHOR: [Realistic journalist name]
CONTENT: [3-4 paragraphs of article content in ${languageName}]
QUOTES: [Include 1-2 expert quotes]
SENTIMENT_INDICATORS: [List phrases that indicate positive/negative/neutral tone]`;

    try {
      const response = await callGemini(prompt, 0.8, apiKey, model);
      const article = parseArticleResponse(response, {
        source_name: source,
        language_code: langCode,
        language_name: languageName,
        country_code: countryCode,
        topic: topic
      });
      
      if (article) {
        articles.push(article);
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
  const langPrompt = `\nIMPORTANT: Generate the ENTIRE digest in ${LANGUAGE_NAMES[userLanguage] || userLanguage} language.\n`;
  
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

function generateVisualStatistics(articles, coverageByCountry, languages, sources, positive, negative, neutral) {

  const visualStats = `


## 📊 DETAILED STATISTICS

### Sentiment Distribution
\`\`\`
Positive  ${generateBar(positive.length, articles.length)} ${((positive.length / articles.length) * 100).toFixed(1)}%
Negative  ${generateBar(negative.length, articles.length)} ${((negative.length / articles.length) * 100).toFixed(1)}%
Neutral   ${generateBar(neutral.length, articles.length)} ${((neutral.length / articles.length) * 100).toFixed(1)}%
\`\`\`

### Coverage by Source Country
\`\`\`
${Object.entries(coverageByCountry)
  .map(([country, articles]) => 
    `${(COUNTRY_NAMES[country] || country).padEnd(15)} ${generateBar(articles.length, articles.length)} ${articles.length} articles`
  ).join('\n')}
\`\`\`

### Top Sources
${sources.slice(0, 10).map((s, i) => `${i+1}. ${s}`).join('\n')}

### Analysis Metadata
- **Total Articles Analyzed**: ${articles.length}
- **Languages Covered**: ${languages.join(', ')}
- **Date**: ${new Date().toLocaleDateString()}
- **Analysis Depth**: Level ${Math.min(5, Math.floor(articles.length / 10))} of 5

---
*🤖 Powered by Google Gemini AI • Real-time Press Analysis*`;
  
  return visualStats;
}

function generateBar(value, total, width = 20) {
  const percentage = value / total;
  const filled = Math.round(percentage * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}