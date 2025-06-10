// Proxy to Railway LangGraph backend
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const RAILWAY_BACKEND_URL = process.env.RAILWAY_BACKEND_URL || 'http://localhost:8000';
    
    // Forward request to Railway backend
    const response = await fetch(`${RAILWAY_BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    // Forward the streaming response
    response.body.pipe(res);
  } catch (error) {
    console.error('Railway backend proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to connect to backend',
      details: error.message 
    });
  }
}