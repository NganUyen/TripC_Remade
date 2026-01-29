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
        const {
            hotelId,
            roomId,
            startDate,
            endDate,
            guestDetails,
            guestCount
        } = booking.metadata || {};

        if (!hotelId || !roomId) {
            throw new Error('Missing hotel/room ID in metadata');
        }

        // 3. Create Domain Record
        const { error } = await this.supabase
            .from('hotel_bookings')
            .insert({
                booking_id: booking.id,
                hotel_id: hotelId,
                room_id: roomId,
                user_uuid: booking.user_id,
                check_in_date: startDate || booking.start_date,
                check_out_date: endDate || booking.end_date,
                guest_name: guestDetails?.name || 'Guest',
                guest_email: guestDetails?.email || 'no-email@example.com',
                guest_phone: guestDetails?.phone || '0000000000',
                guest_count: guestCount || { adults: 1, children: 0 },
                status: 'confirmed',
                payment_status: 'paid',
                total_cents: Math.round(Number(booking.total_amount) * 100), // Hotel uses cents
                currency: booking.currency,
                confirmation_code: `HT-${booking.booking_code || Math.random().toString(36).substr(2, 6).toUpperCase()}`
            });

        if (error) {
            console.error('[HOTEL_SETTLEMENT] Creation failed', error);
            throw error;
        }

        console.log('[HOTEL_SETTLEMENT] Success');
    }
}
