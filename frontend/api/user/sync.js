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

    // Use direct PostgreSQL connection with proper encoding
    const connectionString = 'postgresql://postgres.peojtkesvynmmzftljxo:H%5EOps%23%26PNPXnn9i%40cQ@aws-0-us-east-1.pooler.supabase.com:5432/postgres';
    sql = postgres(connectionString, { max: 1 });

    // First check if user exists
    const existingUsers = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    let user;
    
    if (existingUsers.length > 0) {
      // User exists, just return it
      user = existingUsers[0];
    } else {
      // Create new user with existing table structure
      const newUsers = await sql`
        INSERT INTO users (id, email, role, created_at)
        VALUES (gen_random_uuid(), ${email}, 'user', NOW())
        RETURNING *
      `;
      user = newUsers[0];
    }

    // Map to expected format (add auth0 fields even if not in DB)
    const mappedUser = {
      ...user,
      auth0_id: auth0Id,
      name: name || email.split('@')[0],
      avatar: avatar || '',
      language: language || 'en',
      is_active: true
    };

    console.log('User synced successfully:', mappedUser);

    return res.status(200).json({
      id: mappedUser.id,
      auth0Id: mappedUser.auth0_id,
      email: mappedUser.email,
      name: mappedUser.name,
      avatar: mappedUser.avatar,
      language: mappedUser.language,
      createdAt: mappedUser.created_at || new Date().toISOString(),
      updatedAt: mappedUser.updated_at || new Date().toISOString(),
      isActive: mappedUser.is_active
    });

  } catch (error) {
    console.error('User sync error:', error);
    
    return res.status(500).json({ 
      error: 'Failed to sync user',
      details: error.message,
      code: error.code || 'UNKNOWN',
      hint: 'Check database connection and table structure'
    });
  } finally {
    // Close connection
    if (sql) {
      await sql.end();
    }
  }
}