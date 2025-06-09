#!/usr/bin/env node

/**
 * Local test for press monitor API
 */

import handler from './api/press-monitor-working.js';

// Mock request object
const mockRequest = {
  method: 'POST',
  json: async () => ({
    effortLevel: 3,
    mode: "custom",
    searchQuery: "казахстан об украине за вчера",
    selectedModel: "gemini-2.0-flash",
    userLanguage: "ru"
  })
};

// Set up environment
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

console.log('Testing press monitor with query: "казахстан об украине за вчера"');
console.log('API Key available:', !!process.env.GEMINI_API_KEY);

async function test() {
  try {
    const response = await handler(mockRequest);
    const data = await response.json();
    console.log('\nResponse status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();