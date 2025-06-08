#!/usr/bin/env python3
"""Comprehensive test suite for multi-agent press monitoring system"""

import asyncio
import pytest
from datetime import datetime, timedelta
from typing import List, Dict, Any
from unittest.mock import Mock, patch, AsyncMock
import json

from langchain_core.messages import HumanMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI

# Import all our components
from src.agent.state import OrchestratorState, LanguageSearchState, ArticleInfo
from src.agent.orchestrator import (
    orchestrator_node, 
    get_language_priority,
    route_to_language_agents,
    should_continue_search,
    aggregate_results
)
from src.agent.language_agents import (
    create_language_search_queries,
    search_news_in_language,
    AZERBAIJAN_TRANSLATIONS,
    get_region_by_language
)
from src.agent.sentiment_analyzer import analyze_article_sentiment
from src.agent.temporal_analytics import TemporalAnalyticsAgent
from src.agent.digest_generator import generate_digest_node, generate_executive_summary
from src.agent.database import db_manager
from src.agent.press_monitor_langgraph import (
    detect_press_monitor_intent,
    extract_monitoring_params,
    create_press_monitor_response
)


class TestMultiAgentSystem:
    """Comprehensive test suite for the multi-agent system"""
    
    @pytest.fixture
    async def setup_db(self):
        """Setup test database"""
        await db_manager.initialize()
        yield
        await db_manager.close()
    
    @pytest.fixture
    def mock_llm(self):
        """Mock LLM for testing"""
        return Mock(spec=ChatGoogleGenerativeAI)
    
    @pytest.fixture
    def sample_state(self) -> OrchestratorState:
        """Create sample orchestrator state"""
        return OrchestratorState(
            messages=[HumanMessage(content="Monitor press about Azerbaijan")],
            search_mode="neighbors_priority",
            target_languages=["tr", "ru", "en"],
            target_regions=[],
            active_searches={},
            all_articles=[],
            positive_articles=[],
            negative_articles=[],
            neutral_articles=[],
            temporal_analytics={},
            digest={},
            daily_digest="",
            executive_summary="",
            translation_enabled=True,
            max_articles_per_language=5
        )
    
    @pytest.fixture
    def sample_article(self) -> Dict[str, Any]:
        """Create sample article"""
        return {
            "url": "https://example.com/article1",
            "title": "Azerbaijan Economic Growth",
            "source_name": "Example News",
            "source_country": "TR",
            "source_language": "tr",
            "language_name": "Turkish",
            "published_date": datetime.now(),
            "original_content": "Azerbaycan ekonomisi büyüyor...",
            "translated_content": "Azerbaijan economy is growing...",
            "summary": "Article about Azerbaijan's economic growth",
            "sentiment": "positive",
            "sentiment_score": 0.8,
            "sentiment_explanation": "Positive economic news",
            "key_phrases": ["economic growth", "Azerbaijan", "development"],
            "mentions_context": [{"text": "Azerbaijan's GDP", "context": "growth"}],
            "topics": ["economy", "development"]
        }


class TestOrchestrator(TestMultiAgentSystem):
    """Test orchestrator functionality"""
    
    async def test_orchestrator_initialization(self, sample_state):
        """Test orchestrator node initialization"""
        result = await orchestrator_node(sample_state)
        
        assert "active_searches" in result
        assert len(result["active_searches"]) == 3  # tr, ru, en
        assert "tr" in result["active_searches"]
        assert result["active_searches"]["tr"]["language_name"] == "Turkish"
    
    def test_language_priority(self):
        """Test language prioritization"""
        assert get_language_priority("tr") == 1  # Neighbor
        assert get_language_priority("kk") == 2  # Central Asia
        assert get_language_priority("en") == 3  # Major language
        assert get_language_priority("th") == 4  # Southeast Asia
        assert get_language_priority("sw") == 5  # Default
    
    def test_routing_logic(self, sample_state):
        """Test routing between agents"""
        # All searches incomplete
        sample_state["active_searches"] = {
            "tr": {"search_completed": False},
            "ru": {"search_completed": False}
        }
        assert route_to_language_agents(sample_state) == "language_search"
        
        # All searches complete
        sample_state["active_searches"] = {
            "tr": {"search_completed": True},
            "ru": {"search_completed": True}
        }
        assert route_to_language_agents(sample_state) == "aggregate_results"
    
    async def test_aggregate_results(self, sample_state, sample_article):
        """Test result aggregation"""
        sample_state["active_searches"] = {
            "tr": {
                "articles_found": [sample_article],
                "search_completed": True
            }
        }
        
        with patch('src.agent.database.save_articles_to_db', new_callable=AsyncMock):
            result = await aggregate_results(sample_state)
        
        assert len(result["all_articles"]) == 1
        assert len(result["positive_articles"]) == 1
        assert result["all_articles"][0]["title"] == "Azerbaijan Economic Growth"


class TestLanguageAgents(TestMultiAgentSystem):
    """Test language-specific agents"""
    
    async def test_search_query_generation(self, mock_llm):
        """Test query generation for different languages"""
        mock_llm.ainvoke = AsyncMock(return_value=Mock(
            content="Azerbaycan son dakika\nAzerbaycan ekonomi haberleri\nBakü turizm"
        ))
        
        queries = await create_language_search_queries("tr", "Turkish", mock_llm)
        
        assert len(queries) > 0
        assert len(queries) <= 5
        assert isinstance(queries[0], str)
    
    def test_azerbaijan_translations(self):
        """Test Azerbaijan translations coverage"""
        assert len(AZERBAIJAN_TRANSLATIONS) >= 60  # 60+ languages
        assert AZERBAIJAN_TRANSLATIONS["en"] == ["Azerbaijan", "Azerbaijani", "Azeri", "Baku"]
        assert "Азербайджан" in AZERBAIJAN_TRANSLATIONS["ru"]
        assert "Azerbaycan" in AZERBAIJAN_TRANSLATIONS["tr"]
    
    def test_region_mapping(self):
        """Test language to region mapping"""
        assert get_region_by_language("tr") == "Asia/Europe"
        assert get_region_by_language("ru") == "Europe/Asia"
        assert get_region_by_language("zh") == "Asia"
        assert get_region_by_language("sw") == "Africa"
        assert get_region_by_language("xyz") == "Other"
    
    @patch('google.genai.Client')
    async def test_news_search(self, mock_client, mock_llm):
        """Test news search in specific language"""
        mock_client_instance = Mock()
        mock_client.return_value = mock_client_instance
        
        language_state = {
            "language_code": "tr",
            "language_name": "Turkish",
            "search_queries": ["Azerbaycan haberleri"],
            "articles_found": [],
            "search_completed": False
        }
        
        # Mock the search response
        mock_response = Mock()
        mock_response.candidates = []
        mock_client_instance.models.generate_content_async = AsyncMock(
            return_value=mock_response
        )
        
        with patch('src.agent.database.update_language_checked', new_callable=AsyncMock):
            result = await search_news_in_language("tr", language_state, mock_llm, mock_client_instance)
        
        assert result["search_completed"] == True
        assert "articles_found" in result


class TestSentimentAnalysis(TestMultiAgentSystem):
    """Test sentiment analysis functionality"""
    
    async def test_sentiment_analysis(self, sample_article, mock_llm):
        """Test article sentiment analysis"""
        mock_response = Mock()
        mock_response.sentiment = "positive"
        mock_response.score = 0.85
        mock_response.explanation = "Positive economic indicators"
        mock_response.key_phrases = ["growth", "development"]
        
        mock_llm.with_structured_output = Mock(return_value=Mock(
            ainvoke=AsyncMock(return_value=mock_response)
        ))
        
        result = await analyze_article_sentiment(sample_article, mock_llm)
        
        assert result["sentiment"] == "positive"
        assert result["sentiment_score"] == 0.85
        assert "growth" in result["key_phrases"]
    
    async def test_sentiment_fallback(self, sample_article, mock_llm):
        """Test sentiment analysis fallback on error"""
        mock_llm.with_structured_output = Mock(return_value=Mock(
            ainvoke=AsyncMock(side_effect=Exception("API Error"))
        ))
        
        result = await analyze_article_sentiment(sample_article, mock_llm)
        
        assert result["sentiment"] == "neutral"
        assert result["sentiment_score"] == 0.0
        assert result["sentiment_explanation"] == "Analysis failed"


class TestTemporalAnalytics(TestMultiAgentSystem):
    """Test temporal analytics functionality"""
    
    @patch('src.agent.database.get_countries_with_sufficient_data')
    async def test_temporal_analysis(self, mock_get_countries):
        """Test temporal trend analysis"""
        mock_get_countries.return_value = ["TR", "RU"]
        
        agent = TemporalAnalyticsAgent()
        
        with patch.object(agent, 'analyze_country_trends', new_callable=AsyncMock) as mock_analyze:
            mock_analyze.return_value = {
                "country": "TR",
                "trends": {"7_days": {"positive": 5, "negative": 2}}
            }
            
            state = {"messages": []}
            result = await agent.analyze_all_countries(state, min_articles=10)
            
            assert "temporal_analyses" in result
            assert "messages" in result
    
    def test_sentiment_change_calculation(self):
        """Test sentiment change calculation"""
        agent = TemporalAnalyticsAgent()
        
        current = {"positive": 10, "negative": 5, "neutral": 5}
        previous = {"positive": 5, "negative": 10, "neutral": 5}
        
        changes = agent._calculate_sentiment_changes(current, previous)
        
        assert changes["positive_change"] == 100.0  # 100% increase
        assert changes["negative_change"] == -50.0  # 50% decrease
        assert changes["neutral_change"] == 0.0


class TestDigestGeneration(TestMultiAgentSystem):
    """Test digest generation functionality"""
    
    async def test_digest_generation(self, sample_state, sample_article, mock_llm):
        """Test digest generation"""
        sample_state["positive_articles"] = [sample_article]
        
        mock_llm.ainvoke = AsyncMock(return_value=Mock(
            content="## Positive Coverage Summary\n\nAzerbaijan shows economic growth..."
        ))
        
        with patch('src.agent.database.save_digest_to_db', new_callable=AsyncMock):
            result = await generate_digest_node(sample_state)
        
        assert "digest" in result
        assert "positive_digest" in result["digest"]
    
    async def test_executive_summary(self, sample_state, mock_llm):
        """Test executive summary generation"""
        sample_state["all_articles"] = [{"title": "Test Article"}]
        sample_state["temporal_analytics"] = {"TR": {"trend": "positive"}}
        
        mock_llm.ainvoke = AsyncMock(return_value=Mock(
            content="Executive Summary: Azerbaijan coverage remains positive..."
        ))
        
        summary = await generate_executive_summary(sample_state)
        
        assert "Executive Summary" in summary


class TestChatIntegration(TestMultiAgentSystem):
    """Test chat interface integration"""
    
    def test_intent_detection(self):
        """Test press monitoring intent detection"""
        assert detect_press_monitor_intent("Monitor press about Azerbaijan") == True
        assert detect_press_monitor_intent("Track news coverage of Azerbaijan") == True
        assert detect_press_monitor_intent("What is the capital of France?") == False
        assert detect_press_monitor_intent("мониторинг прессы об Азербайджане") == True
    
    def test_parameter_extraction(self):
        """Test monitoring parameter extraction"""
        params = extract_monitoring_params("Monitor press in tr ru en languages")
        assert params["target_languages"] == ["tr", "ru", "en"]
        assert params["search_mode"] == "specific_languages"
        
        params = extract_monitoring_params("Monitor neighbors press coverage")
        assert params["target_regions"] == ["neighbors"]
        assert params["search_mode"] == "regions"
    
    async def test_response_formatting(self, sample_state, sample_article):
        """Test response formatting for chat"""
        sample_state["all_articles"] = [sample_article]
        sample_state["positive_articles"] = [sample_article]
        
        response = await create_press_monitor_response(sample_state)
        
        assert "Press Monitoring Results" in response
        assert "Total Articles Found: 1" in response
        assert "Turkish (1 articles)" in response
        assert "✅" in response  # Positive emoji


class TestDatabaseOperations(TestMultiAgentSystem):
    """Test database operations"""
    
    @pytest.mark.asyncio
    async def test_database_connection(self, setup_db):
        """Test database connection and basic operations"""
        # Test connection
        async with db_manager.acquire() as conn:
            result = await conn.fetchval("SELECT 1")
            assert result == 1
    
    @pytest.mark.asyncio
    async def test_article_save_and_retrieve(self, setup_db, sample_article):
        """Test saving and retrieving articles"""
        from src.agent.database import save_articles_to_db, get_articles_from_db
        
        # Save article
        await save_articles_to_db([sample_article])
        
        # Retrieve articles
        articles = await get_articles_from_db(days_back=1)
        
        assert len(articles) > 0
        # Note: This might fail if article already exists from previous tests


class TestErrorHandling(TestMultiAgentSystem):
    """Test error handling and edge cases"""
    
    async def test_empty_search_results(self, sample_state):
        """Test handling of empty search results"""
        result = await aggregate_results(sample_state)
        assert result["all_articles"] == []
        assert len(result["messages"]) > 0
    
    async def test_api_failure_handling(self, mock_llm):
        """Test handling of API failures"""
        mock_llm.ainvoke = AsyncMock(side_effect=Exception("API Key Invalid"))
        
        with pytest.raises(Exception):
            await create_language_search_queries("en", "English", mock_llm)
    
    def test_invalid_language_code(self):
        """Test handling of invalid language codes"""
        priority = get_language_priority("xyz")
        assert priority == 5  # Default priority
        
        region = get_region_by_language("xyz")
        assert region == "Other"


# Performance and Load Tests
class TestPerformance(TestMultiAgentSystem):
    """Test system performance and scalability"""
    
    @pytest.mark.asyncio
    async def test_concurrent_language_searches(self, mock_llm):
        """Test concurrent execution of multiple language searches"""
        languages = ["en", "ru", "tr", "ar", "zh"]
        tasks = []
        
        for lang in languages:
            mock_llm_copy = Mock()
            mock_llm_copy.ainvoke = AsyncMock(return_value=Mock(content="Query1\nQuery2"))
            task = create_language_search_queries(lang, lang, mock_llm_copy)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks)
        assert len(results) == len(languages)
        assert all(len(r) > 0 for r in results)
    
    def test_large_article_batch(self, sample_article):
        """Test handling of large article batches"""
        articles = [sample_article.copy() for _ in range(1000)]
        
        # Group by sentiment
        positive = [a for a in articles if a.get("sentiment") == "positive"]
        assert len(positive) == 1000


# Integration Tests
class TestEndToEnd(TestMultiAgentSystem):
    """End-to-end integration tests"""
    
    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_full_monitoring_flow(self, setup_db):
        """Test complete monitoring flow from request to response"""
        from src.agent.graph import graph
        
        # Note: This requires actual API keys and will make real API calls
        # Should be marked for integration testing only
        
        result = await graph.ainvoke({
            "messages": [HumanMessage(content="Monitor press about Azerbaijan in Turkish")]
        })
        
        assert len(result["messages"]) > 1
        last_message = result["messages"][-1]
        assert isinstance(last_message, AIMessage)


if __name__ == "__main__":
    # Run specific test categories
    print("Running Multi-Agent System Tests")
    print("=" * 60)
    
    # Basic unit tests
    pytest.main([__file__, "-v", "-k", "not integration"])
    
    # To run integration tests (requires API keys and database):
    # pytest.main([__file__, "-v", "-k", "integration"])