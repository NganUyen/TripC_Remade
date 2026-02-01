import { SupabaseClient } from '@supabase/supabase-js';
import { ISettlementHandler } from '../types';
import { resolveUserUuid } from '../utils';
import { internalUpsertSavedTraveler } from '@/lib/actions/saved-travelers';

export class FlightSettlementHandler implements ISettlementHandler {
    constructor(private supabase: SupabaseClient) { }

    async settle(booking: any): Promise<void> {
        console.log('[FLIGHT_SETTLEMENT] Starting settlement for booking:', booking.id);

        // 1. Idempotency Check
        const { data: existing } = await this.supabase
            .from('flight_bookings')
            .select('id')
            .eq('booking_id', booking.id)
            .maybeSingle(); // Changed from single() to maybeSingle() for safety

        if (existing) {
            console.log('[FLIGHT_SETTLEMENT] Idempotent: Already processed');
            return;
        }

        // 2. Extract Metadata
        const {
            offerId: rootOfferId,
            flightId: rootFlightId,
            passengers: metadataPassengers,
            contactInfo,
            selectedFlights
        } = booking.metadata || {};

        const passengers = metadataPassengers || booking.guest_details?.passengers || [];

        const firstFlight = selectedFlights?.[0];
        let flightId = rootFlightId || firstFlight?.id;
        let offerId = rootOfferId || firstFlight?.offerId || flightId;

        // 2.5 Handle Mock IDs for DB Constraints
        // Mock IDs (e.g., VN-HAN-SGN-0) are not valid UUIDs. 
        // We swap them with a known "Anchor" UUID that exists in the DB.
        const MOCK_UUID = '2f5c9ade-4412-4d4c-956c-d8e42aacdc7e';
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        if (flightId && !uuidRegex.test(flightId)) {
            console.log('[FLIGHT_SETTLEMENT] Mock flight ID detected, swapping for fallback UUID');
            flightId = MOCK_UUID;
        }
        if (offerId && !uuidRegex.test(offerId)) {
            console.log('[FLIGHT_SETTLEMENT] Mock offer ID detected, swapping for fallback UUID');
            offerId = MOCK_UUID;
        }

        const userUuid = await resolveUserUuid(this.supabase, booking.user_id);

        console.log('[FLIGHT_SETTLEMENT] Resolved internal UUID:', userUuid || 'GUEST');

        // 3. Create Domain Record
        const leadEmail = booking.guest_email ||
            booking.guest_details?.email ||
            contactInfo?.email ||
            passengers?.[0]?.email ||
            'unknown@example.com';

        const leadPhone = booking.guest_details?.phone ||
            contactInfo?.phone ||
            passengers?.[0]?.phone ||
            '0000000000';

        // Using upsert or insert. Insert is fine due to check above, but constraints catch race conditions.
        const { error } = await this.supabase
            .from('flight_bookings')
            .insert({
                booking_id: booking.id,
                offer_id: offerId,
                flight_id: flightId,
                passengers: passengers,
                contact_info: contactInfo || { email: leadEmail, phone: leadPhone },
                lead_passenger_email: leadEmail,
                lead_passenger_phone: leadPhone,
                status: 'TICKETED',
                payment_status: 'PAID',
                user_uuid: userUuid,
                currency: booking.currency,
                base_fare: booking.total_amount * 0.8, // Mock split
                taxes_fees: booking.total_amount * 0.2, // Mock split
                // PNR generation (mock)
                pnr: `FL-${booking.booking_code || Math.random().toString(36).substr(2, 6).toUpperCase()}`
            });

        if (error) {
            console.error('[FLIGHT_SETTLEMENT] Creation failed', error);
            throw error;
        }

        console.log('[FLIGHT_SETTLEMENT] Successfully created flight_bookings record');

        // 4. Auto-save travelers for the user
        if (userUuid && userUuid !== 'GUEST' && passengers.length > 0) {
            console.log('[FLIGHT_SETTLEMENT] Auto-saving travelers:', passengers.length);
            for (const p of passengers) {
                try {
                    await internalUpsertSavedTraveler(this.supabase, userUuid, {
                        first_name: p.firstName || p.first_name,
                        last_name: p.lastName || p.last_name,
                        email: leadEmail,
                        phone_number: leadPhone,
                        date_of_birth: p.dateOfBirth || p.dob,
                        nationality: p.nationality,
                        passport_number: p.passportNumber || p.document_number,
                        gender: p.gender
                    });
                } catch (saveErr) {
                    console.error('[FLIGHT_SETTLEMENT] Auto-save failed for passenger:', p.firstName || p.first_name, saveErr);
                }
            }
        }
    }
}
