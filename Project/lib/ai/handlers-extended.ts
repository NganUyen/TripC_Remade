/**
 * TripC AI Chatbot - Additional Tool Handlers
 * Handlers for Venues, Tickets, Transport, Shop, Vouchers, Promotions, and Payments
 */

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ============================================================================
// VENUE HANDLERS (Spa/Wellness/Beauty/Entertainment)
// ============================================================================

export async function searchVenues(params: {
  location: string;
  category: "spa" | "wellness" | "beauty" | "entertainment";
  date?: string;
  min_rating?: number;
  price_range?: string;
}) {
  try {
    let query = supabase
      .from("venues")
      .select("*")
      .ilike("location", `%${params.location}%`)
      .eq("category", params.category);

    if (params.min_rating) {
      query = query.gte("rating", params.min_rating);
    }

    if (params.price_range) {
      query = query.eq("price_range", params.price_range);
    }

    const { data: venues, error } = await query.limit(10);

    if (error) throw error;

    return {
      success: true,
      count: venues?.length || 0,
      venues: venues?.map((v) => ({
        id: v.id,
        name: v.name,
        category: v.category,
        location: v.location,
        rating: v.rating,
        price_range: v.price_range,
        image_url: v.image_url,
      })),
    };
  } catch (error) {
    return {
      error: "Failed to search venues",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getVenueDetails(params: { venue_id: string }) {
  try {
    const { data: venue, error } = await supabase
      .from("venues")
      .select("*")
      .eq("id", params.venue_id)
      .single();

    if (error) throw error;

    return {
      success: true,
      venue,
    };
  } catch (error) {
    return {
      error: "Failed to get venue details",
    };
  }
}

export async function getVenueServices(params: { venue_id: string }) {
  try {
    const { data: services, error } = await supabase
      .from("venue_services")
      .select("*")
      .eq("venue_id", params.venue_id);

    if (error) throw error;

    return {
      success: true,
      services,
    };
  } catch (error) {
    return {
      error: "Failed to get venue services",
    };
  }
}

export async function getVenueReviews(params: {
  venue_id: string;
  limit?: number;
}) {
  try {
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("item_type", "venue")
      .eq("item_id", params.venue_id)
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
      error: "Failed to get venue reviews",
    };
  }
}

export async function createVenueBooking(params: {
  venue_id: string;
  service_id: string;
  date: string;
  time: string;
  duration?: number;
  notes?: string;
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

    const { data: venue, error: venueError } = await supabase
      .from("venues")
      .select("name")
      .eq("id", params.venue_id)
      .single();

    if (venueError) throw venueError;

    const { data: service, error: serviceError } = await supabase
      .from("venue_services")
      .select("name, price")
      .eq("id", params.service_id)
      .single();

    if (serviceError) throw serviceError;

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        type: "venue",
        title: `${venue.name} - ${service.name}`,
        start_date: `${params.date}T${params.time}`,
        price: service.price,
        status: "pending",
        metadata: {
          venue_id: params.venue_id,
          service_id: params.service_id,
          duration: params.duration,
          notes: params.notes,
        },
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    return {
      success: true,
      booking_id: booking.id,
      confirmation_number: booking.id.substring(0, 8).toUpperCase(),
      venue_name: venue.name,
      service_name: service.name,
      date: params.date,
      time: params.time,
      price: service.price,
      status: "pending",
      message:
        "Venue booking created successfully! Please complete payment to confirm.",
    };
  } catch (error) {
    return {
      error: "Failed to create venue booking",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// TICKET HANDLERS (Tours/Activities/Attractions/Events)
// ============================================================================

export async function searchTickets(params: {
  location: string;
  category?: "tour" | "activity" | "attraction" | "event";
  date?: string;
  min_rating?: number;
  max_price?: number;
}) {
  try {
    let query = supabase
      .from("activities")
      .select("*")
      .ilike("location", `%${params.location}%`);

    if (params.category) {
      query = query.eq("category", params.category);
    }

    if (params.min_rating) {
      query = query.gte("rating", params.min_rating);
    }

    if (params.max_price) {
      query = query.lte("price", params.max_price);
    }

    const { data: tickets, error } = await query.limit(10);

    if (error) throw error;

    return {
      success: true,
      count: tickets?.length || 0,
      tickets: tickets?.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        location: t.location,
        price: t.price,
        rating: t.rating,
        duration: t.duration,
        image_url: t.image_url,
      })),
    };
  } catch (error) {
    return {
      error: "Failed to search tickets",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getTicketDetails(params: { ticket_id: string }) {
  try {
    const { data: ticket, error } = await supabase
      .from("activities")
      .select("*")
      .eq("id", params.ticket_id)
      .single();

    if (error) throw error;

    return {
      success: true,
      ticket,
    };
  } catch (error) {
    return {
      error: "Failed to get ticket details",
    };
  }
}

export async function getTicketReviews(params: {
  ticket_id: string;
  limit?: number;
}) {
  try {
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("item_type", "activity")
      .eq("item_id", params.ticket_id)
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
      error: "Failed to get ticket reviews",
    };
  }
}

export async function createTicketBooking(params: {
  ticket_id: string;
  date: string;
  quantity: number;
  time_slot?: string;
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

    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .select("name, price")
      .eq("id", params.ticket_id)
      .single();

    if (activityError) throw activityError;

    const total_price = activity.price * params.quantity;

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        type: "activity",
        title: `${activity.name} - ${params.quantity} tickets`,
        start_date: params.date,
        price: total_price,
        status: "pending",
        metadata: {
          activity_id: params.ticket_id,
          quantity: params.quantity,
          time_slot: params.time_slot,
        },
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    return {
      success: true,
      booking_id: booking.id,
      confirmation_number: booking.id.substring(0, 8).toUpperCase(),
      activity_name: activity.name,
      date: params.date,
      quantity: params.quantity,
      total_price,
      status: "pending",
      message:
        "Ticket booking created successfully! Please complete payment to confirm.",
    };
  } catch (error) {
    return {
      error: "Failed to create ticket booking",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// TRANSPORT HANDLERS
// ============================================================================

export async function searchTransport(params: {
  service_type: "airport-transfer" | "taxi" | "car-rental" | "private-driver";
  pickup_location: string;
  dropoff_location?: string;
  date: string;
  time: string;
  passengers?: number;
  luggage?: number;
}) {
  try {
    let query = supabase
      .from("transport_services")
      .select("*")
      .eq("service_type", params.service_type)
      .ilike("coverage_area", `%${params.pickup_location}%`);

    const { data: transport, error } = await query.limit(10);

    if (error) throw error;

    return {
      success: true,
      count: transport?.length || 0,
      transport_options: transport?.map((t) => ({
        id: t.id,
        name: t.name,
        service_type: t.service_type,
        vehicle_type: t.vehicle_type,
        capacity: t.capacity,
        price: t.price,
        rating: t.rating,
      })),
    };
  } catch (error) {
    return {
      error: "Failed to search transport",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getTransportDetails(params: { transport_id: string }) {
  try {
    const { data: transport, error } = await supabase
      .from("transport_services")
      .select("*")
      .eq("id", params.transport_id)
      .single();

    if (error) throw error;

    return {
      success: true,
      transport,
    };
  } catch (error) {
    return {
      error: "Failed to get transport details",
    };
  }
}

export async function createTransportBooking(params: {
  transport_id: string;
  pickup_location: string;
  dropoff_location?: string;
  date: string;
  time: string;
  passengers: number;
  luggage?: number;
  contact_phone: string;
  flight_number?: string;
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

    const { data: transport, error: transportError } = await supabase
      .from("transport_services")
      .select("name, price")
      .eq("id", params.transport_id)
      .single();

    if (transportError) throw transportError;

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        type: "transport",
        title: `${transport.name} - ${params.pickup_location}`,
        start_date: `${params.date}T${params.time}`,
        price: transport.price,
        status: "pending",
        metadata: {
          transport_id: params.transport_id,
          pickup_location: params.pickup_location,
          dropoff_location: params.dropoff_location,
          passengers: params.passengers,
          luggage: params.luggage,
          contact_phone: params.contact_phone,
          flight_number: params.flight_number,
        },
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    return {
      success: true,
      booking_id: booking.id,
      confirmation_number: booking.id.substring(0, 8).toUpperCase(),
      service_name: transport.name,
      pickup: params.pickup_location,
      dropoff: params.dropoff_location,
      date: params.date,
      time: params.time,
      price: transport.price,
      status: "pending",
      message:
        "Transport booking created successfully! Please complete payment to confirm.",
    };
  } catch (error) {
    return {
      error: "Failed to create transport booking",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// SHOP HANDLERS
// ============================================================================

export async function searchProducts(params: {
  query?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  brand?: string;
}) {
  try {
    let query = supabase.from("products").select("*");

    if (params.query) {
      query = query.or(
        `name.ilike.%${params.query}%,description.ilike.%${params.query}%`,
      );
    }

    if (params.category) {
      query = query.eq("category", params.category);
    }

    if (params.min_price) {
      query = query.gte("price", params.min_price);
    }

    if (params.max_price) {
      query = query.lte("price", params.max_price);
    }

    if (params.min_rating) {
      query = query.gte("rating", params.min_rating);
    }

    if (params.brand) {
      query = query.eq("brand_id", params.brand);
    }

    const { data: products, error } = await query.limit(10);

    if (error) throw error;

    return {
      success: true,
      count: products?.length || 0,
      products: products?.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        rating: p.rating,
        brand: p.brand_id,
        image_url: p.image_url,
      })),
    };
  } catch (error) {
    return {
      error: "Failed to search products",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getProductDetails(params: { product_id: string }) {
  try {
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", params.product_id)
      .single();

    if (error) throw error;

    return {
      success: true,
      product,
    };
  } catch (error) {
    return {
      error: "Failed to get product details",
    };
  }
}

export async function getProductReviews(params: {
  product_id: string;
  limit?: number;
}) {
  try {
    const { data: reviews, error } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", params.product_id)
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
      error: "Failed to get product reviews",
    };
  }
}

export async function createProductOrder(params: {
  product_id: string;
  quantity: number;
  variant?: string;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        error: "User not authenticated. Please sign in to make an order.",
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

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("name, price")
      .eq("id", params.product_id)
      .single();

    if (productError) throw productError;

    const total_price = product.price * params.quantity;

    const { data: order, error: orderError } = await supabase
      .from("shop_orders")
      .insert({
        user_id: user.id,
        total_amount: total_price,
        status: "pending",
        shipping_address: params.shipping_address,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Add order item
    await supabase.from("shop_order_items").insert({
      order_id: order.id,
      product_id: params.product_id,
      quantity: params.quantity,
      variant: params.variant,
      price: product.price,
    });

    return {
      success: true,
      order_id: order.id,
      order_number: order.id.substring(0, 8).toUpperCase(),
      product_name: product.name,
      quantity: params.quantity,
      total_price,
      status: "pending",
      message:
        "Order created successfully! Please complete payment to confirm.",
    };
  } catch (error) {
    return {
      error: "Failed to create product order",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// VOUCHER HANDLERS
// ============================================================================

export async function searchVouchers(params: {
  category?: string;
  min_value?: number;
  max_value?: number;
}) {
  try {
    let query = supabase.from("vouchers").select("*").eq("status", "active");

    if (params.category) {
      query = query.eq("category", params.category);
    }

    if (params.min_value) {
      query = query.gte("value", params.min_value);
    }

    if (params.max_value) {
      query = query.lte("value", params.max_value);
    }

    const { data: vouchers, error } = await query.limit(10);

    if (error) throw error;

    return {
      success: true,
      count: vouchers?.length || 0,
      vouchers: vouchers?.map((v) => ({
        id: v.id,
        name: v.name,
        category: v.category,
        value: v.value,
        tcent_cost: v.tcent_cost,
        description: v.description,
      })),
    };
  } catch (error) {
    return {
      error: "Failed to search vouchers",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getVoucherDetails(params: { voucher_id: string }) {
  try {
    const { data: voucher, error } = await supabase
      .from("vouchers")
      .select("*")
      .eq("id", params.voucher_id)
      .single();

    if (error) throw error;

    return {
      success: true,
      voucher,
    };
  } catch (error) {
    return {
      error: "Failed to get voucher details",
    };
  }
}

export async function purchaseVoucher(params: {
  voucher_id: string;
  quantity?: number;
  recipient_email?: string;
  personal_message?: string;
}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        error: "User not authenticated. Please sign in to purchase vouchers.",
      };
    }

    const { data: user } = await supabase
      .from("users")
      .select("id, tcent_balance")
      .eq("clerk_id", userId)
      .single();

    if (!user) {
      return {
        error: "User profile not found",
      };
    }

    const { data: voucher, error: voucherError } = await supabase
      .from("vouchers")
      .select("name, tcent_cost")
      .eq("id", params.voucher_id)
      .single();

    if (voucherError) throw voucherError;

    const quantity = params.quantity || 1;
    const total_cost = voucher.tcent_cost * quantity;

    if (user.tcent_balance < total_cost) {
      return {
        error: `Insufficient T₵ent balance. Required: ${total_cost}, Available: ${user.tcent_balance}`,
      };
    }

    // Create voucher purchase
    const { data: purchase, error: purchaseError } = await supabase
      .from("user_vouchers")
      .insert({
        user_id: user.id,
        voucher_id: params.voucher_id,
        status: "AVAILABLE",
        recipient_email: params.recipient_email,
        personal_message: params.personal_message,
      })
      .select()
      .single();

    if (purchaseError) throw purchaseError;

    // Deduct T₵ent
    await supabase
      .from("users")
      .update({ tcent_balance: user.tcent_balance - total_cost })
      .eq("id", user.id);

    return {
      success: true,
      purchase_id: purchase.id,
      voucher_name: voucher.name,
      quantity,
      tcent_spent: total_cost,
      remaining_balance: user.tcent_balance - total_cost,
      message: "Voucher purchased successfully!",
    };
  } catch (error) {
    return {
      error: "Failed to purchase voucher",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// PROMOTION HANDLERS
// ============================================================================

export async function getActivePromotions(params: { limit?: number }) {
  try {
    const { data: promotions, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("status", "active")
      .gte("valid_until", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(params.limit || 20);

    if (error) throw error;

    return {
      success: true,
      count: promotions?.length || 0,
      promotions,
    };
  } catch (error) {
    return {
      error: "Failed to get active promotions",
    };
  }
}

export async function getPromotionsByType(params: {
  service_type:
    | "hotel"
    | "flight"
    | "restaurant"
    | "venue"
    | "ticket"
    | "transport"
    | "shop"
    | "voucher";
}) {
  try {
    const { data: promotions, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("service_type", params.service_type)
      .eq("status", "active")
      .gte("valid_until", new Date().toISOString())
      .order("discount_percentage", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      service_type: params.service_type,
      count: promotions?.length || 0,
      promotions,
    };
  } catch (error) {
    return {
      error: "Failed to get promotions by type",
    };
  }
}

// ============================================================================
// PAYMENT HANDLERS
// ============================================================================

export async function createPaymentLink(params: {
  booking_id: string;
  booking_type:
    | "hotel"
    | "flight"
    | "restaurant"
    | "venue"
    | "ticket"
    | "transport"
    | "shop"
    | "voucher";
}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        error: "User not authenticated.",
      };
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", params.booking_id)
      .single();

    if (bookingError) throw bookingError;

    // In production, integrate with payment gateway (Stripe, PayPal, etc.)
    // For now, return a mock payment link
    const payment_link = `https://tripc.app/payment/${booking.id}`;

    return {
      success: true,
      payment_link,
      booking_id: booking.id,
      amount: booking.price,
      currency: "USD",
      message: "Payment link created successfully",
    };
  } catch (error) {
    return {
      error: "Failed to create payment link",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// ITINERARY HANDLERS
// ============================================================================

export async function generateItinerary(params: {
  destination: string;
  start_date: string;
  end_date: string;
  adults: number;
  children?: number;
  budget_level?: "budget" | "moderate" | "luxury";
  interests: string[];
  travel_style: string[];
  pace?: "relaxed" | "moderate" | "packed";
  special_requests?: string;
}) {
  try {
    // Call the itinerary generation API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/itinerary/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: params.destination,
          startDate: params.start_date,
          endDate: params.end_date,
          travelers: {
            adults: params.adults,
            children: params.children || 0,
          },
          budget: params.budget_level
            ? {
                level: params.budget_level,
              }
            : undefined,
          interests: params.interests,
          travelStyle: params.travel_style,
          pace: params.pace || "moderate",
          specialRequests: params.special_requests,
        }),
      },
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to generate itinerary");
    }

    const itinerary = data.itinerary;

    return {
      success: true,
      itinerary_id: itinerary.id,
      title: itinerary.title,
      destination: itinerary.destination,
      days: itinerary.numberOfDays,
      budget: itinerary.budget?.total,
      preview_url: `/itinerary/${itinerary.id}`,
      message: `✨ I've created a personalized ${itinerary.numberOfDays}-day itinerary for your trip to ${itinerary.destination}! The itinerary includes detailed day-by-day activities, accommodation suggestions, meals, and transportation. Total estimated budget: $${itinerary.budget?.total || "N/A"}. [View your itinerary](/itinerary/${itinerary.id})`,
      summary: {
        total_activities: itinerary.days.reduce(
          (sum: number, day: any) => sum + day.activities.length,
          0,
        ),
        interests_covered: params.interests.join(", "),
        travel_style: params.travel_style.join(", "),
      },
    };
  } catch (error) {
    return {
      error: "Failed to generate itinerary",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getItineraryTemplates(params: {
  destination?: string;
  duration?: number;
  interests?: string[];
}) {
  try {
    // Mock templates for now - in production, fetch from database
    const templates = [
      {
        id: "temp_paris_5d",
        name: "Paris Classics",
        destination: "Paris, France",
        duration: 5,
        description:
          "Experience the best of Paris with iconic landmarks, museums, and French cuisine",
        thumbnail:
          "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600",
        highlights: [
          "Eiffel Tower & Seine River Cruise",
          "Louvre & Musée d'Orsay",
          "Versailles Day Trip",
          "French Cooking Class",
        ],
        price: 1800,
        bestFor: ["culture", "food", "art", "couples"],
      },
      {
        id: "temp_tokyo_7d",
        name: "Tokyo Discovery",
        destination: "Tokyo, Japan",
        duration: 7,
        description:
          "Immerse yourself in Tokyo's blend of tradition and modernity",
        thumbnail:
          "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600",
        highlights: [
          "Senso-ji Temple & Asakusa",
          "Tsukiji Market Food Tour",
          "Mount Fuji Day Trip",
          "Robot Restaurant Experience",
        ],
        price: 2500,
        bestFor: ["culture", "food", "technology", "adventure"],
      },
      {
        id: "temp_bali_10d",
        name: "Bali Relaxation",
        destination: "Bali, Indonesia",
        duration: 10,
        description:
          "Unwind in paradise with beaches, temples, and wellness retreats",
        thumbnail:
          "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600",
        highlights: [
          "Ubud Rice Terraces & Temples",
          "Beach Clubs & Water Sports",
          "Balinese Spa Treatments",
          "Sunset at Tanah Lot",
        ],
        price: 1500,
        bestFor: ["relaxation", "nature", "wellness", "beach"],
      },
    ];

    let filtered = templates;

    if (params.destination) {
      filtered = filtered.filter((t) =>
        t.destination.toLowerCase().includes(params.destination!.toLowerCase()),
      );
    }

    if (params.duration) {
      filtered = filtered.filter(
        (t) => Math.abs(t.duration - params.duration!) <= 2,
      );
    }

    if (params.interests && params.interests.length > 0) {
      filtered = filtered.filter((t) =>
        params.interests!.some((interest) => t.bestFor.includes(interest)),
      );
    }

    return {
      success: true,
      count: filtered.length,
      templates: filtered,
      message:
        filtered.length > 0
          ? `I found ${filtered.length} itinerary template(s) that match your preferences. Each template includes a complete day-by-day plan that you can customize.`
          : "No templates found matching your criteria. Would you like me to generate a custom itinerary instead?",
    };
  } catch (error) {
    return {
      error: "Failed to fetch templates",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function saveItinerary(params: {
  itinerary_id: string;
  title?: string;
  is_public?: boolean;
}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        error: "Authentication required",
        message: "Please sign in to save itineraries",
      };
    }

    // TODO: Implement saving to database
    // For now, return success message
    return {
      success: true,
      message: `✅ Itinerary saved to your account! You can access it anytime from your profile.`,
      saved_id: params.itinerary_id,
    };
  } catch (error) {
    return {
      error: "Failed to save itinerary",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getSavedItineraries() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        error: "Authentication required",
        message: "Please sign in to view your saved itineraries",
      };
    }

    // TODO: Fetch from database
    // Mock data for now
    return {
      success: true,
      count: 0,
      itineraries: [],
      message:
        "You don't have any saved itineraries yet. Generate one to get started!",
    };
  } catch (error) {
    return {
      error: "Failed to fetch itineraries",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getItineraryDetails(params: { itinerary_id: string }) {
  try {
    // TODO: Fetch from database or API
    return {
      success: false,
      error: "Itinerary details fetch not yet implemented",
      message: "Please view the itinerary directly from the generated link",
    };
  } catch (error) {
    return {
      error: "Failed to fetch itinerary details",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
