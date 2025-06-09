export async function onRequestGet(context) {
  const { env, request } = context;
  
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return new Response('User ID required', { status: 400 });
    }
    
    // Get the database URL from environment
    const DATABASE_URL = env.DATABASE_URL || 'postgresql://postgres.peojtkesvynmmzftljxo:H%5EOps%23%26PNPXnn9i%40cQ@aws-0-us-east-1.pooler.supabase.com:5432/postgres';
    
    // Use the Cloudflare Workers compatible PostgreSQL driver
    const { Pool } = await import('@neondatabase/serverless');
    const pool = new Pool({ connectionString: DATABASE_URL });
    
    // Query sessions for the user
    const { rows } = await pool.query(
      `SELECT id, user_id as "userId", title, preset, countries, query_type as "queryType",
              created_at as "createdAt", updated_at as "updatedAt", is_active as "isActive"
       FROM chat_sessions 
       WHERE user_id = $1 AND is_active = true
       ORDER BY created_at DESC`,
      [userId]
    );
    
    // Close the pool
    await pool.end();
    
    return new Response(JSON.stringify(rows), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  const { env, request } = context;
  
  try {
    const data = await request.json();
    
    if (!data.userId || !data.title) {
      return new Response('Missing required fields', { status: 400 });
    }
    
    // Get the database URL from environment
    const DATABASE_URL = env.DATABASE_URL || 'postgresql://postgres.peojtkesvynmmzftljxo:H%5EOps%23%26PNPXnn9i%40cQ@aws-0-us-east-1.pooler.supabase.com:5432/postgres';
    
    // Use the Cloudflare Workers compatible PostgreSQL driver
    const { Pool } = await import('@neondatabase/serverless');
    const pool = new Pool({ connectionString: DATABASE_URL });
    
    // Insert the new session
    const { rows } = await pool.query(
      `INSERT INTO chat_sessions (user_id, title, preset, countries, query_type, created_at, updated_at, is_active)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), true)
       RETURNING id, user_id as "userId", title, preset, countries, query_type as "queryType",
                 created_at as "createdAt", updated_at as "updatedAt", is_active as "isActive"`,
      [data.userId, data.title, data.preset || null, data.countries || null, data.queryType || null]
    );
    
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

export async function onRequestDelete(context) {
  const { env, request, params } = context;
  
  try {
    const url = new URL(request.url);
    const sessionId = url.pathname.split('/').pop();
    
    if (!sessionId) {
      return new Response('Session ID required', { status: 400 });
    }
    
    // Get the database URL from environment
    const DATABASE_URL = env.DATABASE_URL || 'postgresql://postgres.peojtkesvynmmzftljxo:H%5EOps%23%26PNPXnn9i%40cQ@aws-0-us-east-1.pooler.supabase.com:5432/postgres';
    
    // Use the Cloudflare Workers compatible PostgreSQL driver
    const { Pool } = await import('@neondatabase/serverless');
    const pool = new Pool({ connectionString: DATABASE_URL });
    
    // Soft delete the session by setting is_active to false
    await pool.query(
      `UPDATE chat_sessions SET is_active = false WHERE id = $1`,
      [sessionId]
    );
    
    // Close the pool
    await pool.end();
    
    return new Response('OK', { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}