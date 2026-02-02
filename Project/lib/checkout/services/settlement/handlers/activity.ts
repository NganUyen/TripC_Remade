import { SupabaseClient } from '@supabase/supabase-js';
import { ISettlementHandler } from '../types';

export class ActivitySettlementHandler implements ISettlementHandler {
    constructor(private supabase: SupabaseClient) { }

    async settle(booking: any): Promise<void> {
        console.log('[ACTIVITY_SETTLEMENT] Starting settlement for booking:', booking.id);

        // 1. Idempotency Check
        const { data: existing } = await this.supabase
            .from('activity_bookings')
            .select('id')
            .eq('booking_id', booking.id)
            .maybeSingle();

        if (existing) {
            console.log('[ACTIVITY_SETTLEMENT] Idempotent: Already processed');
            return;
        }

        // 2. Extract Metadata
        const metadata = booking.metadata || {};
        const {
            activityId,
            activity_id, // Fallback for old format
            date,
            tickets,
            guestDetails,
            specialRequests,
        } = metadata;

        const finalActivityId = activityId || activity_id;

        // Resolve User IDs
        let userUuid: string | null = null;
        let clerkId: string | null = null;

        if (booking.user_id && booking.user_id !== 'GUEST') {
            userUuid = booking.user_id;

            // Fetch Clerk ID for external reference
            const { data: userData } = await this.supabase
                .from('users')
                .select('clerk_id')
                .eq('id', userUuid)
                .single();

            if (userData) {
                clerkId = userData.clerk_id;
            }
        }

        if (!finalActivityId) {
            console.error('[ACTIVITY_SETTLEMENT] Critical Error: Missing activity ID');
            throw new Error('Missing activity ID in metadata');
        }

        console.log('[ACTIVITY_SETTLEMENT] Resolved user:', userUuid || 'GUEST');

        // Calculate total tickets
        const totalTickets = tickets ? Object.values(tickets).reduce((sum: number, count: any) => sum + Number(count), 0) : 1;

        // Generate confirmation code
        const confirmationCode = `AC-${booking.booking_code || this.generateCode(6)}`;

        // Currency multiplier
        const currencyMultiplier = booking.currency === 'VND' ? 1 : 100;
        const totalCents = Math.round(Number(booking.total_amount) * currencyMultiplier);

        // 3. Create Domain Record
        const { error } = await this.supabase
            .from('activity_bookings')
            .insert({
                booking_id: booking.id,
                user_uuid: userUuid,
                external_user_ref: clerkId || booking.user_id,
                activity_id: finalActivityId,
                confirmation_code: confirmationCode,
                booking_date: date || booking.start_date,
                participant_count: totalTickets,
                ticket_details: tickets || {},
                total_amount: Number(booking.total_amount),
                currency: booking.currency || 'USD',
                guest_name: guestDetails?.name || booking.guest_details?.name || 'Guest',
                guest_email: guestDetails?.email || booking.guest_email || booking.guest_details?.email || 'no-email@example.com',
                guest_phone: guestDetails?.phone || booking.guest_details?.phone || null,
                special_requests: specialRequests || null,
                status: 'confirmed',
                payment_status: booking.payment_status === 'paid' ? 'paid' : 'pending',
                confirmed_at: new Date().toISOString(),
                metadata: {
                    booking_source: 'checkout',
                    tickets: tickets,
                },
            });

        if (error) {
            console.error('[ACTIVITY_SETTLEMENT] Creation failed', error);
            throw error;
        }

        console.log('[ACTIVITY_SETTLEMENT] Successfully created activity_bookings record');
    }

    private generateCode(length: number): string {
        return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
    }
}
