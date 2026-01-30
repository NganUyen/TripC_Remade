/**
 * TripC AI Chatbot - Tool Handlers
 *
 * This file implements the actual logic for each tool/function
 * that the AI can call.
 */

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ============================================================================
// AUTHENTICATION HANDLERS
// ============================================================================

export async function checkAuthStatus() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        authenticated: false,
        message: "User is not logged in. Please sign in to make bookings.",
      };
    }

    return {
      authenticated: true,
      userId,
      message: "User is authenticated.",
    };
  } catch (error) {
    return {
      authenticated: false,
      error: "Failed to check authentication status",
    };
  }
}

export async function getUserProfile() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        error: "User not authenticated",
      };
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", userId)
      .single();

    if (error) throw error;

    return {
      success: true,
      user: {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        membership_tier: user.membership_tier || "standard",
        tcent_balance: user.tcent_balance || 0,
        joined_date: user.created_at,
      },
    };
  } catch (error) {
    return {
      error: "Failed to fetch user profile",
    };
  }
}

// ============================================================================
// HOTEL HANDLERS
// ============================================================================

export async function searchHotels(params: {
  location: string;
  checkin_date: string;
  checkout_date: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  amenities?: string[];
}) {
  try {
    let query = supabase
      .from("hotels")
      .select("*")
      .ilike("location", `%${params.location}%`);

    if (params.min_price) {
      query = query.gte("price_per_night", params.min_price);
    }

    if (params.max_price) {
      query = query.lte("price_per_night", params.max_price);
    }

    if (params.min_rating) {
      query = query.gte("rating", params.min_rating);
    }

    const { data: hotels, error } = await query.limit(10);

    if (error) throw error;

    return {
      success: true,
      count: hotels?.length || 0,
      hotels: hotels?.map((hotel) => ({
        id: hotel.id,
        name: hotel.name,
        location: hotel.location,
        price_per_night: hotel.price_per_night,
        rating: hotel.rating,
        amenities: hotel.amenities,
        image_url: hotel.image_url,
      })),
    };
  } catch (error) {
    return {
      error: "Failed to search hotels",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getHotelDetails(params: { hotel_id: string }) {
  try {
    const { data: hotel, error } = await supabase
      .from("hotels")
      .select("*")
      .eq("id", params.hotel_id)
      .single();

    if (error) throw error;

    return {
      success: true,
      hotel,
    };
  } catch (error) {
    return {
      error: "Failed to get hotel details",
    };
  }
}

export async function getHotelReviews(params: {
  hotel_id: string;
  limit?: number;
}) {
  try {
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("item_type", "hotel")
      .eq("item_id", params.hotel_id)
      .order("created_at", { ascending: false })
      .limit(params.limit || 10);

    if (error) throw error;

    return {
      success: true,
      count: reviews?.length || 0,
      reviews,
    };
  } catch (error) {
    return {
      error: "Failed to get hotel reviews",
    };
  }
}

export async function checkRoomAvailability(params: {
  hotel_id: string;
  room_type: string;
  checkin_date: string;
  checkout_date: string;
}) {
  try {
    // In a real implementation, check against bookings table
    // For now, simulate availability check

    const { data: hotel, error } = await supabase
      .from("hotels")
      .select("available_rooms")
      .eq("id", params.hotel_id)
      .single();

    if (error) throw error;

    return {
      success: true,
      available: true,
      message: "Room is available for the selected dates",
    };
  } catch (error) {
    return {
      error: "Failed to check room availability",
    };
  }
}

export async function createHotelBooking(params: {
  hotel_id: string;
  room_type: string;
  checkin_date: string;
  checkout_date: string;
  guests: number;
  special_requests?: string;
}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        error: "User not authenticated. Please sign in to make a booking.",
      };
    }

    // Get user's database ID
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (!user) {
      return {
        error: "User profile not found",
      };
    }

    // Get hotel details
    const { data: hotel, error: hotelError } = await supabase
      .from("hotels")
      .select("name, price_per_night")
      .eq("id", params.hotel_id)
      .single();

    if (hotelError) throw hotelError;

    // Calculate total nights and price
    const checkin = new Date(params.checkin_date);
    const checkout = new Date(params.checkout_date);
    const nights = Math.ceil(
      (checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24),
    );
    const total_price = nights * hotel.price_per_night;

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        type: "hotel",
        title: `${hotel.name} - ${params.room_type}`,
        start_date: params.checkin_date,
        end_date: params.checkout_date,
        price: total_price,
        status: "pending",
        metadata: {
          hotel_id: params.hotel_id,
          room_type: params.room_type,
          guests: params.guests,
          special_requests: params.special_requests,
        },
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    return {
      success: true,
      booking_id: booking.id,
      confirmation_number: booking.id.substring(0, 8).toUpperCase(),
      hotel_name: hotel.name,
      checkin: params.checkin_date,
      checkout: params.checkout_date,
      nights,
      total_price,
      status: "pending",
      message:
        "Booking created successfully! Please complete payment to confirm.",
    };
  } catch (error) {
    return {
      error: "Failed to create hotel booking",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// FLIGHT HANDLERS
// ============================================================================

export async function searchFlights(params: {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  passengers?: number;
  class?: string;
  max_price?: number;
}) {
  try {
    let query = supabase
      .from("flights")
      .select("*")
      .ilike("origin", `%${params.origin}%`)
      .ilike("destination", `%${params.destination}%`)
      .gte("departure_date", params.departure_date);

    if (params.max_price) {
      query = query.lte("price", params.max_price);
    }

    const { data: flights, error } = await query.limit(10);

    if (error) throw error;

    return {
      success: true,
      count: flights?.length || 0,
      flights: flights?.map((flight) => ({
        id: flight.id,
        airline: flight.airline,
        flight_number: flight.flight_number,
        origin: flight.origin,
        destination: flight.destination,
        departure_time: flight.departure_time,
        arrival_time: flight.arrival_time,
        duration: flight.duration,
        price: flight.price,
        available_seats: flight.available_seats,
      })),
    };
  } catch (error) {
    return {
      error: "Failed to search flights",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getFlightDetails(params: { flight_id: string }) {
  try {
    const { data: flight, error } = await supabase
      .from("flights")
      .select("*")
      .eq("id", params.flight_id)
      .single();

    if (error) throw error;

    return {
      success: true,
      flight,
    };
  } catch (error) {
    return {
      error: "Failed to get flight details",
    };
  }
}

export async function getAirlineRating(params: { airline_code: string }) {
  try {
    const { data: ratings, error } = await supabase
      .from("reviews")
      .select("rating, comment")
      .eq("item_type", "airline")
      .eq("item_id", params.airline_code)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    const avgRating =
      ratings?.reduce((acc, r) => acc + r.rating, 0) / (ratings?.length || 1);

    return {
      success: true,
      airline_code: params.airline_code,
      average_rating: avgRating.toFixed(1),
      review_count: ratings?.length || 0,
      recent_reviews: ratings,
    };
  } catch (error) {
    return {
      error: "Failed to get airline rating",
    };
  }
}

export async function createFlightBooking(params: {
  flight_id: string;
  passengers: Array<{
    first_name: string;
    last_name: string;
    date_of_birth: string;
    passport_number?: string;
  }>;
  contact_email: string;
  contact_phone: string;
}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        error: "User not authenticated. Please sign in to make a booking.",
      };
    }

    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (!user) {
      return {
        error: "User profile not found",
      };
    }

    const { data: flight, error: flightError } = await supabase
      .from("flights")
      .select("*")
      .eq("id", params.flight_id)
      .single();

    if (flightError) throw flightError;

    const total_price = flight.price * params.passengers.length;

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        type: "flight",
        title: `${flight.airline} ${flight.flight_number} - ${flight.origin} to ${flight.destination}`,
        start_date: flight.departure_date,
        price: total_price,
        status: "pending",
        metadata: {
          flight_id: params.flight_id,
          passengers: params.passengers,
          contact_email: params.contact_email,
          contact_phone: params.contact_phone,
        },
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    return {
      success: true,
      booking_id: booking.id,
      confirmation_number: booking.id.substring(0, 8).toUpperCase(),
      flight_number: flight.flight_number,
      airline: flight.airline,
      route: `${flight.origin} → ${flight.destination}`,
      departure: flight.departure_time,
      passengers: params.passengers.length,
      total_price,
      status: "pending",
      message:
        "Flight booking created successfully! Please complete payment to confirm.",
    };
  } catch (error) {
    return {
      error: "Failed to create flight booking",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// RESTAURANT HANDLERS
// ============================================================================

export async function searchRestaurants(params: {
  location: string;
  cuisine?: string;
  date?: string;
  time?: string;
  party_size?: number;
  price_range?: string;
  min_rating?: number;
}) {
  try {
    let query = supabase
      .from("dining_venues")
      .select("*")
      .ilike("location", `%${params.location}%`);

    if (params.cuisine) {
      query = query.contains("cuisines", [params.cuisine]);
    }

    if (params.min_rating) {
      query = query.gte("rating", params.min_rating);
    }

    if (params.price_range) {
      query = query.eq("price_range", params.price_range);
    }

    const { data: restaurants, error } = await query.limit(10);

    if (error) throw error;

    return {
      success: true,
      count: restaurants?.length || 0,
      restaurants: restaurants?.map((r) => ({
        id: r.id,
        name: r.name,
        cuisine: r.cuisines,
        location: r.location,
        price_range: r.price_range,
        rating: r.rating,
        image_url: r.image_url,
      })),
    };
  } catch (error) {
    return {
      error: "Failed to search restaurants",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getRestaurantDetails(params: { restaurant_id: string }) {
  try {
    const { data: restaurant, error } = await supabase
      .from("dining_venues")
      .select("*")
      .eq("id", params.restaurant_id)
      .single();

    if (error) throw error;

    return {
      success: true,
      restaurant,
    };
  } catch (error) {
    return {
      error: "Failed to get restaurant details",
    };
  }
}

export async function getRestaurantMenu(params: { restaurant_id: string }) {
  try {
    const { data: menu, error } = await supabase
      .from("dining_menus")
      .select("*")
      .eq("venue_id", params.restaurant_id);

    if (error) throw error;

    return {
      success: true,
      menu_items: menu,
    };
  } catch (error) {
    return {
      error: "Failed to get restaurant menu",
    };
  }
}

export async function getRestaurantReviews(params: {
  restaurant_id: string;
  limit?: number;
}) {
  try {
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("item_type", "restaurant")
      .eq("item_id", params.restaurant_id)
      .order("created_at", { ascending: false })
      .limit(params.limit || 10);

    if (error) throw error;

    return {
      success: true,
      count: reviews?.length || 0,
      reviews,
    };
  } catch (error) {
    return {
      error: "Failed to get restaurant reviews",
    };
  }
}

export async function checkTableAvailability(params: {
  restaurant_id: string;
  date: string;
  time: string;
  party_size: number;
}) {
  try {
    // Simulate availability check
    // In real implementation, check against reservations table

    return {
      success: true,
      available: true,
      message: "Table is available for the selected date and time",
    };
  } catch (error) {
    return {
      error: "Failed to check table availability",
    };
  }
}

export async function createRestaurantBooking(params: {
  restaurant_id: string;
  date: string;
  time: string;
  party_size: number;
  special_requests?: string;
}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        error: "User not authenticated. Please sign in to make a booking.",
      };
    }

    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (!user) {
      return {
        error: "User profile not found",
      };
    }

    const { data: restaurant, error: restaurantError } = await supabase
      .from("dining_venues")
      .select("name")
      .eq("id", params.restaurant_id)
      .single();

    if (restaurantError) throw restaurantError;

    const { data: booking, error: bookingError } = await supabase
      .from("dining_reservations")
      .insert({
        user_id: user.id,
        venue_id: params.restaurant_id,
        reservation_date: params.date,
        reservation_time: params.time,
        party_size: params.party_size,
        special_requests: params.special_requests,
        status: "pending",
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    return {
      success: true,
      booking_id: booking.id,
      confirmation_number: booking.id.substring(0, 8).toUpperCase(),
      restaurant_name: restaurant.name,
      date: params.date,
      time: params.time,
      party_size: params.party_size,
      status: "pending",
      message: "Restaurant reservation created successfully!",
    };
  } catch (error) {
    return {
      error: "Failed to create restaurant booking",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Continue with remaining handlers in next file...
// This file is getting long, so I'll split the handlers into multiple files
