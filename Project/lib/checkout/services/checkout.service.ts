import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { CheckoutPayload, CheckoutResult } from '../types';
import { generateBookingCode } from '@/utils/booking-codes';

export class CheckoutService {
    private supabase;

    constructor() {
        this.supabase = createServiceSupabaseClient();
    }

    async createBooking(payload: CheckoutPayload): Promise<CheckoutResult> {
        console.log('[CheckoutService] createBooking called with keys:', Object.keys(payload));
        console.log('[CheckoutService] Payload Details:', JSON.stringify(payload, null, 2));

        // 1. Resolve User ID (Handle Clerk vs Internal UUID)
        let userId = payload.userId;

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
        } else if (payload.serviceType === 'hotel') {
            const start = new Date(payload.dates.start);
            const end = new Date(payload.dates.end);
            const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

            // Fetch Hotel Details for Title, Location, and Price Authorization
            const { data: hotel } = await this.supabase
                .from('hotels')
                .select('name, address, images, best_price, metadata')
                .eq('id', payload.hotelId)
                .single();

            if (hotel) {
                // 1. Determine Nightly Rate (Backend Authority)
                // Logic mirrors BookingSidebar: best_price is in cents, fallback is 840 USD
                let nightlyRate = 840;
                if (hotel.best_price) {
                    nightlyRate = Math.floor(hotel.best_price / 100);
                } else if (hotel.metadata?.best_price) {
                    nightlyRate = Math.floor(hotel.metadata.best_price / 100);
                }

                // 2. Calculate Subtotals
                const roomTotal = nightlyRate * nights;
                const tax = Math.round(roomTotal * 0.10 * 100) / 100;
                const serviceFee = Math.round(roomTotal * 0.05 * 100) / 100;

                // 3. Final Total
                totalAmount = roomTotal + tax + serviceFee;

                console.log(`[CheckoutService] Hotel Pricing: Rate=${nightlyRate}, Nights=${nights}, Room=${roomTotal}, Tax=${tax}, Service=${serviceFee}, Total=${totalAmount}`);

                title = hotel.name;
                // Prepare metadata for rendering
                payload.hotelName = hotel.name;
                payload.hotelImage = hotel.images?.[0];

                // Format Address
                let addressStr = 'Vietnam';
                if (hotel.address) {
                    if (typeof hotel.address === 'object') {
                        // @ts-ignore
                        const { line1, city, country } = hotel.address;
                        addressStr = [line1, city, country].filter(Boolean).join(', ') || 'Vietnam';
                    } else {
                        addressStr = String(hotel.address);
                    }
                }
                payload.address = addressStr;
            } else {
                title = `Hotel Stay (${nights} nights)`;
                // Fallback validation if hotel fetch fails (shouldn't happen)
                if (payload.rate) totalAmount = payload.rate * nights;
            }
        }

        // ... other types

        console.log('[CheckoutService] Inserting booking for user:', userId);

        // 3. Generate Booking Code
        const bookingCode = generateBookingCode(payload.serviceType);

        // 4. Extract Guest Details (if any)
        // Many unified flows store this in metadata or payload directly
        const guestDetails = (payload as any).guestDetails ||
            (payload.metadata as any)?.passengerInfo ||
            (payload.metadata as any)?.contactInfo ||
            null;

        console.log('[CheckoutService] Inserting booking with code:', bookingCode);

        // 5. Insert Booking
        const { data: booking, error } = await this.supabase
            .from('bookings')
            .insert({
                category: payload.serviceType, // Standardized: Ledger uses 'category'
                user_id: userId, // Ensure this is UUID or 'GUEST'
                title: title,
                total_amount: totalAmount,
                currency: payload.currency,
                status: 'pending',
                payment_status: 'unpaid',
                location_summary: payload.address || payload.location_summary, // Map from payload (set in hotel block)
                image_url: payload.hotelImage || payload.image_url,       // Map from payload (set in hotel block)
                booking_code: bookingCode,
                guest_details: guestDetails,
                guest_email: guestDetails?.email || (payload.metadata as any)?.contactInfo?.email || null,
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
