"""Main graph for the press monitoring system"""

from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage

from .state import OrchestratorState
from .orchestrator import (
    orchestrator_node,
    should_continue_search,
    aggregate_results,
    route_to_language_agents
)
from .language_agents import language_search_node
from .sentiment_analyzer import sentiment_analysis_node
from .temporal_analytics import temporal_analysis_node
from .digest_generator import generate_digest_node, generate_executive_summary
from .database import db_manager


def create_press_monitor_graph():
    """Create the main press monitoring graph"""
    
    # Create the graph with OrchestratorState
    graph = StateGraph(OrchestratorState)
    
    # Add all nodes
    graph.add_node("start_orchestrator", orchestrator_node)
    graph.add_node("language_search", language_search_node)
    graph.add_node("aggregate_results", aggregate_results)
    graph.add_node("sentiment_analysis", sentiment_analysis_node)
    graph.add_node("temporal_analysis", temporal_analysis_node)
    graph.add_node("generate_digests", generate_digest_node)
    graph.add_node("generate_executive_summary", generate_executive_summary_node)
    
    # Set the entry point
    graph.set_entry_point("start_orchestrator")
    
    # Add edges for the flow
    
    # From orchestrator, route to language searches
    graph.add_conditional_edges(
        "start_orchestrator",
        route_to_language_agents,
        {
            "language_search": "language_search",
            "aggregate_results": "aggregate_results"
        }
    )
    
    # Language searches loop until all complete
    graph.add_conditional_edges(
        "language_search",
        should_continue_search,
        {
            "continue": "language_search",
            "aggregate": "aggregate_results"
        }
    )
    
    # Linear flow after aggregation
    graph.add_edge("aggregate_results", "sentiment_analysis")
    graph.add_edge("sentiment_analysis", "temporal_analysis")
    graph.add_edge("temporal_analysis", "generate_digests")
    graph.add_edge("generate_digests", "generate_executive_summary")
    graph.add_edge("generate_executive_summary", END)
    
    # Compile the graph
    return graph.compile()


async def generate_executive_summary_node(state: OrchestratorState) -> dict:
    """Node to generate executive summary"""
    
    summary = await generate_executive_summary(state)
    
    messages = state["messages"] + [
        HumanMessage(content="Executive summary generated.")
    ]
    
    return {
        "messages": messages,
        "executive_summary": summary
    }


async def run_press_monitor(
    search_mode: str = "all_languages",
    target_languages: list = None,
    target_regions: list = None,
    translation_enabled: bool = True,
    max_articles_per_language: int = 10,
    date_filter: str = None
) -> dict:
    """Run the press monitoring system"""
    
    # Initialize database connection
    await db_manager.initialize()
    
    try:
        # Create the graph
        graph = create_press_monitor_graph()
        
        # Set default date filter to today if not specified
        if not date_filter:
            from datetime import datetime
            today = datetime.now().strftime("%Y-%m-%d")
            date_filter = f"after:{today}"
        
        # Create initial state
        initial_state = {
            "messages": [HumanMessage(content=f"Starting Azerbaijan press monitoring (date filter: {date_filter})...")],
            "search_mode": search_mode,
            "target_languages": target_languages,
            "target_regions": target_regions,
            "active_searches": {},
            "all_articles": [],
            "positive_articles": [],
            "negative_articles": [],
            "neutral_articles": [],
            "digest_generated": False,
            "positive_digest": None,
            "negative_digest": None,
            "temporal_analyses": None,
            "translation_enabled": translation_enabled,
            "max_articles_per_language": max_articles_per_language,
            "date_filter": date_filter
        }
        
        # Run the graph
        result = await graph.ainvoke(initial_state)
        
        return result
        
    finally:
        # Close database connection
        await db_manager.close()


# Configuration for different monitoring scenarios
MONITORING_CONFIGS = {
    "neighbors_priority": {
        "search_mode": "specific_languages",
        "target_languages": ["tr", "ru", "fa", "ka", "hy", "az"],
        "translation_enabled": True,
        "max_articles_per_language": 20
    },
    "central_asia_focus": {
        "search_mode": "specific_languages", 
        "target_languages": ["kk", "uz", "tk", "ky", "tg"],
        "translation_enabled": True,
        "max_articles_per_language": 15
    },
    "southeast_asia_scan": {
        "search_mode": "specific_languages",
        "target_languages": ["th", "id", "ms", "vi", "tl"],
        "translation_enabled": True,
        "max_articles_per_language": 10
    },
    "global_scan": {
        "search_mode": "all_languages",
        "translation_enabled": False,  # Too many articles
        "max_articles_per_language": 5
    },
    "europe_monitor": {
        "search_mode": "regions",
        "target_regions": ["Europe"],
        "translation_enabled": True,
        "max_articles_per_language": 10
    },
    "asia_comprehensive": {
        "search_mode": "regions",
        "target_regions": ["Asia", "Central Asia", "Middle East"],
        "translation_enabled": True,
        "max_articles_per_language": 8
    }
}


async def run_monitoring_cycle(config_name: str = "neighbors_priority") -> dict:
    """Run a monitoring cycle with a predefined configuration"""
    
    config = MONITORING_CONFIGS.get(config_name, MONITORING_CONFIGS["global_scan"])
    
    return await run_press_monitor(**config)


# Helper function to create a simple monitoring request
async def quick_monitor(countries: list = None, days_back: int = 7) -> dict:
    """Quick monitoring for specific countries"""
    
    if countries:
        # Map countries to languages
        country_to_languages = {
            "Turkey": ["tr"],
            "Russia": ["ru"],
            "Iran": ["fa"],
            "Georgia": ["ka"],
            "Armenia": ["hy"],
            "Kazakhstan": ["kk"],
            "Uzbekistan": ["uz"],
            "China": ["zh"],
            "Japan": ["ja"],
            "Thailand": ["th"],
            "Indonesia": ["id"],
            # Add more mappings
        }
        
        languages = []
        for country in countries:
            if country in country_to_languages:
                languages.extend(country_to_languages[country])
        
        if languages:
            return await run_press_monitor(
                search_mode="specific_languages",
                target_languages=languages,
                translation_enabled=True
            )
    
    # Default to neighbors
    return await run_monitoring_cycle("neighbors_priority")