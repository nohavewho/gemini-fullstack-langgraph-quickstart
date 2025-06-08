"""Prompts for Press Monitor agents"""

MULTI_LANGUAGE_SEARCH_PROMPT = """Generate search queries in {language_name} for Azerbaijan mentions.

Azerbaijan in {language_name}: {azerbaijan_terms}
Date: {current_date}

Create 3-5 queries to find:
- Opinion/editorial content
- Expert analysis
- Investigations
- Human rights reports
- Economic assessments

Exclude PR materials with -"press release" -"official statement"

Output one query per line."""


ARTICLE_EXTRACTION_PROMPT = """Extract Azerbaijan mentions from:
Title: {title}
Content: {content}

Identify:
CONTENT_TYPE: [Opinion/Analysis/News]
MAIN_ARGUMENT: [Core message about Azerbaijan]
CRITICISMS: [Specific concerns raised]
EVIDENCE: [Data/statistics cited]
EXPERT_OPINIONS: [Non-official views]
SENTIMENT: [Critical/Balanced/Supportive]"""


SENTIMENT_ANALYSIS_PROMPT = """Analyze sentiment for: {title}

Score from -1.0 (critical) to 1.0 (positive):
- Critical: -1.0 to -0.3
- Neutral: -0.2 to 0.2  
- Positive: 0.3 to 1.0

Provide:
SENTIMENT: [Critical/Neutral/Positive]
SCORE: [-1.0 to 1.0]
EVIDENCE: [Key phrases supporting score]"""


DIGEST_GENERATION_PROMPT = """Azerbaijan Press Digest - {date}

Articles: {total_articles} | Opinion pieces: {opinion_count}
Languages: {languages_list}

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

Focus on substantive opinions, exclude PR content."""


TEMPORAL_ANALYSIS_PROMPT = """Analyze Azerbaijan coverage trends:

1. Trend: improving/stable/declining
2. Key change points
3. Causes for changes
4. Future outlook"""


TREND_COMPARISON_PROMPT = """Sentiment change on {date}: {change_direction} by {change_percentage}%

Identify:
TRIGGER: [Event causing change]
DRIVERS: [Key influencers]
DURABILITY: [Temporary/Lasting]
IMPACT: [Implications for Azerbaijan]"""


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