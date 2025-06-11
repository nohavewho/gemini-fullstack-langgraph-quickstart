#!/usr/bin/env python3
"""Test Google Search directly - try different approaches"""

import google.generativeai as genai
import os

# Configure API
api_key = os.getenv("GOOGLE_API_KEY") or "AIzaSyCzc7LPoJNS4QkI5kZDLS4M9RyElZjy9BQ"
print(f"Using API key: {api_key[:10]}...{api_key[-5:]}")

genai.configure(api_key=api_key)

# Try different approaches
print("\n1. Testing with generation_config dict:")
try:
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(
        "Azerbaijan Turkey relations news today",
        generation_config={
            'temperature': 0.7,
            'candidate_count': 1,
            'google_search_retrieval': {'mode': 'dynamic'}
        }
    )
    print("✅ Success with dict config")
    print(f"Response: {response.text[:100]}...")
except Exception as e:
    print(f"❌ Failed: {e}")

print("\n2. Testing with tools parameter:")
try:
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(
        "Azerbaijan Turkey relations news today",
        tools=['google_search_retrieval']
    )
    print("✅ Success with tools parameter")
    print(f"Response: {response.text[:100]}...")
except Exception as e:
    print(f"❌ Failed: {e}")

print("\n3. Testing simple generate without search:")
try:
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content("Say hello")
    print("✅ Success with simple generate")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"❌ Failed: {e}")

print("\n4. Check available attributes on GenerationConfig:")
try:
    config = genai.GenerationConfig()
    print("Available attributes:", [attr for attr in dir(config) if not attr.startswith('_')])
except Exception as e:
    print(f"❌ Failed: {e}")