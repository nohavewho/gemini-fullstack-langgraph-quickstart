import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';

// Database connection
const connectionString = import.meta.env.VITE_DATABASE_URL || 'postgresql://postgres.peojtkesvynmmzftljxo:H%5EOps%23%26PNPXnn9i%40cQ@aws-0-us-east-1.pooler.supabase.com:5432/postgres';
const sql = postgres(connectionString);
export const db = drizzle(sql);

// Supabase client for real-time features
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://peojtkesvynmmzftljxo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema will be defined here
export * from './schema';