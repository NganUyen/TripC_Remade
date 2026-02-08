/**
 * Validation Schemas for Hotel Partner Portal
 * Using Zod for runtime type validation
 */

import { z } from 'zod';

// =====================================================
// HOTEL VALIDATION SCHEMAS
// =====================================================

export const addressSchema = z.object({
  line1: z.string().min(3, 'Address line 1 must be at least 3 characters'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().optional(),
  country: z.string().length(2, 'Country must be 2-letter ISO code'),
  postal_code: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const contactSchema = z.object({
  phone: z.string().min(8, 'Phone number must be at least 8 characters'),
  email: z.string().email('Invalid email address'),
  website: z.string().url('Invalid website URL').optional(),
});

export const policiesSchema = z.object({
  check_in_time: z.string().regex(/^\d{2}:\d{2}$/, 'Check-in time must be in HH:MM format'),
  check_out_time: z.string().regex(/^\d{2}:\d{2}$/, 'Check-out time must be in HH:MM format'),
  cancellation_policy: z.enum(['flexible', 'moderate', 'strict', 'non_refundable']),
  child_policy: z.string().optional(),
  pet_policy: z.string().optional(),
  smoking_allowed: z.boolean().default(false),
});

export const createHotelSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200, 'Name must be at most 200 characters'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').min(3).max(100),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000, 'Description must be at most 2000 characters').optional(),
  address: addressSchema,
  star_rating: z.number().int().min(1).max(5).nullable(),
  amenities: z.array(z.string()).default([]),
  features: z.record(z.any()).optional(),
  policies: policiesSchema,
  contact: contactSchema,
  metadata: z.record(z.any()).optional(),
});

export const updateHotelSchema = createHotelSchema.partial();

// =====================================================
// ROOM VALIDATION SCHEMAS
// =====================================================

export const bedConfigSchema = z.object({
  type: z.enum(['single', 'double', 'queen', 'king', 'twin', 'sofa_bed', 'bunk_bed']),
  count: z.number().int().min(1).max(10),
});

export const roomAmenitiesSchema = z.object({
  wifi: z.boolean().default(false),
  tv: z.boolean().default(false),
  air_conditioning: z.boolean().default(false),
  mini_bar: z.boolean().default(false),
  safe: z.boolean().default(false),
  balcony: z.boolean().default(false),
  bath_tub: z.boolean().default(false),
  shower: z.boolean().default(false),
  coffee_maker: z.boolean().default(false),
  hairdryer: z.boolean().default(false),
  iron: z.boolean().default(false),
  phone: z.boolean().default(false),
  work_desk: z.boolean().default(false),
});

const baseRoomSchema = z.object({
  hotel_id: z.string().uuid('Invalid hotel ID'),
  code: z.string().min(1, 'Room code is required').max(20, 'Room code must be at most 20 characters'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be at most 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be at most 1000 characters').optional(),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').max(10, 'Capacity must be at most 10'),
  max_adults: z.number().int().min(1, 'Max adults must be at least 1').max(8, 'Max adults must be at most 8'),
  max_children: z.number().int().min(0, 'Max children cannot be negative').max(4, 'Max children must be at most 4'),
  bed_configurations: z.array(bedConfigSchema).min(1, 'At least one bed configuration is required'),
  size_sqm: z.number().min(10, 'Size must be at least 10 sqm').max(500, 'Size must be at most 500 sqm').optional(),
  floor: z.number().int().optional(),
  view_type: z.enum(['city', 'ocean', 'mountain', 'garden', 'pool', 'street', 'courtyard']).optional(),
  amenities: roomAmenitiesSchema.optional(),
  images: z.array(z.string().url()).default([]),
  total_rooms: z.number().int().min(1, 'Must have at least 1 room').max(100, 'Cannot exceed 100 rooms'),
});

export const createRoomSchema = baseRoomSchema.refine(
  (data) => data.capacity === data.max_adults + data.max_children,
  {
    message: 'Capacity must equal max_adults + max_children',
    path: ['capacity'],
  }
);

export const updateRoomSchema = baseRoomSchema.partial().omit({ hotel_id: true });

// =====================================================
// RATE VALIDATION SCHEMAS
// =====================================================

export const createRateSchema = z.object({
  room_id: z.string().uuid('Invalid room ID'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  price_cents: z.number().int().min(1000, 'Price must be at least $10 (1000 cents)').max(100000000, 'Price cannot exceed $1,000,000'),
  available_rooms: z.number().int().min(0, 'Available rooms cannot be negative').max(100, 'Available rooms cannot exceed 100'),
  min_nights: z.number().int().min(1, 'Minimum nights must be at least 1').max(30, 'Minimum nights cannot exceed 30').optional(),
  max_nights: z.number().int().min(1, 'Maximum nights must be at least 1').max(90, 'Maximum nights cannot exceed 90').optional(),
  cancellation_policy: z.enum(['flexible', 'moderate', 'strict', 'non_refundable']),
  refundable: z.boolean().default(true),
  breakfast_included: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
}).refine(
  (data) => {
    if (data.max_nights && data.min_nights) {
      return data.max_nights >= data.min_nights;
    }
    return true;
  },
  {
    message: 'Maximum nights must be greater than or equal to minimum nights',
    path: ['max_nights'],
  }
).refine(
  (data) => data.cancellation_policy !== 'non_refundable' || data.refundable === false,
  {
    message: 'Non-refundable policy must have refundable set to false',
    path: ['refundable'],
  }
);

export const bulkUpdateRatesSchema = z.object({
  room_id: z.string().uuid('Invalid room ID'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  price_cents: z.number().int().min(1000).max(100000000),
  available_rooms: z.number().int().min(0).max(100).optional(),
  min_nights: z.number().int().min(1).max(30).optional(),
  max_nights: z.number().int().min(1).max(90).optional(),
  cancellation_policy: z.enum(['flexible', 'moderate', 'strict', 'non_refundable']).optional(),
  refundable: z.boolean().optional(),
  breakfast_included: z.boolean().optional(),
}).refine(
  (data) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    return end >= start;
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['end_date'],
  }
);

// =====================================================
// BOOKING VALIDATION SCHEMAS
// =====================================================

export const guestDetailsSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number must be at least 8 characters'),
  special_requests: z.string().optional(),
});

export const createBookingSchema = z.object({
  hotel_id: z.string().uuid('Invalid hotel ID'),
  room_id: z.string().uuid('Invalid room ID'),
  check_in_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-in date must be in YYYY-MM-DD format'),
  check_out_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-out date must be in YYYY-MM-DD format'),
  rooms_count: z.number().int().min(1, 'Must book at least 1 room').max(10, 'Cannot book more than 10 rooms'),
  adults_count: z.number().int().min(1, 'Must have at least 1 adult').max(16, 'Too many adults'),
  children_count: z.number().int().min(0, 'Children count cannot be negative').max(8, 'Too many children'),
  guest_details: guestDetailsSchema,
  voucher_code: z.string().optional(),
  tcent_to_use: z.number().int().min(0).optional(),
  has_working_pass: z.boolean().default(false),
}).refine(
  (data) => {
    const checkIn = new Date(data.check_in_date);
    const checkOut = new Date(data.check_out_date);
    return checkOut > checkIn;
  },
  {
    message: 'Check-out date must be after check-in date',
    path: ['check_out_date'],
  }
).refine(
  (data) => {
    const checkIn = new Date(data.check_in_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkIn >= today;
  },
  {
    message: 'Check-in date cannot be in the past',
    path: ['check_in_date'],
  }
);

export const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show']),
  notes: z.string().optional(),
});

export const cancelBookingSchema = z.object({
  cancellation_reason: z.string().min(10, 'Cancellation reason must be at least 10 characters').max(500, 'Cancellation reason must be at most 500 characters'),
  refund_method: z.enum(['original_payment', 'tcent', 'bank_transfer']).optional(),
});

// =====================================================
// ANALYTICS QUERY SCHEMAS
// =====================================================

export const analyticsQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hotel_id: z.string().uuid().optional(),
  metrics: z.array(z.enum([
    'bookings',
    'revenue',
    'occupancy',
    'avg_booking_value',
    'cancellations',
    'reviews',
  ])).optional(),
}).refine(
  (data) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    return end >= start;
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['end_date'],
  }
).refine(
  (data) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 365;
  },
  {
    message: 'Date range cannot exceed 365 days',
    path: ['end_date'],
  }
);

// =====================================================
// REVIEW RESPONSE SCHEMA
// =====================================================

export const reviewResponseSchema = z.object({
  response_text: z.string().min(20, 'Response must be at least 20 characters').max(1000, 'Response must be at most 1000 characters'),
});

// =====================================================
// PARTNER USER SCHEMAS
// =====================================================

export const createPartnerUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(255),
  phone: z.string().min(8).optional(),
  role: z.enum(['owner', 'admin', 'manager', 'staff']),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

export const updatePartnerUserSchema = z.object({
  full_name: z.string().min(2).max(255).optional(),
  phone: z.string().min(8).optional(),
  role: z.enum(['owner', 'admin', 'manager', 'staff']).optional(),
  is_active: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters').max(100),
  confirm_password: z.string().min(1, 'Please confirm your new password'),
}).refine(
  (data) => data.new_password === data.confirm_password,
  {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  }
);

// =====================================================
// TYPE EXPORTS
// Export inferred TypeScript types from schemas
// =====================================================

export type CreateHotel = z.infer<typeof createHotelSchema>;
export type UpdateHotel = z.infer<typeof updateHotelSchema>;
export type CreateRoom = z.infer<typeof createRoomSchema>;
export type UpdateRoom = z.infer<typeof updateRoomSchema>;
export type CreateRate = z.infer<typeof createRateSchema>;
export type BulkUpdateRates = z.infer<typeof bulkUpdateRatesSchema>;
export type CreateBooking = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatus = z.infer<typeof updateBookingStatusSchema>;
export type CancelBooking = z.infer<typeof cancelBookingSchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type ReviewResponse = z.infer<typeof reviewResponseSchema>;
export type CreatePartnerUser = z.infer<typeof createPartnerUserSchema>;
export type UpdatePartnerUser = z.infer<typeof updatePartnerUserSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
