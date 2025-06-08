#!/usr/bin/env python3
"""Test FULL press monitoring flow and see results"""

import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def test_full_flow():
    """Test complete press monitoring flow"""
    from src.agent.press_monitor_graph import create_press_monitor_graph
    from langchain_core.messages import HumanMessage
    from datetime import datetime
    
    print("🚀 Starting FULL press monitoring test...")
    print("=" * 60)
    
    # Create the graph
    graph = create_press_monitor_graph()
    
    # Create initial state with minimal settings
    initial_state = {
        "messages": [HumanMessage(content="Monitor Azerbaijan press in Tajikistan")],
        "search_mode": "specific_languages",
        "target_languages": ["tg"],  # Only Tajik
        "target_regions": [],
        "active_searches": {},
        "all_articles": [],
        "positive_articles": [],
        "negative_articles": [],
        "neutral_articles": [],
        "digest_generated": False,
        "positive_digest": None,
        "negative_digest": None,
        "temporal_analyses": None,
        "translation_enabled": False,  # Disable translation to speed up
        "max_articles_per_language": 3,  # Only 3 articles
        "date_filter": f"after:{datetime.now().strftime('%Y-%m-%d')}"
    }
    
    print(f"📅 Date filter: {initial_state['date_filter']}")
    print(f"🌍 Target language: Tajik (tg)")
    print(f"📰 Max articles: 3")
    print("=" * 60)
    
    # Track progress
    current_node = None
    
    try:
        # Run the graph and stream events
        async for event in graph.astream(initial_state):
            # Show which node is running
            for node_name, node_output in event.items():
                if node_name != current_node:
                    current_node = node_name
                    print(f"\n🔄 Running: {node_name}")
                    
                # Show key results from each node
                if node_name == "language_search" and "all_articles" in node_output:
                    print(f"   ✓ Found {len(node_output['all_articles'])} articles")
                    
                elif node_name == "sentiment_analysis":
                    if "positive_articles" in node_output:
                        print(f"   ✓ Sentiment analysis complete:")
                        print(f"     - Positive: {len(node_output.get('positive_articles', []))}")
                        print(f"     - Negative: {len(node_output.get('negative_articles', []))}")
                        print(f"     - Neutral: {len(node_output.get('neutral_articles', []))}")
                        
                elif node_name == "temporal_analysis" and "temporal_analyses" in node_output:
                    print(f"   ✓ Temporal analysis complete")
                    
                elif node_name == "generate_digests":
                    if "positive_digest" in node_output:
                        print(f"   ✓ Generated positive digest")
                    if "negative_digest" in node_output:
                        print(f"   ✓ Generated negative digest")
                        
                elif node_name == "generate_executive_summary" and "executive_summary" in node_output:
                    print(f"   ✓ Generated executive summary")
                    print("\n" + "="*60)
                    print("📊 EXECUTIVE SUMMARY:")
                    print("="*60)
                    print(node_output["executive_summary"][:500] + "...")
                    
        print("\n✅ Full monitoring process completed!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Initialize database first
    from src.agent.database import db_manager
    
    async def run():
        await db_manager.initialize()
        try:
            await test_full_flow()
        finally:
            await db_manager.close()
    
    asyncio.run(run())