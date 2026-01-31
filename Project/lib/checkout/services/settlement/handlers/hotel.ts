import { SupabaseClient } from '@supabase/supabase-js';
import { ISettlementHandler } from '../types';

export class HotelSettlementHandler implements ISettlementHandler {
    constructor(private supabase: SupabaseClient) { }

    async settle(booking: any): Promise<void> {
        console.log('[HOTEL_SETTLEMENT] Starting', { bookingId: booking.id });

        // 1. Idempotency Check
        const { data: existing } = await this.supabase
            .from('hotel_bookings')
            .select('id')
            .eq('booking_id', booking.id)
            .single();

        if (existing) {
            console.log('[HOTEL_SETTLEMENT] Already settled', { bookingId: booking.id, hotelBookingId: existing.id });
            return;
        }

        // 2. Extract Metadata
        // NOTE: booking.metadata contains the validated intent schemas from route.ts
        const {
            hotelId,
            roomId,
            dates, // { start, end }
            guestDetails,
            guestCount
        } = booking.metadata || {};

        // Use the authoritative user_id from the booking record (Resolved UUID)
        const user_uuid = booking.user_id;

        if (!hotelId || !roomId || !user_uuid) {
            console.error('[HOTEL_SETTLEMENT] Missing critical data', { hotelId, roomId, hasUserUuid: !!user_uuid });
            throw new Error('Missing hotel/room ID or User UUID in metadata');
        }

        // 3. Price Calculation (Server Authority Redundancy)
        // Ensure strictly integer cents.
        // We use the booking.total_amount which was calculated by the Server Route.
        // Simply convert to cents here.
        const totalCents = Math.round(Number(booking.total_amount) * 100);

        // 4. Create Domain Record
        const { error } = await this.supabase
            .from('hotel_bookings')
            .insert({
                booking_id: booking.id,
                hotel_id: hotelId,
                room_id: roomId,
                user_uuid: user_uuid, // Strict UUID
                check_in_date: dates.start,
                check_out_date: dates.end,
                guest_name: guestDetails?.name || 'Guest',
                guest_email: guestDetails?.email || 'no-email@example.com',
                guest_phone: guestDetails?.phone || '0000000000',
                guest_count: guestCount || { adults: 1, children: 0 }, // JSONB
                status: 'pending', // Initial status
                payment_status: booking.payment_status === 'paid' ? 'paid' : 'pending',
                total_cents: totalCents, // Integer Store
                currency: booking.currency,
                nightly_rate_cents: Math.round(totalCents / Math.max(1, (new Date(dates.end).getDate() - new Date(dates.start).getDate()))), // Approx
                confirmation_code: `HT-${booking.booking_code || Math.random().toString(36).substr(2, 6).toUpperCase()}`
            });

        if (error) {
            console.error('[HOTEL_SETTLEMENT] Creation failed', error);
            throw error;
        }

        console.log('[HOTEL_SETTLEMENT] Success');
    }
}
