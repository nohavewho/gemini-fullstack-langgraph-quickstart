"""Orchestrator for managing multiple language agents"""

from typing import List, Dict, Any, Optional
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
# Remove Send import - will use different approach for older langgraph

from .state import OrchestratorState, LanguageSearchState
from .database import (
    db_manager, 
    get_uncovered_languages, 
    get_languages_by_regions,
    save_articles_to_db,
    LANGUAGE_NAMES
)


async def orchestrator_node(state: OrchestratorState) -> Dict[str, Any]:
    """Main orchestrator - manages the entire process"""
    
    # Determine which languages to check
    languages_to_check = []
    
    if state["search_mode"] == "all_languages":
        # Get all languages that haven't been checked recently
        languages_to_check = await get_uncovered_languages(hours_threshold=24)
        # Limit to prevent overload
        languages_to_check = languages_to_check[:20]  # Process 20 languages at a time
    
    elif state["search_mode"] == "specific_languages":
        languages_to_check = state["target_languages"] or []
    
    else:  # regions mode
        languages_to_check = await get_languages_by_regions(state["target_regions"] or [])
    
    # Create initial states for each language
    active_searches = {}
    for lang_code in languages_to_check:
        active_searches[lang_code] = {
            "language_code": lang_code,
            "language_name": LANGUAGE_NAMES.get(lang_code, lang_code),
            "search_queries": [],
            "articles_found": [],
            "search_completed": False
        }
    
    # Create tasks for parallel search
    messages = state.get("messages", [])
    messages.append(
        AIMessage(content=f"Starting press monitoring for {len(languages_to_check)} languages: {', '.join(languages_to_check[:5])}{'...' if len(languages_to_check) > 5 else ''}")
    )
    
    return {
        "active_searches": active_searches,
        "messages": messages,
        "all_articles": [],
        "positive_articles": [],
        "negative_articles": [],
        "neutral_articles": []
    }


def should_continue_search(state: OrchestratorState) -> str:
    """Check if all searches are completed"""
    all_completed = all(
        search.get("search_completed", False) 
        for search in state["active_searches"].values()
    )
    
    if all_completed:
        return "aggregate"
    else:
        return "continue"


async def aggregate_results(state: OrchestratorState) -> Dict[str, Any]:
    """Aggregate all search results"""
    
    all_articles = []
    
    # Collect all articles from all language searches
    for lang_code, search_state in state["active_searches"].items():
        articles = search_state.get("articles_found", [])
        all_articles.extend(articles)
    
    # Save to database if articles found
    if all_articles:
        await save_articles_to_db(all_articles)
    
    # Group by sentiment (this will be updated after sentiment analysis)
    positive = [a for a in all_articles if a.get("sentiment") == "positive"]
    negative = [a for a in all_articles if a.get("sentiment") == "negative"]
    neutral = [a for a in all_articles if a.get("sentiment") == "neutral"]
    
    messages = state["messages"] + [
        AIMessage(content=f"Search completed. Found {len(all_articles)} articles across {len(state['active_searches'])} languages.")
    ]
    
    return {
        "all_articles": all_articles,
        "positive_articles": positive,
        "negative_articles": negative,
        "neutral_articles": neutral,
        "messages": messages
    }


def route_to_language_agents(state: OrchestratorState) -> str:
    """Route to language search or aggregation"""
    
    # Check if any searches are still active
    for lang_code, search_state in state["active_searches"].items():
        if not search_state["search_completed"]:
            return "language_search"
    
    # All searches complete, move to aggregation
    return "aggregate_results"


def create_orchestrator_graph():
    """Create the orchestrator graph"""
    
    # Import here to avoid circular imports
    from .language_agents import language_search_node
    from .sentiment_analyzer import sentiment_analysis_node
    from .digest_generator import generate_digest_node
    from .temporal_analytics import temporal_analysis_node
    
    # Create the graph
    graph = StateGraph(OrchestratorState)
    
    # Add nodes
    graph.add_node("orchestrator", orchestrator_node)
    graph.add_node("language_search", language_search_node)
    graph.add_node("aggregate_results", aggregate_results)
    graph.add_node("sentiment_analysis", sentiment_analysis_node)
    graph.add_node("temporal_analysis", temporal_analysis_node)
    graph.add_node("generate_digest", generate_digest_node)
    
    # Set entry point
    graph.set_entry_point("orchestrator")
    
    # Add edges
    graph.add_conditional_edges(
        "orchestrator",
        route_to_language_agents
    )
    
    graph.add_conditional_edges(
        "language_search",
        should_continue_search,
        {
            "continue": "language_search",
            "aggregate": "aggregate_results"
        }
    )
    
    graph.add_edge("aggregate_results", "sentiment_analysis")
    graph.add_edge("sentiment_analysis", "temporal_analysis")
    graph.add_edge("temporal_analysis", "generate_digest")
    graph.add_edge("generate_digest", END)
    
    return graph.compile()


# Helper functions
def get_language_priority(lang_code: str) -> int:
    """Get priority for a language (neighbors and important regions first)"""
    
    # Highest priority - neighbors
    if lang_code in ['tr', 'ru', 'fa', 'ka', 'hy']:
        return 1
    
    # High priority - Central Asia
    elif lang_code in ['kk', 'uz', 'tk', 'ky', 'tg']:
        return 2
    
    # High priority - major languages
    elif lang_code in ['en', 'ar', 'zh', 'de', 'fr']:
        return 3
    
    # Medium priority - Southeast Asia
    elif lang_code in ['th', 'id', 'ms', 'vi', 'tl']:
        return 4
    
    # Default priority
    else:
        return 5


async def prioritize_languages(languages: List[str]) -> List[str]:
    """Sort languages by priority"""
    return sorted(languages, key=get_language_priority)