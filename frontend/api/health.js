export default function handler(req, res) {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasGoogleKey: !!process.env.GOOGLE_AI_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    }
  });
}