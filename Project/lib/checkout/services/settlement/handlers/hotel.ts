import { SupabaseClient } from '@supabase/supabase-js';
import { ISettlementHandler } from '../types';
import { resolveUserUuid } from '../utils';

export class HotelSettlementHandler implements ISettlementHandler {
    constructor(private supabase: SupabaseClient) { }

    async settle(booking: any): Promise<void> {
        console.log('[HOTEL_SETTLEMENT] Starting settlement for booking:', booking.id);

        // 1. Idempotency Check
        const { data: existing } = await this.supabase
            .from('hotel_bookings')
            .select('id')
            .eq('booking_id', booking.id)
            .maybeSingle(); // Changed from single() to maybeSingle()

        if (existing) {
            console.log('[HOTEL_SETTLEMENT] Idempotent: Already processed');
            return;
        }

        // 2. Extract Metadata
        const {
            hotelId,
            roomId,
            startDate,
            endDate,
            guestDetails,
            guestCount
        } = booking.metadata || {};

        const userUuid = await resolveUserUuid(this.supabase, booking.user_id);

        if (!hotelId || !roomId) {
            console.error('[HOTEL_SETTLEMENT] Critical Error: Missing hotel/room ID in metadata');
            throw new Error('Missing hotel/room ID in metadata');
        }

        console.log('[HOTEL_SETTLEMENT] Resolved internal UUID:', userUuid || 'GUEST');

        const totalCents = Math.round(Number(booking.total_amount) * 100);
        // Estimate nightly rate if not in metadata
        const nights = booking.metadata?.nights || 1;
        const nightlyRateCents = booking.metadata?.nightlyRateCents || Math.round(totalCents / nights);

        // 3. Create Domain Record
        const { error } = await this.supabase
            .from('hotel_bookings')
            .insert({
                booking_id: booking.id,
                hotel_id: hotelId,
                room_id: roomId,
                user_uuid: userUuid,
                check_in_date: startDate || booking.start_date,
                check_out_date: endDate || booking.end_date,
                guest_name: guestDetails?.name || booking.guest_details?.name || 'Guest',
                guest_email: guestDetails?.email || booking.guest_email || booking.guest_details?.email || 'no-email@example.com',
                guest_phone: guestDetails?.phone || booking.guest_details?.phone || '0000000000',
                guest_count: guestCount || { adults: 1, children: 0 },
                status: 'confirmed',
                payment_status: 'paid',
                total_cents: totalCents,
                nightly_rate_cents: nightlyRateCents,
                currency: booking.currency || 'USD',
                confirmation_code: `HT-${booking.booking_code || Math.random().toString(36).substr(2, 6).toUpperCase()}`
            });

        if (error) {
            console.error('[HOTEL_SETTLEMENT] Creation failed', error);
            throw error;
        }

        console.log('[HOTEL_SETTLEMENT] Successfully created hotel_bookings record');
    }
}
