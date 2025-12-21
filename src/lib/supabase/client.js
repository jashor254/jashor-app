'use client';

import { createClient } from '@supabase/supabase-js';

// ✅ Read environment variables (these must start with NEXT_PUBLIC_ for client-side use)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ✅ Safety check: confirm keys exist
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Missing Supabase environment variables. Check your .env.local file!');
}

// ✅ Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
