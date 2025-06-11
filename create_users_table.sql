-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth0_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  name text,
  avatar text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  language text DEFAULT 'en' NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth0_id ON users(auth0_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Check if table was created
SELECT 'Users table ready!' as status;