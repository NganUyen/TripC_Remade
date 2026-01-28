import { SupabaseClient } from '@supabase/supabase-js';
import { ISettlementHandler } from './settlement/types';
import { ShopSettlementHandler, HotelSettlementHandler, FlightSettlementHandler } from './settlement/handlers';

export class SettlementService {
    private handlers: Record<string, ISettlementHandler>;

    constructor(private supabase: SupabaseClient) {
        this.handlers = {
            'shop': new ShopSettlementHandler(supabase),
            'hotel': new HotelSettlementHandler(supabase),
            'flight': new FlightSettlementHandler(supabase),
        };
    }

    /**
     * Settle a booking (Post-payment logic)
     * e.g. Create Shop Order, Issue Flight Ticket, etc.
     */
    async settleBooking(bookingId: string) {
        console.log('[SETTLEMENT_START]', { bookingId });

        // 1. Fetch booking (Lightweight check first)
        const { data: booking, error } = await this.supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (error || !booking) {
            console.error('[SETTLEMENT_BOOKING_FETCH_ERROR]', { bookingId, error: error?.message });
            throw new Error(`Booking not found: ${bookingId}`);
        }

        // 2. Global Idempotency Lock via Event
        // We use this to prevent double-processing at the top level
        const { data: event } = await this.supabase
            .from('booking_events')
            .select('id')
            .eq('booking_id', bookingId)
            .eq('event_type', 'SETTLEMENT_COMPLETED')
            .maybeSingle();

        if (event) {
            console.log('[SETTLEMENT_ALREADY_COMPLETED]', { bookingId });
            return;
        }

        // 3. Delegate to Handler
        const handler = this.handlers[booking.booking_type];
        if (handler) {
            await handler.settle(booking);
        } else {
            console.warn('[SETTLEMENT_NO_HANDLER]', { type: booking.booking_type });
        }

        // 4. Update Booking Status (Final Confirmation)
        // Only done if handler succeeded (didn't throw)
        const { error: updateError } = await this.supabase
            .from('bookings')
            .update({
                status: 'confirmed',
                payment_status: 'paid',
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId);

        if (updateError) {
            console.error('[SETTLEMENT_UPDATE_FAILED]', { bookingId, error: updateError });
            throw updateError;
        }

        // 5. Record Completion Event (Idempotency Key)
        // Handled race condition with try-catch or explicit code check
        const { error: eventInsertError } = await this.supabase
            .from('booking_events')
            .insert({
                booking_id: bookingId,
                event_type: 'SETTLEMENT_COMPLETED'
            });

        if (eventInsertError) {
            if (eventInsertError.code === '23505') {
                console.log('[SETTLEMENT_EVENT_ALREADY_EXISTS]', { bookingId });
            } else {
                console.error('[SETTLEMENT_EVENT_FAIL]', { bookingId, error: eventInsertError });
            }
        } else {
            console.log('[SETTLEMENT_COMPLETED_SUCCESSFULLY]', { bookingId });
        }
    }
}
