import { SupabaseClient } from '@supabase/supabase-js';
import { ISettlementHandler } from './settlement/types';
import {
    ShopSettlementHandler,
    HotelSettlementHandler,
    FlightSettlementHandler,
    DiningSettlementHandler,
    TransportSettlementHandler,
    ActivitySettlementHandler,
    EventSettlementHandler,
    WellnessSettlementHandler,
    BeautySettlementHandler,
    EntertainmentSettlementHandler
} from './settlement/handlers';
import { unifiedEmailService } from '@/lib/email/unified-email-service';

export class SettlementService {
    private handlers: Record<string, ISettlementHandler>;

    constructor(private supabase: SupabaseClient) {
        this.handlers = {
            'shop': new ShopSettlementHandler(supabase),
            'hotel': new HotelSettlementHandler(supabase),
            'flight': new FlightSettlementHandler(supabase),
            'restaurant': new DiningSettlementHandler(supabase), // Note: booking_type is 'restaurant'
            'transport': new TransportSettlementHandler(supabase),
            'activity': new ActivitySettlementHandler(supabase),
            'event': new EventSettlementHandler(supabase),
            'wellness': new WellnessSettlementHandler(supabase),
            'beauty': new BeautySettlementHandler(supabase),
            'entertainment': new EntertainmentSettlementHandler(supabase),
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
        // Ledger uses 'category', but some legacy rows might need handling.
        const serviceType = booking.category || booking.booking_type;
        const handler = this.handlers[serviceType];

        if (handler) {
            await handler.settle(booking);
        } else {
            console.warn('[SETTLEMENT_NO_HANDLER]', { type: serviceType });
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

        // 5. Send Confirmation Email (Async)
        try {
            console.log('[SETTLEMENT_EMAIL_DEBUG] Starting for booking:', bookingId);
            console.log('[SETTLEMENT_EMAIL_DEBUG] category:', serviceType);
            console.log('[SETTLEMENT_EMAIL_DEBUG] booking_code:', booking.booking_code);
            console.log('[SETTLEMENT_EMAIL_DEBUG] guest_details:', JSON.stringify(booking.guest_details));

            let finalEmail = booking.guest_email ||
                booking.guest_details?.email ||
                booking.guest_details?.lead_passenger_email ||
                booking.metadata?.passengerInfo?.email ||
                booking.metadata?.contactInfo?.email ||
                booking.metadata?.email;

            let finalName = booking.guest_details?.name ||
                booking.guest_details?.lead_passenger_name ||
                booking.metadata?.passengerInfo?.firstName ||
                booking.metadata?.passengerInfo?.lastName ||
                'Guest';

            console.log('[SETTLEMENT_EMAIL_DEBUG] extracted email:', finalEmail);
            console.log('[SETTLEMENT_EMAIL_DEBUG] extracted name:', finalName);

            // IF AUTHENTICATED USER: Fetch email from 'users' table if not in guest_details
            if (!finalEmail && booking.user_id && booking.user_id !== 'GUEST') {
                console.log('[SETTLEMENT_EMAIL] Fetching user email for sync:', booking.user_id);

                // Try to find user by ID (UUID) OR Clerk ID
                // Note: .or() is more robust here if we don't know the format of booking.user_id
                const { data: userData } = await this.supabase
                    .from('users')
                    .select('email, full_name')
                    .or(`id.eq.${booking.user_id},clerk_id.eq.${booking.user_id}`)
                    .maybeSingle();

                if (userData) {
                    finalEmail = userData.email;
                    finalName = userData.full_name || finalName;
                    console.log('[SETTLEMENT_EMAIL_DEBUG] resolved user email:', finalEmail);
                } else {
                    console.warn('[SETTLEMENT_EMAIL] No user found for lookup:', booking.user_id);
                }
            }

            if (finalEmail) {
                console.log('[SETTLEMENT_EMAIL] Sending email to:', finalEmail, 'with code:', booking.booking_code);
                const isGuest = !booking.user_id || booking.user_id === 'GUEST';

                const emailResult = await unifiedEmailService.sendBookingEmail({
                    category: serviceType,
                    guest_name: finalName,
                    guest_email: finalEmail,
                    booking_code: booking.booking_code || 'N/A',
                    title: booking.title,
                    description: booking.description || '',
                    start_date: booking.start_date,
                    end_date: booking.end_date,
                    total_amount: booking.total_amount,
                    currency: booking.currency || 'USD',
                    location_summary: booking.location_summary,
                    metadata: booking.metadata,
                    isGuest: isGuest, // Pass guest flag for CTA display
                });
                console.log('[SETTLEMENT_EMAIL] Result:', emailResult);
            } else {
                console.warn('[SETTLEMENT_EMAIL] No email found for booking:', bookingId);
            }
        } catch (emailErr) {
            console.error('[SETTLEMENT_EMAIL_ERROR]', emailErr);
        }

        // 6. Record Completion Event (Idempotency Key)
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
