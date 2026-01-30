import { SupabaseClient } from '@supabase/supabase-js';
import { ISettlementHandler } from '../types';

export class FlightSettlementHandler implements ISettlementHandler {
    constructor(private supabase: SupabaseClient) { }

    async settle(booking: any): Promise<void> {
        console.log('[FLIGHT_SETTLEMENT] Starting', { bookingId: booking.id });

        // 1. Idempotency Check
        const { data: existing } = await this.supabase
            .from('flight_bookings')
            .select('id')
            .eq('booking_id', booking.id)
            .single();

        if (existing) {
            console.log('[FLIGHT_SETTLEMENT] Already settled', { bookingId: booking.id, flightBookingId: existing.id });
            return;
        }

        // 2. Extract Metadata
        const {
            offerId,
            passengers,
            flightId,
            contactInfo
        } = booking.metadata || {};

        if (!offerId || !flightId) {
            console.warn('[FLIGHT_SETTLEMENT] Missing metadata', { bookingId: booking.id });
            // We continue to avoid crashing, but this is a data issue.
            // Maybe we should throw? If we throw, settlement fails and retries.
            // For now, let's create a minimal record or throw.
            console.warn('[FLIGHT_SETTLEMENT] Missing flight/offer ID in metadata - strictly logging for now');
            return;
        }

        // 3. Create Domain Record
        // Using upsert or insert. Insert is fine due to check above, but constraints catch race conditions.
        const { error } = await this.supabase
            .from('flight_bookings')
            .insert({
                booking_id: booking.id,
                offer_id: offerId,
                flight_id: flightId,
                passengers: passengers || [],
                contact_info: contactInfo || {},
                status: 'TICKETED', // Immediate ticketing for MVP
                payment_status: 'PAID',
                user_uuid: booking.user_id, // Ensure user linkage
                total_amount: booking.total_amount, // Redundant but useful for domain queries
                currency: booking.currency,
                // PNR generation (mock)
                pnr: `FL-${booking.booking_code || Math.random().toString(36).substr(2, 6).toUpperCase()}`
            });

        if (error) {
            console.error('[FLIGHT_SETTLEMENT] Creation failed', error);
            throw error;
        }

        console.log('[FLIGHT_SETTLEMENT] Success');
    }
}
