const { chromium } = require('playwright');

async function debugAnalyzeButton() {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console log capture
  page.on('console', msg => {
    console.log(`Console ${msg.type()}: ${msg.text()}`);
  });

  // Enable request logging
  page.on('request', request => {
    console.log(`Request: ${request.method()} ${request.url()}`);
    if (request.method() === 'POST') {
      console.log('Request headers:', request.headers());
      console.log('Request body:', request.postData());
    }
  });

  // Enable response logging
  page.on('response', response => {
    console.log(`Response: ${response.status()} ${response.url()}`);
    if (response.url().includes('api/')) {
      response.text().then(body => {
        console.log('Response body:', body);
      }).catch(err => console.log('Error reading response body:', err));
    }
  });

  // Enable error logging
  page.on('pageerror', error => {
    console.error('Page error:', error);
  });

  // Navigate to the app
  console.log('Navigating to app...');
  await page.goto('http://localhost:3003', { waitUntil: 'networkidle' });

  // Wait for the app to load
  await page.waitForTimeout(3000);

  // Look for the analyze button
  try {
    console.log('Looking for analyze button...');
    
    // Try different selectors
    const selectors = [
      'button:has-text("Analyze")',
      'button:has-text("analyze")',
      'button:has-text("ANALYZE")',
      '[type="submit"]',
      'button[type="submit"]',
      '.analyze-button',
      '#analyze-button'
    ];

    let analyzeButton = null;
    for (const selector of selectors) {
      try {
        analyzeButton = await page.locator(selector).first();
        if (await analyzeButton.isVisible()) {
          console.log(`Found button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!analyzeButton || !(await analyzeButton.isVisible())) {
      console.log('Analyze button not found. Taking screenshot...');
      await page.screenshot({ path: 'debug-screenshot.png' });
      
      // Log all visible buttons
      const buttons = await page.locator('button').all();
      console.log(`Found ${buttons.length} buttons:`);
      for (const button of buttons) {
        const text = await button.textContent();
        console.log(`  Button text: "${text}"`);
      }
      
      return;
    }

    // Click the analyze button
    console.log('Clicking analyze button...');
    await analyzeButton.click();

    // Wait for network activity
    console.log('Waiting for network activity...');
    await page.waitForTimeout(5000);

    // Take a screenshot after clicking
    await page.screenshot({ path: 'after-click-screenshot.png' });

  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  }

  // Keep browser open for manual inspection
  console.log('\nBrowser will remain open for manual inspection. Press Ctrl+C to close.');
  await new Promise(() => {}); // Keep script running
}

debugAnalyzeButton().catch(console.error);