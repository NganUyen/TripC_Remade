// Events module data access layer
// Server-side functions for querying and mutating events data

import { createServiceSupabaseClient } from '@/lib/supabase-server';
import type {
  Event,
  EventSession,
  EventTicketType,
  EventBooking,
  EventWithSessions,
  EventSessionWithTickets,
  EventTicketTypeWithAvailability,
  EventBookingWithDetails,
  EventSearchParams,
  EventListResponse,
  EventAttendee,
  EventQRCode,
} from './types';
import { searchEventsFuzzy } from './search-engine';

// =============================================================================
// Read Operations
// =============================================================================

/**
 * Get paginated list of events with their sessions and ticket types
 */
/**
 * Get paginated list of events with their sessions and ticket types
 * Uses fuzzy search engine for consistency
 */
export async function getEvents(params: EventSearchParams = {}): Promise<EventListResponse> {
  return searchEventsFuzzy(params);
}

/**
 * Get a single event by ID with all sessions and ticket types
 */
export async function getEventById(id: string): Promise<EventWithSessions | null> {
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      sessions:event_sessions(
        *,
        ticket_types:event_ticket_types(*)
      )
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('[EVENTS_DATA_ACCESS] getEventById error:', error);
    throw error;
  }

  return data as EventWithSessions;
}

/**
 * Get a single event by slug
 */
export async function getEventBySlug(slug: string): Promise<EventWithSessions | null> {
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      sessions:event_sessions(
        *,
        ticket_types:event_ticket_types(*)
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('[EVENTS_DATA_ACCESS] getEventBySlug error:', error);
    throw error;
  }

  return data as EventWithSessions;
}

/**
 * Get featured events
 */
export async function getFeaturedEvents(limit: number = 6): Promise<EventWithSessions[]> {
  const { events } = await getEvents({
    is_featured: true,
    limit,
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  return events;
}

/**
 * Get ticket availability for a session
 */
export async function getTicketAvailability(
  sessionId: string
): Promise<EventTicketTypeWithAvailability[]> {
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from('event_ticket_types')
    .select('*')
    .eq('session_id', sessionId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[EVENTS_DATA_ACCESS] getTicketAvailability error:', error);
    throw error;
  }

  return (data || []).map(ticket => ({
    ...ticket,
    available_count: ticket.total_capacity - ticket.sold_count - ticket.held_count,
    is_available: (ticket.total_capacity - ticket.sold_count - ticket.held_count) > 0,
  }));
}

/**
 * Check if specific quantity is available for a ticket type
 */
export async function checkTicketAvailability(
  ticketTypeId: string,
  quantity: number
): Promise<{ available: boolean; remaining: number; price: number }> {
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .rpc('check_event_ticket_availability', {
      p_ticket_type_id: ticketTypeId,
      p_quantity: quantity,
    });

  if (error) {
    console.error('[EVENTS_DATA_ACCESS] checkTicketAvailability error:', error);
    throw error;
  }

  const result = data?.[0] || { available: false, remaining_capacity: 0, current_price: 0 };
  return {
    available: result.available,
    remaining: result.remaining_capacity,
    price: result.current_price,
  };
}

// =============================================================================
// Inventory Operations (with locking for checkout)
// =============================================================================

/**
 * Hold tickets during checkout (prevents overselling)
 */
export async function holdTickets(
  ticketTypeId: string,
  quantity: number
): Promise<boolean> {
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .rpc('hold_event_tickets', {
      p_ticket_type_id: ticketTypeId,
      p_quantity: quantity,
    });

  if (error) {
    console.error('[EVENTS_DATA_ACCESS] holdTickets error:', error);
    throw error;
  }

  return data === true;
}

/**
 * Confirm held tickets (convert to sold on payment success)
 */
export async function confirmTickets(
  ticketTypeId: string,
  quantity: number
): Promise<boolean> {
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .rpc('confirm_event_tickets', {
      p_ticket_type_id: ticketTypeId,
      p_quantity: quantity,
    });

  if (error) {
    console.error('[EVENTS_DATA_ACCESS] confirmTickets error:', error);
    throw error;
  }

  return data === true;
}

/**
 * Release held tickets (on checkout timeout or cancellation)
 */
export async function releaseTickets(
  ticketTypeId: string,
  quantity: number
): Promise<boolean> {
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .rpc('release_event_tickets', {
      p_ticket_type_id: ticketTypeId,
      p_quantity: quantity,
    });

  if (error) {
    console.error('[EVENTS_DATA_ACCESS] releaseTickets error:', error);
    throw error;
  }

  return data === true;
}

// =============================================================================
// Booking Operations
// =============================================================================

/**
 * Create event booking record (called by settlement handler)
 */
export async function createEventBooking(params: {
  bookingId: string;
  userUuid?: string;
  externalUserRef: string;
  eventId: string;
  sessionId: string;
  ticketTypeId: string;
  adultCount: number;
  childCount: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  attendees?: EventAttendee[];
  specialRequests?: string;
  metadata?: Record<string, any>;
}): Promise<EventBooking> {
  const supabase = createServiceSupabaseClient();

  // Generate confirmation code
  const confirmationCode = `EV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Generate QR codes for each ticket
  const totalTickets = params.adultCount + params.childCount;
  const qrCodes: EventQRCode[] = [];

  for (let i = 0; i < totalTickets; i++) {
    qrCodes.push({
      code: `${confirmationCode}-${(i + 1).toString().padStart(3, '0')}-${Date.now().toString(36)}`,
      ticket_number: i + 1,
      attendee_name: params.attendees?.[i]?.name || params.guestName,
    });
  }

  const { data, error } = await supabase
    .from('event_bookings')
    .insert({
      booking_id: params.bookingId,
      user_uuid: params.userUuid || null,
      external_user_ref: params.externalUserRef,
      event_id: params.eventId,
      session_id: params.sessionId,
      ticket_type_id: params.ticketTypeId,
      confirmation_code: confirmationCode,
      adult_count: params.adultCount,
      child_count: params.childCount,
      unit_price: params.unitPrice,
      total_amount: params.totalAmount,
      currency: params.currency,
      guest_name: params.guestName,
      guest_email: params.guestEmail,
      guest_phone: params.guestPhone || null,
      attendees: params.attendees || [],
      qr_codes: qrCodes,
      special_requests: params.specialRequests || null,
      status: 'pending',
      payment_status: 'pending',
      metadata: params.metadata || {},
    })
    .select()
    .single();

  if (error) {
    console.error('[EVENTS_DATA_ACCESS] createEventBooking error:', error);
    throw error;
  }

  return data as EventBooking;
}

/**
 * Get event booking by ID
 */
export async function getEventBooking(id: string): Promise<EventBooking | null> {
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from('event_bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('[EVENTS_DATA_ACCESS] getEventBooking error:', error);
    throw error;
  }

  return data as EventBooking;
}

/**
 * Get event booking by unified booking ID
 */
export async function getEventBookingByBookingId(bookingId: string): Promise<EventBooking | null> {
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from('event_bookings')
    .select('*')
    .eq('booking_id', bookingId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('[EVENTS_DATA_ACCESS] getEventBookingByBookingId error:', error);
    throw error;
  }

  return data as EventBooking;
}

/**
 * Get event booking with full details (event, session, ticket type)
 */
export async function getEventBookingWithDetails(id: string): Promise<EventBookingWithDetails | null> {
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from('event_bookings')
    .select(`
      *,
      event:events(*),
      session:event_sessions(*),
      ticket_type:event_ticket_types(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('[EVENTS_DATA_ACCESS] getEventBookingWithDetails error:', error);
    throw error;
  }

  return data as EventBookingWithDetails;
}

/**
 * Get user's event bookings
 */
export async function getUserEventBookings(userId: string): Promise<EventBookingWithDetails[]> {
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from('event_bookings')
    .select(`
      *,
      event:events(*),
      session:event_sessions(*),
      ticket_type:event_ticket_types(*)
    `)
    .eq('external_user_ref', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[EVENTS_DATA_ACCESS] getUserEventBookings error:', error);
    throw error;
  }

  return (data || []) as EventBookingWithDetails[];
}

/**
 * Update event booking status
 */
export async function updateEventBookingStatus(
  id: string,
  status: EventBooking['status'],
  additionalUpdates?: Partial<EventBooking>
): Promise<EventBooking> {
  const supabase = createServiceSupabaseClient();

  const updates: any = {
    status,
    ...additionalUpdates,
  };

  // Set timestamps based on status
  if (status === 'confirmed') {
    updates.confirmed_at = new Date().toISOString();
    updates.payment_status = 'paid';
  } else if (status === 'checked_in') {
    updates.checked_in_at = new Date().toISOString();
  } else if (status === 'cancelled') {
    updates.cancelled_at = new Date().toISOString();
  } else if (status === 'refunded') {
    updates.refunded_at = new Date().toISOString();
    updates.payment_status = 'refunded';
  }

  const { data, error } = await supabase
    .from('event_bookings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[EVENTS_DATA_ACCESS] updateEventBookingStatus error:', error);
    throw error;
  }

  return data as EventBooking;
}

/**
 * Mark QR code as scanned (for check-in)
 */
export async function scanTicketQRCode(
  bookingId: string,
  qrCode: string
): Promise<{ success: boolean; message: string }> {
  const supabase = createServiceSupabaseClient();

  // Get the booking
  const { data: booking, error: fetchError } = await supabase
    .from('event_bookings')
    .select('qr_codes, status')
    .eq('id', bookingId)
    .single();

  if (fetchError || !booking) {
    return { success: false, message: 'Booking not found' };
  }

  if (booking.status === 'cancelled') {
    return { success: false, message: 'Booking has been cancelled' };
  }

  const qrCodes = booking.qr_codes as EventQRCode[];
  const ticketIndex = qrCodes.findIndex(qr => qr.code === qrCode);

  if (ticketIndex === -1) {
    return { success: false, message: 'Invalid QR code' };
  }

  if (qrCodes[ticketIndex].scanned_at) {
    return { success: false, message: 'Ticket already scanned' };
  }

  // Update the QR code as scanned
  qrCodes[ticketIndex].scanned_at = new Date().toISOString();

  const { error: updateError } = await supabase
    .from('event_bookings')
    .update({
      qr_codes: qrCodes,
      status: 'checked_in',
      checked_in_at: new Date().toISOString(),
    })
    .eq('id', bookingId);

  if (updateError) {
    console.error('[EVENTS_DATA_ACCESS] scanTicketQRCode error:', updateError);
    return { success: false, message: 'Failed to update ticket' };
  }

  return { success: true, message: 'Ticket scanned successfully' };
}
