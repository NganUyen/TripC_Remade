// Events module types and interfaces
// Central type definitions for the Events module

// =============================================================================
// Database Entity Types
// =============================================================================

export type EventCategory = 
  | 'concert' 
  | 'festival' 
  | 'sports' 
  | 'theater' 
  | 'exhibition' 
  | 'conference' 
  | 'workshop' 
  | 'other';

export type EventSessionStatus = 
  | 'scheduled' 
  | 'on_sale' 
  | 'sold_out' 
  | 'cancelled' 
  | 'completed';

export type EventBookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'checked_in' 
  | 'completed' 
  | 'cancelled' 
  | 'refunded' 
  | 'no_show';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'refunded' 
  | 'partially_refunded' 
  | 'failed';

export interface Event {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  short_description: string | null;
  
  // Location
  venue_name: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  location_summary: string | null;
  
  // Categorization
  category: EventCategory | null;
  tags: string[];
  
  // Media
  cover_image_url: string | null;
  images: string[];
  
  // Ratings
  average_rating: number;
  review_count: number;
  
  // Organizer
  organizer_name: string | null;
  organizer_logo_url: string | null;
  organizer_contact: string | null;
  
  // Event Details
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  terms_and_conditions: string | null;
  important_info: string | null;
  age_restriction: string | null;
  dress_code: string | null;
  
  // Display
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface EventSession {
  id: string;
  event_id: string;
  
  // Timing
  session_date: string;
  start_time: string;
  end_time: string | null;
  timezone: string;
  
  // Info
  name: string | null;
  description: string | null;
  doors_open_time: string | null;
  
  // Status
  status: EventSessionStatus;
  total_capacity: number | null;
  venue_override: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface EventTicketType {
  id: string;
  event_id: string;
  session_id: string;
  
  // Info
  name: string;
  description: string | null;
  
  // Pricing
  price: number;
  original_price: number | null;
  currency: string;
  
  // Capacity
  total_capacity: number;
  sold_count: number;
  held_count: number;
  
  // Constraints
  min_per_order: number;
  max_per_order: number;
  
  // Features
  perks: string[];
  
  // Sale Window
  sale_start_at: string | null;
  sale_end_at: string | null;
  
  // Display
  is_active: boolean;
  display_order: number;
  badge: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface EventAttendee {
  name: string;
  email?: string;
  phone?: string;
  dob?: string;
}

export interface EventQRCode {
  code: string;
  ticket_number: number;
  attendee_name: string;
  scanned_at?: string;
}

export interface EventBooking {
  id: string;
  booking_id: string | null;
  user_uuid: string | null;
  external_user_ref: string | null;
  
  // Event refs
  event_id: string;
  session_id: string;
  ticket_type_id: string;
  
  // Booking details
  confirmation_code: string;
  
  // Quantities
  adult_count: number;
  child_count: number;
  total_tickets: number;
  
  // Pricing
  unit_price: number;
  total_amount: number;
  currency: string;
  discount_amount: number;
  tcent_used: number;
  tcent_earned: number;
  
  // Guest Info
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  
  // Attendees & Tickets
  attendees: EventAttendee[];
  qr_codes: EventQRCode[];
  
  // Status
  status: EventBookingStatus;
  payment_status: PaymentStatus;
  special_requests: string | null;
  
  // Timestamps
  confirmed_at: string | null;
  checked_in_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  refund_amount: number | null;
  refunded_at: string | null;
  
  // Metadata
  metadata: Record<string, any>;
  booking_source: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Computed/Joined Types
// =============================================================================

export interface EventWithSessions extends Event {
  sessions: EventSessionWithTickets[];
}

export interface EventSessionWithTickets extends EventSession {
  ticket_types: EventTicketType[];
}

export interface EventTicketTypeWithAvailability extends EventTicketType {
  available_count: number;
  is_available: boolean;
}

export interface EventBookingWithDetails extends EventBooking {
  event: Event;
  session: EventSession;
  ticket_type: EventTicketType;
}

// =============================================================================
// API Request/Response Types
// =============================================================================

export interface EventSearchParams {
  city?: string;
  category?: EventCategory;
  date_from?: string;
  date_to?: string;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  sort_by?: 'date' | 'price' | 'rating' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface EventListResponse {
  events: EventWithSessions[];
  total: number;
  limit: number;
  offset: number;
}

export interface EventDetailResponse {
  event: EventWithSessions;
}

export interface TicketAvailabilityParams {
  session_id: string;
  ticket_type_id?: string;
}

export interface TicketAvailabilityResponse {
  session_id: string;
  ticket_types: EventTicketTypeWithAvailability[];
}

export interface CreateEventBookingRequest {
  event_id: string;
  session_id: string;
  ticket_type_id: string;
  adult_count: number;
  child_count?: number;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  attendees?: EventAttendee[];
  special_requests?: string;
}

// =============================================================================
// Checkout Integration Types
// =============================================================================

export interface EventCheckoutDetails {
  eventId: string;
  sessionId: string;
  ticketTypeId: string;
  adultCount: number;
  childCount: number;
  guestDetails: {
    name: string;
    email: string;
    phone?: string;
  };
  attendees?: EventAttendee[];
  specialRequests?: string;
}

// =============================================================================
// Price Calculation Types
// =============================================================================

export interface EventPriceBreakdown {
  ticketPrice: number;
  quantity: number;
  subtotal: number;
  discount: number;
  serviceFee: number;
  total: number;
  currency: string;
}
