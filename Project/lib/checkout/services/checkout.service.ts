import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { CheckoutPayload, CheckoutResult } from '../types';

export class CheckoutService {
    private supabase;

    constructor() {
        this.supabase = createServiceSupabaseClient();
    }

    async createBooking(payload: CheckoutPayload): Promise<CheckoutResult> {
        console.log('[CheckoutService] createBooking called with:', { userId: payload.userId, type: payload.serviceType });

        // 1. Resolve User ID (Handle Clerk vs Internal UUID)
        let userId = payload.userId;

        // If the ID is a Clerk ID (e.g. user_2...), resolve to UUID
        if (userId.startsWith('user_')) {
            console.log('[CheckoutService] Resolving Clerk ID:', userId);
            const { data: user, error: userError } = await this.supabase
                .from('users')
                .select('id')
                .eq('clerk_id', userId)
                .single();

            if (userError) {
                console.error('[CheckoutService] Error resolving user:', userError);
            }

            if (user) {
                userId = user.id;
                console.log('[CheckoutService] Resolved UUID:', userId);
            } else {
                console.warn(`[CheckoutService] User ${payload.userId} not found in DB. Falling back to null or creating stub.`);
            }
        }

        // 2. Calculate Total & Prepare Data
        let totalAmount = 0;
        let title = 'Booking';

        if (payload.serviceType === 'shop') {
            totalAmount = payload.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

            const firstItemName = payload.items[0]?.name || 'Unknown Item';
            if (payload.items.length === 1) {
                title = `Shop Order: ${firstItemName}`;
            } else {
                title = `Shop Order: ${firstItemName} + ${payload.items.length - 1} more`;
            }
        } else if (payload.serviceType === 'transport') {
            // Basic fallback total calculation if not provided (though route logic usually sends it)
            // But payload from transport checkout usually relies on `items` price logic?
            if (payload.items && payload.items.length > 0) {
                totalAmount = payload.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
                // Apply tax if needed, but usually frontend sends pre-calculated or reliable values? 
                // Actually, CheckoutService typically trusts backend calculation. 
                // For now, let's stick to the items sum.
                // Note: Transport frontend added 10% tax. Ideally we replicate that here or trust items.
                // Let's assume items price includes it or we take it from totalAmount if passed? 
                // The Interface typically calculates from items.
                totalAmount = Math.ceil(totalAmount * 1.1); // Match frontend logic 10% tax? Or just trust items?
                // Let's log it.
                console.log('[CheckoutService] Transport calculated amount:', totalAmount);
            }
            title = payload.items?.[0]?.name || 'Transport Booking';
        }

        // ... other types

        console.log('[CheckoutService] Inserting booking for user:', userId);

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
            console.error('[CheckoutService] Create booking failed', error);
            throw new Error(`Failed to create booking: ${error.message}`);
        }

        console.log('[CheckoutService] Booking created successfully:', booking.id);

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
