import { SupabaseClient } from '@supabase/supabase-js';
import { ISettlementHandler } from '../types';

export class HotelSettlementHandler implements ISettlementHandler {
    constructor(private supabase: SupabaseClient) { }

    async settle(booking: any): Promise<void> {
        console.log('[HOTEL_SETTLEMENT_HANDLER] Placeholder for Hotel settlement', { bookingId: booking.id });
        // Future: Create hotel booking reservation, notify partner, etc.
    }
}
