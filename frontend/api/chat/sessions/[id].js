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
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (req.method === 'DELETE') {
    if (!id) {
      return res.status(400).json({ error: 'Session ID required' });
    }
    
    try {
      // Start a transaction to delete session and related messages
      await pool.query('BEGIN');
      
      // Delete all messages associated with this session
      await pool.query(
        'DELETE FROM messages WHERE session_id = $1',
        [id]
      );
      
      // Delete the session
      const result = await pool.query(
        'DELETE FROM chat_sessions WHERE id = $1 RETURNING id',
        [id]
      );
      
      await pool.query('COMMIT');
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      return res.status(200).json({ success: true, deletedId: id });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Delete session error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}