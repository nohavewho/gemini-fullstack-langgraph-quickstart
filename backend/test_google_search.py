#!/usr/bin/env python3
"""Test Google Search directly"""

import google.generativeai as genai
import os

# Configure API
api_key = os.getenv("GOOGLE_API_KEY") or "AIzaSyCzc7LPoJNS4QkI5kZDLS4M9RyElZjy9BQ"
print(f"Using API key: {api_key[:10]}...{api_key[-5:]}")

genai.configure(api_key=api_key)

# Create model - MUST use 1.5 Flash for Google Search
model = genai.GenerativeModel("gemini-1.5-flash")

# Test Google Search
search_query = "Azerbaijan Turkey relations news today"
print(f"\nSearching for: {search_query}")

try:
    response = model.generate_content(
        search_query,
        generation_config=genai.GenerationConfig(
            temperature=0.7,
            candidate_count=1,
            google_search_retrieval={'mode': 'dynamic'}
        )
    )
    
    print(f"\nResponse text: {response.text[:200] if response.text else 'No text'}...")
    
    # Check for grounding metadata
    if response.candidates and len(response.candidates) > 0:
        candidate = response.candidates[0]
        if hasattr(candidate, 'grounding_metadata') and candidate.grounding_metadata:
            grounding = candidate.grounding_metadata
            print(f"\n✅ Found grounding metadata!")
            
            # Check different attributes
            attrs = ['grounding_chunks', 'grounding_supports', 'search_entry_point', 'retrieval_queries']
            for attr in attrs:
                if hasattr(grounding, attr):
                    value = getattr(grounding, attr)
                    print(f"\n{attr}: {type(value)}")
                    if attr == 'grounding_chunks' and value:
                        print(f"  Number of chunks: {len(value)}")
                        for i, chunk in enumerate(value[:3]):
                            if hasattr(chunk, 'web') and chunk.web:
                                print(f"\n  Chunk {i+1}:")
                                print(f"    URL: {chunk.web.uri}")
                                print(f"    Title: {chunk.web.title}")
        else:
            print("\n❌ No grounding metadata found")
    else:
        print("\n❌ No candidates in response")
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()