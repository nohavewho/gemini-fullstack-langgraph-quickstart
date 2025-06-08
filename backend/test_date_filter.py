#!/usr/bin/env python3
"""Test press monitoring with date filter"""

import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

from src.agent.press_monitor_graph import run_press_monitor
from src.agent.graph import extract_monitoring_params_from_content

async def test_with_date():
    """Test press monitoring with specific date"""
    
    queries = [
        "анализ об азербайджане в прессе таджикистана за 7 февраля",
        "анализ об азербайджане в прессе таджикистана за сегодня",
        "анализ об азербайджане в прессе таджикистана за вчера",
    ]
    
    for query in queries:
        print(f"\n{'='*60}")
        print(f"🔍 Testing: {query}")
        print(f"{'='*60}\n")
        
        try:
            # Extract parameters from query
            params = extract_monitoring_params_from_content(query)
            print(f"📅 Extracted params: {params}")
            
            # Run press monitoring
            result = await run_press_monitor(
                search_mode=params["search_mode"],
                target_languages=params.get("target_languages") or ["tg"],
                max_articles_per_language=5,
                date_filter=params.get("date_filter")
            )
            
            # Get results summary
            total_articles = len(result.get('all_articles', []))
            
            print(f"📰 Found {total_articles} articles")
            
            # Show some articles
            for article in result.get('all_articles', [])[:3]:
                print(f"\n📄 {article['title']}")
                print(f"   Source: {article['source_name']} ({article['language_name']})")
                print(f"   URL: {article['url'][:80]}...")
                print(f"   Date: {article.get('published_date', 'Unknown')}")
            
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_with_date())