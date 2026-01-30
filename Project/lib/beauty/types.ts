// Beauty module types and interfaces

export interface BeautyVenue {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  ward: string | null;
  latitude: number | null;
  longitude: number | null;
  location_summary: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  categories: string[] | null;
  price_range: "budget" | "moderate" | "premium" | "luxury" | null;
  average_rating: number;
  review_count: number;
  cover_image_url: string | null;
  images: string[] | null;
  operating_hours: Record<string, { open: string; close: string }> | null;
  is_active: boolean;
  is_verified: boolean;
  is_featured: boolean;
  owner_user_id: string | null;
  amenities: string[] | null;
  tags: string[] | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface BeautyService {
  id: string;
  venue_id: string;
  name: string;
  description: string | null;
  category: string | null;
  duration_minutes: number;
  price: number;
  currency: string;
  image_url: string | null;
  badge: string | null;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface BeautyAppointment {
  id: string;
  booking_id: string | null;
  user_id: string;
  venue_id: string;
  service_id: string | null;
  appointment_code: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  guest_name: string;
  guest_phone: string | null;
  guest_email: string | null;
  special_requests: string | null;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CreateVenueRequest {
  name: string;
  description?: string;
  address?: string;
  city?: string;
  district?: string;
  categories?: string[];
  price_range?: "budget" | "moderate" | "premium" | "luxury";
  phone?: string;
  email?: string;
  website?: string;
  cover_image_url?: string;
  images?: string[];
  amenities?: string[];
  tags?: string[];
}

export interface CreateServiceRequest {
  venue_id: string;
  name: string;
  description?: string;
  category?: string;
  duration_minutes?: number;
  price: number;
  currency?: string;
  image_url?: string;
  badge?: string;
  is_featured?: boolean;
}

export interface CreateAppointmentRequest {
  venue_id: string;
  service_id?: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes?: number;
  guest_name: string;
  guest_phone?: string;
  guest_email?: string;
  special_requests?: string;
}

export interface VenueSearchParams {
  city?: string;
  district?: string;
  categories?: string[];
  price_range?: string;
  min_rating?: number;
  is_featured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface VenueListResponse {
  venues: BeautyVenue[];
  total: number;
  limit: number;
  offset: number;
}
