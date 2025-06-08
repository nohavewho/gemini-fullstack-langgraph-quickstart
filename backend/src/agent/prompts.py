from datetime import datetime


# Get current date in a readable format
def get_current_date():
    return datetime.now().strftime("%B %d, %Y")


query_writer_instructions = """SEARCH AZERBAIJAN MENTIONS IN LOCAL LANGUAGE

CRITICAL: Use LOCAL LANGUAGE for search terms!
- Armenian media: search "Ադրբեջան"
- Turkish media: search "Azerbaycan"  
- Russian media: search "Азербайджан"
- Georgian media: search "აზერბაიჯანი"
- Persian/Farsi media: search "آذربایجان"
- Arabic media: search "أذربيجان"

DEFAULT BEHAVIOR: If no specific country mentioned, search neighbors (Turkey, Russia, Iran, Georgia, Armenia).

Current date: {current_date}

Generate 3-5 queries:
1. Basic: [country name in LOCAL language] + date
2. News: add local news terms (новости, haberler, أخبار)
3. Analysis: add opinion/analysis terms in LOCAL language
4. Fallback: broaden date range if needed

Format: 
```json
{{
    "rationale": "Search strategy using local language terms",
    "query": [
        "query 1",
        "query 2", 
        "query 3",
        "query 4",
        "query 5"
    ]
}}
```

Context: {research_topic}"""


web_searcher_instructions = """ANALYZE AZERBAIJAN MENTIONS

Current date: {current_date}

SOURCE RULES:
- "пресса Армении" → ONLY Armenian media
- "пресса Турции" → ONLY Turkish media 
- "пресса России" → ONLY Russian media
- EXCLUDE Azerbaijani sources (azernews, azertag, trend.az)

IMPORTANCE LEVELS:
HIGH: Government statements, business deals, security, energy, diplomacy
MEDIUM: Cultural exchanges, tourism, trade with commentary
LOW: Sports, weather, routine events (exclude)

Extract from each article:
1. Key facts about Azerbaijan
2. Sentiment/tone
3. Expert quotes if any
4. Context and implications

If few articles found: expand date range ±1-2 days.

Research Topic: {research_topic}"""

reflection_instructions = """ASSESS COVERAGE

Analyzing: "{research_topic}"

VOLUME:
- 20+ articles: Abundant
- 10-20 articles: Moderate  
- <10 articles: Scarce

SUFFICIENCY CHECK:
- Found key topics? → Sufficient
- Missing major news? → Expand search
- Only trivial mentions? → Try different queries

If SCARCE: expand date range ±2 days, add regional terms.

Output:
```json
{{
    "is_sufficient": true/false,
    "coverage_volume": "Abundant/Moderate/Scarce",
    "importance_distribution": {{
        "high": number,
        "medium": number,
        "low": number
    }},
    "follow_up_queries": ["only if needed"]
}}
```

Summaries:
{summaries}"""

answer_instructions = """RESPOND IN THE SAME LANGUAGE AS THE QUERY!
- Вопрос на русском → ответ на русском
- Question in English → answer in English  
- Türkçe soru → Türkçe cevap

Analyze "{research_topic}" coverage:

📊 **SUMMARY**
- Articles found: X
- Key topics covered
- Overall sentiment

🎯 **KEY FINDINGS**

HIGH IMPORTANCE:
- Government statements
- Business/energy deals
- Security issues
[Include quotes and sources]

MEDIUM IMPORTANCE:
- Cultural/educational exchanges
- Trade developments
[Brief summary]

📌 **MAIN TAKEAWAYS**
- Primary narrative about Azerbaijan
- Notable changes or trends
- Strategic implications

Always cite sources with [URL].

Current date: {current_date}

Summaries:
{summaries}"""
