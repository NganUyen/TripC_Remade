/**
 * TripC AI Chatbot - Tool Definitions
 *
 * This file defines all the tools/functions that the AI can call
 * to interact with TripC's services and databases.
 */

import { z } from "zod";

// ============================================================================
// 1. AUTHENTICATION TOOLS
// ============================================================================

export const authTools = {
  check_auth_status: {
    description:
      "Check if the user is currently logged in. Always call this before attempting to create bookings.",
    parameters: z.object({}),
  },

  get_user_profile: {
    description:
      "Get the current user profile information including name, email, membership tier, and T₵ent balance.",
    parameters: z.object({}),
  },
};

// ============================================================================
// 2. HOTEL TOOLS
// ============================================================================

export const hotelTools = {
  search_hotels: {
    description:
      "Search for hotels by location, dates, number of guests, and other filters. Returns a list of available hotels.",
    parameters: z.object({
      location: z
        .string()
        .describe('City or location name (e.g., "Da Nang", "Bangkok")'),
      checkin_date: z.string().describe("Check-in date in YYYY-MM-DD format"),
      checkout_date: z.string().describe("Check-out date in YYYY-MM-DD format"),
      guests: z.number().optional().describe("Number of guests (default: 2)"),
      min_price: z
        .number()
        .optional()
        .describe("Minimum price per night in USD"),
      max_price: z
        .number()
        .optional()
        .describe("Maximum price per night in USD"),
      min_rating: z.number().optional().describe("Minimum rating (1-5)"),
      amenities: z
        .array(z.string())
        .optional()
        .describe('Required amenities (e.g., ["pool", "wifi", "parking"])'),
    }),
  },

  get_hotel_details: {
    description:
      "Get detailed information about a specific hotel including description, amenities, policies, and room types.",
    parameters: z.object({
      hotel_id: z.string().describe("The unique ID of the hotel"),
    }),
  },

  get_hotel_reviews: {
    description: "Get reviews and ratings for a specific hotel.",
    parameters: z.object({
      hotel_id: z.string().describe("The unique ID of the hotel"),
      limit: z
        .number()
        .optional()
        .describe("Maximum number of reviews to return (default: 10)"),
    }),
  },

  check_room_availability: {
    description: "Check if specific rooms are available for given dates.",
    parameters: z.object({
      hotel_id: z.string().describe("The unique ID of the hotel"),
      room_type: z
        .string()
        .describe('Type of room (e.g., "deluxe", "suite", "standard")'),
      checkin_date: z.string().describe("Check-in date in YYYY-MM-DD format"),
      checkout_date: z.string().describe("Check-out date in YYYY-MM-DD format"),
    }),
  },

  create_hotel_booking: {
    description:
      "Create a hotel booking. User must be authenticated. This will create a pending booking and return a payment link.",
    parameters: z.object({
      hotel_id: z.string().describe("The unique ID of the hotel"),
      room_type: z.string().describe("Type of room to book"),
      checkin_date: z.string().describe("Check-in date in YYYY-MM-DD format"),
      checkout_date: z.string().describe("Check-out date in YYYY-MM-DD format"),
      guests: z.number().describe("Number of guests"),
      special_requests: z.string().optional().describe("Any special requests"),
    }),
  },
};

// ============================================================================
// 3. FLIGHT TOOLS
// ============================================================================

export const flightTools = {
  search_flights: {
    description:
      "Search for flights between two locations on specific dates. Returns available flights with pricing.",
    parameters: z.object({
      origin: z
        .string()
        .describe('Origin airport code or city (e.g., "SGN", "Ho Chi Minh")'),
      destination: z
        .string()
        .describe('Destination airport code or city (e.g., "HAN", "Hanoi")'),
      departure_date: z
        .string()
        .describe("Departure date in YYYY-MM-DD format"),
      return_date: z
        .string()
        .optional()
        .describe("Return date for round-trip flights in YYYY-MM-DD format"),
      passengers: z
        .number()
        .optional()
        .describe("Number of passengers (default: 1)"),
      class: z
        .enum(["economy", "business", "first"])
        .optional()
        .describe("Cabin class"),
      max_price: z
        .number()
        .optional()
        .describe("Maximum price per person in USD"),
    }),
  },

  get_flight_details: {
    description:
      "Get detailed information about a specific flight including schedule, aircraft, baggage allowance.",
    parameters: z.object({
      flight_id: z.string().describe("The unique ID of the flight"),
    }),
  },

  get_airline_rating: {
    description: "Get ratings and reviews for a specific airline.",
    parameters: z.object({
      airline_code: z
        .string()
        .describe('IATA airline code (e.g., "VN" for Vietnam Airlines)'),
    }),
  },

  create_flight_booking: {
    description:
      "Create a flight booking. User must be authenticated. Returns booking confirmation and payment link.",
    parameters: z.object({
      flight_id: z.string().describe("The unique ID of the flight to book"),
      passengers: z
        .array(
          z.object({
            first_name: z.string(),
            last_name: z.string(),
            date_of_birth: z.string(),
            passport_number: z.string().optional(),
          }),
        )
        .describe("Passenger information"),
      contact_email: z
        .string()
        .describe("Contact email for booking confirmation"),
      contact_phone: z.string().describe("Contact phone number"),
    }),
  },
};

// ============================================================================
// 4. RESTAURANT TOOLS
// ============================================================================

export const restaurantTools = {
  search_restaurants: {
    description:
      "Search for restaurants by location, cuisine type, and other filters.",
    parameters: z.object({
      location: z.string().describe("City or area name"),
      cuisine: z
        .string()
        .optional()
        .describe(
          'Type of cuisine (e.g., "Italian", "Vietnamese", "Japanese")',
        ),
      date: z
        .string()
        .optional()
        .describe("Reservation date in YYYY-MM-DD format"),
      time: z.string().optional().describe("Reservation time in HH:MM format"),
      party_size: z.number().optional().describe("Number of people"),
      price_range: z.enum(["budget", "moderate", "fine-dining"]).optional(),
      min_rating: z.number().optional().describe("Minimum rating (1-5)"),
    }),
  },

  get_restaurant_details: {
    description:
      "Get detailed information about a specific restaurant including menu, hours, and policies.",
    parameters: z.object({
      restaurant_id: z.string().describe("The unique ID of the restaurant"),
    }),
  },

  get_restaurant_menu: {
    description: "Get the menu for a specific restaurant.",
    parameters: z.object({
      restaurant_id: z.string().describe("The unique ID of the restaurant"),
    }),
  },

  get_restaurant_reviews: {
    description: "Get reviews and ratings for a specific restaurant.",
    parameters: z.object({
      restaurant_id: z.string().describe("The unique ID of the restaurant"),
      limit: z
        .number()
        .optional()
        .describe("Maximum number of reviews to return (default: 10)"),
    }),
  },

  check_table_availability: {
    description:
      "Check if tables are available at a specific restaurant for a given date and time.",
    parameters: z.object({
      restaurant_id: z.string().describe("The unique ID of the restaurant"),
      date: z.string().describe("Reservation date in YYYY-MM-DD format"),
      time: z.string().describe("Reservation time in HH:MM format"),
      party_size: z.number().describe("Number of people"),
    }),
  },

  create_restaurant_booking: {
    description: "Create a restaurant reservation. User must be authenticated.",
    parameters: z.object({
      restaurant_id: z.string().describe("The unique ID of the restaurant"),
      date: z.string().describe("Reservation date in YYYY-MM-DD format"),
      time: z.string().describe("Reservation time in HH:MM format"),
      party_size: z.number().describe("Number of people"),
      special_requests: z
        .string()
        .optional()
        .describe("Special requests or dietary requirements"),
    }),
  },
};

// ============================================================================
// 5. VENUE TOOLS (Spa/Wellness/Beauty/Entertainment)
// ============================================================================

export const venueTools = {
  search_venues: {
    description:
      "Search for venues offering spa, wellness, beauty, or entertainment services.",
    parameters: z.object({
      location: z.string().describe("City or area name"),
      category: z
        .enum(["spa", "wellness", "beauty", "entertainment"])
        .describe("Type of venue"),
      date: z
        .string()
        .optional()
        .describe("Desired service date in YYYY-MM-DD format"),
      min_rating: z.number().optional().describe("Minimum rating (1-5)"),
      price_range: z.enum(["budget", "moderate", "premium"]).optional(),
    }),
  },

  get_venue_details: {
    description: "Get detailed information about a specific venue.",
    parameters: z.object({
      venue_id: z.string().describe("The unique ID of the venue"),
    }),
  },

  get_venue_services: {
    description: "Get available services and treatments offered by a venue.",
    parameters: z.object({
      venue_id: z.string().describe("The unique ID of the venue"),
    }),
  },

  get_venue_reviews: {
    description: "Get reviews and ratings for a specific venue.",
    parameters: z.object({
      venue_id: z.string().describe("The unique ID of the venue"),
      limit: z
        .number()
        .optional()
        .describe("Maximum number of reviews to return (default: 10)"),
    }),
  },

  create_venue_booking: {
    description:
      "Book a service at a spa, wellness, beauty, or entertainment venue. User must be authenticated.",
    parameters: z.object({
      venue_id: z.string().describe("The unique ID of the venue"),
      service_id: z.string().describe("The specific service to book"),
      date: z.string().describe("Service date in YYYY-MM-DD format"),
      time: z.string().describe("Service time in HH:MM format"),
      duration: z.number().optional().describe("Duration in minutes"),
      notes: z.string().optional().describe("Additional notes or preferences"),
    }),
  },
};

// ============================================================================
// 6. TICKET TOOLS (Tours/Activities/Attractions/Events)
// ============================================================================

export const ticketTools = {
  search_tickets: {
    description:
      "Search for tickets to tours, activities, attractions, or events.",
    parameters: z.object({
      location: z.string().describe("City or area name"),
      category: z.enum(["tour", "activity", "attraction", "event"]).optional(),
      date: z
        .string()
        .optional()
        .describe("Event/activity date in YYYY-MM-DD format"),
      min_rating: z.number().optional().describe("Minimum rating (1-5)"),
      max_price: z
        .number()
        .optional()
        .describe("Maximum price per ticket in USD"),
    }),
  },

  get_ticket_details: {
    description: "Get detailed information about a specific ticket/event.",
    parameters: z.object({
      ticket_id: z.string().describe("The unique ID of the ticket/event"),
    }),
  },

  get_ticket_reviews: {
    description:
      "Get reviews and ratings for a specific tour/activity/attraction.",
    parameters: z.object({
      ticket_id: z.string().describe("The unique ID of the ticket/event"),
      limit: z
        .number()
        .optional()
        .describe("Maximum number of reviews to return (default: 10)"),
    }),
  },

  create_ticket_booking: {
    description:
      "Book tickets for a tour, activity, attraction, or event. User must be authenticated.",
    parameters: z.object({
      ticket_id: z.string().describe("The unique ID of the ticket/event"),
      date: z.string().describe("Date of visit/event in YYYY-MM-DD format"),
      quantity: z.number().describe("Number of tickets"),
      time_slot: z
        .string()
        .optional()
        .describe("Preferred time slot if applicable"),
    }),
  },
};

// ============================================================================
// 7. TRANSPORT TOOLS
// ============================================================================

export const transportTools = {
  search_transport: {
    description:
      "Search for transport services including airport transfers, taxis, and car rentals.",
    parameters: z.object({
      service_type: z
        .enum(["airport-transfer", "taxi", "car-rental", "private-driver"])
        .describe("Type of transport service"),
      pickup_location: z.string().describe("Pickup location or address"),
      dropoff_location: z
        .string()
        .optional()
        .describe("Drop-off location (not required for rentals)"),
      date: z.string().describe("Service date in YYYY-MM-DD format"),
      time: z.string().describe("Pickup time in HH:MM format"),
      passengers: z.number().optional().describe("Number of passengers"),
      luggage: z.number().optional().describe("Number of luggage pieces"),
    }),
  },

  get_transport_details: {
    description: "Get detailed information about a specific transport option.",
    parameters: z.object({
      transport_id: z
        .string()
        .describe("The unique ID of the transport option"),
    }),
  },

  create_transport_booking: {
    description: "Book a transport service. User must be authenticated.",
    parameters: z.object({
      transport_id: z
        .string()
        .describe("The unique ID of the transport option"),
      pickup_location: z.string().describe("Pickup location or address"),
      dropoff_location: z.string().optional().describe("Drop-off location"),
      date: z.string().describe("Service date in YYYY-MM-DD format"),
      time: z.string().describe("Pickup time in HH:MM format"),
      passengers: z.number().describe("Number of passengers"),
      luggage: z.number().optional().describe("Number of luggage pieces"),
      contact_phone: z.string().describe("Contact phone number"),
      flight_number: z
        .string()
        .optional()
        .describe("Flight number if airport transfer"),
    }),
  },
};

// ============================================================================
// 8. SHOP TOOLS
// ============================================================================

export const shopTools = {
  search_products: {
    description: "Search for products in the TripC shop.",
    parameters: z.object({
      query: z
        .string()
        .optional()
        .describe("Search query for product name or description"),
      category: z
        .string()
        .optional()
        .describe(
          'Product category (e.g., "luggage", "accessories", "electronics")',
        ),
      min_price: z.number().optional().describe("Minimum price in USD"),
      max_price: z.number().optional().describe("Maximum price in USD"),
      min_rating: z.number().optional().describe("Minimum rating (1-5)"),
      brand: z.string().optional().describe("Filter by brand name"),
    }),
  },

  get_product_details: {
    description: "Get detailed information about a specific product.",
    parameters: z.object({
      product_id: z.string().describe("The unique ID of the product"),
    }),
  },

  get_product_reviews: {
    description: "Get reviews and ratings for a specific product.",
    parameters: z.object({
      product_id: z.string().describe("The unique ID of the product"),
      limit: z
        .number()
        .optional()
        .describe("Maximum number of reviews to return (default: 10)"),
    }),
  },

  create_product_order: {
    description: "Order a product from the shop. User must be authenticated.",
    parameters: z.object({
      product_id: z.string().describe("The unique ID of the product"),
      quantity: z.number().describe("Quantity to order"),
      variant: z
        .string()
        .optional()
        .describe("Product variant (e.g., size, color)"),
      shipping_address: z
        .object({
          street: z.string(),
          city: z.string(),
          state: z.string(),
          postal_code: z.string(),
          country: z.string(),
        })
        .describe("Shipping address"),
    }),
  },
};

// ============================================================================
// 9. VOUCHER TOOLS
// ============================================================================

export const voucherTools = {
  search_vouchers: {
    description: "Search for available vouchers and gift cards.",
    parameters: z.object({
      category: z
        .string()
        .optional()
        .describe('Voucher category (e.g., "dining", "hotel", "spa")'),
      min_value: z.number().optional().describe("Minimum voucher value in USD"),
      max_value: z.number().optional().describe("Maximum voucher value in USD"),
    }),
  },

  get_voucher_details: {
    description: "Get detailed information about a specific voucher.",
    parameters: z.object({
      voucher_id: z.string().describe("The unique ID of the voucher"),
    }),
  },

  purchase_voucher: {
    description: "Purchase a voucher or gift card. User must be authenticated.",
    parameters: z.object({
      voucher_id: z
        .string()
        .describe("The unique ID of the voucher to purchase"),
      quantity: z
        .number()
        .optional()
        .describe("Number of vouchers to purchase (default: 1)"),
      recipient_email: z
        .string()
        .optional()
        .describe("Email to send the voucher to (if it's a gift)"),
      personal_message: z
        .string()
        .optional()
        .describe("Personal message for gift vouchers"),
    }),
  },
};

// ============================================================================
// 10. PROMOTION TOOLS
// ============================================================================

export const promotionTools = {
  get_active_promotions: {
    description:
      "Get all currently active promotions and discounts across all services.",
    parameters: z.object({
      limit: z
        .number()
        .optional()
        .describe("Maximum number of promotions to return (default: 20)"),
    }),
  },

  get_promotions_by_type: {
    description: "Get active promotions for a specific service type.",
    parameters: z.object({
      service_type: z
        .enum([
          "hotel",
          "flight",
          "restaurant",
          "venue",
          "ticket",
          "transport",
          "shop",
          "voucher",
        ])
        .describe("Type of service to get promotions for"),
    }),
  },
};

// ============================================================================
// 11. PAYMENT TOOLS
// ============================================================================

export const paymentTools = {
  create_payment_link: {
    description:
      "Create a payment link for any booking or order. Used after a booking is created.",
    parameters: z.object({
      booking_id: z
        .string()
        .describe("The unique ID of the booking to create payment for"),
      booking_type: z
        .enum([
          "hotel",
          "flight",
          "restaurant",
          "venue",
          "ticket",
          "transport",
          "shop",
          "voucher",
        ])
        .describe("Type of booking"),
    }),
  },
};

// ============================================================================
// COMBINED TOOL REGISTRY
// ============================================================================

export const allTools = {
  ...authTools,
  ...hotelTools,
  ...flightTools,
  ...restaurantTools,
  ...venueTools,
  ...ticketTools,
  ...transportTools,
  ...shopTools,
  ...voucherTools,
  ...promotionTools,
  ...paymentTools,
};

// Export tool names for easy reference
export const toolNames = Object.keys(allTools);

// Tool categories for organizing the UI
export const toolCategories = {
  Authentication: Object.keys(authTools),
  Hotels: Object.keys(hotelTools),
  Flights: Object.keys(flightTools),
  Restaurants: Object.keys(restaurantTools),
  Venues: Object.keys(venueTools),
  Tickets: Object.keys(ticketTools),
  Transport: Object.keys(transportTools),
  Shop: Object.keys(shopTools),
  Vouchers: Object.keys(voucherTools),
  Promotions: Object.keys(promotionTools),
  Payment: Object.keys(paymentTools),
};
