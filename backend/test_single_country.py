#!/usr/bin/env python3
"""Test single country press monitoring - Azerbaijan in Tajikistan"""

import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

# Direct test of the flow
from src.agent.press_monitor_graph import run_press_monitor

async def test_tajikistan_only():
    """Test press monitoring for Tajikistan only"""
    
    print("🚀 Testing Azerbaijan press monitoring in Tajikistan media ONLY...")
    print("📍 Target: Tajik language (tg) press")
    print("-" * 60)
    
    try:
        # Run monitoring for Tajik language only
        result = await run_press_monitor(
            search_mode="specific_languages",
            target_languages=["tg"],  # ONLY Tajik language
            max_articles_per_language=5  # Just 5 articles to test
        )
        
        print(f"\n✅ Monitoring completed!")
        print(f"📊 Results for Tajikistan:")
        print(f"- Total articles: {len(result.get('all_articles', []))}")
        print(f"- Languages processed: {result.get('active_searches', {}).keys()}")
        
        # Show what happened
        print(f"\n📰 Articles found:")
        for article in result.get('all_articles', [])[:10]:
            print(f"\n- Title: {article['title']}")
            print(f"  Source: {article['source_name']} ({article['source_country']})")
            print(f"  Language: {article['language_name']}")
            print(f"  URL: {article['url']}")
            print(f"  Sentiment: {article.get('sentiment', 'not analyzed')}")
            
    except Exception as e:
        print(f"\n❌ Error in flow: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_tajikistan_only())