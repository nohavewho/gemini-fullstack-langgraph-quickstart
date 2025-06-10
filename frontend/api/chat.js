// Proxy to Railway LangGraph backend
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const RAILWAY_BACKEND_URL = process.env.RAILWAY_BACKEND_URL || 'http://localhost:8000';
    
    // Forward request to Railway backend
    const response = await fetch(`${RAILWAY_BACKEND_URL}/api/press-monitor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    // Set proper headers for streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Forward the streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }
    } finally {
      reader.releaseLock();
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