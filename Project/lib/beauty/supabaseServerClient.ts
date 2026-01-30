/**
 * Supabase Server Client for Beauty Service
 *
 * Server-side Supabase client with service role access for the beauty module.
 * Use only in server-side code (API routes, server components).
 *
 * @module lib/beauty/supabaseServerClient
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL environment variable. " +
      "Please add it to your .env.local file.",
  );
}

if (!supabaseServiceKey) {
  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY environment variable. " +
      "Please add it to your .env.local file. " +
      "WARNING: Never commit this key to version control!",
  );
}

export const supabaseServerClient = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  },
);

export async function testBeautyDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabaseServerClient
      .from("beauty_venues")
      .select("id")
      .limit(1);
    return !error;
  } catch (err) {
    console.error("Beauty database connection test failed:", err);
    return false;
  }
}
