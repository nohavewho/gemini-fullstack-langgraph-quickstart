from __future__ import annotations

from dataclasses import dataclass, field
from typing import TypedDict, List, Dict, Optional, Literal, Any
from datetime import datetime

from langgraph.graph import add_messages
from typing_extensions import Annotated

import operator
from .countries_config import QueryType


class OverallState(TypedDict):
    messages: Annotated[list, add_messages]
    search_query: Annotated[list, operator.add]
    web_research_result: Annotated[list, operator.add]
    sources_gathered: Annotated[list, operator.add]
    initial_search_query_count: int
    max_research_loops: int
    research_loop_count: int
    reasoning_model: str
    
    # New fields for integrated press monitoring
    integrated_mode: Optional[bool]  # Whether this is integrated press + research
    press_monitor_params: Optional[Dict[str, Any]]  # Parameters for press monitoring
    press_monitoring_results: Optional[Dict[str, Any]]  # Results from press monitoring
    continue_to_research: Optional[bool]  # Whether to continue to deep research
    
    # Multi-country support
    target_countries: Optional[List[str]]  # ISO country codes to monitor
    source_countries: Optional[List[str]]  # Countries to search news from
    query_type: Optional[str]  # 'about', 'in', or 'cross_reference'
    preset: Optional[str]  # Preset configuration name


class ReflectionState(TypedDict):
    is_sufficient: bool
    knowledge_gap: str
    follow_up_queries: Annotated[list, operator.add]
    research_loop_count: int
    number_of_ran_queries: int


class Query(TypedDict):
    query: str
    rationale: str


class QueryGenerationState(TypedDict):
    query_list: list[Query]


class WebSearchState(TypedDict):
    search_query: str
    id: str


@dataclass
class SearchStateOutput:
    running_summary: str = field(default=None)  # Final report


# New state types for Press Monitor
class ArticleInfo(TypedDict):
    """Information about a press article"""
    url: str
    title: str
    source_name: str
    source_country: str
    source_language: str
    language_name: str
    published_date: Optional[datetime]
    original_content: str
    translated_content: Optional[str]
    summary: str
    sentiment: Literal["positive", "negative", "neutral"]
    sentiment_score: float
    sentiment_explanation: str
    key_phrases: List[str]
    mentions_context: List[Dict[str, str]]  # {"text": "...", "context": "economic/political/cultural"}
    topics: List[str]
    countries_mentioned: List[str]  # Which target countries are mentioned
    country_sentiments: Dict[str, float]  # Per-country sentiment scores


class LanguageSearchState(TypedDict):
    """State for searching in a specific language"""
    language_code: str
    language_name: str
    search_queries: List[str]
    articles_found: List[ArticleInfo]
    search_completed: bool


class OrchestratorState(TypedDict):
    """Main orchestrator state"""
    messages: Annotated[list, add_messages]
    search_mode: Literal["all_languages", "specific_languages", "regions"]
    target_languages: Optional[List[str]]  # if specific_languages
    target_regions: Optional[List[str]]    # if regions
    active_searches: Dict[str, LanguageSearchState]  # language_code -> state
    all_articles: List[ArticleInfo]
    positive_articles: List[ArticleInfo]
    negative_articles: List[ArticleInfo]
    neutral_articles: List[ArticleInfo]
    digest_generated: bool
    positive_digest: Optional[str]
    negative_digest: Optional[str]
    temporal_analyses: Optional[Dict[str, Any]]
    translation_enabled: Optional[bool]
    max_articles_per_language: Optional[int]
    executive_summary: Optional[str]
    
    # Multi-country support
    target_countries: List[str]  # ISO country codes to monitor
    source_countries: Optional[List[str]]  # Countries to search news from
    query_type: str  # 'about', 'in', or 'cross_reference'
    preset: Optional[str]  # Preset configuration name
    country_specific_digests: Dict[str, str]  # Per-country digests


class TemporalAnalyticsState(TypedDict):
    """State for temporal analysis"""
    countries: List[str]  # Multiple countries to analyze
    region: Optional[str]
    time_periods: List[int]  # [7, 30, 90] days
    sentiment_trends: Dict[str, Dict[str, float]]  # period -> trends
    volatility_scores: Dict[str, float]
    trend_predictions: Dict[str, str]
    significant_events: List[Dict[str, Any]]
    comparison_data: Dict[str, Any]
    country_comparisons: Dict[str, Dict[str, Any]]  # Compare countries


class PressMonitorOverallState(TypedDict):
    """Extended state for the entire system"""
    # Existing fields
    messages: Annotated[list, add_messages]
    
    # New fields for press monitoring
    monitor_mode: bool  # monitoring mode vs regular research
    orchestrator_state: Optional[OrchestratorState]
    
    # Configuration
    languages_to_monitor: List[str]  # which languages to track
    sentiment_threshold: float  # threshold for positive/negative
    max_articles_per_language: int
    translation_enabled: bool
    
    # Multi-country configuration
    target_countries: List[str]  # ISO country codes to monitor
    source_countries: Optional[List[str]]  # Countries to search news from
    query_type: str  # 'about', 'in', or 'cross_reference'
    preset: Optional[str]  # Preset configuration name
