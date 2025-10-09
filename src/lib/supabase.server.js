// src/lib/supabase.server.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL; // e.g., 'https://************* */.supabase.co'
const supabaseServiceRoleKey = process.env.SUPABASE_SECRET_KEY; // e.g., 'service_role_key'

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
