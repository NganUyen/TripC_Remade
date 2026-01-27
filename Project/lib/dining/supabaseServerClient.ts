/**
 * Supabase Server Client for Dining Service
 *
 * This module provides a server-side Supabase client with service role access
 * specifically for the dining service.
 * IMPORTANT: This should ONLY be used in server-side code (API routes, server components).
 * Never expose the service role key to the browser.
 *
 * @module lib/dining/supabaseServerClient
 */

import { createClient } from "@supabase/supabase-js";

// Validate required environment variables
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

/**
 * Server-side Supabase client with service role privileges for Dining service
 *
 * This client bypasses Row Level Security (RLS) and has full database access.
 * Use with caution and always validate user permissions in your application logic.
 */
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

/**
 * Helper function to test dining database connectivity
 * Tests connection by querying the dining_venues table
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabaseServerClient
      .from("dining_venues")
      .select("id")
      .limit(1);

    return !error;
  } catch (err) {
    console.error("Dining database connection test failed:", err);
    return false;
  }
}
