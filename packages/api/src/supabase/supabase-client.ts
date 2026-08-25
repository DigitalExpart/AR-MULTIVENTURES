import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@ar-multiventures/types';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  'https://demo-placeholder.supabase.co';

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  'demo-placeholder-anon-key';

export const isSupabaseConfigured =
  supabaseUrl !== 'https://demo-placeholder.supabase.co' &&
  supabaseAnonKey !== 'demo-placeholder-anon-key' &&
  Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
