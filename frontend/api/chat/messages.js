import { Pool } from 'pg';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.peojtkesvynmmzftljxo:H%5EOps%23%26PNPXnn9i%40cQ@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;

  try {
    if (method === 'GET') {
      const { sessionId } = req.query;
      
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID required' });
      }
      
      // Query real database for messages
      const result = await pool.query(
        `SELECT 
          id,
          session_id as "sessionId",
          role,
          content,
          created_at as "createdAt"
        FROM messages
        WHERE session_id = $1
        ORDER BY created_at ASC`,
        [sessionId]
      );
      
      return res.status(200).json(result.rows);
    }

    if (method === 'POST') {
      const { sessionId, role, content } = req.body;
      
      if (!sessionId || !role || !content) {
        return res.status(400).json({ error: 'Session ID, role, and content are required' });
      }
      
      // Create new message in database
      const result = await pool.query(
        `INSERT INTO messages (session_id, role, content, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING 
          id,
          session_id as "sessionId",
          role,
          content,
          created_at as "createdAt"`,
        [sessionId, role, content]
      );
      
      // Update session's updated_at timestamp
      await pool.query(
        'UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1',
        [sessionId]
      );
      
      return res.status(200).json(result.rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}