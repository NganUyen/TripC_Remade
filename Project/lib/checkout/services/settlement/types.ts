import { SupabaseClient } from '@supabase/supabase-js';

export interface ISettlementHandler {
    /**
     * Settle a booking.
     * Guaranteed to be called only when payment is successful.
     * Should be idempotent.
     */
    settle(booking: any): Promise<void>;
}

export type SettlementContext = {
    supabase: SupabaseClient;
};
