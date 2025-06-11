#!/usr/bin/env python3
"""Test API key directly"""

import google.generativeai as genai

# Test the API key
api_key = "AIzaSyCzc7LPoJNS4QkI5kZDLS4M9RyElZjy9BQ"

print(f"Testing API key: {api_key[:10]}...{api_key[-5:]}")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash-exp")
    response = model.generate_content("Say hello")
    print(f"✅ API key works! Response: {response.text[:50]}...")
except Exception as e:
    print(f"❌ API key failed: {e}")