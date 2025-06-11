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

    // Use Supabase client with anon key (service key was invalid)
    const supabaseUrl = 'https://peojtkesvynmmzftljxo.supabase.co';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlb2p0a2VzdnlubW16ZnRsanhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczMDMyNzQsImV4cCI6MjA1Mjg3OTI3NH0.Yj3MkKPpXJsB4x0b0WJQBVh2TgR8UGIZ_LnAGus9Ixo';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // First, check if user exists by email in the existing users table
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    let user;
    
    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = not found
      throw selectError;
    }

    if (existingUser) {
      // User exists, just return it with mapped fields
      user = existingUser;
    } else {
      // Create new user in existing table structure
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          email: email,
          role: 'user'
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      user = newUser;
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
      hint: 'Check Supabase Dashboard and ensure users table exists'
    });
  }
}