import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { auth0Id, email, name, avatar, language = 'en' } = req.body;

    if (!auth0Id || !email) {
      return res.status(400).json({ error: 'auth0Id and email are required' });
    }

    console.log('Syncing user:', { auth0Id, email, name });

    // Use Supabase client instead of raw SQL for better error handling
    const supabaseUrl = 'https://peojtkesvynmmzftljxo.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlb2p0a2VzdnlubW16ZnRsanhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzMwMzI3NCwiZXhwIjoyMDUyODc5Mjc0fQ.IxLJDtOaZIJhJTFdtKmk5kN7EW_9LfOPi2k4VN5qFTE';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try to upsert user (will create table automatically via Supabase migrations)
    const { data: user, error } = await supabase
      .from('users')
      .upsert(
        {
          auth0_id: auth0Id,
          email: email,
          name: name || '',
          avatar: avatar || '',
          language: language,
          updated_at: new Date().toISOString()
        },
        { 
          onConflict: 'auth0_id',
          ignoreDuplicates: false 
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Supabase upsert error:', error);
      
      // If table doesn't exist, return helpful message
      if (error.code === '42P01') { // relation does not exist
        return res.status(500).json({
          error: 'Database table not found. Please create users table in Supabase Dashboard.',
          details: 'Run the migration SQL or create table manually',
          sqlCommand: `
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth0_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  name text,
  avatar text,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  language text DEFAULT 'en' NOT NULL
);`
        });
      }
      
      throw error;
    }
    
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
    
    return res.status(500).json({ 
      error: 'Failed to sync user',
      details: error.message,
      code: error.code || 'UNKNOWN',
      hint: 'Check Supabase Dashboard and ensure users table exists'
    });
  }
}