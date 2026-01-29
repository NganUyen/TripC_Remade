import { SupabaseClient } from '@supabase/supabase-js';
import { ISettlementHandler } from '../types';

export class TransportSettlementHandler implements ISettlementHandler {
    constructor(private supabase: SupabaseClient) { }

    async settle(booking: any): Promise<void> {
        console.log('[TRANSPORT_SETTLEMENT] Starting', { bookingId: booking.id });

        // 1. Idempotency Check
        const { data: existing } = await this.supabase
            .from('transport_bookings')
            .select('id')
            .eq('booking_id', booking.id)
            .single();

        if (existing) {
            console.log('[TRANSPORT_SETTLEMENT] Already settled', { bookingId: booking.id, transportBookingId: existing.id });
            return;
        }

        // 2. Extract Metadata
        const {
            routeId,
            vehicleDetails,
            passengerInfo,
            contactInfo
        } = booking.metadata || {};

        if (!routeId) {
            console.error('[TRANSPORT_SETTLEMENT] Missing routeId', { bookingId: booking.id });
            throw new Error('Missing routeId in metadata');
        }

        // 3. Create Domain Record
        const { error } = await this.supabase
            .from('transport_bookings')
            .insert({
                booking_id: booking.id,
                route_id: routeId,
                passenger_info: passengerInfo || booking.guest_details || {},
                vehicle_snapshot: vehicleDetails || {},
                status: 'confirmed'
            });

        if (error) {
            console.error('[TRANSPORT_SETTLEMENT] Creation failed', error);
            throw error;
        }

        console.log('[TRANSPORT_SETTLEMENT] Success');
    }
}
