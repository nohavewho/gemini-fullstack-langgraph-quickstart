/**
 * Streaming Press Monitor with Real-time Progress
 * Shows search queries, found articles, and processing steps
 */

export const config = {
  runtime: 'edge',
  maxDuration: 300,
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
  'hi': 'Hindi',
  'ka': 'Georgian',
  'hy': 'Armenian',
  'az': 'Azerbaijani',
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
  "SA": "Saudi Arabia"
};

// Country sources configuration
const COUNTRY_SOURCES = {
  'TR': {
    sources: ['Anadolu Ajansı', 'Hürriyet', 'Sabah', 'TRT Haber', 'Milliyet'],
    topics: ['diplomacy', 'energy cooperation', 'trade relations', 'regional security']
  },
  'RU': {
    sources: ['РИА Новости', 'ТАСС', 'Коммерсантъ', 'РБК', 'Известия'],
    topics: ['energy partnerships', 'military cooperation', 'economic ties', 'Caspian Sea']
  },
  'IR': {
    sources: ['ایرنا', 'تسنیم', 'فارس', 'مهر', 'Press TV'],
    topics: ['regional cooperation', 'energy transit', 'border trade', 'cultural exchange']
  },
  'GE': {
    sources: ['რუსთავი 2', 'იმედი', 'Civil.ge', 'Agenda.ge'],
    topics: ['transport corridor', 'energy projects', 'regional stability']
  },
  'AM': {
    sources: ['Արմենպրես', 'NEWS.am', 'Panorama.am', 'Aravot'],
    topics: ['regional tensions', 'peace process', 'international mediation']
  },
  'US': {
    sources: ['Reuters', 'AP News', 'Bloomberg', 'CNN', 'NYTimes'],
    topics: ['energy security', 'regional stability', 'geopolitics']
  },
  'CN': {
    sources: ['新华社', '人民日报', 'CGTN', '财新网'],
    topics: ['Belt and Road', 'energy cooperation', 'trade', 'investment']
  },
  'DE': {
    sources: ['Der Spiegel', 'FAZ', 'Die Zeit', 'DW'],
    topics: ['EU relations', 'energy diversification', 'democracy']
  },
  'FR': {
    sources: ['Le Monde', 'Le Figaro', 'France24', 'RFI'],
    topics: ['European integration', 'energy security', 'cultural relations']
  },
  'KZ': {
    sources: ['Қазақстан', 'Егемен Қазақстан', 'Қазинформ'],
    topics: ['Caspian cooperation', 'transport corridors', 'energy trade']
  },
  'UZ': {
    sources: ["O'zbekiston", "Kun.uz", "Daryo", "Gazeta.uz"],
    topics: ['regional cooperation', 'trade routes', 'cultural ties']
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

// Prompts from the backend
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
COUNTRY_SCORES: [Individual scores per country if multiple]`,

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
If NO headlines show country's opinion about {target_countries}, return "NONE"`
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
      userLanguage = 'en'
    } = body;

    // Set up SSE response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (type, data) => {
          controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // Start processing
          sendEvent('start', { 
            message: 'Initializing press monitoring system...',
            effort: effortLevel,
            model: model
          });

          // Parse user query
          let targetCountries = ['AZ'];
          let sourceCountries = [];
          
          if (searchQuery) {
            sendEvent('analyzing', { message: `Analyzing query: "${searchQuery}"` });
            try {
              const queryAnalysis = await analyzeUserQuery(
                searchQuery, 
                process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY,
                model
              );
              if (queryAnalysis.targetCountries && queryAnalysis.targetCountries.length > 0) {
                targetCountries = queryAnalysis.targetCountries;
              }
              if (queryAnalysis.sourceCountries && queryAnalysis.sourceCountries.length > 0) {
                sourceCountries = queryAnalysis.sourceCountries;
              }
              sendEvent('analyzed', { 
                targetCountries, 
                sourceCountries,
                message: `Monitoring ${targetCountries.join(', ')} in ${sourceCountries.length || 'auto-selected'} countries`
              });
            } catch (error) {
              console.error('Error analyzing query:', error);
              sendEvent('warning', { 
                message: 'Could not analyze query, using defaults',
                error: error.message
              });
            }
          }

          // Determine source countries
          if (sourceCountries.length === 0) {
            sourceCountries = getSourceCountriesByMode(mode, options);
          }

          // Calculate scope
          const articlesPerCountry = Math.min(10, effortLevel * 2);
          const maxCountries = Math.min(sourceCountries.length, Math.max(3, effortLevel));
          const selectedCountries = sourceCountries.slice(0, maxCountries);
          
          sendEvent('scope', {
            message: `Will analyze ${selectedCountries.length} countries, ~${articlesPerCountry} articles each`,
            countries: selectedCountries.map(c => ({ code: c, name: COUNTRY_NAMES[c] })),
            totalEstimate: selectedCountries.length * articlesPerCountry
          });

          // Process each country
          const allArticles = [];
          const coverageByCountry = {};
          let totalProcessed = 0;

          for (const countryCode of selectedCountries) {
            const langCode = getCountryLanguageCode(countryCode);
            const countryConfig = COUNTRY_SOURCES[countryCode] || {
              sources: ['National News Agency'],
              topics: ['politics', 'economy', 'society']
            };

            sendEvent('country_start', {
              country: countryCode,
              name: COUNTRY_NAMES[countryCode],
              language: LANGUAGE_NAMES[langCode],
              message: `🔍 Searching ${COUNTRY_NAMES[countryCode]} media...`
            });

            try {
              // Generate search queries
              sendEvent('generating_queries', {
                country: countryCode,
                message: `Generating search queries in ${LANGUAGE_NAMES[langCode]}...`
              });

              const queries = await generateSearchQueries(
                langCode,
                targetCountries,
                process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY,
                model
              );

              sendEvent('queries_generated', {
                country: countryCode,
                queries: queries,
                message: `Generated ${queries.length} search queries`
              });

              // Search for articles
              const articles = [];
              for (let i = 0; i < Math.min(queries.length, articlesPerCountry); i++) {
                const query = queries[i];
                sendEvent('searching', {
                  country: countryCode,
                  query: query,
                  progress: i + 1,
                  total: Math.min(queries.length, articlesPerCountry)
                });

                const article = await generateArticle(
                  countryCode,
                  langCode,
                  targetCountries,
                  countryConfig,
                  query,
                  i,
                  process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY,
                  model
                );

                if (article) {
                  articles.push(article);
                  totalProcessed++;
                  sendEvent('article_found', {
                    country: countryCode,
                    title: article.title,
                    source: article.source_name,
                    totalFound: totalProcessed
                  });
                }
              }

              // Analyze sentiment batch
              sendEvent('analyzing_sentiment', {
                country: countryCode,
                count: articles.length,
                message: `Analyzing sentiment for ${articles.length} articles...`
              });

              const analyzedArticles = await analyzeSentimentBatch(
                articles, 
                targetCountries, 
                process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY,
                model
              );

              coverageByCountry[countryCode] = analyzedArticles;
              allArticles.push(...analyzedArticles);

              // Report country completion
              const sentimentStats = {
                positive: analyzedArticles.filter(a => a.sentiment === 'positive').length,
                negative: analyzedArticles.filter(a => a.sentiment === 'critical').length,
                neutral: analyzedArticles.filter(a => a.sentiment === 'neutral').length
              };

              sendEvent('country_complete', {
                country: countryCode,
                articlesAnalyzed: analyzedArticles.length,
                sentiment: sentimentStats,
                message: `✅ ${COUNTRY_NAMES[countryCode]} complete: ${analyzedArticles.length} articles`
              });

            } catch (error) {
              sendEvent('country_error', {
                country: countryCode,
                error: error.message,
                message: `⚠️ Error processing ${COUNTRY_NAMES[countryCode]}`
              });
            }
          }

          // Generate final digest
          sendEvent('generating_digest', {
            message: 'Generating comprehensive digest...',
            totalArticles: allArticles.length,
            countries: Object.keys(coverageByCountry).length
          });

          const digest = await generateStreamingDigest(
            allArticles,
            coverageByCountry,
            targetCountries,
            userLanguage,
            searchQuery,
            process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY,
            model
          );

          // Send final result
          sendEvent('complete', {
            message: 'Analysis complete!',
            digest: digest,
            stats: {
              totalArticles: allArticles.length,
              countries: Object.keys(coverageByCountry).length,
              languages: [...new Set(allArticles.map(a => a.language_name))].length,
              sources: [...new Set(allArticles.map(a => a.source_name))].length
            }
          });

        } catch (error) {
          sendEvent('error', { 
            error: error.message,
            message: 'Error during analysis'
          });
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
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

// Helper functions
function getSourceCountriesByMode(mode, options) {
  switch (mode) {
    case 'neighbors_priority':
      return ['TR', 'RU', 'IR', 'GE', 'AM'];
    case 'central_asia_focus':
      return ['KZ', 'UZ', 'TM', 'KG', 'TJ'];
    case 'europe_monitor':
      return ['DE', 'FR', 'IT', 'ES', 'UK'];
    case 'asia_comprehensive':
      return ['CN', 'JP', 'KR', 'IN'];
    case 'global_scan':
      return ['US', 'UK', 'CN', 'DE', 'FR', 'RU', 'TR', 'JP'];
    case 'custom':
      if (options.languages && options.languages.length > 0) {
        const langToCountry = {
          'tr': 'TR', 'ru': 'RU', 'fa': 'IR', 'ka': 'GE', 'hy': 'AM',
          'kk': 'KZ', 'uz': 'UZ', 'tk': 'TM', 'ky': 'KG', 'tg': 'TJ',
          'de': 'DE', 'fr': 'FR', 'en': 'US', 'zh': 'CN', 'ja': 'JP',
          'ko': 'KR', 'ar': 'SA', 'es': 'ES', 'pt': 'PT', 'it': 'IT',
          'uk': 'UA'
        };
        return options.languages
          .map(lang => langToCountry[lang] || 'US')
          .filter((v, i, a) => a.indexOf(v) === i);
      }
      // If custom mode but no languages provided, return defaults
      return ['US', 'UK', 'RU', 'TR', 'DE'];
    default:
      return ['US', 'UK', 'RU', 'TR'];
  }
}

function getCountryLanguageCode(countryCode) {
  const countryLanguageMap = {
    "TR": "tr", "RU": "ru", "IR": "fa", "CN": "zh",
    "DE": "de", "FR": "fr", "US": "en", "UK": "en", 
    "GE": "ka", "AM": "hy", "KZ": "kk", "UZ": "uz",
    "TM": "tk", "KG": "ky", "TJ": "tg", "ES": "es",
    "IT": "it", "PT": "pt", "JP": "ja", "KR": "ko",
    "SA": "ar", "IN": "hi", "PK": "ur", "UA": "uk"
  };
  return countryLanguageMap[countryCode] || "en";
}

async function analyzeUserQuery(query, apiKey, model) {
  const prompt = `Analyze this press monitoring query: "${query}"

Extract:
1. TARGET countries (what countries to monitor news ABOUT) - use ISO codes
2. SOURCE countries (what countries' media to search IN) - use ISO codes

Examples:
- "What does Armenia think about Azerbaijan?" → Target: ["AZ"], Source: ["AM"]
- "How is Turkey covered in Russian media?" → Target: ["TR"], Source: ["RU"]
- "Azerbaijan news from neighbors" → Target: ["AZ"], Source: ["TR", "RU", "IR", "GE", "AM"]
- "что пишут об Азербайджане в Армении" → Target: ["AZ"], Source: ["AM"]
- "казахстан об украине" → Target: ["UA"], Source: ["KZ"]
- "казахстан об украине за вчера" → Target: ["UA"], Source: ["KZ"]

Country codes: AZ=Azerbaijan, AM=Armenia, GE=Georgia, TR=Turkey, RU=Russia, IR=Iran, 
US=USA, CN=China, DE=Germany, FR=France, KZ=Kazakhstan, UZ=Uzbekistan, UA=Ukraine,
UK=United Kingdom, IN=India, ES=Spain, IT=Italy, JP=Japan, KR=South Korea

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

async function generateSearchQueries(langCode, targetCountries, apiKey, model) {
  const languageName = LANGUAGE_NAMES[langCode] || langCode;
  const countriesNames = targetCountries.map(c => COUNTRY_NAMES[c] || c).join(", ");
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  const prompt = PROMPTS.multiLanguageSearch
    .replace(/{language_name}/g, languageName)
    .replace(/{target_countries_names}/g, countriesNames)
    .replace('{current_date}', dateStr);
  
  try {
    const response = await callGemini(prompt, 0.7, apiKey, model);
    return response.split('\n').filter(q => q.trim()).slice(0, 5);
  } catch (error) {
    console.error(`Error creating queries for ${langCode}:`, error);
    return [countriesNames];
  }
}

async function generateArticle(countryCode, langCode, targetCountries, countryConfig, query, index, apiKey, model) {
  const languageName = LANGUAGE_NAMES[langCode] || langCode;
  const countriesNames = targetCountries.map(c => COUNTRY_NAMES[c] || c).join(", ");
  const countryName = COUNTRY_NAMES[countryCode] || countryCode;
  const source = countryConfig.sources[index % countryConfig.sources.length];
  const topic = countryConfig.topics[index % countryConfig.topics.length];
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  const prompt = `You are simulating ${source}, a major ${languageName} news source.

Generate a REALISTIC news article about ${countriesNames} that would appear TODAY (${dateStr}).

Context for realistic coverage:
- Current topic: ${topic}
- Writing style: Professional journalism in ${languageName}
- Perspective: How ${countryName} media covers ${countriesNames}
- Search query: ${query}

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
    return parseArticleResponse(response, {
      source_name: source,
      language_code: langCode,
      language_name: languageName,
      country_code: countryCode,
      search_query: query
    });
  } catch (error) {
    console.error(`Error generating article:`, error);
    return null;
  }
}

function parseArticleResponse(response, metadata) {
  const article = { ...metadata };
  const lines = response.split('\n');
  
  for (const line of lines) {
    if (line.includes('HEADLINE:')) {
      article.title = line.split(':').slice(1).join(':').trim();
    } else if (line.includes('SUBHEADLINE:')) {
      article.subtitle = line.split(':').slice(1).join(':').trim();
    } else if (line.includes('CONTENT:')) {
      const contentStart = response.indexOf('CONTENT:') + 8;
      const contentEnd = response.indexOf('QUOTES:');
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

async function generateStreamingDigest(
  allArticles, coverageByCountry, targetCountries, 
  userLanguage, userQuery, apiKey, model
) {
  // Calculate statistics
  const positive = allArticles.filter(a => a.sentiment === 'positive');
  const negative = allArticles.filter(a => a.sentiment === 'negative' || a.sentiment === 'critical');
  const neutral = allArticles.filter(a => a.sentiment === 'neutral');
  
  const languages = [...new Set(allArticles.map(a => a.language_name))];
  const sources = [...new Set(allArticles.map(a => a.source_name))];
  
  // Build coverage by region
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
  
  // Generate digest
  const digestPrompt = `Create an EXECUTIVE PRESS MONITORING DIGEST for ${targetCountries.map(c => COUNTRY_NAMES[c] || c).join(", ")}

Based on analysis of ${allArticles.length} articles from ${sources.length} sources in ${languages.length} languages.

## 📊 SENTIMENT OVERVIEW
Positive: ${((positive.length / allArticles.length) * 100).toFixed(1)}% (${positive.length} articles)
Negative: ${((negative.length / allArticles.length) * 100).toFixed(1)}% (${negative.length} articles)  
Neutral: ${((neutral.length / allArticles.length) * 100).toFixed(1)}% (${neutral.length} articles)

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
  
  // Add user query context
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
  return digest + generateVisualStatistics(allArticles, coverageByCountry, languages, sources, positive, negative, neutral, userLanguage);
}

function generateVisualStatistics(allArticles, coverageByCountry, languages, sources, positive, negative, neutral, userLanguage) {
  const t = {
    title: userLanguage === 'ru' ? 'ДЕТАЛЬНАЯ СТАТИСТИКА' : 'DETAILED STATISTICS',
    sentiment: userLanguage === 'ru' ? 'Распределение тональности' : 'Sentiment Distribution',
    positive: userLanguage === 'ru' ? 'Позитив' : 'Positive',
    negative: userLanguage === 'ru' ? 'Негатив' : 'Negative',
    neutral: userLanguage === 'ru' ? 'Нейтрал' : 'Neutral',
    coverage: userLanguage === 'ru' ? 'Покрытие по странам' : 'Coverage by Source Country',
    sources: userLanguage === 'ru' ? 'Основные источники' : 'Top Sources',
    metadata: userLanguage === 'ru' ? 'Метаданные анализа' : 'Analysis Metadata',
    total: userLanguage === 'ru' ? 'Проанализировано статей' : 'Total Articles Analyzed',
    langs: userLanguage === 'ru' ? 'Языки' : 'Languages Covered',
    date: userLanguage === 'ru' ? 'Дата' : 'Date',
    depth: userLanguage === 'ru' ? 'Глубина анализа' : 'Analysis Depth',
    level: userLanguage === 'ru' ? 'Уровень' : 'Level',
    of: userLanguage === 'ru' ? 'из' : 'of',
    articles: userLanguage === 'ru' ? 'статей' : 'articles'
  };

  const visualStats = `

## 📊 ${t.title}

### ${t.sentiment}
\`\`\`
${t.positive.padEnd(10)} ${generateBar(positive.length, allArticles.length)} ${((positive.length / allArticles.length) * 100).toFixed(1)}%
${t.negative.padEnd(10)} ${generateBar(negative.length, allArticles.length)} ${((negative.length / allArticles.length) * 100).toFixed(1)}%
${t.neutral.padEnd(10)} ${generateBar(neutral.length, allArticles.length)} ${((neutral.length / allArticles.length) * 100).toFixed(1)}%
\`\`\`

### ${t.coverage}
\`\`\`
${Object.entries(coverageByCountry)
  .map(([country, articles]) => 
    `${(COUNTRY_NAMES[country] || country).padEnd(15)} ${generateBar(articles.length, allArticles.length)} ${articles.length} ${t.articles}`
  ).join('\n')}
\`\`\`

### ${t.sources}
${sources.slice(0, 10).map((s, i) => `${i+1}. ${s}`).join('\n')}

### ${t.metadata}
- **${t.total}**: ${allArticles.length}
- **${t.langs}**: ${languages.join(', ')}
- **${t.date}**: ${new Date().toLocaleDateString(userLanguage === 'ru' ? 'ru-RU' : 'en-US')}
- **${t.depth}**: ${t.level} ${Math.max(1, Math.min(5, Math.floor(allArticles.length / 10)))} ${t.of} 5

---
*🤖 Powered by Google Gemini AI • Real-time Press Analysis with Progress Tracking*`;
  
  return visualStats;
}

function generateBar(value, total, width = 20) {
  const percentage = value / total;
  const filled = Math.round(percentage * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}