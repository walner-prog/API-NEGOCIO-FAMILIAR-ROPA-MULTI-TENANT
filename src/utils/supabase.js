import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

console.log("URL:", process.env.SUPABASE_URL)
console.log("KEY:", process.env.SUPABASE_SERVICE_ROLE ? "OK" : "VACÍA")


export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false }
});
