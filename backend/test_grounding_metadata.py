#!/usr/bin/env python3
"""Test Google Search grounding metadata"""

import google.generativeai as genai
import os

# Configure API
api_key = os.getenv("GOOGLE_API_KEY") or "AIzaSyCzc7LPoJNS4QkI5kZDLS4M9RyElZjy9BQ"
print(f"Using API key: {api_key[:10]}...{api_key[-5:]}")

genai.configure(api_key=api_key)

# Create model
model = genai.GenerativeModel("gemini-1.5-flash")

# Test Google Search with grounding
search_query = "Azerbaijan Russia relations news today after:2025-02-09"
print(f"\nSearching for: {search_query}")

try:
    response = model.generate_content(
        search_query,
        tools=['google_search_retrieval']
    )
    
    print(f"\nResponse text: {response.text[:200] if response.text else 'No text'}...")
    
    # Deep inspection of response
    print("\n=== Response Structure ===")
    print(f"Type: {type(response)}")
    print(f"Attributes: {[attr for attr in dir(response) if not attr.startswith('_')]}")
    
    if hasattr(response, 'candidates') and response.candidates:
        print(f"\nNumber of candidates: {len(response.candidates)}")
        candidate = response.candidates[0]
        print(f"\nCandidate type: {type(candidate)}")
        print(f"Candidate attributes: {[attr for attr in dir(candidate) if not attr.startswith('_')]}")
        
        # Check for grounding metadata
        if hasattr(candidate, 'grounding_metadata'):
            grounding = candidate.grounding_metadata
            print(f"\n✅ Found grounding_metadata!")
            print(f"Grounding type: {type(grounding)}")
            print(f"Grounding attributes: {[attr for attr in dir(grounding) if not attr.startswith('_')]}")
            
            # Try to access grounding supports or chunks
            if hasattr(grounding, 'grounding_supports'):
                supports = grounding.grounding_supports
                print(f"\nGrounding supports: {len(supports) if supports else 0}")
                if supports:
                    for i, support in enumerate(supports[:3]):
                        print(f"\nSupport {i+1}:")
                        print(f"  Type: {type(support)}")
                        print(f"  Attributes: {[attr for attr in dir(support) if not attr.startswith('_')]}")
                        if hasattr(support, 'grounding_chunk_indices'):
                            print(f"  Chunk indices: {support.grounding_chunk_indices}")
                        if hasattr(support, 'confidence_scores'):
                            print(f"  Confidence: {support.confidence_scores}")
            
            if hasattr(grounding, 'web_search_queries'):
                queries = grounding.web_search_queries
                print(f"\nWeb search queries: {queries}")
            
            if hasattr(grounding, 'search_entry_point'):
                entry = grounding.search_entry_point
                print(f"\nSearch entry point: {entry}")
                if hasattr(entry, 'rendered_content'):
                    print(f"  Rendered content: {entry.rendered_content[:100]}...")
        else:
            print("\n❌ No grounding_metadata attribute")
            
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()