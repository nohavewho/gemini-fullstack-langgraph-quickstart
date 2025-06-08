#!/usr/bin/env python3
"""Simple test for date filtering"""

import asyncio
import os
import re
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# Simple date extraction function
def extract_date(query):
    """Extract date from query"""
    
    # Check for specific date patterns
    if "за 7 февраля" in query:
        return f"after:2025-02-07"
    elif "за сегодня" in query or "today" in query:
        return f"after:{datetime.now().strftime('%Y-%m-%d')}"
    elif "за вчера" in query or "yesterday" in query:
        yesterday = datetime.now() - timedelta(days=1)
        return f"after:{yesterday.strftime('%Y-%m-%d')}"
    elif "за неделю" in query:
        week_ago = datetime.now() - timedelta(days=7)
        return f"after:{week_ago.strftime('%Y-%m-%d')}"
    else:
        # Default to today
        return f"after:{datetime.now().strftime('%Y-%m-%d')}"

async def test_dates():
    """Test date filtering in press monitoring"""
    from src.agent.press_monitor_graph import run_press_monitor
    
    queries = [
        "анализ об азербайджане в прессе таджикистана за 7 февраля",
        "анализ об азербайджане в прессе таджикистана за сегодня",
        "анализ об азербайджане в прессе таджикистана за вчера",
    ]
    
    for query in queries:
        print(f"\n{'='*60}")
        print(f"🔍 Testing: {query}")
        
        # Extract date
        date_filter = extract_date(query)
        print(f"📅 Date filter: {date_filter}")
        print(f"{'='*60}\n")
        
        try:
            # Run press monitoring with date filter
            result = await run_press_monitor(
                search_mode="specific_languages",
                target_languages=["tg"],  # Tajik
                max_articles_per_language=3,
                date_filter=date_filter
            )
            
            # Show results
            total = len(result.get('all_articles', []))
            print(f"📰 Found {total} articles")
            
            # Show articles
            for i, article in enumerate(result.get('all_articles', [])[:3], 1):
                print(f"\n{i}. {article['title']}")
                print(f"   📍 {article['source_name']}")
                print(f"   🌐 {article['url'][:60]}...")
                
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_dates())