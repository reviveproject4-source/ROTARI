import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Build environments without Supabase configuration must not silently target
// a real project. The .invalid hostname is deliberately non-routable.
const clientUrl = supabaseUrl || "https://supabase-not-configured.invalid";
const clientKey = supabaseAnonKey || "supabase-not-configured";

export const supabase = createClient(clientUrl, clientKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
