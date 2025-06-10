#!/usr/bin/env node

const https = require('https');

// Test configurations
const API_URL = 'https://airesearchprojects.com/api/press-monitor';
const tests = [
  {
    name: "Test 1: Basic Russian press analysis",
    body: {
      searchQuery: "Анализ прессы об Азербайджане",
      userLanguage: "ru",
      stream: false
    }
  },
  {
    name: "Test 2: Preset format - neighbors_priority in Russian",
    body: {
      searchQuery: "Анализ прессы: neighbors_priority, период: 02.06.2025 - 09.06.2025",
      userLanguage: "ru",
      stream: false
    }
  },
  {
    name: "Test 3: Preset format - caspian_states in English",
    body: {
      searchQuery: "Press analysis: caspian_states, period: 01.06.2025 - 08.06.2025",
      userLanguage: "en",
      stream: false
    }
  },
  {
    name: "Test 4: Preset format - turkic_world in Turkish",
    body: {
      searchQuery: "Basın analizi: turkic_world, dönem: 03.06.2025 - 10.06.2025",
      userLanguage: "tr",
      stream: false
    }
  },
  {
    name: "Test 5: Custom countries mode",
    body: {
      mode: "custom",
      options: { countries: ["US", "DE", "FR"] },
      searchQuery: "Azerbaijan energy cooperation",
      userLanguage: "en",
      stream: false
    }
  },
  {
    name: "Test 6: Azerbaijani language test",
    body: {
      searchQuery: "Azərbaycan haqqında mətbuat təhlili",
      userLanguage: "az",
      stream: false
    }
  },
  {
    name: "Test 7: Streaming test",
    body: {
      searchQuery: "Azerbaijan press analysis",
      userLanguage: "en",
      stream: true
    }
  },
  {
    name: "Test 8: Error handling - empty query",
    body: {
      searchQuery: "",
      userLanguage: "en",
      stream: false
    }
  },
  {
    name: "Test 9: Error handling - invalid mode",
    body: {
      mode: "invalid_mode",
      searchQuery: "Test query",
      userLanguage: "en",
      stream: false
    }
  },
  {
    name: "Test 10: Error handling - missing parameters",
    body: {
      searchQuery: "Test query"
      // Missing userLanguage
    }
  }
];

// Function to make HTTPS POST request
function makeRequest(testCase) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const postData = JSON.stringify(testCase.body);
    
    const options = {
      hostname: 'airesearchprojects.com',
      path: '/api/press-monitor',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running: ${testCase.name}`);
    console.log(`Request body: ${JSON.stringify(testCase.body, null, 2)}`);
    console.log(`${'='.repeat(60)}`);
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Response Time: ${duration}s`);
        console.log(`Response Headers: ${JSON.stringify(res.headers, null, 2)}`);
        
        try {
          if (testCase.body.stream) {
            console.log('Stream Response (first 500 chars):');
            console.log(data.substring(0, 500) + '...');
          } else {
            const jsonResponse = JSON.parse(data);
            console.log('JSON Response Structure:');
            console.log(JSON.stringify(jsonResponse, null, 2).substring(0, 1000) + '...');
            
            // Validate response structure
            if (jsonResponse.result) {
              console.log('\nValidation Results:');
              console.log(`✓ Has result field`);
              console.log(`✓ Result length: ${jsonResponse.result.length} chars`);
              
              // Check for expected sections
              const expectedSections = ['📊', '🌍', '📈', '💡'];
              expectedSections.forEach(section => {
                if (jsonResponse.result.includes(section)) {
                  console.log(`✓ Contains ${section} section`);
                } else {
                  console.log(`✗ Missing ${section} section`);
                }
              });
            }
          }
        } catch (e) {
          console.log('Raw Response:', data.substring(0, 500));
          if (e.message) {
            console.log('Parse Error:', e.message);
          }
        }
        
        resolve({ testCase: testCase.name, duration, statusCode: res.statusCode });
      });
    });
    
    req.on('error', (e) => {
      console.error(`Request Error: ${e.message}`);
      reject(e);
    });
    
    req.setTimeout(35000, () => {
      console.error('Request Timeout (35s)');
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.write(postData);
    req.end();
  });
}

// Function to test with curl
function testWithCurl(testCase) {
  return new Promise((resolve, reject) => {
    const { exec } = require('child_process');
    
    const curlCommand = `curl -X POST ${API_URL} \\
      -H "Content-Type: application/json" \\
      -d '${JSON.stringify(testCase.body)}' \\
      -w "\\n\\nTime: %{time_total}s\\nHTTP Code: %{http_code}" \\
      -m 35`;
    
    console.log(`\nCURL Command:\n${curlCommand}\n`);
    
    exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('CURL Error:', error);
        reject(error);
        return;
      }
      
      console.log('CURL Response:', stdout);
      if (stderr) console.error('CURL Stderr:', stderr);
      resolve();
    });
  });
}

// Run all tests
async function runTests() {
  console.log('Starting Press Monitor API Tests');
  console.log(`API URL: ${API_URL}`);
  console.log(`Number of tests: ${tests.length}`);
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await makeRequest(test);
      results.push(result);
      
      // Add delay between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (e) {
      console.error(`Test failed: ${test.name}`, e.message);
      results.push({ testCase: test.name, error: e.message });
    }
  }
  
  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('TEST SUMMARY');
  console.log(`${'='.repeat(60)}`);
  
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.testCase}: FAILED - ${result.error}`);
    } else {
      const status = result.statusCode === 200 ? '✅' : '❌';
      console.log(`${status} ${result.testCase}: ${result.statusCode} (${result.duration}s)`);
    }
  });
  
  // Test with CURL for comparison
  console.log(`\n${'='.repeat(60)}`);
  console.log('CURL TEST (for comparison)');
  console.log(`${'='.repeat(60)}`);
  
  try {
    await testWithCurl(tests[0]);
  } catch (e) {
    console.error('CURL test failed:', e.message);
  }
}

// Run the tests
runTests().catch(console.error);