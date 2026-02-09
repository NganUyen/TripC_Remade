/**
 * Validation schemas for Flight Partner Portal
 * Uses Zod for runtime type checking and validation
 */

import { z } from "zod";

// =====================================================
// FLIGHT SCHEMAS
// =====================================================

/**
 * Create flight schema
 */
export const createFlightSchema = z
  .object({
    flight_number: z.string().min(1, "Flight number is required").max(20),
    airline_code: z.string().length(2, "Airline code must be 2 characters"),
    origin: z.string().length(3, "Airport code must be 3 characters"),
    destination: z.string().length(3, "Airport code must be 3 characters"),
    origin_name: z.string().optional(),
    destination_name: z.string().optional(),
    departure_at: z.string().datetime("Invalid departure time format"),
    arrival_at: z.string().datetime("Invalid arrival time format"),
    aircraft: z.string().min(1, "Aircraft type is required"),
    base_price: z.number().positive("Base price must be positive"),
    currency: z.string().default("USD"),
    seat_classes: z.array(z.any()).optional(),
    amenities: z.array(z.string()).optional(),
    baggage_allowance: z.record(z.any()).optional(),
    status: z
      .enum(["scheduled", "delayed", "cancelled", "completed"])
      .default("scheduled"),
    metadata: z.record(z.any()).optional(),
  })
  .refine((data) => new Date(data.arrival_at) > new Date(data.departure_at), {
    message: "Arrival time must be after departure time",
    path: ["arrival_at"],
  });

/**
 * Update flight schema (all fields optional)
 */
export const updateFlightSchema = z.object({
  flight_number: z.string().min(1).max(20).optional(),
  origin: z.string().length(3).optional(),
  destination: z.string().length(3).optional(),
  origin_name: z.string().optional(),
  destination_name: z.string().optional(),
  departure_at: z.string().datetime().optional(),
  arrival_at: z.string().datetime().optional(),
  aircraft: z.string().min(1).optional(),
  base_price: z.number().positive().optional(),
  currency: z.string().optional(),
  seat_classes: z.array(z.any()).optional(),
  amenities: z.array(z.string()).optional(),
  baggage_allowance: z.record(z.any()).optional(),
  status: z.enum(["scheduled", "delayed", "cancelled", "completed"]).optional(),
  metadata: z.record(z.any()).optional(),
});

// =====================================================
// ROUTE SCHEMAS
// =====================================================

/**
 * Create route schema
 */
export const createRouteSchema = z
  .object({
    origin: z.string().length(3, "Origin airport code must be 3 characters"),
    destination: z
      .string()
      .length(3, "Destination airport code must be 3 characters"),
    distance_km: z.number().positive("Distance must be positive"),
    duration_minutes: z.number().int().positive("Duration must be positive"),
    frequency: z.enum(["daily", "weekly", "seasonal"]).default("weekly"),
    is_active: z.boolean().default(true),
    metadata: z.record(z.any()).optional(),
  })
  .refine((data) => data.origin !== data.destination, {
    message: "Origin and destination must be different",
    path: ["destination"],
  });

/**
 * Update route schema
 */
const baseRouteSchema = z.object({
  origin: z.string().length(3, "Origin airport code must be 3 characters"),
  destination: z
    .string()
    .length(3, "Destination airport code must be 3 characters"),
  distance_km: z.number().positive("Distance must be positive"),
  duration_minutes: z.number().int().positive("Duration must be positive"),
  frequency: z.enum(["daily", "weekly", "seasonal"]).default("weekly"),
  is_active: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
});

export const updateRouteSchema = baseRouteSchema.partial();

// =====================================================
// PRICING SCHEMAS
// =====================================================

/**
 * Create pricing rule schema
 */
export const createPricingRuleSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  rule_type: z.enum([
    "base",
    "seasonal",
    "demand",
    "advance_booking",
    "day_of_week",
  ]),
  route_id: z.string().uuid("Invalid route ID").optional(),
  flight_class: z
    .enum(["economy", "premium_economy", "business", "first"])
    .optional(),

  // Price adjustments
  adjustment_type: z.enum(["percentage", "fixed_amount"]),
  adjustment_value: z.number(),

  // Conditions
  conditions: z
    .object({
      start_date: z.string().date().optional(),
      end_date: z.string().date().optional(),
      days_before_departure_min: z.number().int().nonnegative().optional(),
      days_before_departure_max: z.number().int().nonnegative().optional(),
      days_of_week: z.array(z.number().int().min(0).max(6)).optional(),
      min_seats_available: z.number().int().nonnegative().optional(),
      max_seats_available: z.number().int().nonnegative().optional(),
    })
    .optional(),

  priority: z.number().int().nonnegative().default(0),
  is_active: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
});

/**
 * Update pricing rule schema
 */
export const updatePricingRuleSchema = createPricingRuleSchema.partial();

// =====================================================
// BOOKING SCHEMAS
// =====================================================

/**
 * Update booking status schema
 */
export const updateBookingStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "checked_in",
    "boarded",
    "completed",
    "cancelled",
    "no_show",
  ]),
  notes: z.string().optional(),
});

/**
 * Booking filters schema
 */
export const bookingFiltersSchema = z.object({
  flight_id: z.string().uuid().optional(),
  status: z.string().optional(),
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  passenger_name: z.string().optional(),
  booking_reference: z.string().optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
});

// =====================================================
// ANALYTICS SCHEMAS
// =====================================================

/**
 * Analytics date range schema
 */
export const analyticsDateRangeSchema = z
  .object({
    start_date: z.string().date("Invalid start date"),
    end_date: z.string().date("Invalid end date"),
    flight_id: z.string().uuid("Invalid flight ID").optional(),
    route_id: z.string().uuid("Invalid route ID").optional(),
    granularity: z.enum(["daily", "weekly", "monthly"]).default("daily"),
  })
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: "End date must be after or equal to start date",
    path: ["end_date"],
  });

/**
 * Revenue report filters schema
 */
export const revenueReportFiltersSchema = z.object({
  start_date: z.string().date(),
  end_date: z.string().date(),
  flight_id: z.string().uuid().optional(),
  booking_class: z
    .enum(["economy", "premium_economy", "business", "first"])
    .optional(),
  group_by: z.enum(["flight", "route", "class", "date"]).default("date"),
});

/**
 * Capacity report filters schema
 */
export const capacityReportFiltersSchema = z.object({
  start_date: z.string().date(),
  end_date: z.string().date(),
  flight_id: z.string().uuid().optional(),
  min_load_factor: z.number().min(0).max(100).optional(),
  max_load_factor: z.number().min(0).max(100).optional(),
});

// =====================================================
// PAYOUT SCHEMAS
// =====================================================

/**
 * Create payout schema
 */
export const createPayoutSchema = z
  .object({
    period_start: z.string().date("Invalid start date"),
    period_end: z.string().date("Invalid end date"),
    gross_amount_cents: z.number().int().nonnegative(),
    commission_cents: z.number().int().nonnegative(),
    net_amount_cents: z.number().int().nonnegative(),
    adjustment_cents: z.number().int().default(0),
    adjustment_reason: z.string().optional(),
    payment_method: z.string().optional(),
    notes: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  })
  .refine((data) => new Date(data.period_end) >= new Date(data.period_start), {
    message: "Period end must be after or equal to period start",
    path: ["period_end"],
  });

/**
 * Update payout status schema
 */
export const updatePayoutStatusSchema = z.object({
  status: z.enum(["pending", "processing", "paid", "failed", "disputed"]),
  payment_reference: z.string().optional(),
  paid_at: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// =====================================================
// TYPE EXPORTS
// Export inferred types from schemas
// =====================================================

export type CreateFlight = z.infer<typeof createFlightSchema>;
export type UpdateFlight = z.infer<typeof updateFlightSchema>;
export type CreateRoute = z.infer<typeof createRouteSchema>;
export type UpdateRoute = z.infer<typeof updateRouteSchema>;
export type CreatePricingRule = z.infer<typeof createPricingRuleSchema>;
export type UpdatePricingRule = z.infer<typeof updatePricingRuleSchema>;
export type UpdateBookingStatus = z.infer<typeof updateBookingStatusSchema>;
export type BookingFilters = z.infer<typeof bookingFiltersSchema>;
export type AnalyticsDateRange = z.infer<typeof analyticsDateRangeSchema>;
export type RevenueReportFilters = z.infer<typeof revenueReportFiltersSchema>;
export type CapacityReportFilters = z.infer<typeof capacityReportFiltersSchema>;
export type CreatePayout = z.infer<typeof createPayoutSchema>;
export type UpdatePayoutStatus = z.infer<typeof updatePayoutStatusSchema>;
