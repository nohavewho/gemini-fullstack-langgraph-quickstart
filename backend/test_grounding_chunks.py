#!/usr/bin/env python3
"""Test Google Search grounding chunks"""

import google.generativeai as genai
import os

# Configure API
api_key = os.getenv("GOOGLE_API_KEY") or "AIzaSyCzc7LPoJNS4QkI5kZDLS4M9RyElZjy9BQ"
genai.configure(api_key=api_key)

# Create model
model = genai.GenerativeModel("gemini-1.5-flash")

# Test Google Search with grounding
search_query = "Azerbaijan Turkey Russia news today after:2025-02-09"
print(f"\nSearching for: {search_query}")

try:
    response = model.generate_content(
        search_query,
        tools=['google_search_retrieval']
    )
    
    print(f"\nResponse text: {response.text[:200] if response.text else 'No text'}...")
    
    # Get grounding chunks
    if response.candidates and len(response.candidates) > 0:
        candidate = response.candidates[0]
        if hasattr(candidate, 'grounding_metadata') and candidate.grounding_metadata:
            grounding = candidate.grounding_metadata
            
            # Check grounding chunks
            if hasattr(grounding, 'grounding_chunks'):
                chunks = grounding.grounding_chunks
                print(f"\n✅ Found {len(chunks)} grounding chunks!")
                
                for i, chunk in enumerate(chunks[:5]):  # First 5 chunks
                    print(f"\n=== Chunk {i+1} ===")
                    print(f"Type: {type(chunk)}")
                    print(f"Attributes: {[attr for attr in dir(chunk) if not attr.startswith('_')]}")
                    
                    # Try to access web data
                    if hasattr(chunk, 'web'):
                        web = chunk.web
                        print(f"\nWeb data found!")
                        print(f"Web attributes: {[attr for attr in dir(web) if not attr.startswith('_')]}")
                        
                        if hasattr(web, 'uri'):
                            print(f"URL: {web.uri}")
                        if hasattr(web, 'title'):
                            print(f"Title: {web.title}")
                        if hasattr(web, 'snippet'):
                            print(f"Snippet: {web.snippet[:100]}..." if web.snippet else "No snippet")
                    
                    # Check for retrieved_context
                    if hasattr(chunk, 'retrieved_context'):
                        context = chunk.retrieved_context
                        print(f"\nRetrieved context found!")
                        if hasattr(context, 'uri'):
                            print(f"URI: {context.uri}")
                        if hasattr(context, 'title'):
                            print(f"Title: {context.title}")
                    
            else:
                print("\n❌ No grounding_chunks attribute")
        else:
            print("\n❌ No grounding metadata")
            
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()