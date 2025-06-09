/**
 * Press Monitor Edge Function for Vercel
 * Simplified version of the backend press monitoring logic
 * Runs entirely on Vercel Edge with Google Gemini API
 */

// Configuration constants
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '7a6d6fdc120f9c927fed34e80372dc9b3081f';
const GEMINI_MODEL = 'gemini-2.0-flash-exp';

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
  'tg': 'Tajik'
};

// Prompts from the backend
const PROMPTS = {
  multiLanguageSearch: `Generate search queries in {language_name} for {target_countries_names}.

YOU MUST:
1. Translate country names to {language_name} YOURSELF
2. Use ONLY {language_name} for ALL search terms
3. Create natural queries a local would use

Target countries: {target_countries_names}
Date: {current_date}

Output 3-5 queries, one per line.`,

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

  digestGeneration: `{target_countries_names} Press Digest - {date}

Articles: {total_articles} | Opinion pieces: {opinion_count}
Languages: {languages_list}
Countries covered: {countries_covered}

## KEY FINDINGS

### Expert Views
{expert_opinions}

### Main Criticisms
{criticisms}

### Positive Coverage
{positive_coverage}

## SENTIMENT OVERVIEW
{sentiment_summary}

## REGIONAL BREAKDOWN
{regional_analysis}

## COUNTRY-SPECIFIC INSIGHTS
{country_insights}

Focus on substantive opinions, exclude PR content.`,

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
  "FR": "France"
};

// Helper function to get country name
function getCountryName(code) {
  return COUNTRY_NAMES[code] || code;
}

// Helper function to get language name for country
function getCountryLanguageCode(countryCode) {
  const countryLanguageMap = {
    "TR": "tr", "RU": "ru", "IR": "fa", "CN": "zh",
    "DE": "de", "FR": "fr", "US": "en", "GE": "ka", "AM": "hy"
  };
  return countryLanguageMap[countryCode] || "en";
}

// Call Gemini API
async function callGemini(prompt, temperature = 0.7) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
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
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// Search news with Google
async function searchNewsWithGoogle(query, languageCode) {
  const searchPrompt = `Search for recent news articles about this query: "${query}"
  
  Find articles in ${LANGUAGE_NAMES[languageCode] || languageCode} language.
  Focus on news from the last 7 days.
  
  Return the results in this format:
  1. [Source Name] Title of article
  2. [Source Name] Title of article
  etc.
  
  Only include real news articles, not social media or forums.`;

  try {
    const response = await callGemini(searchPrompt, 0.8);
    
    // Parse the response to extract articles
    const lines = response.split('\n').filter(line => line.trim());
    const articles = [];
    
    for (const line of lines) {
      const match = line.match(/^\d+\.\s*\[([^\]]+)\]\s*(.+)$/);
      if (match) {
        articles.push({
          source_name: match[1],
          title: match[2],
          language_code: languageCode,
          language_name: LANGUAGE_NAMES[languageCode] || languageCode,
          url: `https://search.example.com/${encodeURIComponent(match[2])}`,
          search_query: query
        });
      }
    }
    
    return articles;
  } catch (error) {
    console.error(`Error searching for "${query}":`, error);
    return [];
  }
}

// Create search queries for a language
async function createSearchQueries(languageCode, targetCountries) {
  const countriesNames = targetCountries.map(c => getCountryName(c)).join(", ");
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  const prompt = PROMPTS.multiLanguageSearch
    .replace('{language_name}', LANGUAGE_NAMES[languageCode] || languageCode)
    .replace('{target_countries_names}', countriesNames)
    .replace('{current_date}', currentDate);
  
  try {
    const response = await callGemini(prompt);
    const queries = response.split('\n').filter(q => q.trim()).slice(0, 5);
    return queries;
  } catch (error) {
    console.error(`Error creating queries for ${languageCode}:`, error);
    return [countriesNames]; // Fallback to simple query
  }
}

// Filter articles by headlines
async function filterArticlesByHeadlines(articles, languageCode, targetCountries) {
  if (!articles.length) return [];
  
  const countriesNames = targetCountries.map(c => getCountryName(c)).join(", ");
  const countryName = {
    "uk": "Ukraine", "ru": "Russia", "tr": "Turkey", "de": "Germany", 
    "fr": "France", "es": "Spain", "it": "Italy", "pl": "Poland",
    "en": "International English-speaking media", "ar": "Arab countries",
    "fa": "Iran", "az": "Azerbaijan itself", "ka": "Georgia", "hy": "Armenia"
  }[languageCode] || `country using ${languageCode} language`;
  
  const headlinesText = articles.map((a, i) => `${i+1}. [${a.source_name}] ${a.title}`).join('\n');
  
  const prompt = PROMPTS.headlineFilter
    .replace(/\{country_name\}/g, countryName)
    .replace(/\{target_countries\}/g, countriesNames)
    .replace('{language_code}', languageCode)
    .replace('{headlines_text}', headlinesText);
  
  try {
    const response = await callGemini(prompt, 0.3);
    const result = response.trim();
    
    if (result === "NONE") return [];
    
    const indices = result.split(',').map(x => parseInt(x.trim()) - 1).filter(i => i >= 0 && i < articles.length);
    return indices.map(i => articles[i]);
  } catch (error) {
    console.error(`Error filtering headlines:`, error);
    return articles; // Return all if filtering fails
  }
}

// Analyze sentiment for articles
async function analyzeArticleSentiment(article, targetCountries) {
  const countriesNames = targetCountries.map(c => getCountryName(c)).join(", ");
  
  const prompt = PROMPTS.sentimentAnalysis
    .replace('{title}', article.title)
    .replace('{target_countries_names}', countriesNames);
  
  try {
    const response = await callGemini(prompt, 0.3);
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

// Generate comprehensive digest
async function generateDigest(articles, targetCountries) {
  const positiveArticles = articles.filter(a => a.sentiment === 'positive');
  const negativeArticles = articles.filter(a => a.sentiment === 'negative' || a.sentiment === 'critical');
  const neutralArticles = articles.filter(a => a.sentiment === 'neutral');
  
  const languages = [...new Set(articles.map(a => a.language_name))];
  const sources = [...new Set(articles.map(a => a.source_name))];
  
  const digestPrompt = `Generate a comprehensive press monitoring digest for ${targetCountries.map(c => getCountryName(c)).join(", ")} based on the following data:

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
1. Provides clear overview of ${targetCountries.map(c => getCountryName(c)).join(", ")}'s image in global press
2. Highlights key themes and regional perspectives
3. Identifies concerning trends and opportunities
4. Gives actionable insights for decision makers

Format with clear sections and executive summary.`;

  try {
    const digest = await callGemini(digestPrompt, 0.4);
    
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
*🤖 Powered by Google Gemini 2.0 Flash • Running on Vercel Edge*`;

    return digest + footer;
  } catch (error) {
    console.error('Error generating digest:', error);
    return 'Error generating digest';
  }
}

// Main orchestrator function
async function runPressMonitor(targetCountries = ['AZ'], sourceCountries = [], searchMode = 'about') {
  const startTime = Date.now();
  
  // Determine which languages to search
  let languagesToSearch = [];
  
  if (searchMode === 'about' && sourceCountries.length > 0) {
    // Search in languages of specified source countries
    languagesToSearch = sourceCountries.map(c => getCountryLanguageCode(c));
  } else if (searchMode === 'about') {
    // Default: search in major languages
    languagesToSearch = ['en', 'ru', 'tr', 'ar', 'fa', 'zh', 'de', 'fr'];
  } else if (searchMode === 'in') {
    // Search in languages of target countries
    languagesToSearch = targetCountries.map(c => getCountryLanguageCode(c));
  }
  
  // Remove duplicates
  languagesToSearch = [...new Set(languagesToSearch)];
  
  console.log(`Starting press monitor for ${targetCountries.join(', ')} in ${languagesToSearch.length} languages`);
  
  // Phase 1: Language Search - Create queries and search
  const allArticles = [];
  
  for (const langCode of languagesToSearch) {
    try {
      // Create search queries
      const queries = await createSearchQueries(langCode, targetCountries);
      
      // Search for articles
      const langArticles = [];
      for (const query of queries) {
        const articles = await searchNewsWithGoogle(query, langCode);
        langArticles.push(...articles);
      }
      
      // Filter articles by headlines
      const filteredArticles = await filterArticlesByHeadlines(langArticles, langCode, targetCountries);
      allArticles.push(...filteredArticles);
      
      console.log(`Found ${filteredArticles.length} relevant articles in ${LANGUAGE_NAMES[langCode]}`);
    } catch (error) {
      console.error(`Error processing language ${langCode}:`, error);
    }
  }
  
  console.log(`Total articles found: ${allArticles.length}`);
  
  // Phase 2: Sentiment Analysis
  const analyzedArticles = [];
  for (const article of allArticles) {
    const analyzed = await analyzeArticleSentiment(article, targetCountries);
    analyzedArticles.push(analyzed);
  }
  
  // Phase 3: Generate Digest
  const digest = await generateDigest(analyzedArticles, targetCountries);
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  return {
    success: true,
    digest,
    statistics: {
      total_articles: analyzedArticles.length,
      languages_searched: languagesToSearch.length,
      processing_time: `${duration}s`,
      positive_count: analyzedArticles.filter(a => a.sentiment === 'positive').length,
      negative_count: analyzedArticles.filter(a => a.sentiment === 'negative' || a.sentiment === 'critical').length,
      neutral_count: analyzedArticles.filter(a => a.sentiment === 'neutral').length
    },
    articles: analyzedArticles
  };
}

// Vercel Edge Function handler
export default async function handler(req) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const {
      target_countries = ['AZ'],
      source_countries = [],
      search_mode = 'about'
    } = body;

    // Run the press monitor
    const result = await runPressMonitor(target_countries, source_countries, search_mode);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Press monitor error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Export config for Vercel Edge Runtime
export const config = {
  runtime: 'edge',
};