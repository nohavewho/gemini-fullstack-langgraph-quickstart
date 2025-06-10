/**
 * Press Monitor API with AI SDK
 * Using streaming for real-time updates
 */

import { streamText, generateText } from 'ai';
import { google } from '@ai-sdk/google';

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
    'SA': '🇸🇦', 'AE': '🇦🇪', 'EG': '🇪🇬', 'IN': '🇮🇳', 'BR': '🇧🇷',
    'PT': '🇵🇹', 'NL': '🇳🇱', 'BE': '🇧🇪', 'AT': '🇦🇹', 'CH': '🇨🇭',
    'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮', 'PL': '🇵🇱',
    'MA': '🇲🇦', 'IL': '🇮🇱', 'QA': '🇶🇦', 'KW': '🇰🇼', 'BH': '🇧🇭',
    'OM': '🇴🇲', 'JO': '🇯🇴', 'LB': '🇱🇧', 'SY': '🇸🇾', 'IQ': '🇮🇶',
    'YE': '🇾🇪', 'PK': '🇵🇰', 'TH': '🇹🇭', 'MY': '🇲🇾', 'ID': '🇮🇩',
    'VN': '🇻🇳', 'PH': '🇵🇭', 'AU': '🇦🇺', 'NZ': '🇳🇿', 'CA': '🇨🇦',
    'MX': '🇲🇽', 'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴', 'PE': '🇵🇪'
  };
  return flags[countryCode] || '🏳️';
}

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
    model: google(model),
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

Return a JSON array with EXACTLY ${count} article objects. Each object must have these fields:
- source: string (media outlet name)
- headline: string (in ${languageName})  
- summary: string (2-3 sentences in ${languageName})
- sentiment: string (positive/negative/neutral)
- topic: string (category)

Example format:
[
  {
    "source": "Reuters",
    "headline": "Example headline",
    "summary": "Article summary here.",
    "sentiment": "positive",
    "topic": "economy"
  }
]`;

  const { text } = await generateText({
    model: google(model),
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
  
  // Analyze articles
  const positive = articles.filter(a => a.sentiment === 'positive');
  const negative = articles.filter(a => a.sentiment === 'negative');
  const neutral = articles.filter(a => a.sentiment === 'neutral');
  
  const coverageByCountry = {};
  const sources = new Set();
  const languages = new Set();
  
  articles.forEach(article => {
    if (!coverageByCountry[article.country]) {
      coverageByCountry[article.country] = [];
    }
    coverageByCountry[article.country].push(article);
    sources.add(article.source);
    languages.add(article.language);
  });

  // Build main themes
  const mainThemes = articles.reduce((themes, article) => {
    const topic = article.topic || 'general';
    themes[topic] = (themes[topic] || 0) + 1;
    return themes;
  }, {});

  const prompt = `Create an EXECUTIVE PRESS MONITORING DIGEST for ${targetNames}

Based on analysis of ${articles.length} articles from ${sources.size} sources in ${languages.size} languages.

## 📊 SENTIMENT OVERVIEW
Positive: ${((positive.length / articles.length) * 100).toFixed(1)}% (${positive.length} articles)
Negative: ${((negative.length / articles.length) * 100).toFixed(1)}% (${negative.length} articles)  
Neutral: ${((neutral.length / articles.length) * 100).toFixed(1)}% (${neutral.length} articles)

## 📰 KEY COVERAGE BY REGION
${Object.entries(coverageByCountry).map(([country, countryArticles]) => `
### ${getCountryFlag(country)} ${COUNTRY_NAMES[country]}
${countryArticles.map(a => `- **${a.headline}** (${a.sentiment})`).join('\n')}
`).join('\n')}

## 🔍 MAIN THEMES IDENTIFIED
${Object.entries(mainThemes).map(([theme, count]) => `- **${theme}**: ${count} articles`).join('\n')}

${userQuery ? `\n## 🎯 USER QUERY FOCUS\nUser specifically asked: "${userQuery}"\n` : ''}

## 💡 STRATEGIC INSIGHTS

Synthesize the findings into actionable intelligence:
1. How is ${targetNames} perceived in different regions?
2. What are the main concerns and opportunities?
3. Which narratives are gaining traction?
4. What actions should decision-makers consider?

CRITICAL: Write EVERYTHING in ${languageName} language! No English words except source names.`;

  const { text: digest } = await generateText({
    model: google(model),
    prompt,
    temperature: 0.7,
    maxTokens: 3000,
  });
  
  // Add visual statistics
  const visualStats = generateVisualStatistics(
    articles,
    coverageByCountry,
    Array.from(languages),
    Array.from(sources),
    positive,
    negative,
    neutral,
    userLanguage
  );
  
  return digest + '\n\n' + visualStats;
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

## ${t.metadata}

- 📅 **${t.date}**: ${new Date().toLocaleDateString(userLanguage === 'ru' ? 'ru-RU' : 'en-US')}
- 📰 **${t.total}**: ${allArticles.length}
- 🌐 **${t.langs}**: ${languages.length}
- 📊 **${t.sources}**: ${sources.length}
- ⚠️ **${t.riskLevel}**: ${riskLevel}

---
`;

  return visualStats;
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
    
    console.log('Generated articles count:', allArticles.length);
    console.log('Sample article:', allArticles[0]);

    // Generate digest
    const fullDigest = await generateDigest(
      allArticles,
      targetCountries,
      userLanguage,
      model,
      searchQuery
    );

    if (stream) {
      // For streaming, we need to stream the already generated content
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(fullDigest));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      // Non-streaming response
      return new Response(JSON.stringify({
        success: true,
        digest: fullDigest,
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