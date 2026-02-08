/**
 * Database operations for Hotel Partner Portal
 * Handles all database queries and mutations
 */

import { supabaseServerClient } from '@/lib/hotel/supabaseServerClient';
import { getDateRange } from './calculations';

// =====================================================
// PARTNER QUERIES
// =====================================================

/**
 * Get partner by ID
 */
export async function getPartner(partnerId: string) {
  const { data, error } = await supabaseServerClient
    .from('hotel_partners')
    .select('*')
    .eq('id', partnerId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get partner hotels
 */
export async function getPartnerHotels(partnerId: string) {
  const { data, error } = await supabaseServerClient
    .from('hotel_partner_listings')
    .select(`
      id,
      is_active,
      partner_hotel_id,
      hotel:hotels (
        id,
        slug,
        name,
        address,
        star_rating,
        images,
        amenities,
        created_at,
        updated_at
      )
    `)
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get single hotel by ID (verify partner ownership)
 */
export async function getPartnerHotel(partnerId: string, hotelId: string) {
  const { data, error } = await supabaseServerClient
    .from('hotel_partner_listings')
    .select(`
      id,
      is_active,
      partner_hotel_id,
      hotel:hotels (
        id,
        slug,
        name,
        description,
        address,
        star_rating,
        images,
        amenities,
        policies,
        contact,
        metadata,
        created_at,
        updated_at
      )
    `)
    .eq('partner_id', partnerId)
    .eq('hotel_id', hotelId)
    .single();

  if (error) throw error;
  return data;
}

// =====================================================
// HOTEL OPERATIONS
// =====================================================

/**
 * Create a new hotel
 */
export async function createHotel(partnerId: string, hotelData: any) {
  // Insert hotel
  const { data: hotel, error: hotelError } = await supabaseServerClient
    .from('hotels')
    .insert({
      ...hotelData,
      metadata: {
        ...hotelData.metadata,
        partner_id: partnerId,
        created_via: 'partner_portal',
      },
    })
    .select()
    .single();

  if (hotelError) throw hotelError;

  // Create partner listing
  const { error: listingError } = await supabaseServerClient
    .from('hotel_partner_listings')
    .insert({
      hotel_id: hotel.id,
      partner_id: partnerId,
      partner_hotel_id: hotel.slug,
      is_active: true,
    });

  if (listingError) {
    // Rollback: delete the hotel if listing creation fails
    await supabaseServerClient.from('hotels').delete().eq('id', hotel.id);
    throw listingError;
  }

  return hotel;
}

/**
 * Update hotel
 */
export async function updateHotel(
  partnerId: string,
  hotelId: string,
  updates: any
) {
  // Verify ownership
  const ownership = await getPartnerHotel(partnerId, hotelId);
  if (!ownership) {
    throw new Error('Hotel not found or access denied');
  }

  const { data, error } = await supabaseServerClient
    .from('hotels')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', hotelId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete hotel (soft delete - set listing to inactive)
 */
export async function deleteHotel(partnerId: string, hotelId: string) {
  // Verify ownership
  await getPartnerHotel(partnerId, hotelId);

  // Deactivate the partner listing instead of deleting the hotel
  const { error } = await supabaseServerClient
    .from('hotel_partner_listings')
    .update({ is_active: false })
    .eq('partner_id', partnerId)
    .eq('hotel_id', hotelId);

  if (error) throw error;
}

// =====================================================
// ROOM OPERATIONS
// =====================================================

/**
 * Get rooms for a hotel
 */
export async function getHotelRooms(hotelId: string) {
  const { data, error } = await supabaseServerClient
    .from('hotel_rooms')
    .select('*')
    .eq('hotel_id', hotelId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get single room
 */
export async function getRoom(roomId: string) {
  const { data, error } = await supabaseServerClient
    .from('hotel_rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create room
 */
export async function createRoom(roomData: any) {
  const { data, error } = await supabaseServerClient
    .from('hotel_rooms')
    .insert(roomData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update room
 */
export async function updateRoom(roomId: string, updates: any) {
  const { data, error } = await supabaseServerClient
    .from('hotel_rooms')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', roomId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete room
 */
export async function deleteRoom(roomId: string) {
  const { error } = await supabaseServerClient
    .from('hotel_rooms')
    .delete()
    .eq('id', roomId);

  if (error) throw error;
}

// =====================================================
// RATE OPERATIONS
// =====================================================

/**
 * Get rates for a room within date range
 */
export async function getRoomRates(
  roomId: string,
  startDate: string,
  endDate: string,
  partnerId?: string
) {
  let query = supabaseServerClient
    .from('hotel_rates')
    .select('*')
    .eq('room_id', roomId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (partnerId) {
    query = query.eq('partner_id', partnerId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Create or update rates (upsert)
 */
export async function upsertRates(rates: any[]) {
  const { data, error } = await supabaseServerClient
    .from('hotel_rates')
    .upsert(rates, {
      onConflict: 'room_id,date,partner_id',
    })
    .select();

  if (error) throw error;
  return data;
}

/**
 * Bulk update rates for date range
 */
export async function bulkUpdateRates(
  roomId: string,
  partnerId: string,
  startDate: string,
  endDate: string,
  rateData: any
) {
  const dates = getDateRange(startDate, endDate);
  
  const ratesToUpsert = dates.map((date) => ({
    room_id: roomId,
    partner_id: partnerId,
    date,
    ...rateData,
  }));

  return upsertRates(ratesToUpsert);
}

/**
 * Delete rates for date range
 */
export async function deleteRates(
  roomId: string,
  partnerId: string,
  startDate: string,
  endDate: string
) {
  const { error } = await supabaseServerClient
    .from('hotel_rates')
    .delete()
    .eq('room_id', roomId)
    .eq('partner_id', partnerId)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) throw error;
}

// =====================================================
// BOOKING OPERATIONS
// =====================================================

/**
 * Get bookings for a partner
 */
export async function getPartnerBookings(
  partnerId: string,
  filters: {
    hotel_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  } = {}
) {
  // Get partner's hotel IDs
  const { data: listings } = await supabaseServerClient
    .from('hotel_partner_listings')
    .select('hotel_id')
    .eq('partner_id', partnerId)
    .eq('is_active', true);

  if (!listings || listings.length === 0) {
    return [];
  }

  const hotelIds = listings.map((l) => l.hotel_id);

  let query = supabaseServerClient
    .from('hotel_bookings')
    .select(
      `
      *,
      hotel:hotels (id, name, address),
      room:hotel_rooms (id, title, code)
    `
    )
    .in('hotel_id', hotelIds)
    .order('created_at', { ascending: false });

  if (filters.hotel_id) {
    query = query.eq('hotel_id', filters.hotel_id);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.start_date) {
    query = query.gte('check_in_date', filters.start_date);
  }

  if (filters.end_date) {
    query = query.lte('check_out_date', filters.end_date);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
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
    .from('hotel_bookings')
    .select(
      `
      *,
      hotel:hotels (
        id,
        slug,
        name,
        description,
        address,
        star_rating,
        images,
        amenities
      ),
      room:hotel_rooms (*)
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
  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'checked_in') {
    updates.actual_check_in = new Date().toISOString();
  } else if (status === 'checked_out') {
    updates.actual_check_out = new Date().toISOString();
  }

  const { data, error } = await supabaseServerClient
    .from('hotel_bookings')
    .update(updates)
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;

  // Log status change in modifications table
  await supabaseServerClient.from('hotel_booking_modifications').insert({
    booking_id: bookingId,
    modification_type: 'status_change',
    old_values: {},
    new_values: { status, notes },
    modified_at: new Date().toISOString(),
  });

  return data;
}

// =====================================================
// ANALYTICS OPERATIONS
// =====================================================

/**
 * Get partner analytics for date range
 */
export async function getPartnerAnalytics(
  partnerId: string,
  startDate: string,
  endDate: string,
  hotelId?: string
) {
  let query = supabaseServerClient
    .from('partner_analytics')
    .select('*')
    .eq('partner_id', partnerId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (hotelId) {
    query = query.eq('hotel_id', hotelId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Get dashboard metrics summary
 */
export async function getDashboardMetrics(partnerId: string) {
  // Get today and 30 days ago
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const startDate = thirtyDaysAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  const analytics = await getPartnerAnalytics(partnerId, startDate, endDate);

  // Aggregate metrics
  const metrics = analytics.reduce(
    (acc, row) => ({
      total_bookings: acc.total_bookings + row.total_bookings,
      confirmed_bookings: acc.confirmed_bookings + row.confirmed_bookings,
      cancelled_bookings: acc.cancelled_bookings + row.cancelled_bookings,
      gross_revenue_cents: acc.gross_revenue_cents + row.gross_revenue_cents,
      net_revenue_cents: acc.net_revenue_cents + row.net_revenue_cents,
      total_reviews: acc.total_reviews + row.new_reviews,
    }),
    {
      total_bookings: 0,
      confirmed_bookings: 0,
      cancelled_bookings: 0,
      gross_revenue_cents: 0,
      net_revenue_cents: 0,
      total_reviews: 0,
    }
  );

  // Get active hotels count
  const { data: hotels } = await supabaseServerClient
    .from('hotel_partner_listings')
    .select('hotel_id')
    .eq('partner_id', partnerId)
    .eq('is_active', true);

  return {
    ...metrics,
    active_hotels: hotels?.length || 0,
    period_start: startDate,
    period_end: endDate,
  };
}

// =====================================================
// REVIEW OPERATIONS
// =====================================================

/**
 * Get reviews for partner hotels
 */
export async function getPartnerReviews(
  partnerId: string,
  filters: {
    hotel_id?: string;
    has_response?: boolean;
    min_rating?: number;
    limit?: number;
  } = {}
) {
  const { data: listings } = await supabaseServerClient
    .from('hotel_partner_listings')
    .select('hotel_id')
    .eq('partner_id', partnerId)
    .eq('is_active', true);

  if (!listings || listings.length === 0) {
    return [];
  }

  const hotelIds = listings.map((l) => l.hotel_id);

  let query = supabaseServerClient
    .from('hotel_reviews')
    .select(
      `
      *,
      hotel:hotels (id, name),
      user:users (id, full_name)
    `
    )
    .in('hotel_id', hotelIds)
    .order('created_at', { ascending: false });

  if (filters.hotel_id) {
    query = query.eq('hotel_id', filters.hotel_id);
  }

  if (filters.has_response !== undefined) {
    if (filters.has_response) {
      query = query.not('partner_response', 'is', null);
    } else {
      query = query.is('partner_response', null);
    }
  }

  if (filters.min_rating) {
    query = query.gte('rating', filters.min_rating);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Add partner response to review
 */
export async function respondToReview(
  reviewId: string,
  responseText: string,
  responderId: string
) {
  const { data, error } = await supabaseServerClient
    .from('hotel_reviews')
    .update({
      partner_response: responseText,
      partner_response_date: new Date().toISOString(),
      partner_responder_id: responderId,
    })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =====================================================
// PAYOUT OPERATIONS
// =====================================================

/**
 * Get partner payouts
 */
export async function getPartnerPayouts(
  partnerId: string,
  filters: {
    status?: string;
    limit?: number;
  } = {}
) {
  let query = supabaseServerClient
    .from('partner_payouts')
    .select('*')
    .eq('partner_id', partnerId)
    .order('period_start', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Get single payout
 */
export async function getPayout(payoutId: string) {
  const { data, error } = await supabaseServerClient
    .from('partner_payouts')
    .select('*')
    .eq('id', payoutId)
    .single();

  if (error) throw error;
  return data;
}
