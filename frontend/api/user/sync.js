import postgres from 'postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let sql;
  
  try {
    const { auth0Id, email, name, avatar, language = 'en' } = req.body;

    if (!auth0Id || !email) {
      return res.status(400).json({ error: 'auth0Id and email are required' });
    }

    console.log('Syncing user:', { auth0Id, email, name });

    // Use PostgreSQL connection from CLAUDE.md
    const connectionString = 'postgresql://postgres.peojtkesvynmmzftljxo:H%5EOps%23%26PNPXnn9i%40cQ@aws-0-us-east-1.pooler.supabase.com:5432/postgres';
    sql = postgres(connectionString, { max: 1 });
    
    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        auth0_id text UNIQUE NOT NULL,
        email text UNIQUE NOT NULL,
        name text,
        avatar text,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL,
        is_active boolean DEFAULT true NOT NULL,
        language text DEFAULT 'en' NOT NULL
      );
    `;

    // Check if user exists, if not create
    const result = await sql`
      INSERT INTO users (auth0_id, email, name, avatar, language, created_at, updated_at, is_active)
      VALUES (${auth0Id}, ${email}, ${name || ''}, ${avatar || ''}, ${language}, NOW(), NOW(), true)
      ON CONFLICT (auth0_id) 
      DO UPDATE SET 
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        avatar = EXCLUDED.avatar,
        updated_at = NOW()
      RETURNING id, auth0_id, email, name, avatar, language, created_at, updated_at, is_active;
    `;

    const user = result[0];
    
    console.log('User synced successfully:', user);

    return res.status(200).json({
      id: user.id,
      auth0Id: user.auth0_id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      language: user.language,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      isActive: user.is_active
    });

  } catch (error) {
    console.error('User sync error:', error);
    
    // Check if it's a table doesn't exist error
    if (error.message.includes('relation "users" does not exist')) {
      return res.status(500).json({ 
        error: 'Database table not found. Please run migrations.',
        details: 'users table does not exist'
      });
    }

    return res.status(500).json({ 
      error: 'Failed to sync user',
      details: error.message 
    });
  } finally {
    // Close connection
    if (sql) {
      await sql.end();
    }
  }
}