"""Digest generator for creating comprehensive press reports"""

import os
from typing import Dict, List, Any, Optional
from datetime import datetime
from collections import defaultdict
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import AIMessage

from .state import OrchestratorState
from .press_prompts import DIGEST_GENERATION_PROMPT
from .database import save_digest_to_db
from .temporal_analytics import summarize_temporal_insights


async def generate_digest_node(state: OrchestratorState) -> Dict[str, Any]:
    """Node function for comprehensive digest generation with detailed statistics"""
    
    # Check if we have articles to process
    if not state.get("all_articles"):
        return {
            "positive_digest": "No articles found.",
            "negative_digest": "No articles found.",
            "digest_generated": True,
            "messages": state["messages"] + [
                AIMessage(content="No articles found in the specified timeframe.")
            ]
        }
    
    # Generate comprehensive analysis with statistics
    comprehensive_digest = await generate_comprehensive_digest(state)
    
    return {
        "positive_digest": "",
        "negative_digest": "",
        "digest_generated": True,
        "messages": state["messages"] + [
            AIMessage(content=comprehensive_digest)
        ]
    }


async def generate_digest(
    articles: List[Dict[str, Any]],
    digest_type: str,
    temporal_analyses: Optional[Dict[str, Any]] = None
) -> str:
    """Generate a comprehensive digest from articles"""
    
    if not articles:
        return f"No {digest_type} articles found in the monitoring period."
    
    # Initialize model
    model = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        temperature=0.4,
        google_api_key=os.getenv("GEMINI_API_KEY")
    )
    
    # Group articles by region and language
    articles_by_region = defaultdict(list)
    articles_by_language = defaultdict(int)
    countries_covered = set()
    
    for article in articles:
        # Determine region
        region = get_region_for_article(article)
        articles_by_region[region].append(article)
        
        # Count languages
        articles_by_language[article["language_name"]] += 1
        
        # Track countries
        if article.get("source_country"):
            countries_covered.add(article["source_country"])
    
    # Extract key themes
    all_topics = []
    for article in articles:
        all_topics.extend(article.get("topics", []))
    
    # Count topic frequency
    topic_counts = defaultdict(int)
    for topic in all_topics:
        topic_counts[topic] += 1
    
    key_themes = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    
    # Prepare data for the prompt
    articles_data = []
    for region, region_articles in sorted(articles_by_region.items()):
        # Sort articles by sentiment score
        if digest_type == "positive":
            sorted_articles = sorted(
                region_articles, 
                key=lambda x: x.get("sentiment_score", 0), 
                reverse=True
            )
        else:
            sorted_articles = sorted(
                region_articles, 
                key=lambda x: x.get("sentiment_score", 0)
            )
        
        articles_data.append({
            "region": region,
            "article_count": len(region_articles),
            "articles": [
                {
                    "title": a["title"],
                    "source": f"{a['source_name']} ({a.get('source_country', 'Unknown')})",
                    "language": a["language_name"],
                    "summary": a["summary"][:200] + "..." if len(a["summary"]) > 200 else a["summary"],
                    "sentiment_explanation": a.get("sentiment_explanation", ""),
                    "url": a["url"],
                    "key_phrases": a.get("key_phrases", [])[:3]
                }
                for a in sorted_articles[:5]  # Top 5 per region
            ]
        })
    
    # Add temporal insights if available
    temporal_insights = ""
    if temporal_analyses:
        insights = summarize_temporal_insights(temporal_analyses)
        
        if digest_type == "positive" and insights["improving_countries"]:
            temporal_insights = f"\n\n**Improving Trends**: {', '.join(insights['improving_countries'][:5])}"
        elif digest_type == "negative" and insights["declining_countries"]:
            temporal_insights = f"\n\n**Declining Trends**: {', '.join(insights['declining_countries'][:5])}"
        
        if insights["key_trend_changes"]:
            relevant_changes = [
                c for c in insights["key_trend_changes"]
                if (digest_type == "positive" and c["direction"] == "improvement") or
                   (digest_type == "negative" and c["direction"] == "deterioration")
            ]
            if relevant_changes:
                temporal_insights += f"\n\n**Recent Changes**:"
                for change in relevant_changes[:3]:
                    temporal_insights += f"\n- {change['country']}: {change['direction']} on {change['date']}"
    
    # Format the prompt
    prompt = DIGEST_GENERATION_PROMPT.format(
        digest_type=digest_type.capitalize(),
        total_articles=len(articles),
        languages_count=len(articles_by_language),
        languages_list=", ".join(list(articles_by_language.keys())[:10]),
        regions_count=len(articles_by_region),
        articles_by_region=format_articles_for_prompt(articles_data),
        key_themes=[theme[0] for theme in key_themes],
        date=datetime.now().strftime("%Y-%m-%d")
    )
    
    # Add temporal insights to prompt if available
    if temporal_insights:
        prompt += f"\n\nTemporal Analysis Insights:{temporal_insights}"
    
    # Generate the digest
    response = await model.ainvoke(prompt)
    
    # Add metadata footer
    footer = f"\n\n---\n\n"
    footer += f"*Generated on {datetime.now().strftime('%Y-%m-%d %H:%M UTC')}*\n\n"
    footer += f"**Coverage Statistics:**\n"
    footer += f"- Total Articles: {len(articles)}\n"
    footer += f"- Languages: {len(articles_by_language)}\n"
    footer += f"- Countries: {len(countries_covered)}\n"
    footer += f"- Regions: {len(articles_by_region)}\n"
    
    if key_themes:
        footer += f"\n**Top Themes:**\n"
        for theme, count in key_themes[:5]:
            footer += f"- {theme} ({count} mentions)\n"
    
    return response.content + footer


def format_articles_for_prompt(articles_data: List[Dict]) -> str:
    """Format articles data for the digest prompt"""
    
    formatted = ""
    for region_data in articles_data:
        formatted += f"\n\n### {region_data['region']} ({region_data['article_count']} articles)\n"
        
        for i, article in enumerate(region_data['articles'], 1):
            formatted += f"\n{i}. **{article['title']}**\n"
            formatted += f"   - Source: {article['source']} | Language: {article['language']}\n"
            formatted += f"   - Summary: {article['summary']}\n"
            if article['sentiment_explanation']:
                formatted += f"   - Sentiment: {article['sentiment_explanation']}\n"
            if article['key_phrases']:
                formatted += f"   - Key phrases: {', '.join(article['key_phrases'])}\n"
    
    return formatted


def get_region_for_article(article: Dict[str, Any]) -> str:
    """Determine region for an article based on language or country"""
    
    # First try to use the stored region
    if article.get("region"):
        return article["region"]
    
    # Map of language codes to regions
    language_to_region = {
        # Asia
        "zh": "Asia", "ja": "Asia", "ko": "Asia", "th": "Asia",
        "vi": "Asia", "id": "Asia", "ms": "Asia", "tl": "Asia",
        "hi": "Asia", "bn": "Asia", "ur": "Asia", "ne": "Asia",
        "si": "Asia", "my": "Asia", "km": "Asia", "lo": "Asia",
        "mn": "Asia", "ka": "Asia", "hy": "Asia", "az": "Asia",
        "kk": "Central Asia", "uz": "Central Asia", "tk": "Central Asia",
        "ky": "Central Asia", "tg": "Central Asia",
        
        # Middle East
        "ar": "Middle East", "he": "Middle East", "fa": "Middle East",
        "tr": "Middle East/Europe",
        
        # Europe
        "en": "Global", "de": "Europe", "fr": "Europe", "es": "Europe/Americas",
        "pt": "Europe/Americas", "it": "Europe", "ru": "Europe/Asia",
        "pl": "Europe", "uk": "Europe", "nl": "Europe", "sv": "Europe",
        "no": "Europe", "da": "Europe", "fi": "Europe", "is": "Europe",
        "et": "Europe", "lv": "Europe", "lt": "Europe", "ro": "Europe",
        "bg": "Europe", "hr": "Europe", "sr": "Europe", "sk": "Europe",
        "sl": "Europe", "cs": "Europe", "hu": "Europe", "el": "Europe",
        
        # Africa
        "sw": "Africa", "am": "Africa", "yo": "Africa", "zu": "Africa",
        "xh": "Africa", "af": "Africa",
        
        # Americas
        "qu": "Americas", "gn": "Americas", "ay": "Americas", "ht": "Americas"
    }
    
    # Get region from language
    lang_code = article.get("source_language", "")
    region = language_to_region.get(lang_code, "Other")
    
    # Override for specific countries if needed
    country_to_region = {
        "US": "North America", "CA": "North America", "MX": "North America",
        "BR": "South America", "AR": "South America", "CL": "South America",
        "AU": "Oceania", "NZ": "Oceania",
        # Add more as needed
    }
    
    country = article.get("source_country")
    if country in country_to_region:
        region = country_to_region[country]
    
    return region


async def generate_executive_summary(state: OrchestratorState) -> str:
    """Generate an executive summary combining all insights"""
    
    total_articles = len(state.get("all_articles", []))
    positive_count = len(state.get("positive_articles", []))
    negative_count = len(state.get("negative_articles", []))
    neutral_count = len(state.get("neutral_articles", []))
    
    # Calculate percentages
    if total_articles > 0:
        positive_pct = (positive_count / total_articles) * 100
        negative_pct = (negative_count / total_articles) * 100
        neutral_pct = (neutral_count / total_articles) * 100
    else:
        positive_pct = negative_pct = neutral_pct = 0
    
    # Get temporal insights
    temporal_summary = ""
    if state.get("temporal_analyses"):
        insights = summarize_temporal_insights(state["temporal_analyses"])
        temporal_summary = f"\n\n**Temporal Analysis**: {insights['overall_outlook']}"
        
        if insights["improving_countries"]:
            temporal_summary += f"\n- Improving: {', '.join(insights['improving_countries'][:5])}"
        if insights["declining_countries"]:
            temporal_summary += f"\n- Declining: {', '.join(insights['declining_countries'][:5])}"
        if insights["volatile_countries"]:
            temporal_summary += f"\n- Volatile: {', '.join(insights['volatile_countries'][:5])}"
    
    # Create summary
    summary = f"""# Azerbaijan Press Monitor - Executive Summary

**Date**: {datetime.now().strftime('%Y-%m-%d')}

## Overall Sentiment Distribution
- **Positive**: {positive_count} articles ({positive_pct:.1f}%)
- **Negative**: {negative_count} articles ({negative_pct:.1f}%)
- **Neutral**: {neutral_count} articles ({neutral_pct:.1f}%)
- **Total Coverage**: {total_articles} articles

## Key Insights
"""
    
    # Add sentiment balance
    if positive_pct > negative_pct + 20:
        summary += "- **Overall sentiment is notably positive** across global media\n"
    elif negative_pct > positive_pct + 20:
        summary += "- **Concerning negative sentiment trend** detected in global coverage\n"
    else:
        summary += "- **Balanced sentiment** with mixed coverage globally\n"
    
    # Add language coverage
    languages = set()
    for article in state.get("all_articles", []):
        languages.add(article.get("language_name", "Unknown"))
    
    summary += f"- Coverage spans **{len(languages)} languages** ensuring comprehensive global perspective\n"
    
    # Add regional distribution
    regions = defaultdict(int)
    for article in state.get("all_articles", []):
        region = get_region_for_article(article)
        regions[region] += 1
    
    top_regions = sorted(regions.items(), key=lambda x: x[1], reverse=True)[:3]
    if top_regions:
        summary += f"- Highest coverage from: {', '.join([f'{r[0]} ({r[1]} articles)' for r in top_regions])}\n"
    
    # Add temporal summary
    summary += temporal_summary
    
    # Add recommendations
    summary += "\n\n## Recommendations\n"
    
    if negative_pct > 40:
        summary += "- **Immediate attention required**: High negative sentiment requires strategic communication response\n"
    elif negative_pct > 25:
        summary += "- **Monitor closely**: Negative sentiment trending upward in certain regions\n"
    
    if positive_pct > 50:
        summary += "- **Leverage positive momentum**: Current positive coverage presents opportunities for enhanced engagement\n"
    
    if len(languages) < 20:
        summary += "- **Expand language coverage**: Consider monitoring additional languages for comprehensive insight\n"
    
    return summary


async def generate_comprehensive_digest(state: OrchestratorState) -> str:
    """Generate comprehensive digest with detailed statistics and sentiment analysis"""
    
    all_articles = state.get("all_articles", [])
    if not all_articles:
        return "No articles found for analysis."
    
    # Initialize Gemini model
    model = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        temperature=0.3,
        google_api_key=os.getenv("GEMINI_API_KEY")
    )
    
    # Analyze sentiment for all articles
    analyzed_articles = await analyze_article_sentiments(all_articles, model)
    
    # Calculate statistics
    stats = calculate_detailed_statistics(analyzed_articles)
    
    # Generate comprehensive analysis
    analysis_prompt = f"""
Generate a comprehensive press monitoring digest for Azerbaijan based on the following data:

## STATISTICS
- Total Articles: {stats['total_articles']}
- Languages Monitored: {stats['languages_count']} ({', '.join(stats['top_languages'])})
- Countries/Regions: {stats['countries_count']} ({', '.join(stats['top_countries'])})

## SENTIMENT ANALYSIS
- Positive: {stats['positive_count']} articles ({stats['positive_percentage']:.1f}%)
- Negative: {stats['negative_count']} articles ({stats['negative_percentage']:.1f}%)
- Neutral: {stats['neutral_count']} articles ({stats['neutral_percentage']:.1f}%)

## TOP THEMES
{chr(10).join([f"- {theme}: {count} mentions" for theme, count in stats['top_themes'][:10]])}

## ARTICLES BY SENTIMENT

### POSITIVE COVERAGE ({stats['positive_count']} articles)
{format_articles_by_sentiment(analyzed_articles, 'positive')[:2000]}

### NEGATIVE COVERAGE ({stats['negative_count']} articles)  
{format_articles_by_sentiment(analyzed_articles, 'negative')[:2000]}

### NEUTRAL COVERAGE ({stats['neutral_count']} articles)
{format_articles_by_sentiment(analyzed_articles, 'neutral')[:1500]}

TASK: Create a comprehensive, executive-level digest that:
1. Provides clear overview of Azerbaijan's image in global press
2. Highlights key themes and regional perspectives
3. Identifies concerning trends and opportunities
4. Gives actionable insights for decision makers
5. Uses professional, analytical tone suitable for government officials

Format with clear sections, bullet points, and executive summary.
"""

    response = await model.ainvoke(analysis_prompt)
    
    # Add detailed statistics footer
    footer = f"""

---

## 📊 DETAILED ANALYSIS STATISTICS

### Processing Summary
- **Articles Processed**: {stats['total_articles']} from {stats['sources_count']} unique sources
- **Languages Monitored**: {stats['languages_count']} languages across {stats['countries_count']} countries/regions
- **Date Range**: {datetime.now().strftime('%Y-%m-%d')} (Real-time monitoring)
- **Analysis Depth**: Full sentiment analysis with AI-powered relevance filtering

### Sentiment Distribution
```
Positive: {'█' * min(20, int(stats['positive_percentage'] / 5))} {stats['positive_percentage']:.1f}% ({stats['positive_count']} articles)
Negative: {'█' * min(20, int(stats['negative_percentage'] / 5))} {stats['negative_percentage']:.1f}% ({stats['negative_count']} articles)
Neutral:  {'█' * min(20, int(stats['neutral_percentage'] / 5))} {stats['neutral_percentage']:.1f}% ({stats['neutral_count']} articles)
```

### Geographic Coverage
{chr(10).join([f"- **{country}**: {count} articles" for country, count in stats['countries_breakdown'][:10]])}

### Language Coverage  
{chr(10).join([f"- **{lang}**: {count} articles" for lang, count in stats['languages_breakdown'][:10]])}

### Most Mentioned Topics
{chr(10).join([f"{i+1}. **{theme}** ({count} mentions)" for i, (theme, count) in enumerate(stats['top_themes'][:15])])}

---
*🤖 Generated by Azerbaijan Press Monitor • Powered by Google Gemini 2.0 Flash*  
*📅 Analysis completed: {datetime.now().strftime('%Y-%m-%d %H:%M UTC')}*
"""
    
    return response.content + footer


async def analyze_article_sentiments(articles: List[Dict], model: ChatGoogleGenerativeAI) -> List[Dict]:
    """Analyze sentiment for all articles using Gemini"""
    
    analyzed_articles = []
    
    # Process in batches to avoid token limits
    batch_size = 10
    for i in range(0, len(articles), batch_size):
        batch = articles[i:i + batch_size]
        
        # Prepare batch for sentiment analysis
        batch_text = []
        for j, article in enumerate(batch):
            batch_text.append(f"{j+1}. Title: {article['title']}")
            if article.get('summary'):
                batch_text.append(f"   Summary: {article['summary'][:200]}...")
        
        sentiment_prompt = f"""Analyze sentiment of these {len(batch)} articles about Azerbaijan:

{chr(10).join(batch_text)}

For each article (1-{len(batch)}), classify sentiment as:
- POSITIVE: Favorable view of Azerbaijan, positive developments
- NEGATIVE: Critical view, concerns, conflicts  
- NEUTRAL: Factual reporting without clear positive/negative tone

Return ONLY the format:
1: POSITIVE|NEGATIVE|NEUTRAL
2: POSITIVE|NEGATIVE|NEUTRAL
etc.
"""
        
        try:
            response = await model.ainvoke(sentiment_prompt)
            sentiment_results = response.content.strip().split('\n')
            
            # Apply sentiment to articles
            for j, article in enumerate(batch):
                article_copy = article.copy()
                
                if j < len(sentiment_results):
                    sentiment_line = sentiment_results[j]
                    if ':' in sentiment_line:
                        sentiment = sentiment_line.split(':')[1].strip().upper()
                        article_copy['sentiment'] = sentiment.lower()
                        
                        # Assign numeric sentiment score
                        if sentiment == 'POSITIVE':
                            article_copy['sentiment_score'] = 0.7
                        elif sentiment == 'NEGATIVE':
                            article_copy['sentiment_score'] = -0.7
                        else:
                            article_copy['sentiment_score'] = 0.0
                    else:
                        article_copy['sentiment'] = 'neutral'
                        article_copy['sentiment_score'] = 0.0
                else:
                    article_copy['sentiment'] = 'neutral'
                    article_copy['sentiment_score'] = 0.0
                
                analyzed_articles.append(article_copy)
        
        except Exception as e:
            print(f"Error analyzing sentiment for batch: {e}")
            # Default to neutral if analysis fails
            for article in batch:
                article_copy = article.copy()
                article_copy['sentiment'] = 'neutral'
                article_copy['sentiment_score'] = 0.0
                analyzed_articles.append(article_copy)
    
    return analyzed_articles


def calculate_detailed_statistics(articles: List[Dict]) -> Dict:
    """Calculate comprehensive statistics from analyzed articles"""
    
    total_articles = len(articles)
    
    # Sentiment counts
    positive_count = len([a for a in articles if a.get('sentiment') == 'positive'])
    negative_count = len([a for a in articles if a.get('sentiment') == 'negative'])
    neutral_count = total_articles - positive_count - negative_count
    
    # Percentages
    positive_pct = (positive_count / total_articles * 100) if total_articles > 0 else 0
    negative_pct = (negative_count / total_articles * 100) if total_articles > 0 else 0
    neutral_pct = (neutral_count / total_articles * 100) if total_articles > 0 else 0
    
    # Language and country breakdowns
    languages = defaultdict(int)
    countries = defaultdict(int)
    sources = set()
    topics = defaultdict(int)
    
    for article in articles:
        languages[article.get('language_name', 'Unknown')] += 1
        countries[article.get('source_country', 'Unknown')] += 1
        sources.add(article.get('source_name', 'Unknown'))
        
        # Count topics/themes
        for topic in article.get('topics', []):
            topics[topic] += 1
        for phrase in article.get('key_phrases', []):
            topics[phrase] += 1
    
    # Sort by frequency
    top_languages = sorted(languages.items(), key=lambda x: x[1], reverse=True)
    top_countries = sorted(countries.items(), key=lambda x: x[1], reverse=True)
    top_themes = sorted(topics.items(), key=lambda x: x[1], reverse=True)
    
    return {
        'total_articles': total_articles,
        'positive_count': positive_count,
        'negative_count': negative_count,
        'neutral_count': neutral_count,
        'positive_percentage': positive_pct,
        'negative_percentage': negative_pct,
        'neutral_percentage': neutral_pct,
        'languages_count': len(languages),
        'countries_count': len(countries),
        'sources_count': len(sources),
        'top_languages': [lang for lang, count in top_languages[:5]],
        'top_countries': [country for country, count in top_countries[:5]],
        'top_themes': top_themes,
        'languages_breakdown': top_languages,
        'countries_breakdown': top_countries
    }


def format_articles_by_sentiment(articles: List[Dict], sentiment: str) -> str:
    """Format articles by sentiment for display"""
    
    filtered_articles = [a for a in articles if a.get('sentiment') == sentiment]
    if not filtered_articles:
        return f"No {sentiment} articles found."
    
    formatted = ""
    for i, article in enumerate(filtered_articles[:5], 1):  # Show top 5
        formatted += f"{i}. **{article['title']}**\n"
        formatted += f"   📍 Source: {article.get('source_name', 'Unknown')} ({article.get('language_name', 'Unknown')})\n"
        if article.get('summary'):
            formatted += f"   📄 Summary: {article['summary'][:150]}...\n"
        formatted += f"   🔗 {article.get('url', 'No URL')}\n\n"
    
    if len(filtered_articles) > 5:
        formatted += f"... and {len(filtered_articles) - 5} more {sentiment} articles\n"
    
    return formatted