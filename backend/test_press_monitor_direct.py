#!/usr/bin/env python3
"""Test direct press monitoring system"""

import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import the press monitoring components
from src.agent.press_monitor_graph import run_press_monitor, quick_monitor

async def test_uzbekistan_press():
    """Test press monitoring for Uzbekistan specifically"""
    
    print("🚀 Testing Azerbaijan press monitoring in Uzbekistan media...")
    
    try:
        # Run monitoring specifically for Uzbek language
        result = await run_press_monitor(
            search_mode="specific_languages",
            target_languages=["uz", "ru"],  # Uzbek and Russian (common in Uzbekistan)
            max_articles_per_language=10
        )
        
        print(f"\n📊 Results:")
        print(f"Total articles found: {len(result.get('all_articles', []))}")
        print(f"Positive: {len(result.get('positive_articles', []))}")
        print(f"Negative: {len(result.get('negative_articles', []))}")
        print(f"Neutral: {len(result.get('neutral_articles', []))}")
        
        # Show some articles
        print(f"\n📰 Sample articles:")
        for article in result.get('all_articles', [])[:5]:
            print(f"- {article['title']} ({article['source_name']}, {article['language_name']})")
            print(f"  Sentiment: {article.get('sentiment', 'unknown')}")
            print(f"  URL: {article['url']}\n")
        
        # Show executive summary
        if result.get('executive_summary'):
            print(f"\n📋 Executive Summary:")
            print(result['executive_summary'])
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_uzbekistan_press())