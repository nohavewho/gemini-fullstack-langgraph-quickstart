// Proxy to Railway LangGraph backend for press monitoring
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Allow overriding the local backend URL for development
    const RAILWAY_BACKEND_URL =
      process.env.RAILWAY_BACKEND_URL ||
      process.env.LOCAL_BACKEND_URL ||
      'http://localhost:2024';
    
    console.log('[API Proxy] Press monitor request received:', JSON.stringify(req.body));
    console.log('[API Proxy] Backend URL:', RAILWAY_BACKEND_URL);
    console.log('[API Proxy] Request headers:', req.headers);
    
    // Forward request to Railway backend streaming endpoint
    const response = await fetch(`${RAILWAY_BACKEND_URL}/api/press-monitor-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API Proxy] Backend error:', response.status, errorText);
      throw new Error(`Backend API error: ${response.status} - ${errorText}`);
    }
    
    console.log('[API Proxy] Backend response OK, starting stream...');

    // Set SSE headers for streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Forward the streaming response
    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          res.write(chunk);
        }
      } finally {
        reader.releaseLock();
      }
    }

    res.end();
  } catch (error) {
    console.error('Railway backend proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to connect to backend',
      details: error.message 
    });
  }
}