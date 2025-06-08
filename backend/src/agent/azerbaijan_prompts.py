"""Azerbaijan Press Monitor Prompts"""
from datetime import datetime
import re

# Azerbaijan translations in different languages
AZERBAIJAN_KEYWORDS = {
    "en": ["Azerbaijan", "Azerbaijani", "Azeri", "Baku"],
    "ru": ["Азербайджан", "азербайджанский", "азербайджанец", "Баку"],
    "tr": ["Azerbaycan", "Azeri", "Azerbaycanlı", "Bakü"],
    "fa": ["آذربایجان", "آذربایجانی", "باکو"],
    "ar": ["أذربيجان", "أذربيجاني", "باكو"],
    "ka": ["აზერბაიჯანი", "აზერბაიჯანული", "ბაქო"],
    "de": ["Aserbaidschan", "aserbaidschanisch", "Baku"],
    "fr": ["Azerbaïdjan", "azerbaïdjanais", "Bakou"],
    "es": ["Azerbaiyán", "azerbaiyano", "Bakú"],
    "it": ["Azerbaigian", "azerbaigiano", "Baku"],
    "ja": ["アゼルバイジャン", "アゼルバイジャン人", "バクー"],
    "zh": ["阿塞拜疆", "阿塞拜疆人", "巴库"],
    "hi": ["अज़रबैजान", "अज़रबैजानी", "बाकू"],
    "ur": ["آذربائیجان", "آذربائیجانی", "باکو"],
    "th": ["อาเซอร์ไบจาน", "ชาวอาเซอร์ไบจาน", "บากู"],
    "id": ["Azerbaijan", "Azerbaijan", "Baku"],
    "kk": ["Әзірбайжан", "әзірбайжандық", "Баку"],
    "uz": ["Ozarbayjon", "ozarbayjonlik", "Boku"],
}

def extract_date_from_query(query: str) -> tuple[str, str]:
    """Extract date range from query text"""
    today = datetime.now()
    query_lower = query.lower()
    
    # Today
    if "сегодня" in query_lower or "today" in query_lower or "bugün" in query_lower:
        date_str = today.strftime("%Y-%m-%d")
        return f"after:{date_str}", "today"
    
    # Specific date patterns
    date_patterns = [
        r"за (\d{1,2}) (января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)",
        r"(\d{1,2}) (january|february|march|april|may|june|july|august|september|october|november|december)",
        r"(\d{1,2})\.(\d{1,2})\.(\d{4})",
        r"(\d{4})-(\d{1,2})-(\d{1,2})"
    ]
    
    # Last N days
    if match := re.search(r"за последние (\d+) дн|last (\d+) day|son (\d+) gün", query_lower):
        days = int(match.group(1) or match.group(2) or match.group(3))
        date_str = (today - datetime.timedelta(days=days)).strftime("%Y-%m-%d")
        return f"after:{date_str}", f"last {days} days"
    
    # This week
    if "неделю" in query_lower or "week" in query_lower or "hafta" in query_lower:
        date_str = (today - datetime.timedelta(days=7)).strftime("%Y-%m-%d")
        return f"after:{date_str}", "this week"
    
    # This month
    if "месяц" in query_lower or "month" in query_lower or "ay" in query_lower:
        date_str = today.replace(day=1).strftime("%Y-%m-%d")
        return f"after:{date_str}", "this month"
    
    # Default to last 3 days
    date_str = (today - datetime.timedelta(days=3)).strftime("%Y-%m-%d")
    return f"after:{date_str}", "last 3 days"

def get_country_language(query: str) -> tuple[str, str]:
    """Determine country and language from query"""
    country_langs = {
        "турции": ("Turkey", "tr"),
        "turkey": ("Turkey", "tr"),
        "türkiye": ("Turkey", "tr"),
        "россии": ("Russia", "ru"),
        "russia": ("Russia", "ru"),
        "иране": ("Iran", "fa"),
        "iran": ("Iran", "fa"),
        "грузии": ("Georgia", "ka"),
        "georgia": ("Georgia", "ka"),
        "германии": ("Germany", "de"),
        "germany": ("Germany", "de"),
        "франции": ("France", "fr"),
        "france": ("France", "fr"),
        "китае": ("China", "zh"),
        "china": ("China", "zh"),
        "японии": ("Japan", "ja"),
        "japan": ("Japan", "ja"),
        "казахстане": ("Kazakhstan", "kk"),
        "kazakhstan": ("Kazakhstan", "kk"),
        "узбекистане": ("Uzbekistan", "uz"),
        "uzbekistan": ("Uzbekistan", "uz"),
    }
    
    query_lower = query.lower()
    for key, (country, lang) in country_langs.items():
        if key in query_lower:
            return country, lang
    
    return "Global", "en"


azerbaijan_query_writer = """You are a search query generator for Azerbaijan Press Monitor.

Your task is to generate search queries to find news articles mentioning Azerbaijan in the specified country's media.

Instructions:
1. ALWAYS include date filters based on the requested time period
2. Use the LOCAL LANGUAGE keywords for Azerbaijan when searching specific country media
3. Include both the country name AND news/press terms in queries
4. Generate 3-5 diverse queries to capture different types of coverage

Date filter: {date_filter}
Time period: {time_period}
Country: {country}
Language: {language}
Azerbaijan keywords: {azerbaijan_keywords}

Format your response as JSON:
```json
{{
    "rationale": "Explanation of search strategy",
    "query": ["query1", "query2", "query3"]
}}
```

Context: {research_topic}
"""


azerbaijan_analyzer = """You are analyzing press articles about Azerbaijan for sentiment and summary.

For each article found, you must:
1. Create a SHORT summary (2-3 sentences max) focusing on HOW Azerbaijan is mentioned
2. Determine sentiment: POSITIVE, NEGATIVE, or NEUTRAL
3. Extract key phrases about Azerbaijan
4. Note the context of mention (politics, economy, culture, etc.)

CRITICAL: 
- Only analyze articles that actually mention Azerbaijan
- Focus on the country's perspective/opinion about Azerbaijan
- Ignore articles where Azerbaijan is mentioned only in passing

Articles to analyze:
{articles}

Format your response as JSON:
```json
{{
    "analyzed_articles": [
        {{
            "url": "article url",
            "title": "article title",
            "summary": "2-3 sentence summary of Azerbaijan mention",
            "sentiment": "POSITIVE/NEGATIVE/NEUTRAL",
            "confidence": 0.95,
            "key_phrases": ["phrase1", "phrase2"],
            "context": "politics/economy/culture/etc",
            "relevance": "high/medium/low"
        }}
    ],
    "excluded_articles": [
        {{
            "url": "article url",
            "reason": "why excluded (e.g., 'no Azerbaijan mention', 'only passing reference')"
        }}
    ]
}}
```
"""


digest_generator = """You are creating press digests about Azerbaijan coverage.

Based on the analyzed articles, create TWO separate digests:

1. POSITIVE DIGEST - compile all positive mentions
2. NEGATIVE DIGEST - compile all negative mentions

Each digest should:
- Group articles by topic/theme
- Highlight key positive/negative points
- Include specific quotes or statements
- Mention source countries and media outlets
- Be written in a professional, presidential briefing style

Articles data:
{articles_data}

Format your response as JSON:
```json
{{
    "positive_digest": {{
        "title": "Positive Press Coverage of Azerbaijan - {date}",
        "summary": "Executive summary of positive coverage",
        "themes": [
            {{
                "theme": "Economic Cooperation",
                "articles_count": 3,
                "key_points": ["point1", "point2"],
                "sources": ["media1 (country)", "media2 (country)"]
            }}
        ],
        "full_text": "Full digest text in professional style..."
    }},
    "negative_digest": {{
        "title": "Negative Press Coverage of Azerbaijan - {date}",
        "summary": "Executive summary of negative coverage",
        "themes": [
            {{
                "theme": "Human Rights Concerns",
                "articles_count": 2,
                "key_points": ["point1", "point2"],
                "sources": ["media1 (country)", "media2 (country)"]
            }}
        ],
        "full_text": "Full digest text in professional style..."
    }},
    "statistics": {{
        "total_articles": 25,
        "positive": 15,
        "negative": 8,
        "neutral": 2,
        "countries_covered": 5,
        "main_topics": ["economy", "politics", "culture"]
    }}
}}
```
"""