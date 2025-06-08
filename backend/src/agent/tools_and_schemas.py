from typing import List, Dict, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime


class SearchQueryList(BaseModel):
    query: List[str] = Field(
        description="A list of search queries to be used for web research."
    )
    rationale: str = Field(
        description="A brief explanation of why these queries are relevant to the research topic."
    )


class Reflection(BaseModel):
    is_sufficient: bool = Field(
        description="Whether the provided summaries are sufficient to answer the user's question."
    )
    knowledge_gap: str = Field(
        description="A description of what information is missing or needs clarification."
    )
    follow_up_queries: List[str] = Field(
        description="A list of follow-up queries to address the knowledge gap."
    )


# New schemas for Press Monitor
class LanguageSearchQuery(BaseModel):
    """Search query for a specific language"""
    language_code: str = Field(description="ISO language code")
    language_name: str = Field(description="Full language name")
    queries: List[str] = Field(
        description="List of search queries in this language",
        min_items=1,
        max_items=5
    )


class MultiLanguageSearchPlan(BaseModel):
    """Search plan for multiple languages"""
    search_queries_by_language: List[LanguageSearchQuery] = Field(
        description="Search queries for each language"
    )


class SentimentAnalysis(BaseModel):
    """Sentiment analysis result"""
    sentiment: Literal["positive", "negative", "neutral"] = Field(
        description="Overall sentiment of the article"
    )
    score: float = Field(
        description="Confidence score from -1 (negative) to 1 (positive)",
        ge=-1.0,
        le=1.0
    )
    explanation: str = Field(
        description="Explanation of why this sentiment was assigned"
    )
    key_phrases: List[str] = Field(
        description="Key phrases that determined the sentiment"
    )


class ArticleAnalysis(BaseModel):
    """Full article analysis"""
    title: str
    summary: str = Field(description="Brief summary of the article")
    sentiment_analysis: SentimentAnalysis
    azerbaijan_mentions: List[Dict[str, str]] = Field(
        description="All mentions of Azerbaijan with context"
    )
    topics: List[str] = Field(
        description="Main topics covered in the article"
    )


class PressDigest(BaseModel):
    """Press digest structure"""
    digest_type: Literal["positive", "negative"]
    title: str
    summary: str = Field(description="Overall summary")
    articles_by_region: Dict[str, List[Dict[str, str]]] = Field(
        description="Articles grouped by region"
    )
    key_themes: List[str] = Field(description="Key themes")
    statistics: Dict[str, int] = Field(
        description="Statistics: article count, languages, countries"
    )


class TemporalTrendAnalysis(BaseModel):
    """Temporal trend analysis result"""
    period: str = Field(description="Time period analyzed (e.g., '7 days', '30 days')")
    trend_direction: Literal["improving", "stable", "declining"] = Field(
        description="Overall trend direction"
    )
    sentiment_changes: Dict[str, float] = Field(
        description="Percentage changes in sentiment"
    )
    significant_events: List[Dict[str, str]] = Field(
        description="Events that influenced the trend"
    )
    confidence: Literal["low", "medium", "high"] = Field(
        description="Confidence level of the analysis"
    )
