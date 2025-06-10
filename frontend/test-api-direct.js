// Direct API test
async function testAPI() {
  console.log('Testing API endpoints...\n');

  // Test health endpoint
  try {
    console.log('1. Testing health endpoint...');
    const healthRes = await fetch('https://deepgemini-frontend.vercel.app/api/health');
    console.log('Health response status:', healthRes.status);
    const healthData = await healthRes.text();
    console.log('Health response:', healthData);
  } catch (error) {
    console.error('Health check error:', error.message);
  }

  console.log('\n2. Testing chat endpoint...');
  
  // Test chat endpoint
  try {
    const chatRes = await fetch('https://deepgemini-frontend.vercel.app/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Test message: analyze press about Azerbaijan today',
            parts: [{ type: 'text', text: 'Test message: analyze press about Azerbaijan today' }]
          }
        ],
        mode: 'neighbors_priority',
        selectedCountries: ['RU', 'TR', 'GE', 'IR'],
        effortLevel: 3,
        model: 'gemini-2.0-flash'
      })
    });

    console.log('Chat response status:', chatRes.status);
    console.log('Chat response headers:', Object.fromEntries(chatRes.headers.entries()));
    
    if (chatRes.ok) {
      const reader = chatRes.body.getReader();
      const decoder = new TextDecoder();
      let chunks = [];
      
      console.log('\nReading stream...');
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        chunks.push(chunk);
        console.log('Chunk:', chunk.substring(0, 100) + '...');
      }
      
      console.log('\nTotal chunks received:', chunks.length);
    } else {
      const errorText = await chatRes.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Chat API error:', error);
  }

  console.log('\n3. Testing press-monitor-langgraph endpoint directly...');
  
  // Test press monitor endpoint
  try {
    const pressRes = await fetch('https://deepgemini-frontend.vercel.app/api/press-monitor-langgraph', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'neighbors_priority',
        options: {},
        searchQuery: 'Test: analyze press about Azerbaijan',
        userLanguage: 'en',
        stream: true
      })
    });

    console.log('Press monitor response status:', pressRes.status);
    console.log('Press monitor response headers:', Object.fromEntries(pressRes.headers.entries()));
    
    if (pressRes.ok) {
      const reader = pressRes.body.getReader();
      const decoder = new TextDecoder();
      let chunks = [];
      
      console.log('\nReading stream...');
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        chunks.push(chunk);
        console.log('Chunk:', chunk.substring(0, 100) + '...');
      }
      
      console.log('\nTotal chunks received:', chunks.length);
    } else {
      const errorText = await pressRes.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Press monitor API error:', error);
  }
}

testAPI().catch(console.error);