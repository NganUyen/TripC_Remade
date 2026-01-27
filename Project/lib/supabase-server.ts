
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client (for API routes and server components)
 * Uses service role key - bypasses RLS for admin operations
 */
export function createServiceSupabaseClient() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
    }

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        },
    );
}
