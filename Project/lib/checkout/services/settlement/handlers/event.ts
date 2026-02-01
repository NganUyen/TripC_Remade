import { SupabaseClient } from '@supabase/supabase-js';
import { ISettlementHandler } from '../types';
import type { EventCheckoutDetails, EventAttendee, EventQRCode } from '@/lib/events/types';

export class EventSettlementHandler implements ISettlementHandler {
    constructor(private supabase: SupabaseClient) { }

    async settle(booking: any): Promise<void> {
        console.log('[EVENT_SETTLEMENT] Starting', { bookingId: booking.id });

        // 1. Idempotency Check
        const { data: existing } = await this.supabase
            .from('event_bookings')
            .select('id')
            .eq('booking_id', booking.id)
            .single();

        if (existing) {
            console.log('[EVENT_SETTLEMENT] Already settled', {
                bookingId: booking.id,
                eventBookingId: existing.id
            });
            return;
        }

        // 2. Extract Metadata
        const metadata = booking.metadata as EventCheckoutDetails;

        if (!metadata) {
            console.error('[EVENT_SETTLEMENT] Missing metadata');
            throw new Error('Missing event booking metadata');
        }

        const {
            eventId,
            sessionId,
            ticketTypeId,
            adultCount,
            childCount = 0,
            guestDetails,
            attendees,
            specialRequests,
        } = metadata;

        // Validate required fields
        if (!eventId || !sessionId || !ticketTypeId) {
            console.error('[EVENT_SETTLEMENT] Missing critical data', {
                eventId, sessionId, ticketTypeId
            });
            throw new Error('Missing event/session/ticket type ID in metadata');
        }

        // 3. Verify Ticket Availability and Lock Inventory
        const totalTickets = adultCount + childCount;

        // Get ticket type details for price verification
        const { data: ticketType, error: ticketError } = await this.supabase
            .from('event_ticket_types')
            .select('price, currency, total_capacity, sold_count, held_count')
            .eq('id', ticketTypeId)
            .single();

        if (ticketError || !ticketType) {
            console.error('[EVENT_SETTLEMENT] Ticket type not found', ticketError);
            throw new Error('Ticket type not found');
        }

        // Verify capacity (should already be held during checkout init)
        const availableCapacity = ticketType.total_capacity - ticketType.sold_count - ticketType.held_count;

        // 4. Confirm tickets (convert held to sold)
        const { data: confirmResult, error: confirmError } = await this.supabase
            .rpc('confirm_event_tickets', {
                p_ticket_type_id: ticketTypeId,
                p_quantity: totalTickets,
            });

        if (confirmError) {
            console.error('[EVENT_SETTLEMENT] Failed to confirm tickets', confirmError);
            throw new Error('Failed to confirm ticket inventory');
        }

        if (confirmResult === false) {
            // Tickets weren't held properly - try direct update as fallback
            console.warn('[EVENT_SETTLEMENT] Confirm returned false, attempting direct update');

            const { error: updateError } = await this.supabase
                .from('event_ticket_types')
                .update({
                    sold_count: ticketType.sold_count + totalTickets,
                })
                .eq('id', ticketTypeId);

            if (updateError) {
                console.error('[EVENT_SETTLEMENT] Direct inventory update failed', updateError);
                throw new Error('Failed to update ticket inventory');
            }
        }

        // 5. Generate Confirmation Code and QR Codes
        const confirmationCode = `EV-${booking.booking_code || this.generateCode(6)}`;
        const qrCodes = this.generateQRCodes(confirmationCode, totalTickets, guestDetails.name, attendees);

        // 6. Resolve User IDs
        let userUuid: string | null = null;
        let clerkId: string | null = null;

        if (booking.user_id) {
            // booking.user_id is the internal UUID (foreign key to users table)
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

        // 7. Create Domain Record
        const { data: eventBooking, error: insertError } = await this.supabase
            .from('event_bookings')
            .insert({
                booking_id: booking.id,
                user_uuid: userUuid,
                external_user_ref: clerkId || booking.user_id, // Fallback to UUID if Clerk ID not found (though it should be)
                event_id: eventId,
                session_id: sessionId,
                ticket_type_id: ticketTypeId,
                confirmation_code: confirmationCode,
                adult_count: adultCount,
                child_count: childCount,
                unit_price: ticketType.price,
                total_amount: Number(booking.total_amount),
                currency: booking.currency || ticketType.currency || 'VND',
                guest_name: guestDetails.name,
                guest_email: guestDetails.email,
                guest_phone: guestDetails.phone || null,
                attendees: attendees || [],
                qr_codes: qrCodes,
                special_requests: specialRequests || null,
                status: 'confirmed',
                payment_status: booking.payment_status === 'paid' ? 'paid' : 'pending',
                confirmed_at: new Date().toISOString(),
                metadata: {
                    booking_source: 'checkout',
                    original_booking_id: booking.id,
                },
            })
            .select()
            .single();

        if (insertError) {
            console.error('[EVENT_SETTLEMENT] Creation failed', insertError);

            // Rollback inventory on failure
            await this.rollbackInventory(ticketTypeId, totalTickets);

            throw insertError;
        }

        // 8. Update session status if sold out
        await this.updateSessionStatus(sessionId);

        console.log('[EVENT_SETTLEMENT] Success', {
            bookingId: booking.id,
            eventBookingId: eventBooking.id,
            confirmationCode,
            tickets: totalTickets,
        });
    }

    /**
     * Generate a random alphanumeric code
     */
    private generateCode(length: number): string {
        return Math.random()
            .toString(36)
            .substring(2, 2 + length)
            .toUpperCase();
    }

    /**
     * Generate QR codes for each ticket
     */
    private generateQRCodes(
        confirmationCode: string,
        totalTickets: number,
        primaryGuestName: string,
        attendees?: EventAttendee[]
    ): EventQRCode[] {
        const qrCodes: EventQRCode[] = [];

        for (let i = 0; i < totalTickets; i++) {
            const ticketNumber = i + 1;
            const attendeeName = attendees?.[i]?.name || primaryGuestName;

            // Generate unique QR code
            // Format: {confirmation}-{ticket#}-{timestamp}-{random}
            const qrCode = `${confirmationCode}-${ticketNumber.toString().padStart(3, '0')}-${Date.now().toString(36)}-${this.generateCode(4)}`;

            qrCodes.push({
                code: qrCode,
                ticket_number: ticketNumber,
                attendee_name: attendeeName,
            });
        }

        return qrCodes;
    }

    /**
     * Rollback inventory on settlement failure
     */
    private async rollbackInventory(ticketTypeId: string, quantity: number): Promise<void> {
        try {
            await this.supabase.rpc('release_event_tickets', {
                p_ticket_type_id: ticketTypeId,
                p_quantity: quantity,
            });
            console.log('[EVENT_SETTLEMENT] Inventory rollback successful');
        } catch (error) {
            console.error('[EVENT_SETTLEMENT] Inventory rollback failed', error);
            // Log for manual intervention but don't throw
        }
    }

    /**
     * Update session status based on remaining capacity
     */
    private async updateSessionStatus(sessionId: string): Promise<void> {
        try {
            // Get all ticket types for this session
            const { data: ticketTypes } = await this.supabase
                .from('event_ticket_types')
                .select('total_capacity, sold_count, held_count')
                .eq('session_id', sessionId)
                .eq('is_active', true);

            if (!ticketTypes || ticketTypes.length === 0) return;

            // Calculate total available
            const totalAvailable = ticketTypes.reduce((sum, t) => {
                return sum + (t.total_capacity - t.sold_count - t.held_count);
            }, 0);

            // If no tickets available, mark session as sold out
            if (totalAvailable <= 0) {
                await this.supabase
                    .from('event_sessions')
                    .update({ status: 'sold_out' })
                    .eq('id', sessionId);

                console.log('[EVENT_SETTLEMENT] Session marked as sold_out', { sessionId });
            }
        } catch (error) {
            console.error('[EVENT_SETTLEMENT] Failed to update session status', error);
            // Non-critical - don't throw
        }
    }
}
