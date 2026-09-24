import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oluzsthlxjxxpukxkcry.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sdXpzdGhseGp4eHB1a3hrY3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjU0MzQsImV4cCI6MjA5NTU0MTQzNH0.dummy_anon_key_for_build";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
