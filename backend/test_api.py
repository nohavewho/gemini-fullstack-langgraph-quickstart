#!/usr/bin/env python3
"""Test API endpoints"""

import requests
import json

# Test research endpoint
def test_research():
    url = "http://localhost:2024/api/research"
    
    # Test with a simple query
    data = {
        "query": "Что такое столица Азербайджана?",
        "effort": "low",
        "model": "gemini-2.0-flash"
    }
    
    print("📝 Sending query:", data["query"])
    
    try:
        response = requests.post(url, json=data)
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success!")
            print("Result:", result.get("result", "No result")[:200] + "...")
        else:
            print("❌ Error:", response.text)
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_research()