#!/usr/bin/env python3
"""Test UI integration with Playwright"""

import subprocess
import time
import os
from playwright.sync_api import sync_playwright

def test_chat():
    # Start backend in background
    print("🚀 Starting backend server...")
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    backend_process = subprocess.Popen(
        ["python", "-m", "langgraph", "up"],
        cwd=backend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Give backend time to start
    print("⏳ Waiting for backend to start...")
    time.sleep(5)
    
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        # Go to the app - WITH trailing slash
        print("🌐 Opening http://localhost:5173/")
        page.goto("http://localhost:5173/")
        
        # Wait for chat to load - check for WelcomeScreen or textarea
        print("⏳ Waiting for chat interface to load...")
        try:
            # First wait for the app to load
            page.wait_for_selector('.flex.h-screen', timeout=10000)
            
            # Look for textarea in WelcomeScreen
            textarea_selector = 'textarea[placeholder="Ask me anything..."]'
            page.wait_for_selector(textarea_selector, timeout=10000)
            
            # Type the query
            print("📝 Typing press monitoring query...")
            textarea = page.locator(textarea_selector)
            textarea.fill("анализ прессы об азербайджане в таджикистане за сегодня")
            
            # Click send button or press Enter
            print("📤 Sending message...")
            send_button = page.locator('button:has-text("Send")')
            if send_button.is_visible():
                send_button.click()
            else:
                page.keyboard.press("Enter")
            
            print("\n✅ Message sent! Monitoring the response...")
            print("⏰ Waiting to see press monitoring + deep research results...")
            
            # Monitor for press monitoring events
            print("\n📊 Monitoring activity timeline...")
            for i in range(120):  # 2 minutes
                # Check for Press Monitoring in activity timeline
                press_monitor_activity = page.locator('text="Press Monitoring"')
                if press_monitor_activity.is_visible():
                    print("✅ Press monitoring started!")
                    activity_text = press_monitor_activity.text_content()
                    print(f"   Activity: {activity_text}")
                
                # Check for other activities
                activities = page.locator('[title="Generating Search Queries"], [title="Web Research"], [title="Reflection"], [title="Finalizing Answer"]')
                for activity in activities.all():
                    if activity.is_visible():
                        title = activity.get_attribute("title")
                        data = activity.get_attribute("data") or activity.text_content()
                        print(f"   📍 {title}: {data}")
                
                # Check if response is complete
                if page.locator('text="Finalizing Answer"').is_visible():
                    print("\n🎯 Final answer is being generated...")
                    time.sleep(10)  # Wait for final answer
                    break
                    
                time.sleep(1)
            
            # Take screenshot of final result
            print("\n📸 Taking screenshot...")
            page.screenshot(path="press_monitor_test_result.png", full_page=True)
            print("✅ Screenshot saved as press_monitor_test_result.png")
            
        except Exception as e:
            print(f"\n❌ Error during test: {e}")
            page.screenshot(path="error_screenshot.png")
            print("📸 Error screenshot saved")
            
        browser.close()
        
    # Stop backend
    print("\n🛑 Stopping backend...")
    backend_process.terminate()
    backend_process.wait()
    
    print("\n✅ Test completed!")

if __name__ == "__main__":
    test_chat()