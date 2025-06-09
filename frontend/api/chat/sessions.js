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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;

  try {
    if (method === 'GET') {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }
      
      // First get the user by auth0Id
      const userResult = await pool.query(
        'SELECT id FROM app_users WHERE auth0_id = $1',
        [userId]
      );
      
      if (userResult.rows.length === 0) {
        return res.status(200).json([]); // No user found, return empty sessions
      }
      
      const dbUserId = userResult.rows[0].id;
      
      // Query real database for sessions
      const result = await pool.query(
        `SELECT 
          cs.id, 
          cs.user_id as "userId", 
          cs.title, 
          cs.preset,
          cs.countries,
          cs.created_at as "createdAt", 
          cs.updated_at as "updatedAt", 
          cs.is_active as "isActive"
        FROM chat_sessions cs
        WHERE cs.user_id = $1
        ORDER BY cs.updated_at DESC`,
        [dbUserId]
      );
      
      return res.status(200).json(result.rows);
    }

    if (method === 'POST') {
      const { userId, title, preset, countries } = req.body;
      
      if (!userId || !title) {
        return res.status(400).json({ error: 'User ID and title are required' });
      }
      
      // First get the user by auth0Id
      const userResult = await pool.query(
        'SELECT id FROM app_users WHERE auth0_id = $1',
        [userId]
      );
      
      if (userResult.rows.length === 0) {
        return res.status(400).json({ error: 'User not found' });
      }
      
      const dbUserId = userResult.rows[0].id;
      
      // Create new session in database
      const result = await pool.query(
        `INSERT INTO chat_sessions (user_id, title, preset, countries, created_at, updated_at, is_active)
         VALUES ($1, $2, $3, $4, NOW(), NOW(), true)
         RETURNING 
          id, 
          user_id as "userId", 
          title, 
          preset,
          countries,
          created_at as "createdAt", 
          updated_at as "updatedAt", 
          is_active as "isActive"`,
        [dbUserId, title, preset || null, countries || null]
      );
      
      return res.status(200).json(result.rows[0]);
    }

    if (method === 'DELETE') {
      // Extract session ID from URL path
      const url = req.url;
      const sessionId = url.split('/').pop();
      
      if (!sessionId || sessionId === 'sessions') {
        return res.status(400).json({ error: 'Session ID required' });
      }
      
      // Delete session from database
      await pool.query(
        'DELETE FROM chat_sessions WHERE id = $1',
        [sessionId]
      );
      
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}