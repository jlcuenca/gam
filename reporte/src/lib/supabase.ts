import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Stronger guards to prevent the app from exploding in Vercel if Env Vars are not set yet
const isConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_url';

if (!isConfigured) {
    console.error('Supabase credentials are missing. Visit Vercel Dashboard to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// If not configured, we provide a placeholder to prevent "supabaseUrl is required" crash
// but we cast it carefully to satisfy the library requirements while warning the developer
export const supabase = createClient(
    supabaseUrl || 'https://placeholder-dont-crash.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);
