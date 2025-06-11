#!/usr/bin/env python3
"""Run browser tests with Railway browserless service"""

import os
import sys
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Load test environment
env_path = Path(__file__).parent / ".env.test"
load_dotenv(env_path)

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))


async def test_browser_connection():
    """Test basic browser connection"""
    from playwright.async_api import async_playwright
    
    endpoint = os.getenv("BROWSER_PLAYWRIGHT_ENDPOINT")
    print(f"🔗 Connecting to: {endpoint}")
    
    try:
        async with async_playwright() as p:
            browser = await p.chromium.connect(endpoint, timeout=30000)
            print("✅ Connected to browser!")
            
            # Create a page and navigate
            page = await browser.new_page()
            await page.goto("https://airesearchprojects.com")
            title = await page.title()
            print(f"📄 Page title: {title}")
            
            # Take screenshot
            screenshot_path = Path(__file__).parent / "test_screenshot.png"
            await page.screenshot(path=str(screenshot_path))
            print(f"📸 Screenshot saved to: {screenshot_path}")
            
            await browser.close()
            print("✅ Browser connection test passed!")
            return True
            
    except Exception as e:
        print(f"❌ Browser connection failed: {e}")
        return False


async def run_quick_test():
    """Run a quick press monitor test"""
    from playwright.async_api import async_playwright
    
    endpoint = os.getenv("BROWSER_PLAYWRIGHT_ENDPOINT")
    frontend_url = os.getenv("FRONTEND_URL")
    
    print(f"\n🧪 Running quick press monitor test...")
    print(f"📍 Frontend URL: {frontend_url}")
    
    try:
        async with async_playwright() as p:
            browser = await p.chromium.connect(endpoint, timeout=30000)
            context = await browser.new_context(
                viewport={"width": 1280, "height": 720}
            )
            page = await context.new_page()
            
            # Go to app
            print("🌐 Navigating to app...")
            await page.goto(frontend_url, wait_until="networkidle")
            
            # Wait for chat interface
            print("⏳ Waiting for chat interface...")
            chat_selector = 'textarea[placeholder*="Type"], input[placeholder*="Type"], .chat-input'
            await page.wait_for_selector(chat_selector, timeout=30000)
            print("✅ Chat interface loaded!")
            
            # Type a message
            print("💬 Sending test query...")
            chat_input = await page.query_selector(chat_selector)
            await chat_input.fill("Hello, test the press monitoring system")
            
            # Find and click send button
            send_selectors = [
                'button[type="submit"]',
                'button:has-text("Send")',
                'button[aria-label*="Send"]',
                '.send-button'
            ]
            
            send_button = None
            for selector in send_selectors:
                send_button = await page.query_selector(selector)
                if send_button:
                    break
            
            if send_button:
                await send_button.click()
                print("✅ Message sent!")
                
                # Wait for response
                print("⏳ Waiting for AI response...")
                await page.wait_for_selector('.message.assistant, [data-testid="ai-message"]', timeout=30000)
                print("✅ AI responded!")
                
                # Take screenshot of conversation
                screenshot_path = Path(__file__).parent / "test_conversation.png"
                await page.screenshot(path=str(screenshot_path), full_page=True)
                print(f"📸 Conversation screenshot: {screenshot_path}")
            else:
                print("⚠️  Send button not found")
            
            await context.close()
            await browser.close()
            print("✅ Quick test completed!")
            
    except Exception as e:
        print(f"❌ Quick test failed: {e}")
        import traceback
        traceback.print_exc()


async def main():
    """Run all tests"""
    print("🚀 Starting browser tests with Railway browserless...")
    print(f"🌐 Browser domain: {os.getenv('BROWSER_DOMAIN')}")
    
    # Test connection first
    if await test_browser_connection():
        # Run quick functional test
        await run_quick_test()
        
        # Optionally run full test suite
        print("\n📋 To run full test suite, use:")
        print("   pytest tests/test_press_monitor_browser.py -v")
        print("   pytest tests/test_integration_browser.py -v")
    else:
        print("\n❌ Cannot proceed without browser connection")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())