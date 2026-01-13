import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Stronger guards to prevent the app from exploding in Vercel if Env Vars are not set yet
export const isSupabaseConfigured = !!(supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    supabaseUrl !== 'your_supabase_url' &&
    !supabaseUrl.includes('placeholder-dont-crash'));

if (!isSupabaseConfigured) {
    console.error('Supabase credentials are missing or invalid.');
    console.log('Checking Environment Variables (VITE_ prefixed):');
    console.log('- VITE_SUPABASE_URL:', supabaseUrl ? 'Set (starts with ' + supabaseUrl.substring(0, 8) + '...)' : 'Missing');
    console.log('- VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set (length: ' + supabaseAnonKey.length + ')' : 'Missing');
}

// If not configured, we provide a placeholder to prevent "supabaseUrl is required" crash
const finalUrl = (supabaseUrl && supabaseUrl.startsWith('http'))
    ? supabaseUrl
    : 'https://placeholder-dont-crash.supabase.co';

export const supabase = createClient(
    finalUrl,
    supabaseAnonKey || 'placeholder-key'
);
