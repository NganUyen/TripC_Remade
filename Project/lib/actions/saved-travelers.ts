"use server"

import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { verifyClerkAuth } from '@/lib/flight/clerkAuth';
import { resolveUserUuid } from '@/lib/checkout/services/settlement/utils';

export interface SavedTraveler {
    id?: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone_number?: string;
    date_of_birth?: string;
    gender?: 'male' | 'female' | 'other';
    nationality?: string;
    passport_number?: string;
}

/**
 * Fetch saved travelers for the current authenticated user
 */
export async function getSavedTravelers(): Promise<SavedTraveler[]> {
    try {
        const user = await verifyClerkAuth();
        const supabase = createServiceSupabaseClient();

        // Resolve internal user UUID
        const userUuid = await resolveUserUuid(supabase, user.id);
        if (!userUuid) return [];

        const { data, error } = await supabase
            .from('saved_travelers')
            .select('*')
            .eq('user_id', userUuid)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[SAVED_TRAVELERS] Fetch error:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('[SAVED_TRAVELERS] Auth or fetch error:', error);
        return [];
    }
}

/**
 * Core logic to save or update a traveler profile
 * Can be called from server actions or background tasks (like settlement)
 */
export async function internalUpsertSavedTraveler(
    supabase: any,
    userUuid: string,
    traveler: SavedTraveler
) {
    const { data, error } = await supabase
        .from('saved_travelers')
        .upsert({
            ...traveler,
            user_id: userUuid,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,first_name,last_name,passport_number',
            ignoreDuplicates: false,
        })
        .select()
        .single();

    if (error) {
        console.error('[SAVED_TRAVELERS] Upsert error:', error);
        throw error;
    }

    return data;
}

/**
 * Server action: Save or update a traveler profile
 */
export async function upsertSavedTraveler(traveler: SavedTraveler) {
    try {
        const user = await verifyClerkAuth();
        const supabase = createServiceSupabaseClient();

        // Resolve internal user UUID
        const userUuid = await resolveUserUuid(supabase, user.id);
        if (!userUuid) throw new Error('Could not resolve user UUID');

        const data = await internalUpsertSavedTraveler(supabase, userUuid, traveler);

        return { success: true, data };
    } catch (error) {
        console.error('[SAVED_TRAVELERS] Save action error:', error);
        throw error;
    }
}
