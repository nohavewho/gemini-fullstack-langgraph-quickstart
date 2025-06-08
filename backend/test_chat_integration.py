#!/usr/bin/env python3
"""Test chat integration with press monitoring"""

import asyncio
from langchain_core.messages import HumanMessage
from src.agent.graph import graph
from src.agent.database import db_manager


async def test_chat():
    """Test different queries in chat"""
    
    # Initialize database
    await db_manager.initialize()
    
    try:
        # Test 1: Regular search query
        print("\n1. Testing regular search query...")
        result = await graph.ainvoke({
            "messages": [HumanMessage(content="What is the capital of France?")]
        })
        print(f"Regular search response: {result['messages'][-1].content[:200]}...")
        
        # Test 2: Press monitoring query
        print("\n2. Testing press monitoring query...")
        result = await graph.ainvoke({
            "messages": [HumanMessage(content="Monitor press about Azerbaijan in Turkish and Russian languages")]
        })
        print(f"Press monitor response: {result['messages'][-1].content[:500]}...")
        
        # Test 3: Another press monitoring variant
        print("\n3. Testing another press monitoring variant...")
        result = await graph.ainvoke({
            "messages": [HumanMessage(content="Track news coverage about Azerbaijan from neighbors")]
        })
        print(f"Press monitor response 2: {result['messages'][-1].content[:500]}...")
        
    finally:
        await db_manager.close()


if __name__ == "__main__":
    print("Testing Chat Integration with Press Monitoring")
    print("=" * 60)
    asyncio.run(test_chat())