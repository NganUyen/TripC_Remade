import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Resolves a Clerk User ID (the string starting with 'user_') 
 * to the internal database UUID from the 'users' table.
 */
export async function resolveUserUuid(supabase: SupabaseClient, clerkId: string | null): Promise<string | null> {
    if (!clerkId || clerkId === 'GUEST') return null;

    // 1. Check if it's already a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(clerkId)) return clerkId;

    // 2. Lookup in users table
    const { data: userData, error } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkId)
        .maybeSingle();

    if (error) {
        console.error('[SETTLEMENT_UTILS] Error resolving user UUID:', error);
        return null;
    }

    return userData?.id || null;
}
