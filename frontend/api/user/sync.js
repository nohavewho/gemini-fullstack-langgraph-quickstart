import { Pool } from 'pg';

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { auth0Id, email, name, avatar, language } = req.body;

  if (!auth0Id || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT * FROM app_users WHERE auth0_id = $1',
      [auth0Id]
    );

    let user;
    
    if (existingUser.rows.length > 0) {
      // Update existing user
      const updateResult = await pool.query(
        `UPDATE app_users 
         SET email = $2, name = $3, avatar = $4, language = $5, updated_at = NOW()
         WHERE auth0_id = $1
         RETURNING id, auth0_id, email, name, avatar, language, created_at, updated_at, is_active`,
        [auth0Id, email, name || null, avatar || null, language || 'en']
      );
      user = updateResult.rows[0];
    } else {
      // Create new user
      const insertResult = await pool.query(
        `INSERT INTO app_users (auth0_id, email, name, avatar, language, created_at, updated_at, is_active)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), true)
         RETURNING id, auth0_id, email, name, avatar, language, created_at, updated_at, is_active`,
        [auth0Id, email, name || null, avatar || null, language || 'en']
      );
      user = insertResult.rows[0];
    }

    // Convert to camelCase
    const camelCaseUser = {
      id: user.id,
      auth0Id: user.auth0_id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      language: user.language,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      isActive: user.is_active
    };

    return res.status(200).json(camelCaseUser);
  } catch (error) {
    console.error('User sync error:', error);
    return res.status(500).json({ error: 'Failed to sync user' });
  }
}