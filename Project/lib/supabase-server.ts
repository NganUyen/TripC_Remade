/**
 * Server-side Supabase Client
 * 
 * This file provides a Supabase client for use in API routes and server components.
 * Uses service role key to bypass RLS for admin operations.
 */

import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client (for API routes and server components)
 * Uses service role key - bypasses RLS for admin operations
 */
export function createServiceSupabaseClient() {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY;

    if (!key) {
        throw new Error("Missing Supabase API Key (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_KEY)");
    }

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        key,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        },
    );
}

/**
 * Standard server-side Supabase client using public anon key
 */
export function createServerSupabaseClient() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_KEY) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_KEY environment variable");
    }

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        },
    );
}
