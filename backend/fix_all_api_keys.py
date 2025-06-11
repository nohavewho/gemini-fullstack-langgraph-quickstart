#!/usr/bin/env python3
"""Fix all API key references to use fallback"""

import os
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Replace simple api_key=os.getenv("GEMINI_API_KEY")
    content = re.sub(
        r'api_key=os\.getenv\("GEMINI_API_KEY"\)',
        'api_key=os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")',
        content
    )
    
    # Replace google_api_key=os.getenv("GEMINI_API_KEY")
    content = re.sub(
        r'google_api_key=os\.getenv\("GEMINI_API_KEY"\)',
        'google_api_key=os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")',
        content
    )
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"✅ Fixed {filepath}")

# Fix all files
files_to_fix = [
    'src/agent/graph.py',
    'src/agent/digest_generator.py',
    'src/agent/language_agents.py',
    'src/agent/sentiment_analyzer.py',
    'src/agent/temporal_analytics.py'
]

for file in files_to_fix:
    if os.path.exists(file):
        fix_file(file)

print("🎉 All files fixed!")