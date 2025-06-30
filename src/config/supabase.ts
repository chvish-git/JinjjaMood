import { createClient } from '@supabase/supabase-js';

// Supabase configuration using environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that required config values are present
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration values');
  console.error('Please update your .env file with actual Supabase project values from your Supabase dashboard.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export default supabase;