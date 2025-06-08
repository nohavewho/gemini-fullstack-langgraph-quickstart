#!/usr/bin/env python3
"""Test direct Gemini API with grounding"""

import asyncio
import os
from dotenv import load_dotenv
from google.genai import Client

load_dotenv()

async def test_gemini_search():
    """Test Gemini search with grounding"""
    
    # Initialize client
    client = Client(api_key=os.getenv("GEMINI_API_KEY"))
    
    # Test query
    query = "Азербайджан новости Таджикистан пресса 2025"
    
    print(f"🔍 Testing query: {query}")
    
    try:
        # Use grounding search
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=query,
            config={
                "tools": [{"google_search": {}}],
                "temperature": 0.7,
            }
        )
        
        print(f"\n✅ Response received!")
        print(f"Text: {response.text[:500]}...")
        
        # Check grounding metadata
        if hasattr(response, 'candidates') and response.candidates:
            candidate = response.candidates[0]
            if hasattr(candidate, 'grounding_metadata'):
                print(f"\n📊 Grounding metadata found!")
                metadata = candidate.grounding_metadata
                if hasattr(metadata, 'search_entry_point'):
                    print(f"Search performed: Yes")
                    
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_gemini_search())