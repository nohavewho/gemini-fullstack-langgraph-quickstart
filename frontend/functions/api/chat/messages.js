export async function onRequestGet(context) {
  const { env, request } = context;
  
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    
    if (!sessionId) {
      return new Response('Session ID required', { status: 400 });
    }
    
    // Get the database URL from environment
    const DATABASE_URL = env.DATABASE_URL || 'postgresql://postgres.peojtkesvynmmzftljxo:H%5EOps%23%26PNPXnn9i%40cQ@aws-0-us-east-1.pooler.supabase.com:5432/postgres';
    
    // Use the Cloudflare Workers compatible PostgreSQL driver
    const { Pool } = await import('@neondatabase/serverless');
    const pool = new Pool({ connectionString: DATABASE_URL });
    
    // Query messages for the session
    const { rows } = await pool.query(
      `SELECT id, session_id as "sessionId", type, content, metadata, created_at as "createdAt"
       FROM messages 
       WHERE session_id = $1
       ORDER BY created_at ASC`,
      [sessionId]
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
    
    if (!data.sessionId || !data.type || !data.content) {
      return new Response('Missing required fields', { status: 400 });
    }
    
    // Get the database URL from environment
    const DATABASE_URL = env.DATABASE_URL || 'postgresql://postgres.peojtkesvynmmzftljxo:H%5EOps%23%26PNPXnn9i%40cQ@aws-0-us-east-1.pooler.supabase.com:5432/postgres';
    
    // Use the Cloudflare Workers compatible PostgreSQL driver
    const { Pool } = await import('@neondatabase/serverless');
    const pool = new Pool({ connectionString: DATABASE_URL });
    
    // Insert the new message
    const { rows } = await pool.query(
      `INSERT INTO messages (session_id, type, content, metadata, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, session_id as "sessionId", type, content, metadata, created_at as "createdAt"`,
      [data.sessionId, data.type, data.content, data.metadata || null]
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