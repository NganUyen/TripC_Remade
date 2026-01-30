// Dining module types and interfaces
// Central type definitions for the Dining module

export interface DiningVenue {
  id: string
  name: string
  slug: string | null
  description: string | null
  address: string | null
  city: string | null
  district: string | null
  ward: string | null
  latitude: number | null
  longitude: number | null
  location_summary: string | null
  phone: string | null
  email: string | null
  website: string | null
  cuisine_type: string[] | null
  price_range: 'budget' | 'moderate' | 'upscale' | 'fine_dining' | null
  capacity: number
  operating_hours: Record<string, { open: string; close: string }> | null
  is_active: boolean
  is_verified: boolean
  is_featured: boolean
  average_rating: number
  review_count: number
  cover_image_url: string | null
  images: string[] | null
  owner_user_id: string | null
  amenities: string[] | null
  tags: string[] | null
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface DiningMenu {
  id: string
  venue_id: string
  name: string
  description: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DiningMenuItem {
  id: string
  menu_id: string
  venue_id: string
  name: string
  description: string | null
  price: number
  original_price: number | null
  currency: string
  category: string | null
  dietary_tags: string[] | null
  allergens: string[] | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  is_popular: boolean
  display_order: number
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface DiningTable {
  id: string
  venue_id: string
  table_number: string
  name: string | null
  min_capacity: number
  max_capacity: number
  section: string | null
  floor: number
  features: string[] | null
  is_active: boolean
  is_reservable: boolean
  premium_charge: number
  created_at: string
  updated_at: string
}

export interface DiningReservation {
  id: string
  booking_id: string | null
  user_id: string
  venue_id: string
  table_id: string | null
  reservation_code: string
  reservation_date: string
  reservation_time: string
  duration_minutes: number
  guest_count: number
  guest_name: string
  guest_phone: string | null
  guest_email: string | null
  special_requests: string | null
  occasion: string | null
  dietary_restrictions: string[] | null
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show'
  confirmed_at: string | null
  confirmed_by: string | null
  seated_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  deposit_amount: number
  deposit_paid: boolean
  internal_notes: string | null
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface DiningTimeSlot {
  id: string
  venue_id: string
  day_of_week: number
  start_time: string
  end_time: string
  slot_duration_minutes: number
  max_reservations_per_slot: number
  max_guests_per_slot: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DiningBlockedDate {
  id: string
  venue_id: string
  start_date: string
  end_date: string
  reason: string | null
  start_time: string | null
  end_time: string | null
  created_at: string
}

// Request/Response types for API
export interface CreateVenueRequest {
  name: string
  description?: string
  address?: string
  city?: string
  district?: string
  ward?: string
  latitude?: number
  longitude?: number
  phone?: string
  email?: string
  website?: string
  cuisine_type?: string[]
  price_range?: 'budget' | 'moderate' | 'upscale' | 'fine_dining'
  operating_hours?: Record<string, { open: string; close: string }>
  cover_image_url?: string
  images?: string[]
  amenities?: string[]
  tags?: string[]
}

export interface CreateReservationRequest {
  venue_id: string
  reservation_date: string
  reservation_time: string
  guest_count: number
  guest_name: string
  guest_phone?: string
  guest_email?: string
  special_requests?: string
  occasion?: string
  dietary_restrictions?: string[]
  table_id?: string
  duration_minutes?: number
}

export interface VenueSearchParams {
  city?: string
  district?: string
  cuisine_type?: string[]
  price_range?: string
  min_rating?: number
  is_featured?: boolean
  search?: string
  limit?: number
  offset?: number
}

export interface VenueListResponse {
  venues: DiningVenue[]
  total: number
  limit: number
  offset: number
}
