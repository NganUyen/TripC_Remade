import { SupabaseClient } from '@supabase/supabase-js';
import { ISettlementHandler } from '../types';
import type { EntertainmentCheckoutDetails } from '@/lib/checkout/types';

interface EntertainmentQRCode {
    code: string;
    ticket_number: number;
    guest_name: string;
}

export class EntertainmentSettlementHandler implements ISettlementHandler {
    constructor(private supabase: SupabaseClient) { }

    async settle(booking: any): Promise<void> {
        console.log('[ENTERTAINMENT_SETTLEMENT] Starting', { bookingId: booking.id });

        // 1. Idempotency Check
        const { data: existing } = await this.supabase
            .from('entertainment_bookings')
            .select('id')
            .eq('booking_id', booking.id)
            .single();

        if (existing) {
            console.log('[ENTERTAINMENT_SETTLEMENT] Already settled', {
                bookingId: booking.id,
                entertainmentBookingId: existing.id
            });
            return;
        }

        // 2. Extract Metadata
        const metadata = booking.metadata as EntertainmentCheckoutDetails;

        if (!metadata) {
            console.error('[ENTERTAINMENT_SETTLEMENT] Missing metadata');
            throw new Error('Missing entertainment booking metadata');
        }

        const {
            itemId,
            sessionId,
            ticketTypeId,
            quantity = 1,
            guestDetails,
            specialRequests,
        } = metadata;

        // Validate required fields
        if (!itemId || !ticketTypeId) {
            console.error('[ENTERTAINMENT_SETTLEMENT] Missing critical data', {
                itemId, ticketTypeId
            });
            throw new Error('Missing item/ticket type ID in metadata');
        }

        // 3. Get ticket type details for price verification
        const { data: ticketType, error: ticketError } = await this.supabase
            .from('entertainment_ticket_types')
            .select('price, currency, total_available, total_sold, held_count, name')
            .eq('id', ticketTypeId)
            .single();

        if (ticketError || !ticketType) {
            console.error('[ENTERTAINMENT_SETTLEMENT] Ticket type not found', ticketError);
            throw new Error('Ticket type not found');
        }

        // 4. Confirm tickets (convert held to sold) via RPC
        const { data: confirmResult, error: confirmError } = await this.supabase
            .rpc('confirm_entertainment_tickets', {
                p_ticket_type_id: ticketTypeId,
                p_quantity: quantity,
            });

        if (confirmError) {
            console.error('[ENTERTAINMENT_SETTLEMENT] Failed to confirm tickets', confirmError);
            throw new Error('Failed to confirm ticket inventory');
        }

        if (confirmResult === false) {
            // Tickets weren't held properly - try direct update as fallback
            console.warn('[ENTERTAINMENT_SETTLEMENT] Confirm returned false, attempting direct update');

            const { error: updateError } = await this.supabase
                .from('entertainment_ticket_types')
                .update({
                    total_sold: (ticketType.total_sold || 0) + quantity,
                })
                .eq('id', ticketTypeId);

            if (updateError) {
                console.error('[ENTERTAINMENT_SETTLEMENT] Direct inventory update failed', updateError);
                throw new Error('Failed to update ticket inventory');
            }
        }

        // 5. Generate Confirmation Code and QR Codes
        const confirmationCode = `ENT-${booking.booking_code || this.generateCode(6)}`;
        const qrCodes = this.generateQRCodes(confirmationCode, quantity, guestDetails.name);

        // 6. Resolve User IDs
        let userUuid: string | null = null;
        let clerkId: string | null = null;

        if (booking.user_id) {
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

        // 7. Get item details for organizer reference
        const { data: itemData } = await this.supabase
            .from('entertainment_items')
            .select('organizer_id, title')
            .eq('id', itemId)
            .single();

        // 8. Create Domain Record
        const bookingReference = `ENT-${new Date().getFullYear()}-${this.generateCode(6)}`;

        const { data: entertainmentBooking, error: insertError } = await this.supabase
            .from('entertainment_bookings')
            .insert({
                // Unified pipeline link
                booking_id: booking.id,

                // User identification
                user_id: clerkId || booking.user_id, // Legacy Clerk ID field
                external_user_ref: clerkId,
                user_uuid: userUuid,

                // References
                item_id: itemId,
                session_id: sessionId || null,
                organizer_id: itemData?.organizer_id || null,

                // Booking identifiers
                booking_reference: bookingReference,
                confirmation_code: confirmationCode,

                // Contact Information
                customer_name: guestDetails.name,
                customer_email: guestDetails.email,
                customer_phone: guestDetails.phone || null,

                // Ticket Information
                // Note: Schema uses total_quantity, not quantity
                total_quantity: quantity,

                // Totals
                total_amount: Number(booking.total_amount),
                currency: booking.currency || ticketType.currency || 'VND',

                // Status Mapping
                booking_status: 'confirmed', // Schema uses booking_status, not status
                payment_status: booking.payment_status === 'paid' ? 'paid' : 'pending',

                // Timestamps: booking_date uses created_at by default

                // Metadata - Storing all non-schema fields here
                metadata: {
                    booking_source: 'unified_checkout',
                    original_booking_id: booking.id,
                    item_title: itemData?.title,
                    qr_codes: qrCodes,
                    special_requests: specialRequests || null,
                    // Ticket Details moved to metadata (not in schema)
                    ticket_type_id: ticketTypeId,
                    ticket_type_name: ticketType.name,
                    unit_price: ticketType.price,
                    subtotal: ticketType.price * quantity
                },
            })
            .select()
            .single();

        if (insertError) {
            console.error('[ENTERTAINMENT_SETTLEMENT] Creation failed', insertError);

            // Rollback inventory on failure
            await this.rollbackInventory(ticketTypeId, quantity);

            throw insertError;
        }

        // 9. Update session status if sold out (if session exists)
        if (sessionId) {
            await this.updateSessionStatus(sessionId);
        }

        console.log('[ENTERTAINMENT_SETTLEMENT] Success', {
            bookingId: booking.id,
            entertainmentBookingId: entertainmentBooking.id,
            confirmationCode,
            tickets: quantity,
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
        quantity: number,
        guestName: string
    ): EntertainmentQRCode[] {
        const qrCodes: EntertainmentQRCode[] = [];

        for (let i = 0; i < quantity; i++) {
            const ticketNumber = i + 1;

            // Generate unique QR code
            // Format: {confirmation}-{ticket#}-{timestamp}-{random}
            const qrCode = `${confirmationCode}-${ticketNumber.toString().padStart(3, '0')}-${Date.now().toString(36)}-${this.generateCode(4)}`;

            qrCodes.push({
                code: qrCode,
                ticket_number: ticketNumber,
                guest_name: guestName,
            });
        }

        return qrCodes;
    }

    /**
     * Rollback inventory on settlement failure
     */
    private async rollbackInventory(ticketTypeId: string, quantity: number): Promise<void> {
        try {
            await this.supabase.rpc('release_entertainment_tickets', {
                p_ticket_type_id: ticketTypeId,
                p_quantity: quantity,
            });
            console.log('[ENTERTAINMENT_SETTLEMENT] Inventory rollback successful');
        } catch (error) {
            console.error('[ENTERTAINMENT_SETTLEMENT] Inventory rollback failed', error);
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
                .from('entertainment_ticket_types')
                .select('total_available, total_sold, held_count')
                .eq('session_id', sessionId)
                .eq('is_active', true);

            if (!ticketTypes || ticketTypes.length === 0) return;

            // Calculate total available
            const totalAvailable = ticketTypes.reduce((sum, t) => {
                return sum + ((t.total_available || 0) - (t.total_sold || 0) - (t.held_count || 0));
            }, 0);

            // If no tickets available, mark session as sold out
            if (totalAvailable <= 0) {
                await this.supabase
                    .from('entertainment_sessions')
                    .update({ status: 'sold_out' })
                    .eq('id', sessionId);

                console.log('[ENTERTAINMENT_SETTLEMENT] Session marked as sold_out', { sessionId });
            }
        } catch (error) {
            console.error('[ENTERTAINMENT_SETTLEMENT] Failed to update session status', error);
            // Non-critical - don't throw
        }
    }
}
