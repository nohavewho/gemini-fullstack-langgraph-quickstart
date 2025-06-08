"""Prompts for Press Monitor agents"""

MULTI_LANGUAGE_SEARCH_PROMPT = """You are a multilingual expert at finding GENUINE PUBLIC OPINION about Azerbaijan. Generate search queries in {language_name} ({language_code}) to find REAL DISCOURSE, not PR.

Key terms for Azerbaijan in {language_name}: {azerbaijan_terms}

Current date: {current_date}

Generate 3-5 SOPHISTICATED search queries in {language_name} to find:

1. OPINION & EDITORIAL content:
   - Op-eds, editorials, commentary
   - Expert opinions, analysis
   - Think tank reports
   - Academic perspectives

2. INVESTIGATIVE & IN-DEPTH reporting:
   - Long-form journalism
   - Investigations, exposes
   - Data-driven analysis
   - Field reports

3. CIVIL SOCIETY & HUMAN perspectives:
   - Human rights assessments
   - Civil society views
   - Personal stories
   - Social issues

4. BUSINESS & ECONOMIC reality:
   - Investment climate analysis
   - Risk assessments
   - Market research
   - Economic expert views

LANGUAGE-SPECIFIC PATTERNS:

Russian:
- "Азербайджан" мнение эксперт
- "Азербайджан" анализ проблемы
- "Азербайджан" исследование коррупция
- "Азербайджан" права человека отчет

English:
- "Azerbaijan" opinion editorial -"press release"
- "Azerbaijan" expert analysis -official -minister
- "Azerbaijan" investigation corruption
- "Azerbaijan" "human rights" report

ADD EXCLUSIONS to avoid PR:
- -"пресс-релиз" -"заявление" -"официальный"
- -"press release" -"official statement" -"announces"

Output one sophisticated query per line, no numbering."""


ARTICLE_EXTRACTION_PROMPT = """Analyze this article for GENUINE OPINIONS and REAL DISCOURSE about Azerbaijan.

Article Title: {title}
Article Content: {content}
Language: {language_name}

Azerbaijan terms to look for: {azerbaijan_terms}

CRITICAL ANALYSIS REQUIRED:

1. CONTENT TYPE IDENTIFICATION:
   - Is this: Opinion/Editorial/Analysis/Investigation/Report/News?
   - Author credentials/expertise?
   - Source type: Think tank/Media outlet/NGO/Academic/Business?

2. AUTHENTICITY ASSESSMENT:
   - Does it contain original analysis or just repeat official statements?
   - Are there multiple sources cited beyond government officials?
   - Does it discuss problems/challenges or only positive aspects?
   - Is there critical thinking or questioning of narratives?

3. EXTRACT KEY ELEMENTS:
   - Main argument/thesis about Azerbaijan
   - Specific criticisms or concerns raised
   - Data/statistics/evidence presented
   - Expert opinions quoted (non-official)
   - Recommendations or warnings given

4. OPINION INDICATORS:
   - Direct opinion statements ("I believe", "experts argue", "analysis shows")
   - Evaluative language (positive or negative assessments)
   - Comparative analysis with other countries
   - Future predictions or scenarios

Format your response as:
CONTENT_TYPE: [Opinion/Editorial/Analysis/Investigation/Report/News]
AUTHOR_CREDIBILITY: [High/Medium/Low - explain why]
AUTHENTICITY: [Genuine Opinion/Mixed/PR Material - explain]
MAIN_ARGUMENT: [Core thesis about Azerbaijan]
CRITICISMS: [Specific concerns or negative points raised]
EVIDENCE: [Data, statistics, or research cited]
EXPERT_OPINIONS: [Non-official expert views quoted]
KEY_INSIGHTS: [Most important revelations or assessments]
OVERALL_SENTIMENT: [Critical/Balanced/Supportive - with nuance]"""


SENTIMENT_ANALYSIS_PROMPT = """Analyze the GENUINE SENTIMENT of this article about Azerbaijan, distinguishing real opinion from diplomatic language.

Title: {title}
Content: {content}
Content Type: {content_type}
Main Argument: {main_argument}

CRITICAL SENTIMENT ANALYSIS:

1. AUTHENTICITY OF SENTIMENT:
   - Is this genuine opinion or diplomatic courtesy?
   - Does the sentiment come from independent analysis or official sources?
   - Are criticisms substantive or superficial?
   - Is praise specific and evidence-based or generic?

2. SENTIMENT LAYERS:
   a) Surface sentiment (what it appears to say)
   b) Underlying sentiment (what it really means)
   c) Implied criticisms (reading between lines)
   d) Contextual sentiment (compared to regional coverage)

3. SENTIMENT INDICATORS:
   GENUINE POSITIVE:
   - Specific achievements with data
   - Comparative advantages cited
   - Expert endorsements
   - Investment recommendations
   
   GENUINE NEGATIVE:
   - Specific problems identified
   - Data supporting criticism
   - Expert concerns quoted
   - Warnings or cautions issued
   
   DIPLOMATIC/NEUTRAL:
   - Vague positive language
   - "Both sides" framing
   - Official quotes only
   - Avoiding controversial topics

4. SCORING GUIDE:
   -1.0 to -0.7: Strongly critical (serious concerns, warnings)
   -0.6 to -0.3: Moderately critical (problems identified)
   -0.2 to 0.2: Genuinely neutral or mixed
   0.3 to 0.6: Moderately positive (real achievements noted)
   0.7 to 1.0: Strongly positive (enthusiastic endorsement)

Provide:
GENUINE_SENTIMENT: [Critical/Negative/Mixed/Positive/Supportive]
AUTHENTICITY: [Genuine Opinion/Diplomatic Language/PR Material]
CONFIDENCE_SCORE: [-1.0 to 1.0 with detailed justification]
KEY_EVIDENCE: [Specific phrases/data supporting assessment]
HIDDEN_SENTIMENT: [What's implied but not directly stated]
CONTEXT: [How this compares to typical coverage]"""


DIGEST_GENERATION_PROMPT = """Create a comprehensive GENUINE PUBLIC OPINION digest about Azerbaijan.

Digest Type: {digest_type}
Total Articles: {total_articles}
Genuine Opinion Pieces: {opinion_count}
PR/Official Content: {pr_count}
Languages Covered: {languages_count} ({languages_list})
Regions: {regions_count}
Date: {date}

Content Analysis:
{content_by_type}

Key Opinion Themes:
{opinion_themes}

CREATE THREE DISTINCT SECTIONS:

## 1. GENUINE PUBLIC DISCOURSE DIGEST

### Expert & Think Tank Perspectives
- Summarize main arguments from think tanks/experts
- Highlight specific criticisms or endorsements
- Note consensus views vs outlier opinions

### Media Commentary & Editorials  
- Key editorial positions from major outlets
- Opinion trends across different regions
- Notable columnist perspectives

### Civil Society & Human Rights Views
- Human rights organization assessments
- Civil society concerns raised
- Social issue coverage insights

### Economic & Business Analysis
- Investment climate assessments
- Business risk evaluations  
- Economic expert predictions

## 2. SENTIMENT REALITY CHECK

### Authentic Positive Sentiment
- Evidence-based praise
- Specific achievements recognized
- Genuine opportunities identified

### Genuine Concerns & Criticisms
- Substantive problems identified
- Expert warnings issued
- Systemic issues discussed

### Mixed/Nuanced Views
- Balanced assessments
- Conditional support/criticism
- Context-dependent opinions

## 3. KEY INSIGHTS & PATTERNS

### Dominant Narratives
- What stories are gaining traction
- Emerging themes in coverage
- Shift from previous periods

### Regional Variations
- How opinions differ by region
- Cultural factors in coverage
- Geopolitical influences

### Forward-Looking Analysis
- Expert predictions
- Recommended actions
- Potential scenarios

FORMAT REQUIREMENTS:
- Use clear markdown headers
- Include source citations [Author, Outlet]
- Highlight most impactful quotes
- Separate genuine opinion from PR
- Provide actionable intelligence
- Focus on what matters for reputation

EMPHASIZE: This digest captures REAL PUBLIC DISCOURSE, not official narratives."""


TEMPORAL_ANALYSIS_PROMPT = """Analyze the temporal trends in Azerbaijan's press coverage.

Historical data provided shows sentiment changes over time.
Identify:
1. Overall trend direction (improving/stable/declining)
2. Significant change points
3. Potential causes for changes
4. Predictions for future trends

Be analytical and data-driven in your assessment."""


TREND_COMPARISON_PROMPT = """Analyze what caused this change in GENUINE PUBLIC OPINION about Azerbaijan.

Date of change: {date}
Direction: {change_direction}
Change magnitude: {change_percentage}%
Opinion vs PR ratio: {opinion_ratio}

Genuine opinion pieces around this time:
{opinion_articles}

Key events/developments:
{events_context}

ANALYZE THE SHIFT IN PUBLIC DISCOURSE:

1. TRIGGER IDENTIFICATION:
   - Specific event that sparked opinion change?
   - Policy decision that drew criticism/praise?
   - International development affecting perception?
   - Investigative report or expose published?
   - Expert report or study released?

2. OPINION LEADERS DRIVING CHANGE:
   - Which think tanks weighed in?
   - Key media outlets that shifted tone?
   - Influential experts who spoke out?
   - Organizations that issued assessments?

3. NATURE OF SENTIMENT SHIFT:
   - From neutral to critical?
   - From ignored to scrutinized?
   - From supportive to concerned?
   - Widening or narrowing of criticism?

4. AUTHENTICITY ASSESSMENT:
   - Is this organic opinion shift or orchestrated?
   - Are multiple independent sources aligned?
   - Does timing suggest coordinated campaign?
   - Are concerns substantive or superficial?

5. DURABILITY PREDICTION:
   - Temporary reaction to specific event?
   - Fundamental shift in perception?
   - Likely to intensify or fade?
   - Potential for long-term impact?

Provide:
MAIN_TRIGGER: [Specific event/development]
OPINION_DRIVERS: [Key influencers of change]
SHIFT_TYPE: [Organic/Orchestrated/Mixed]
DURABILITY: [Temporary spike/Lasting change/Unclear]
IMPLICATIONS: [What this means for Azerbaijan's image]
EVIDENCE: [Specific quotes/data supporting analysis]"""


LANGUAGE_SPECIFIC_PROMPTS = {
    'ru': """Особое внимание к РЕАЛЬНЫМ МНЕНИЯМ в российских СМИ:
    - Ищите авторские колонки, экспертные оценки, аналитику
    - Отделяйте официальную риторику от независимых мнений
    - Обращайте внимание на критику в экономических и правозащитных изданиях
    - Ищите мнения think tanks: Карнеги, Валдай, РСМД""",
    
    'tr': """Türk medyasında GERÇEK GÖRÜŞLERE odaklanın:
    - Köşe yazıları, uzman yorumları, araştırma raporları
    - Resmi açıklamalardan bağımsız görüşleri ayırın
    - İnsan hakları ve ekonomi konularındaki eleştirilere dikkat
    - Think tank görüşleri: SETA, TESEV, SDE""",
    
    'fa': """توجه ویژه به نظرات واقعی در رسانه های فارسی:
    - مقالات تحلیلی، نظرات کارشناسان، گزارش های تحقیقاتی
    - جدا کردن بیانیه های رسمی از نظرات مستقل
    - توجه به انتقادات در حوزه حقوق بشر و اقتصاد
    - دیدگاه های اندیشکده ها و موسسات پژوهشی""",
    
    'ar': """التركيز على الآراء الحقيقية في الإعلام العربي:
    - مقالات الرأي، تحليلات الخبراء، تقارير البحوث
    - فصل البيانات الرسمية عن الآراء المستقلة
    - الانتباه للنقد في مجال حقوق الإنسان والاقتصاد
    - آراء مراكز الفكر والمؤسسات البحثية""",
    
    'zh': """关注中文媒体中的真实观点：
    - 寻找专栏文章、专家评论、深度分析
    - 区分官方辞令与独立观点
    - 注意经济和人权领域的批评声音
    - 关注智库观点：布鲁金斯、卡内基等""",
    
    'en': """Focus on GENUINE OPINIONS in English media:
    - Op-eds, expert analysis, investigative reports
    - Distinguish PR from independent views
    - Look for criticism in economic and human rights coverage
    - Think tank views: Carnegie, Brookings, CFR, Atlantic Council""",
}


def get_language_specific_instruction(language_code: str) -> str:
    """Get language-specific instructions for analysis"""
    return LANGUAGE_SPECIFIC_PROMPTS.get(
        language_code,
        f"Pay special attention to the tone and context of Azerbaijan mentions in {language_code} media."
    )