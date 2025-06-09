// Test API endpoints
const API_BASE = 'http://localhost:8000/api/chat';

async function testAPI() {
  console.log('Testing API endpoints...\n');

  // Test GET sessions
  try {
    console.log('1. Testing GET /api/chat/sessions');
    const response = await fetch(`${API_BASE}/sessions?userId=test123`);
    const data = await response.json();
    console.log('Response:', response.status, data);
    console.log('✓ GET sessions endpoint works\n');
  } catch (error) {
    console.error('✗ GET sessions failed:', error.message, '\n');
  }

  // Test POST session
  try {
    console.log('2. Testing POST /api/chat/sessions');
    const response = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test123',
        title: 'Test Session',
        countries: ['US', 'RU']
      })
    });
    const data = await response.json();
    console.log('Response:', response.status, data);
    console.log('✓ POST session endpoint works\n');
  } catch (error) {
    console.error('✗ POST session failed:', error.message, '\n');
  }

  // Test GET messages
  try {
    console.log('3. Testing GET /api/chat/messages');
    const response = await fetch(`${API_BASE}/messages?sessionId=test-session`);
    const data = await response.json();
    console.log('Response:', response.status, data);
    console.log('✓ GET messages endpoint works\n');
  } catch (error) {
    console.error('✗ GET messages failed:', error.message, '\n');
  }
}

testAPI();