/**
 * Supabase Server Client for Shop Service
 *
 * This module provides a server-side Supabase client with service role access.
 * IMPORTANT: This should ONLY be used in server-side code (API routes, server components).
 * Never expose the service role key to the browser.
 *
 * @module lib/shop/supabaseServerClient
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
 * Supabase client with service role access
 *
 * This client bypasses Row Level Security (RLS) and has full database access.
 * Use with caution and only in secure server-side contexts.
 *
 * @example
 * ```typescript
 * import { supabaseServerClient } from '@/lib/shop/supabaseServerClient';
 *
 * const { data, error } = await supabaseServerClient
 *   .from('products')
 *   .select('*');
 * ```
 */
export const supabaseServerClient = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

/**
 * Test database connection
 *
 * Performs a simple query to verify database connectivity.
 * Useful for health checks and debugging.
 * Gracefully handles missing tables (returns true if table doesn't exist yet).
 *
 * @returns Promise<boolean> True if connection is successful
 *
 * @example
 * ```typescript
 * const isHealthy = await testDatabaseConnection();
 * console.log('Database status:', isHealthy ? 'OK' : 'ERROR');
 * ```
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabaseServerClient
      .from("products")
      .select("id")
      .limit(1);

    if (error) {
      // PGRST205 = table doesn't exist, which is ok for initial setup
      if (error.code === "PGRST205") {
        console.warn("Shop products table not found (OK for initial setup)");
        return true;
      }
      console.error("Shop database connection test failed:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Shop database connection test error:", error);
    return false;
  }
}
