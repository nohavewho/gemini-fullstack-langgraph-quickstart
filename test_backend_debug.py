#!/usr/bin/env python3
"""
Debug script to test backend components individually
"""

import asyncio
import os
import sys
sys.path.append('/Users/vladislaviushchenko/deepgemini/backend/src')

from agent.database import db_manager

async def test_database_connection():
    """Test database connection"""
    print("🔍 Testing database connection...")
    try:
        await db_manager.initialize()
        print("✅ Database connection successful")
        
        # Test a simple query
        async with db_manager.acquire() as conn:
            if conn:
                result = await conn.fetchval("SELECT 1")
                print(f"✅ Database query test: {result}")
            else:
                print("⚠️ No database connection available - running in offline mode")
        
        await db_manager.close()
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

async def test_gemini_connection():
    """Test Gemini API connection"""
    print("🔍 Testing Gemini API connection...")
    try:
        import google.generativeai as genai
        from langchain_google_genai import ChatGoogleGenerativeAI
        
        # Check API key
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        print(f"🔑 API Key: {api_key[:10]}...{api_key[-5:] if api_key else 'NONE'}")
        
        if not api_key:
            print("❌ No API key found")
            return False
        
        # Test Gemini SDK
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content("Hello, respond with just 'OK'")
        print(f"✅ Gemini SDK test: {response.text.strip()}")
        
        # Test LangChain integration
        chat_model = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.7,
            google_api_key=api_key
        )
        response = await chat_model.ainvoke("Hello, respond with just 'OK'")
        print(f"✅ LangChain Gemini test: {response.content.strip()}")
        
        return True
    except Exception as e:
        print(f"❌ Gemini API test failed: {e}")
        return False

async def test_simple_search():
    """Test simple Google search through Gemini"""
    print("🔍 Testing simple Google search...")
    try:
        import google.generativeai as genai
        
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        genai.configure(api_key=api_key)
        
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(
            "Azerbaijan news today",
            generation_config=genai.GenerationConfig(
                temperature=0.7,
                candidate_count=1
            ),
            tools=['google_search_retrieval']
        )
        
        print(f"✅ Search response length: {len(response.text)} chars")
        
        # Check for grounding metadata
        if response.candidates and len(response.candidates) > 0:
            candidate = response.candidates[0]
            if hasattr(candidate, 'grounding_metadata') and candidate.grounding_metadata:
                grounding = candidate.grounding_metadata
                if hasattr(grounding, 'grounding_chunks') and grounding.grounding_chunks:
                    print(f"✅ Found {len(grounding.grounding_chunks)} grounding chunks")
                    for i, chunk in enumerate(grounding.grounding_chunks[:2]):
                        if hasattr(chunk, 'web') and chunk.web:
                            print(f"  - Chunk {i+1}: {chunk.web.uri}")
                else:
                    print("⚠️ No grounding chunks found")
            else:
                print("⚠️ No grounding metadata found")
        
        return True
    except Exception as e:
        print(f"❌ Search test failed: {e}")
        return False

async def test_minimal_press_monitor():
    """Test minimal press monitor functionality"""
    print("🔍 Testing minimal press monitor...")
    try:
        # Import the press monitor components
        from agent.press_monitor_langgraph import press_monitor_node
        from langchain_core.messages import HumanMessage
        
        # Create minimal state
        state = {
            "messages": [HumanMessage(content="monitor press about azerbaijan")],
            "integrated_mode": False
        }
        
        print("🚀 Running press monitor node...")
        result = await press_monitor_node(state)
        print(f"✅ Press monitor completed, messages count: {len(result.get('messages', []))}")
        
        if result.get('messages'):
            last_message = result['messages'][-1]
            content_length = len(last_message.content) if hasattr(last_message, 'content') else 0
            print(f"✅ Last message length: {content_length} chars")
        
        return True
    except Exception as e:
        print(f"❌ Press monitor test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Run all tests"""
    print("🧪 Backend Debug Tests")
    print("=" * 50)
    
    tests = [
        ("Database Connection", test_database_connection),
        ("Gemini API", test_gemini_connection),
        ("Google Search", test_simple_search),
        ("Minimal Press Monitor", test_minimal_press_monitor)
    ]
    
    results = {}
    for test_name, test_func in tests:
        print(f"\n📋 Running {test_name}...")
        try:
            # Add timeout for each test
            result = await asyncio.wait_for(test_func(), timeout=30.0)
            results[test_name] = result
        except asyncio.TimeoutError:
            print(f"❌ {test_name} timed out after 30 seconds")
            results[test_name] = False
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results[test_name] = False
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {status} {test_name}")
    
    all_passed = all(results.values())
    print(f"\n🎯 Overall: {'✅ ALL TESTS PASSED' if all_passed else '❌ SOME TESTS FAILED'}")

if __name__ == "__main__":
    asyncio.run(main())