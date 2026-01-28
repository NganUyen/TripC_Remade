import { SupabaseClient } from '@supabase/supabase-js';

export class SettlementService {
    constructor(private supabase: SupabaseClient) { }

    /**
     * Settle a booking (Post-payment logic)
     * e.g. Create Shop Order, Issue Flight Ticket, etc.
     */
    async settleBooking(bookingId: string) {
        console.log('[SETTLEMENT_START]', { bookingId });

        // 1. Fetch booking
        const { data: booking, error } = await this.supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (error) {
            console.error('[SETTLEMENT_BOOKING_FETCH_ERROR]', {
                bookingId,
                error: error.message,
                code: error.code,
            });
            throw new Error(`Booking not found during settlement: ${error.message}`);
        }

        if (!booking) {
            console.error('[SETTLEMENT_BOOKING_NOT_FOUND]', { bookingId });
            throw new Error('Booking not found during settlement');
        }

        console.log('[SETTLEMENT_BOOKING_FETCHED]', {
            bookingId,
            bookingType: booking.booking_type,
            currentStatus: booking.status,
            currentPaymentStatus: booking.payment_status,
        });

        // 2. Check strict idempotency lock (prevent double settlement)
        const { data: event, error: eventError } = await this.supabase
            .from('booking_events')
            .select('id')
            .eq('booking_id', bookingId)
            .eq('event_type', 'SETTLEMENT_COMPLETED')
            .single();

        if (eventError && eventError.code !== 'PGRST116') {
            console.error('[SETTLEMENT_EVENT_CHECK_ERROR]', {
                bookingId,
                error: eventError.message,
                code: eventError.code,
            });
        }

        if (event) {
            console.log('[SETTLEMENT_ALREADY_COMPLETED]', { bookingId, eventId: event.id });
            return; // Already done
        }

        // 3. Perform specific logic based on type
        if (booking.booking_type === 'shop') {
            await this.settleShopBooking(booking);
        } else {
            // Placeholder: Flight, Hotel specific logic...
            console.log('[SETTLEMENT_GENERIC]', { bookingId, type: booking.booking_type });
        }

        // 4. Update Booking Status
        console.log('[SETTLEMENT_UPDATING_BOOKING]', {
            bookingId,
            newStatus: 'confirmed',
            newPaymentStatus: 'paid',
        });

        const { error: updateError, count } = await this.supabase
            .from('bookings')
            .update({
                status: 'confirmed',
                payment_status: 'paid',
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId);

        if (updateError) {
            console.error('[SETTLEMENT_BOOKING_UPDATE_ERROR]', {
                bookingId,
                error: updateError.message,
                code: updateError.code,
            });
            throw new Error(`Failed to update booking: ${updateError.message}`);
        }

        console.log('[SETTLEMENT_BOOKING_UPDATED]', { bookingId, rowsUpdated: count });

        // 5. Record Event
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
                console.error('[SETTLEMENT_EVENT_INSERT_ERROR]', {
                    bookingId,
                    error: eventInsertError.message,
                    code: eventInsertError.code,
                });
            }
            // Don't throw - event is nice-to-have
        } else {
            console.log('[SETTLEMENT_EVENT_RECORDED]', { bookingId });
        }

        console.log('[SETTLEMENT_COMPLETED]', { bookingId });
    }

    private async settleShopBooking(booking: any) {
        console.log('[SETTLEMENT_SHOP_START]', { bookingId: booking.id });

        if (!booking.metadata?.cartId) {
            console.error('[SETTLEMENT_SHOP_MISSING_CART]', { bookingId: booking.id });
            throw new Error('Missing cartId in booking metadata for shop settlement');
        }

        // Create Shop Order
        const orderNumber = `ORD-${Date.now()}`;
        console.log('[SETTLEMENT_SHOP_CREATING_ORDER]', {
            bookingId: booking.id,
            orderNumber,
            cartId: booking.metadata.cartId,
        });

        const { error, data: order } = await this.supabase
            .from('shop_orders')
            .insert({
                order_number: orderNumber,
                user_id: booking.user_id,
                cart_id: booking.metadata.cartId,
                booking_id: booking.id,
                subtotal: Math.floor(Number(booking.total_amount)), // Ensure integer
                shipping_address_snapshot: {},
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('[SETTLEMENT_SHOP_ORDER_CREATE_ERROR]', {
                bookingId: booking.id,
                error: error.message,
                code: error.code,
            });
            throw error;
        }

        console.log('[SETTLEMENT_SHOP_ORDER_CREATED]', {
            bookingId: booking.id,
            orderId: order?.id,
            orderNumber,
        });
    }
}
