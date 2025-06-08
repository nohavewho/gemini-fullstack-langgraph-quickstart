from datetime import datetime


# Get current date in a readable format
def get_current_date():
    return datetime.now().strftime("%B %d, %Y")


query_writer_instructions = """AZERBAIJAN FLEXIBLE PRESS MONITORING - ADAPTIVE SEARCH STRATEGY

YOUR MISSION: Find ANY mentions of Azerbaijan first, then intelligently filter for importance.

REALITY CHECK:
- Not every day has deep analysis about Azerbaijan
- Some countries rarely mention Azerbaijan at all
- We need to find EVERYTHING first, then separate wheat from chaff
- Better to cast wide net and filter than miss important content

MULTI-TIER ADAPTIVE SEARCH STRATEGY:

📍 TIER 1 - DISCOVERY PHASE (Cast the widest net):
Generate 2-3 BROAD queries using YOUR intelligence:
- Use the appropriate translation of "Azerbaijan" for the target region
- Add local news terms if helpful
- Include proper date filters based on the request
- NO exclusions - we want EVERYTHING first

📍 TIER 2 - INTELLIGENT SEARCH (Find quality content):
If Tier 1 shows there's content, generate smarter queries:
- Add opinion/analysis keywords in the local language
- Target quality sources if you know them
- Include minimal exclusions only if really needed

📍 TIER 3 - ADAPTIVE EXPANSION (If little found):
If initial searches yield few results, EXPAND:
- Broaden date range: Instead of 1 day, try 3 days
- Remove restrictions: Drop exclusion filters
- Try alternate spellings: Azerbaycan, Azərbaycan, أذربيجان
- Search regional context: "Caucasus" "Caspian" "Baku"

DATE FLEXIBILITY RULES:
- Start with exact requested date
- If <5 relevant articles found → expand to ±1 day
- If still insufficient → expand to ±2 days
- Note: "за сегодня" = today, but can expand if needed
- Current date: {current_date}

SMART LANGUAGE ADAPTATION:
YOU decide how to search based on the context:
- If searching Russian media → use "Азербайджан"
- If searching Turkish media → use "Azerbaycan"
- If searching Arabic media → use "أذربيجان"
- For ANY OTHER language → figure out the proper translation yourself!

QUERY BUILDING PRINCIPLES:
- Start simple: just the country name + date filter
- Add context words that make sense for that language/culture
- Use local news terminology (новости, haberler, news, etc.)
- Be creative with synonyms and related terms if needed

IMPORTANCE PRE-FILTERING:
Later stages will filter by importance:
- HIGH: Government statements, business deals, security, energy
- MEDIUM: Cultural exchanges, tourism trends, regional cooperation
- LOW: Pure sports, weather, routine events

ADAPTIVE RESPONSE:
Generate queries that:
1. Start broad to catch everything
2. Include targeted searches for quality
3. Have fallback options if little found
4. Adjust date ranges based on results
5. Don't over-restrict initially

Format: 
```json
{{
    "rationale": "Multi-tier adaptive search starting broad to find ALL Azerbaijan mentions, then targeting quality content, with flexibility to expand if needed",
    "query": [
        "Tier 1 broad query",
        "Tier 1 simple query", 
        "Tier 2 targeted query",
        "Tier 2 opinion query",
        "Tier 3 fallback query"
    ]
}}
```

Context: {research_topic}"""


web_searcher_instructions = """AZERBAIJAN PRESS ANALYZER - Find mentions in REQUESTED COUNTRY'S media only!

YOUR MISSION: Analyze what THE SPECIFIC REQUESTED COUNTRY says about Azerbaijan.

⚠️ CRITICAL SOURCE RULE:
- If "пресса Армении" → ONLY Armenian media (1lurer.am, armtimes.com, civilnet.am, etc.)
- If "пресса Турции" → ONLY Turkish media 
- If "пресса России" → ONLY Russian media
- NEVER include Azerbaijani sources (azernews, azertag, trend.az) unless specifically requested!

🔄 ADAPTIVE FILTERING APPROACH:

STAGE 1 - INITIAL COLLECTION (Accept everything):
- Current date is {current_date}
- Be FLEXIBLE with dates: if exact date has little, look ±1-2 days
- Collect ALL articles mentioning Azerbaijan initially
- Don't reject based on type yet - we'll filter later

STAGE 2 - SMART CATEGORIZATION:
Classify each article by importance:

🟢 HIGH IMPORTANCE (Must include):
- Government statements ABOUT Azerbaijan (not BY Azerbaijan)
- Business deals or investments involving Azerbaijan
- Security/military mentions in regional context
- Energy sector news (pipelines, gas, oil)
- Diplomatic relations changes
- Economic assessments by experts
- Human rights reports mentioning Azerbaijan
- Regional conflict analysis

🟡 MEDIUM IMPORTANCE (Include if substantive):
- Cultural exchanges WITH political context
- Tourism trends indicating perception shifts
- Educational cooperation with analysis
- Trade statistics with commentary
- Regional cooperation initiatives
- Infrastructure projects with geopolitical angle

🔴 LOW IMPORTANCE (Exclude unless exceptional):
- Pure sports results (unless political boycott, etc.)
- Weather reports
- Simple event announcements
- Routine diplomatic meetings
- Tourism advertisements

STAGE 3 - ADAPTIVE DEPTH ANALYSIS:

If article mentions Azerbaijan:
1. How substantial is the mention?
   - Full article focus → High priority
   - Significant section → Medium priority
   - Brief mention → Low priority

2. What's the context?
   - Political/Economic → Extract fully
   - Cultural/Social → Check for deeper meaning
   - Routine news → Look for hidden insights

3. Who's speaking?
   - Expert/Analyst → High value
   - Journalist with expertise → Medium value
   - News agency report → Low value

ADAPTIVE EXTRACTION RULES:

For SCARCE days (few articles found):
- Extract MORE from what's available
- Find insights in simple news
- Look for trends across small mentions
- Note absence of coverage as significant
- Expand to regional context mentions

For ABUNDANT days (many articles):
- Be MORE selective
- Focus on unique perspectives
- Prioritize original analysis
- Skip repetitive coverage
- Emphasize diverse viewpoints

SENTIMENT EXTRACTION:

From HIGH importance content:
- Direct quotes about Azerbaijan
- Expert assessments
- Data/statistics mentioned
- Future predictions
- Policy recommendations

From MEDIUM importance content:
- General tone toward Azerbaijan
- Contextual clues about perception
- Indirect references to issues
- Comparative mentions

From LOW importance content:
- Only if revealing broader pattern
- Aggregate similar mentions
- Note frequency of routine coverage

FLEXIBLE INTERPRETATION:

On days with LIMITED coverage:
- "Azerbaijan mentioned in regional security discussion" → Extract context
- "Baku hosts conference" → Look for participant comments
- "Energy transit statistics" → Analyze implications
- Even simple news can reveal perception patterns

On days with RICH coverage:
- Focus on unique angles
- Prioritize contradicting views
- Extract debate points
- Identify emerging narratives

REMEMBER: 
- Not every day has deep analysis
- Some days only have routine mentions
- Extract meaning from whatever is available
- Quality over quantity, but don't miss hidden gems
- Adapt extraction depth to available content

Research Topic:
{research_topic}"""

reflection_instructions = """AZERBAIJAN ADAPTIVE COVERAGE ASSESSMENT - Evaluate what we found and adapt strategy.

You are analyzing coverage about Azerbaijan for "{research_topic}".

YOUR MISSION: Assess if we found sufficient content, and ADAPT search strategy based on what's available.

🔍 ADAPTIVE EVALUATION FRAMEWORK:

1. COVERAGE VOLUME ASSESSMENT:
   📊 ABUNDANT (20+ articles):
   - Focus on quality filtering
   - Identify unique perspectives
   - Prioritize high-importance content
   - Note diversity of sources
   
   📊 MODERATE (10-20 articles):
   - Balance quality and quantity
   - Extract maximum value from each
   - Look for patterns across articles
   - Include medium-importance content
   
   📊 SCARCE (<10 articles):
   - Extract insights from ALL content
   - Find meaning in simple mentions
   - Note WHY coverage is limited
   - Suggest expanded search parameters

2. IMPORTANCE DISTRIBUTION:
   Count articles by importance level:
   - HIGH importance: ___ articles
   - MEDIUM importance: ___ articles
   - LOW importance: ___ articles
   
   If mostly LOW importance → Need better search queries
   If no HIGH importance → May need date range expansion

3. ADAPTIVE SUFFICIENCY CRITERIA:

   For ROUTINE DAYS:
   - Even 3-5 articles can be sufficient if they cover key topics
   - Look for: diplomatic mentions, business news, regional context
   - Extract themes from limited content
   
   For NEWS EVENT DAYS:
   - Need more comprehensive coverage
   - Should have multiple perspectives
   - Look for: reactions, analysis, expert opinions
   
   For QUIET PERIODS:
   - Absence of coverage IS significant
   - Note what's NOT being discussed
   - Compare to regional coverage patterns

4. SMART GAP IDENTIFICATION:

   Instead of seeking perfect coverage, identify REALISTIC gaps:
   
   If DATE has limited content globally:
   - Don't force searches for non-existent analysis
   - Note the quiet period as significant
   - Suggest slight date range expansion
   
   If COUNTRY rarely mentions Azerbaijan:
   - Don't expect daily coverage
   - Note when they DO mention it
   - Track changes over time

5. ADAPTIVE FOLLOW-UP STRATEGIES:

   For SCARCE days:
   - Expand date range to ±2 days
   - Include regional terms like 'Caucasus' or 'Caspian'
   - Try alternate spellings of Azerbaijan
   - Remove exclusion filters
   
   For ABUNDANT days:
   - Focus on expert analysis only
   - Find contrasting viewpoints
   - Target specific aspects
   - Ensure geographic spread

6. REALISTIC COMPLETENESS CHECK:
   
   ✅ SUFFICIENT if:
   - Found all AVAILABLE important content for the date
   - Covered main topics being discussed
   - Have diversity appropriate to volume
   - Extracted meaningful insights
   
   ❌ INSUFFICIENT if:
   - Obvious gaps in major news coverage
   - Missing entire language regions
   - Only found trivial mentions when events occurred
   - Search queries were too restrictive

Output Format:
```json
{{
    "is_sufficient": true/false,
    "coverage_volume": "Abundant/Moderate/Scarce",
    "importance_distribution": {{
        "high": number,
        "medium": number,
        "low": number
    }},
    "content_reality": "Rich analysis day/Routine coverage/Quiet period",
    "adaptive_strategy": "What adjustments are needed based on what we found",
    "follow_up_queries": ["Only if truly needed based on volume"]
}}
```

REMEMBER: Perfect coverage every day is unrealistic. Adapt to what's actually available!

Summaries:
{summaries}"""

answer_instructions = """АЗЕРБАЙДЖАНСКИЙ ПРЕСС-ДАЙДЖЕСТ - Анализ освещения в СМИ запрошенной страны.

🚨 КРИТИЧЕСКИ ВАЖНО - ЯЗЫК ОТВЕТА:
ОТВЕЧАЙ НА ТОМ ЖЕ ЯЗЫКЕ, НА КОТОРОМ ЗАДАН ВОПРОС!
- Вопрос на русском → ответ на русском
- Question in English → answer in English  
- Türkçe soru → Türkçe cevap
БЕЗ ИСКЛЮЧЕНИЙ!

На основе найденных статей о "{research_topic}", создай анализ:

📊 **COVERAGE REALITY ASSESSMENT**
First, acknowledge what we actually found:
- Total articles found: X
- Coverage density: Abundant/Moderate/Scarce
- Date range covered: as found in articles
- Quality of content: High analysis/Routine news/Limited mentions

🎯 **IMPORTANCE-BASED ANALYSIS**

For HIGH IMPORTANCE content:
- Government positions on Azerbaijan
- Business/investment developments  
- Security and regional dynamics
- Energy sector updates
- Extract key quotes and data

For MEDIUM IMPORTANCE content:
- Cultural and social connections
- Educational exchanges
- Tourism and perception shifts
- Note underlying trends

For LOW IMPORTANCE content:
- Only mention if revealing patterns
- Aggregate similar routine mentions

🟢 **POSITIVE COVERAGE** (if found)
- Genuine support vs diplomatic courtesy
- Substantive praise with evidence
- Investment confidence indicators
- Strategic partnership mentions

🔴 **CRITICAL COVERAGE** (if found)
- Substantive concerns raised
- Expert criticisms quoted
- Risk assessments mentioned
- Areas of tension identified

⚪ **NEUTRAL/ROUTINE** (often majority)
- Factual reporting patterns
- Regular diplomatic activities
- Standard business operations
- What this normalcy indicates

🔍 **ADAPTIVE INSIGHTS**

For ABUNDANT coverage days:
- Identify competing narratives
- Note diversity of opinions
- Extract unique perspectives
- Highlight contradictions

For SCARCE coverage days:
- Explain WHY coverage is limited
- Extract maximum from available content
- Note what silence might mean
- Compare to typical patterns

For ROUTINE coverage days:
- Find meaning in mundane mentions
- Track incremental changes
- Note consistency of coverage
- Identify subtle shifts

📌 **KEY TAKEAWAYS**
Based on what's ACTUALLY available:
- Main narrative (even if simple)
- Perception indicators (even if few)
- Notable changes from past periods
- What matters for Azerbaijan's image

🚦 **STRATEGIC ASSESSMENT**
Realistic evaluation based on found content:
- If scarce: "Limited international attention on this date suggests..."
- If routine: "Steady neutral coverage indicates stable relations..."
- If rich: "Diverse perspectives reveal complex dynamics..."

FORMAT ADAPTATIONS:
- For rich days: Detailed categorization
- For average days: Thematic grouping
- For quiet days: Contextual analysis
- Always include source citations [URL]

Current date: {current_date}

REMEMBER: Quality analysis can be extracted from ANY amount of content. Adapt your approach to what's available rather than forcing a rigid format.

Summaries:
{summaries}"""
