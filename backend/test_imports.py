#!/usr/bin/env python3
"""Test imports"""

try:
    print("Testing imports...")
    
    print("1. google.generativeai...")
    import google.generativeai as genai
    print("✅ Success")
    
    print("2. langchain_google_genai...")
    from langchain_google_genai import ChatGoogleGenerativeAI
    print("✅ Success")
    
    print("3. src.agent.app...")
    from src.agent.app import app
    print("✅ Success")
    
    print("4. src.agent.press_monitor_langgraph...")
    from src.agent.press_monitor_langgraph import analyze_press_async
    print("✅ Success")
    
    print("\nAll imports successful!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()