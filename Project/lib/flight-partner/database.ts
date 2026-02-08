/**
 * Database operations for Flight Partner Portal
 * Handles all database queries and mutations
 */

import { supabaseServerClient } from '@/lib/hotel/supabaseServerClient';
import { getDateRange } from './calculations';

// =====================================================
// PARTNER QUERIES
// =====================================================

/**
 * Get flight partner by ID
 */
export async function getFlightPartner(partnerId: string) {
  const { data, error } = await supabaseServerClient
    .from('flight_partners')
    .select('*')
    .eq('id', partnerId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get partner flights
 */
export async function getPartnerFlights(partnerId: string) {
  const { data, error } = await supabaseServerClient
    .from('flights')
    .select(`
      id,
      flight_number,
      airline_code,
      airline_name,
      origin,
      origin_name,
      destination,
      destination_name,
      departure_at,
      arrival_at,
      duration_minutes,
      aircraft,
      seat_classes,
      amenities,
      baggage_allowance,
      base_price,
      currency,
      status,
      metadata,
      created_at,
      updated_at
    `)
    .eq('airline_code', partnerId)
    .order('departure_at', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Get single flight by ID (verify partner ownership)
 */
export async function getPartnerFlight(partnerId: string, flightId: string) {
  const { data, error } = await supabaseServerClient
    .from('flights')
    .select('*')
    .eq('id', flightId)
    .eq('airline_code', partnerId)
    .single();

  if (error) throw error;
  return data;
}

// =====================================================
// FLIGHT OPERATIONS
// =====================================================

/**
 * Create a new flight
 */
export async function createFlight(partnerId: string, flightData: any) {
  const { data, error } = await supabaseServerClient
    .from('flights')
    .insert({
      ...flightData,
      airline_code: partnerId,
      metadata: {
        ...flightData.metadata,
        created_via: 'partner_portal',
      },
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update flight
 */
export async function updateFlight(
  partnerId: string,
  flightId: string,
  updates: any
) {
  // Verify ownership
  await getPartnerFlight(partnerId, flightId);

  const { data, error } = await supabaseServerClient
    .from('flights')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', flightId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete flight (soft delete - set status to cancelled)
 */
export async function deleteFlight(partnerId: string, flightId: string) {
  // Verify ownership
  await getPartnerFlight(partnerId, flightId);

  const { error } = await supabaseServerClient
    .from('flights')
    .update({ status: 'cancelled' })
    .eq('id', flightId);

  if (error) throw error;
}

// =====================================================
// ROUTE OPERATIONS
// =====================================================

/**
 * Get partner routes
 */
export async function getPartnerRoutes(partnerId: string) {
  const { data, error } = await supabaseServerClient
    .from('flight_routes')
    .select('*')
    .eq('airline_code', partnerId)
    .order('origin', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Get single route by ID
 */
export async function getRoute(routeId: string) {
  const { data, error } = await supabaseServerClient
    .from('flight_routes')
    .select('*')
    .eq('id', routeId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create route
 */
export async function createRoute(partnerId: string, routeData: any) {
  const { data, error } = await supabaseServerClient
    .from('flight_routes')
    .insert({
      ...routeData,
      airline_code: partnerId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update route
 */
export async function updateRoute(
  partnerId: string,
  routeId: string,
  updates: any
) {
  const { data, error } = await supabaseServerClient
    .from('flight_routes')
    .update(updates)
    .eq('id', routeId)
    .eq('airline_code', partnerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete route
 */
export async function deleteRoute(partnerId: string, routeId: string) {
  const { error } = await supabaseServerClient
    .from('flight_routes')
    .delete()
    .eq('id', routeId)
    .eq('airline_code', partnerId);

  if (error) throw error;
}

// =====================================================
// PRICING OPERATIONS
// =====================================================

/**
 * Get pricing rules for partner
 */
export async function getPricingRules(partnerId: string, routeId?: string) {
  let query = supabaseServerClient
    .from('flight_pricing_rules')
    .select('*')
    .eq('airline_code', partnerId)
    .order('priority', { ascending: false });

  if (routeId) {
    query = query.eq('route_id', routeId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Create pricing rule
 */
export async function createPricingRule(partnerId: string, ruleData: any) {
  const { data, error } = await supabaseServerClient
    .from('flight_pricing_rules')
    .insert({
      ...ruleData,
      airline_code: partnerId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update pricing rule
 */
export async function updatePricingRule(
  partnerId: string,
  ruleId: string,
  updates: any
) {
  const { data, error } = await supabaseServerClient
    .from('flight_pricing_rules')
    .update(updates)
    .eq('id', ruleId)
    .eq('airline_code', partnerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete pricing rule
 */
export async function deletePricingRule(partnerId: string, ruleId: string) {
  const { error } = await supabaseServerClient
    .from('flight_pricing_rules')
    .delete()
    .eq('id', ruleId)
    .eq('airline_code', partnerId);

  if (error) throw error;
}

// =====================================================
// BOOKING OPERATIONS
// =====================================================

/**
 * Get bookings for partner's flights
 */
export async function getPartnerBookings(
  partnerId: string,
  filters?: {
    flight_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }
) {
  let query = supabaseServerClient
    .from('flight_bookings')
    .select(
      `
      *,
      flight:flights!inner (
        id,
        flight_number,
        airline_code,
        origin,
        origin_name,
        destination,
        destination_name,
        departure_at,
        arrival_at
      ),
      passenger:users (
        id,
        full_name,
        email
      )
    `
    )
    .eq('flight.airline_code', partnerId)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters?.flight_id) {
    query = query.eq('flight_id', filters.flight_id);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.start_date) {
    query = query.gte('flight.departure_at', filters.start_date);
  }

  if (filters?.end_date) {
    query = query.lte('flight.departure_at', filters.end_date);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(
      filters.offset,
      filters.offset + (filters.limit || 50) - 1
    );
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Get single booking
 */
export async function getBooking(bookingId: string) {
  const { data, error } = await supabaseServerClient
    .from('flight_bookings')
    .select(
      `
      *,
      flight:flights (
        id,
        flight_number,
        airline_code,
        origin,
        origin_name,
        destination,
        destination_name,
        departure_at,
        arrival_at,
        seat_classes
      ),
      passenger:users (
        id,
        full_name,
        email,
        phone
      )
    `
    )
    .eq('id', bookingId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  bookingId: string,
  status: string,
  notes?: string
) {
  const { data, error } = await supabaseServerClient
    .from('flight_bookings')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;

  // Log status change
  await supabaseServerClient.from('booking_events').insert({
    booking_id: bookingId,
    event_type: `status_changed_to_${status}`,
    metadata: { notes, previous_status: data.status },
  });

  return data;
}

// =====================================================
// ANALYTICS OPERATIONS
// =====================================================

/**
 * Get dashboard metrics
 */
export async function getDashboardMetrics(
  partnerId: string,
  dateRange?: { start: Date; end: Date }
) {
  const range = dateRange || getDateRange('last_30_days');

  // Get bookings in range
  const { data: bookings, error: bookingsError } = await supabaseServerClient
    .from('flight_bookings')
    .select(
      `
      *,
      flight:flights!inner (airline_code)
    `
    )
    .eq('flight.airline_code', partnerId)
    .gte('created_at', range.start.toISOString())
    .lte('created_at', range.end.toISOString());

  if (bookingsError) throw bookingsError;

  // Get flights count
  const { count: flightsCount, error: flightsError } = await supabaseServerClient
    .from('flights')
    .select('*', { count: 'exact', head: true })
    .eq('airline_code', partnerId);

  if (flightsError) throw flightsError;

  // Calculate metrics
  const totalBookings = bookings?.length || 0;
  const totalRevenue = bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
  const confirmedBookings = bookings?.filter((b) => b.status === 'confirmed').length || 0;
  const cancelledBookings = bookings?.filter((b) => b.status === 'cancelled').length || 0;

  return {
    flights: {
      total: flightsCount || 0,
      active: flightsCount || 0, // TODO: Filter by status
    },
    bookings: {
      total: totalBookings,
      confirmed: confirmedBookings,
      cancelled: cancelledBookings,
      pending: totalBookings - confirmedBookings - cancelledBookings,
    },
    revenue: {
      total: totalRevenue,
      average: totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0,
    },
    period: {
      start: range.start.toISOString(),
      end: range.end.toISOString(),
    },
  };
}

/**
 * Get revenue analytics
 */
export async function getRevenueAnalytics(
  partnerId: string,
  startDate: string,
  endDate: string,
  groupBy: 'day' | 'week' | 'month' = 'day'
) {
  const { data, error } = await supabaseServerClient
    .from('flight_partner_analytics')
    .select('*')
    .eq('partner_id', partnerId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Get capacity analytics
 */
export async function getCapacityAnalytics(
  partnerId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabaseServerClient
    .from('flights')
    .select('*')
    .eq('airline_code', partnerId)
    .gte('departure_at', startDate)
    .lte('departure_at', endDate)
    .order('departure_at', { ascending: true });

  if (error) throw error;

  // TODO: Calculate load factors from seat_classes jsonb
  // Currently returning raw flight data
  return data;
}

// =====================================================
// PAYOUT OPERATIONS
// =====================================================

/**
 * Get payouts for partner
 */
export async function getPartnerPayouts(
  partnerId: string,
  filters?: {
    status?: string;
    start_date?: string;
    end_date?: string;
  }
) {
  let query = supabaseServerClient
    .from('flight_partner_payouts')
    .select('*')
    .eq('partner_id', partnerId)
    .order('period_start', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.start_date) {
    query = query.gte('period_start', filters.start_date);
  }

  if (filters?.end_date) {
    query = query.lte('period_end', filters.end_date);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

/**
 * Create payout
 */
export async function createPayout(partnerId: string, payoutData: any) {
  const { data, error } = await supabaseServerClient
    .from('flight_partner_payouts')
    .insert({
      ...payoutData,
      partner_id: partnerId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update payout status
 */
export async function updatePayoutStatus(
  payoutId: string,
  status: string,
  updates?: any
) {
  const { data, error } = await supabaseServerClient
    .from('flight_partner_payouts')
    .update({
      status,
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payoutId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
