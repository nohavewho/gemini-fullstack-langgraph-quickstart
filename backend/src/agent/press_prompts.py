"""Prompts for Press Monitor agents"""

from typing import List, Optional
from .countries_config import get_country_name, get_country_translations


MULTI_LANGUAGE_SEARCH_PROMPT = """Generate search queries in {language_name} for {target_countries_names}.

YOU MUST:
1. Translate country names to {language_name} YOURSELF
2. Use ONLY {language_name} for ALL search terms
3. Create natural queries a local would use

Target countries: {target_countries_names}
Date: {current_date}

Output 3-5 queries, one per line."""


ARTICLE_EXTRACTION_PROMPT = """Extract mentions of {target_countries_names} from:
Title: {title}
Content: {content}

Identify:
CONTENT_TYPE: [Opinion/Analysis/News]
MAIN_ARGUMENT: [Core message about the countries]
CRITICISMS: [Specific concerns raised]
EVIDENCE: [Data/statistics cited]
EXPERT_OPINIONS: [Non-official views]
SENTIMENT: [Critical/Balanced/Supportive]
COUNTRIES_MENTIONED: [Which target countries are discussed]"""


SENTIMENT_ANALYSIS_PROMPT = """Analyze sentiment for: {title}
About countries: {target_countries_names}

Score from -1.0 (critical) to 1.0 (positive):
- Critical: -1.0 to -0.3
- Neutral: -0.2 to 0.2  
- Positive: 0.3 to 1.0

Provide:
SENTIMENT: [Critical/Neutral/Positive]
SCORE: [-1.0 to 1.0]
EVIDENCE: [Key phrases supporting score]
COUNTRY_SCORES: [Individual scores per country if multiple]"""


DIGEST_GENERATION_PROMPT = """{target_countries_names} Press Digest - {date}

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

Focus on substantive opinions, exclude PR content."""


TEMPORAL_ANALYSIS_PROMPT = """Analyze coverage trends for {target_countries_names}:

1. Trend: improving/stable/declining
2. Key change points
3. Causes for changes
4. Future outlook
5. Country-specific differences"""


TREND_COMPARISON_PROMPT = """Sentiment change on {date}: {change_direction} by {change_percentage}%
Countries: {target_countries_names}

Identify:
TRIGGER: [Event causing change]
DRIVERS: [Key influencers]
DURABILITY: [Temporary/Lasting]
IMPACT: [Implications for the countries]
COUNTRY_DIFFERENCES: [How each country is affected differently]"""


CROSS_REFERENCE_PROMPT = """Analyze coverage of {target_countries_names} in {source_countries_names} media:

Focus on:
1. How {source_countries_names} media portrays {target_countries_names}
2. Key themes and narratives
3. Differences in coverage between source countries
4. Political/economic context influencing coverage"""


LANGUAGE_SPECIFIC_PROMPTS = {
    'ru': """Особое внимание к РЕАЛЬНЫМ МНЕНИЯМ в российских СМИ о {target_countries_names}:
    - Ищите авторские колонки, экспертные оценки, аналитику
    - Отделяйте официальную риторику от независимых мнений
    - Обращайте внимание на критику в экономических и правозащитных изданиях
    - Ищите мнения think tanks: Карнеги, Валдай, РСМД""",
    
    'tr': """Türk medyasında {target_countries_names} hakkında GERÇEK GÖRÜŞLERE odaklanın:
    - Köşe yazıları, uzman yorumları, araştırma raporları
    - Resmi açıklamalardan bağımsız görüşleri ayırın
    - İnsan hakları ve ekonomi konularındaki eleştirilere dikkat
    - Think tank görüşleri: SETA, TESEV, SDE""",
    
    'fa': """توجه ویژه به نظرات واقعی در رسانه های فارسی درباره {target_countries_names}:
    - مقالات تحلیلی، نظرات کارشناسان، گزارش های تحقیقاتی
    - جدا کردن بیانیه های رسمی از نظرات مستقل
    - توجه به انتقادات در حوزه حقوق بشر و اقتصاد
    - دیدگاه های اندیشکده ها و موسسات پژوهشی""",
    
    'ar': """التركيز على الآراء الحقيقية في الإعلام العربي حول {target_countries_names}:
    - مقالات الرأي، تحليلات الخبراء، تقارير البحوث
    - فصل البيانات الرسمية عن الآراء المستقلة
    - الانتباه للنقد في مجال حقوق الإنسان والاقتصاد
    - آراء مراكز الفكر والمؤسسات البحثية""",
    
    'zh': """关注中文媒体中关于{target_countries_names}的真实观点：
    - 寻找专栏文章、专家评论、深度分析
    - 区分官方辞令与独立观点
    - 注意经济和人权领域的批评声音
    - 关注智库观点：布鲁金斯、卡内基等""",
    
    'en': """Focus on GENUINE OPINIONS about {target_countries_names} in English media:
    - Op-eds, expert analysis, investigative reports
    - Distinguish PR from independent views
    - Look for criticism in economic and human rights coverage
    - Think tank views: Carnegie, Brookings, CFR, Atlantic Council""",
}


def get_language_specific_instruction(language_code: str, target_countries: List[str]) -> str:
    """Get language-specific instructions for analysis"""
    countries_names = ", ".join([get_country_name(c) for c in target_countries])
    
    if language_code in LANGUAGE_SPECIFIC_PROMPTS:
        return LANGUAGE_SPECIFIC_PROMPTS[language_code].format(target_countries_names=countries_names)
    
    return f"Pay special attention to the tone and context of {countries_names} mentions in {language_code} media."


def format_prompt_with_countries(prompt_template: str, target_countries: List[str], 
                               source_countries: Optional[List[str]] = None, **kwargs) -> str:
    """Format prompt template with country names and other variables"""
    countries_names = ", ".join([get_country_name(c) for c in target_countries])
    
    prompt_vars = {
        "target_countries_names": countries_names,
        "countries_covered": countries_names,
        **kwargs
    }
    
    if source_countries:
        source_names = ", ".join([get_country_name(c) for c in source_countries])
        prompt_vars["source_countries_names"] = source_names
    
    return prompt_template.format(**prompt_vars)