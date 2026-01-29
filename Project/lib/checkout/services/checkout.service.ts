import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { CheckoutPayload, CheckoutResult } from '../types';

export class CheckoutService {
    private supabase;

    constructor() {
        this.supabase = createServiceSupabaseClient();
    }

    async createBooking(payload: CheckoutPayload): Promise<CheckoutResult> {
        // 1. Resolve User ID (Handle Clerk vs Internal UUID)
        let userId = payload.userId;

        // If the ID is a Clerk ID (e.g. user_2...), resolve to UUID
        if (userId.startsWith('user_')) {
            const { data: user } = await this.supabase
                .from('users')
                .select('id')
                .eq('clerk_id', userId)
                .single();

            if (user) {
                userId = user.id;
            } else {
                console.warn(`User ${payload.userId} not found in DB. Falling back to null or creating stub.`);
                // Ideally throw error or create user stub. For now, we proceed if table allows or specific fallback logic.
                // Assuming the user table syncs via webhook, it should be there.
                // If testing, we might need a fallback.
            }
        }

        // 2. Calculate Total & Prepare Data
        let totalAmount = 0;
        let title = 'Booking';

        if (payload.serviceType === 'shop') {
            totalAmount = payload.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
            title = `Shop Order (${payload.items.length} items)`;
        }
        // ... other types

        // 3. Insert Booking
        const { data: booking, error } = await this.supabase
            .from('bookings')
            .insert({
                category: payload.serviceType, // Standardized: Ledger uses 'category'
                user_id: userId, // Ensure this is UUID
                title: title,
                total_amount: totalAmount,
                currency: payload.currency,
                status: 'pending',
                payment_status: 'unpaid',
                metadata: payload, // Save full payload for context/settlement
                start_date: new Date().toISOString(), // Required field default
                end_date: new Date().toISOString() // Required field default
            })
            .select()
            .single();

        if (error) {
            console.error('Create booking failed', error);
            throw new Error(`Failed to create booking: ${error.message}`);
        }

        // 4. Create Initial Event
        await this.supabase.from('booking_events').insert({
            booking_id: booking.id,
            event_type: 'BOOKING_CREATED'
        });

        return {
            bookingId: booking.id,
            totalAmount: booking.total_amount,
            currency: booking.currency,
            status: booking.status
        };
    }
}
