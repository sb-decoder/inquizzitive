import { createClient } from "@supabase/supabase-js";

// Use Vite env vars locally, process.env on Vercel
const supabaseUrl =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL
    ? import.meta.env.VITE_SUPABASE_URL
    : process.env.SUPABASE_URL;

const supabaseAnonKey =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY
    ? import.meta.env.VITE_SUPABASE_ANON_KEY
    : process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Key missing in environment variables!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
