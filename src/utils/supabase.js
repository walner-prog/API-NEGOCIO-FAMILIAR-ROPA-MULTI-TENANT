import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

console.log("URL:", process.env.SUPABASE_URL)
console.log("KEY:", process.env.SUPABASE_ANON_KEY ? "OK" : "VACÍA")

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});
