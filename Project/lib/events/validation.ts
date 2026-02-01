// Events module validation schemas (Zod)
// Server-side validation for API requests

import { z } from 'zod';

// =============================================================================
// Enums
// =============================================================================

export const EventCategorySchema = z.enum([
  'concert',
  'festival',
  'sports',
  'theater',
  'exhibition',
  'conference',
  'workshop',
  'other',
]);

export const EventBookingStatusSchema = z.enum([
  'pending',
  'confirmed',
  'checked_in',
  'completed',
  'cancelled',
  'refunded',
  'no_show',
]);

// =============================================================================
// Search & List Schemas
// =============================================================================

export const EventSearchParamsSchema = z.object({
  city: z.string().optional(),
  category: EventCategorySchema.optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
  is_featured: z.coerce.boolean().optional(),
  search: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sort_by: z.enum(['date', 'price', 'rating', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// =============================================================================
// Availability Check Schemas
// =============================================================================

export const TicketAvailabilityParamsSchema = z.object({
  session_id: z.string().uuid('Invalid session ID'),
  ticket_type_id: z.string().uuid('Invalid ticket type ID').optional(),
});

export const CheckAvailabilitySchema = z.object({
  ticket_type_id: z.string().uuid('Invalid ticket type ID'),
  quantity: z.number().int().min(1).max(20),
});

// =============================================================================
// Booking Schemas
// =============================================================================

export const EventAttendeeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().max(20).optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const CreateEventBookingSchema = z.object({
  event_id: z.string().uuid('Invalid event ID'),
  session_id: z.string().uuid('Invalid session ID'),
  ticket_type_id: z.string().uuid('Invalid ticket type ID'),
  adult_count: z.number().int().min(1, 'At least 1 adult required').max(20),
  child_count: z.number().int().min(0).max(20).default(0),
  guest_name: z.string().min(1, 'Guest name is required').max(100),
  guest_email: z.string().email('Invalid email address'),
  guest_phone: z.string().max(20).optional(),
  attendees: z.array(EventAttendeeSchema).optional(),
  special_requests: z.string().max(500).optional(),
}).refine(
  (data) => data.adult_count + data.child_count <= 20,
  { message: 'Maximum 20 tickets per order', path: ['adult_count'] }
);

// =============================================================================
// Checkout Integration Schema
// =============================================================================

export const EventCheckoutDetailsSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  sessionId: z.string().uuid('Invalid session ID'),
  ticketTypeId: z.string().uuid('Invalid ticket type ID'),
  adultCount: z.number().int().min(1).max(20),
  childCount: z.number().int().min(0).max(20).default(0),
  guestDetails: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email'),
    phone: z.string().max(20).optional(),
  }),
  attendees: z.array(EventAttendeeSchema).optional(),
  specialRequests: z.string().max(500).optional(),
});

// =============================================================================
// QR Code Scan Schema
// =============================================================================

export const ScanQRCodeSchema = z.object({
  booking_id: z.string().uuid('Invalid booking ID'),
  qr_code: z.string().min(1, 'QR code is required'),
});

// =============================================================================
// Type exports from schemas
// =============================================================================

export type EventSearchParamsInput = z.input<typeof EventSearchParamsSchema>;
export type EventSearchParamsOutput = z.output<typeof EventSearchParamsSchema>;
export type CreateEventBookingInput = z.input<typeof CreateEventBookingSchema>;
export type EventCheckoutDetailsInput = z.input<typeof EventCheckoutDetailsSchema>;
