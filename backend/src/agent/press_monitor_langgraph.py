"""
Press Monitor Multi-Agent System for LangGraph
Integrates press monitoring into the existing LangGraph chat interface
"""

import os
from typing import List, Dict, Any, Optional
from langchain_core.messages import AIMessage, HumanMessage
from langgraph.graph import StateGraph, END
from langgraph.types import Send
from langchain_google_genai import ChatGoogleGenerativeAI
from google import genai
import asyncio
import re

from .state import OrchestratorState
from .orchestrator import orchestrator_node, aggregate_results
from .language_agents import language_search_node
from .sentiment_analyzer import sentiment_analysis_node
from .temporal_analytics import temporal_analysis_node
from .digest_generator import generate_digest_node, generate_executive_summary
from .database import db_manager


def detect_press_monitor_intent(message: str) -> bool:
    """Detect if user wants to monitor press"""
    keywords = [
        "monitor press", "press monitoring", "monitor news", "news monitoring",
        "track press", "track news", "monitor azerbaijan", "press about azerbaijan",
        "news about azerbaijan", "мониторинг прессы", "отслеживать новости",
        "monitor media", "media monitoring", "press coverage", "news coverage"
    ]
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in keywords)


def extract_monitoring_params(message: str) -> Dict[str, Any]:
    """Extract monitoring parameters from message"""
    params = {
        "search_mode": "neighbors_priority",  # Default mode
        "target_languages": [],
        "target_regions": []
    }
    
    # Check for language codes
    lang_pattern = r'\b([a-z]{2})\b'
    potential_langs = re.findall(lang_pattern, message.lower())
    valid_langs = ['en', 'ru', 'tr', 'ar', 'zh', 'ja', 'ko', 'de', 'fr', 'es', 'pt', 'it', 
                   'hi', 'fa', 'he', 'ka', 'hy', 'az', 'kk', 'uz', 'tk', 'ky', 'tg']
    params["target_languages"] = [lang for lang in potential_langs if lang in valid_langs]
    
    # Check for regions
    regions = {
        "neighbors": ["tr", "ru", "ir", "ge", "am"],
        "central asia": ["kk", "uz", "tk", "ky", "tg"],
        "southeast asia": ["th", "id", "ms", "vi", "tl"],
        "europe": ["en", "de", "fr", "es", "it", "pt"],
        "middle east": ["ar", "he", "fa"],
        "asia": ["zh", "ja", "ko", "hi", "bn", "ur"]
    }
    
    message_lower = message.lower()
    for region, langs in regions.items():
        if region in message_lower:
            params["target_regions"].append(region)
            params["search_mode"] = "regions"
    
    if params["target_languages"]:
        params["search_mode"] = "specific_languages"
    
    return params


async def create_press_monitor_response(state: OrchestratorState) -> str:
    """Create a formatted response from press monitoring results"""
    total_articles = len(state.get("all_articles", []))
    positive = len(state.get("positive_articles", []))
    negative = len(state.get("negative_articles", []))
    neutral = len(state.get("neutral_articles", []))
    
    pos_pct = positive/total_articles*100 if total_articles > 0 else 0
    neg_pct = negative/total_articles*100 if total_articles > 0 else 0
    neu_pct = neutral/total_articles*100 if total_articles > 0 else 0
    
    response = f"""# 📰 Press Monitoring Results for Azerbaijan

## 📊 Summary Statistics
- **Total Articles Found**: {total_articles}
- **Positive Coverage**: {positive} articles ({pos_pct:.1f}%)
- **Negative Coverage**: {negative} articles ({neg_pct:.1f}%)
- **Neutral Coverage**: {neutral} articles ({neu_pct:.1f}%)

## 🌍 Coverage by Region
"""
    
    # Group articles by region/language
    by_language = {}
    for article in state.get("all_articles", []):
        lang = article.get("language_name", "Unknown")
        if lang not in by_language:
            by_language[lang] = []
        by_language[lang].append(article)
    
    for lang, articles in sorted(by_language.items(), key=lambda x: len(x[1]), reverse=True):
        response += f"\n### {lang} ({len(articles)} articles)\n"
        for article in articles[:3]:  # Show top 3 per language
            sentiment_emoji = {"positive": "✅", "negative": "❌", "neutral": "➖"}.get(article.get("sentiment", "neutral"), "➖")
            response += f"- {sentiment_emoji} [{article.get('title', 'No title')}]({article.get('url', '#')})\n"
    
    # Add digests if available
    if state.get("daily_digest"):
        response += f"\n## 📋 Daily Digest\n{state['daily_digest']}\n"
    
    if state.get("executive_summary"):
        response += f"\n## 📊 Executive Summary\n{state['executive_summary']}\n"
    
    return response


async def press_monitor_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """Enhanced node that handles press monitoring and passes results to deep research"""
    messages = state.get("messages", [])
    last_message = messages[-1] if messages else None
    
    if not last_message:
        return state
    
    user_query = last_message.content if hasattr(last_message, 'content') else str(last_message)
    
    # Get integrated mode from state (set by wrapper)
    # Enable integrated mode for ALL Azerbaijan press queries for better analysis
    integrated_mode = True  # Always use deep research integration
    
    print(f"🔄 INTEGRATED MODE ENABLED - Press Monitor + Deep Research")
    
    print(f"📰 Press monitor node: integrated_mode = {integrated_mode}")
    print(f"📰 Press monitor query: '{user_query}'")
    
    # Get monitoring parameters
    if state.get("press_monitor_params"):
        params = state["press_monitor_params"]
    else:
        # Extract from content 
        from .graph import extract_monitoring_params_from_content
        params = extract_monitoring_params_from_content(user_query)
        print(f"📰 Extracted params: {params}")
    
    # Initialize database if needed
    if not db_manager.pool:
        await db_manager.initialize()
    
    # Create orchestrator state
    orchestrator_state = OrchestratorState(
        messages=[HumanMessage(content=f"Monitor press about Azerbaijan with params: {params}")],
        search_mode=params["search_mode"],
        target_languages=params["target_languages"],
        target_regions=params["target_regions"],
        active_searches={},
        all_articles=[],
        positive_articles=[],
        negative_articles=[],
        neutral_articles=[],
        temporal_analytics={},
        digest_generated=False,
        positive_digest="",
        negative_digest="",
        executive_summary="",
        translation_enabled=True,
        max_articles_per_language=5
    )
    
    # Run REAL press monitoring pipeline with actual components
    try:
        # Import the real press monitoring graph
        from .press_monitor_graph import create_press_monitor_graph, run_press_monitor
        
        # Run the full press monitoring system
        print(f"🚀 Starting REAL press monitoring with params: {params}")
        
        monitor_result = await run_press_monitor(
            search_mode=params["search_mode"],
            target_languages=params.get("target_languages"),
            target_regions=params.get("target_regions"),
            max_articles_per_language=state.get("max_articles_per_language", 10),
            date_filter=params.get("date_filter")
        )
        
        # Format results
        if integrated_mode:
            # Store detailed results for deep research integration
            press_results = {
                "articles": monitor_result.get("all_articles", []),
                "executive_summary": monitor_result.get("executive_summary", ""),
                "positive_digest": monitor_result.get("positive_digest", ""),
                "negative_digest": monitor_result.get("negative_digest", ""),
                "temporal_analyses": monitor_result.get("temporal_analyses", {}),
                "statistics": {
                    "total": len(monitor_result.get("all_articles", [])),
                    "positive": len(monitor_result.get("positive_articles", [])),
                    "negative": len(monitor_result.get("negative_articles", [])),
                    "neutral": len(monitor_result.get("neutral_articles", []))
                }
            }
            
            # Create brief summary for intermediate message
            summary_msg = f"""## 📰 Мониторинг Прессы - Этап 1 Завершен

**Найдено статей:** {press_results['statistics']['total']}
- ✅ **Позитивных:** {press_results['statistics']['positive']} статей
- ❌ **Негативных:** {press_results['statistics']['negative']} статей  
- ➖ **Нейтральных:** {press_results['statistics']['neutral']} статей

**🔄 Переходим к Этапу 2:** Глубокий веб-анализ для расширения контекста и получения дополнительных инсайтов..."""
            
            return {
                "press_monitoring_results": press_results,
                "continue_to_research": True,
                "messages": messages + [AIMessage(content=summary_msg)]
            }
        else:
            # Standalone mode - return full formatted response
            response_text = await create_press_monitor_response(monitor_result)
            return {"messages": messages + [AIMessage(content=response_text)]}
        
    except Exception as e:
        import traceback
        full_error = traceback.format_exc()
        error_msg = f"Error during press monitoring: {str(e)}\n\nFull traceback:\n{full_error}"
        print(f"❌ Press monitor error: {e}")
        print(f"Full traceback:\n{full_error}")
        return {"messages": messages + [AIMessage(content=error_msg)]}


def create_mock_articles_for_demo(countries: List[str]) -> List[Dict[str, Any]]:
    """Create mock articles for demonstration"""
    articles = []
    
    if "uzbekistan" in [c.lower() for c in countries] or "узбекистан" in [c.lower() for c in countries]:
        articles.extend([
            {
                "title": "Узбекистан и Азербайджан укрепляют союзнические отношения",
                "url": "https://uzdaily.uz/news/azerbaijan-uzbekistan-alliance",
                "source_name": "UzDaily",
                "source_country": "Uzbekistan",
                "source_language": "uz",
                "language_name": "Uzbek",
                "summary": "Президенты двух стран обсудили углубление стратегического партнерства",
                "sentiment": "positive",
                "sentiment_score": 0.8,
                "key_phrases": ["союзнические отношения", "стратегическое партнерство", "экономическое сотрудничество"]
            },
            {
                "title": "Расширение торгово-экономических связей между Узбекистаном и Азербайджаном",
                "url": "https://kun.uz/news/azerbaijan-trade",
                "source_name": "Kun.uz",
                "source_country": "Uzbekistan", 
                "source_language": "uz",
                "language_name": "Uzbek",
                "summary": "Товарооборот между странами показывает рост",
                "sentiment": "positive",
                "sentiment_score": 0.7,
                "key_phrases": ["товарооборот", "экономические связи", "торговля"]
            },
            {
                "title": "Энергетическое партнерство Узбекистана и Азербайджана",
                "url": "https://uzmednews.uz/energy-partnership",
                "source_name": "UzMedNews",
                "source_country": "Uzbekistan",
                "source_language": "ru", 
                "language_name": "Russian",
                "summary": "Страны развивают сотрудничество в сфере энергетики",
                "sentiment": "neutral",
                "sentiment_score": 0.5,
                "key_phrases": ["энергетика", "партнерство", "сотрудничество"]
            }
        ])
    
    return articles


def generate_mock_executive_summary(countries: List[str]) -> str:
    """Generate mock executive summary"""
    if "uzbekistan" in [c.lower() for c in countries] or "узбекистан" in [c.lower() for c in countries]:
        return """
Анализ узбекской прессы показывает активное освещение отношений с Азербайджаном в позитивном ключе. 
Основные темы: укрепление союзнических отношений, рост товарооборота, энергетическое партнерство.
Тональность покрытия: 67% позитивных, 33% нейтральных материалов.
"""
    
    return "Press monitoring completed for specified regions."


def should_run_press_monitor(state: Dict[str, Any]) -> str:
    """Decide whether to run press monitor or regular search"""
    messages = state.get("messages", [])
    last_message = messages[-1] if messages else None
    
    if last_message and isinstance(last_message, HumanMessage):
        if detect_press_monitor_intent(last_message.content):
            return "press_monitor"
    
    return "generate_query"  # Regular search flow


# Export function to modify the existing graph
def add_press_monitor_to_graph(graph_builder: StateGraph) -> StateGraph:
    """Add press monitoring capability to existing LangGraph"""
    
    # Add press monitor node
    graph_builder.add_node("press_monitor", press_monitor_node)
    
    # Modify the start routing to check for press monitoring intent
    # This would need to be integrated with the existing graph routing
    
    return graph_builder