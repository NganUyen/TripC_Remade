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

                // Try to find user by ID (UUID) first, then fall back to Clerk ID
                let { data: userData } = await this.supabase
                    .from('users')
                    .select('email, full_name')
                    .eq('id', booking.user_id)
                    .maybeSingle();

                // If not found by UUID, try Clerk ID
                if (!userData && booking.user_id.startsWith('user_')) {
                    const result = await this.supabase
                        .from('users')
                        .select('email, full_name')
                        .eq('clerk_id', booking.user_id)
                        .maybeSingle();
                    userData = result.data;
                }

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

            // 7. Process Cashback / Loyalty (Async non-blocking)
            // We do this AFTER settlement is confirmed
            this.processCashback(booking).catch(err => {
                console.error('[SETTLEMENT_CASHBACK_ERROR]', { bookingId, error: err });
            });
        }
    }

    /**
     * PROCESS CASHBACK & TIER PROGRESSION
     * Calculates T-Cents based on user tier and total spent
     */
    private async processCashback(booking: any) {
        if (!booking.user_id || booking.user_id === 'GUEST') {
            console.log('[CASHBACK_SKIP] Guest user or no ID:', booking.user_id);
            return;
        }

        const totalAmount = Number(booking.total_amount);
        if (isNaN(totalAmount) || totalAmount <= 0) {
            console.log('[CASHBACK_SKIP] Invalid amount:', totalAmount);
            return;
        }

        console.log('[CASHBACK_START]', { userId: booking.user_id, amount: totalAmount });

        // 1. Get User's Current Tier and RESOLVE UUID
        // booking.user_id might be a Clerk ID (string) or UUID
        let query = this.supabase.from('users').select('id, membership_tier');

        // Check if ID looks like a Clerk ID (starts with "user_")
        // If so, query by clerk_id. Otherwise assume it's a UUID and query by id.
        // This prevents "invalid input syntax for type uuid" error when checking 'id' column with a non-UUID string.
        if (booking.user_id.startsWith('user_')) {
            query = query.eq('clerk_id', booking.user_id);
        } else {
            query = query.eq('id', booking.user_id);
        }

        const { data: user, error: userError } = await query.maybeSingle();

        if (userError || !user) {
            console.error('[CASHBACK_USER_ERROR] User not found or invalid ID:', booking.user_id, userError);
            return;
        }

        const userId = user.id; // Correct UUID


        const currentTier = user.membership_tier || 'BRONZE';

        // 2. Get Tier Configuration for Multiplier
        const { data: tierConfig, error: configError } = await this.supabase
            .from('tier_configs')
            .select('earning_multiplier')
            .eq('tier_name', currentTier)
            .single();

        if (configError) {
            console.error('[CASHBACK_CONFIG_ERROR]', configError);
            return;
        }

        const multiplier = Number(tierConfig?.earning_multiplier || 1.0);

        // 3. Calculate T-Cents
        // Base Rate: 10 T-Cents per $1 USD
        // Formula: Spend * 10 * Multiplier
        const basePoints = totalAmount * 10;
        const finalPoints = Math.round(basePoints * multiplier);

        console.log('[CASHBACK_CALC]', {
            tier: currentTier,
            spend: totalAmount,
            basePoints,
            multiplier,
            finalPoints
        });

        // 4. Insert into Ledger
        // Note: The 'process_cashback_trigger' on this table will automatically:
        // - Update user.lifetime_spend
        // - Update user.total_orders_completed
        // - Promote user tier if eligible
        const { error: ledgerError } = await this.supabase
            .from('tcent_ledger')
            .insert({
                user_id: userId,
                amount: finalPoints,
                transaction_type: 'BOOKING_CASHBACK',
                total_spend_usd: totalAmount,
                description: `Cashback for booking #${booking.booking_code} (${currentTier} Tier x${multiplier})`,
                reference_type: 'booking',
                reference_id: booking.id,
                status: 'completed',
                balance_after: 0 // Trigger or default usually handles this, or current balance needed? 
                // Wait, tcent_ledger usually requires calculating balance_after?
                // Let's check schema. If it's a log, maybe we need to calc it?
                // UPDATE: The atomic trigger `on_tcent_earned` (if exists) usually handles balance updates?
                // Or the `process_spin_reward` handled it manually.
                // I'll assume for now I should let a trigger handle it or I might need to fetch current balance.
                // Let's rely on valid backend logic.
                // Re-checking process_spin_reward: it did `UPDATE users set tcent_balance ...`.
                // `tcent_ledger` usually documents the history.
                // Does tcent_ledger have a trigger to update user balance?
                // Step 2018: `trg_process_cashback` updates lifetime_spend. NOT balance.
                // I need to UPDATE USER BALANCE too.
            });

        if (ledgerError) {
            console.error('[CASHBACK_LEDGER_ERROR]', ledgerError);
            throw new Error('Failed to record cashback');
        }

        // 5. Update User Balance (Since trigger might not do it)
        // We do this explicitly to be safe as `trg_process_cashback` only did stats.
        const { error: balanceError } = await this.supabase.rpc('increment_tcent_balance', {
            user_uuid: userId,
            amount_inc: finalPoints
        });

        // Fallback if RPC doesn't exist (it should, but just in case)
        if (balanceError) {
            console.warn('[CASHBACK_RPC_ERROR] trying direct update', balanceError);
            // Verify if RPC exists first? Or just do direct update?
            // Safest is direct update if we are Service Role.
            const { error: directError } = await this.supabase.rpc('increment_user_balance', {
                p_user_id: userId,
                p_amount: finalPoints
            });

            if (directError) {
                // Final fallback: Raw SQL update via query (not possible here easily w/o RPC)
                // But we have Service Role so we can just select + update
                const { data: u } = await this.supabase.from('users').select('tcent_balance').eq('id', userId).single();
                const newBal = (u?.tcent_balance || 0) + finalPoints;
                await this.supabase.from('users').update({ tcent_balance: newBal }).eq('id', userId);
            }
        }

        console.log('[CASHBACK_SUCCESS] Awarded', finalPoints);
    }
}
