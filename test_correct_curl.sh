#!/bin/bash

# Test correct POST request to /api/press-monitor-langgraph
echo "Testing POST request to /api/press-monitor-langgraph"
echo "========================================"

# Test 1: Direct POST request with proper body
echo "Test 1: Central Asia preset with dates"
curl -X POST https://airesearchprojects.com/api/press-monitor-langgraph \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "target_countries": ["AZ"],
    "source_countries": ["KZ", "UZ", "TM", "KG", "TJ"],
    "search_mode": "about"
  }' \
  -v

echo -e "\n\n========================================"
echo "Test 2: Using searchQuery format (like frontend does)"
curl -X POST https://airesearchprojects.com/api/press-monitor-langgraph \
  -H "Content-Type: application/json" \
  -d '{
    "searchQuery": "Press analysis: central_asia, period: 03.06.2025 - 10.06.2025",
    "userLanguage": "en",
    "stream": false
  }' \
  -v

echo -e "\n\n========================================"
echo "Test 3: Chat API format"
curl -X POST https://airesearchprojects.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "Press analysis: central_asia, period: 03.06.2025 - 10.06.2025",
      "parts": [{ "type": "text", "text": "Press analysis: central_asia, period: 03.06.2025 - 10.06.2025" }]
    }],
    "mode": "central_asia_focus",
    "selectedCountries": ["KZ", "UZ", "TM", "KG", "TJ"],
    "effortLevel": 3,
    "model": "gemini-2.0-flash"
  }' \
  -v