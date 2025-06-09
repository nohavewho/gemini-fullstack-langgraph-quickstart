import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres.peojtkesvynmmzftljxo:H%5EOps%23%26PNPXnn9i%40cQ@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function createChatTables() {
  try {
    // Create chat_sessions table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        preset VARCHAR(50),
        countries TEXT[],
        query_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        is_active BOOLEAN DEFAULT true
      )
    `);
    console.log('✓ Chat sessions table ready');

    // Create messages table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ Messages table ready');

    // Check if tables were created
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('app_users', 'chat_sessions', 'messages')
    `);
    
    console.log('\nCreated tables:');
    tables.rows.forEach(row => console.log(`- ${row.table_name}`));

    await pool.end();
  } catch (error) {
    console.error('Database error:', error);
    process.exit(1);
  }
}

createChatTables();