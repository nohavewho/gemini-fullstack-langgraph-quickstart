export async function onRequestPost(context) {
  const { env, request } = context;
  
  try {
    const data = await request.json();
    
    if (!data.auth0Id || !data.email) {
      return new Response('Missing required fields', { status: 400 });
    }
    
    // Get the database URL from environment
    const DATABASE_URL = env.DATABASE_URL || 'postgresql://postgres.peojtkesvynmmzftljxo:H%5EOps%23%26PNPXnn9i%40cQ@aws-0-us-east-1.pooler.supabase.com:5432/postgres';
    
    // Use the Cloudflare Workers compatible PostgreSQL driver
    const { Pool } = await import('@neondatabase/serverless');
    const pool = new Pool({ connectionString: DATABASE_URL });
    
    // First check if user exists
    let { rows } = await pool.query(
      `SELECT id, auth0_id as "auth0Id", email, name, avatar, created_at as "createdAt", 
              updated_at as "updatedAt", is_active as "isActive", language
       FROM users 
       WHERE auth0_id = $1`,
      [data.auth0Id]
    );
    
    if (rows.length === 0) {
      // Create new user
      const result = await pool.query(
        `INSERT INTO users (auth0_id, email, name, avatar, language, created_at, updated_at, is_active)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), true)
         RETURNING id, auth0_id as "auth0Id", email, name, avatar, created_at as "createdAt", 
                   updated_at as "updatedAt", is_active as "isActive", language`,
        [data.auth0Id, data.email, data.name || null, data.avatar || null, data.language || 'en']
      );
      rows = result.rows;
    } else {
      // Update existing user
      const result = await pool.query(
        `UPDATE users 
         SET email = $2, name = $3, avatar = $4, language = $5, updated_at = NOW()
         WHERE auth0_id = $1
         RETURNING id, auth0_id as "auth0Id", email, name, avatar, created_at as "createdAt", 
                   updated_at as "updatedAt", is_active as "isActive", language`,
        [data.auth0Id, data.email, data.name || null, data.avatar || null, data.language || rows[0].language]
      );
      rows = result.rows;
    }
    
    // Close the pool
    await pool.end();
    
    return new Response(JSON.stringify(rows[0]), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}