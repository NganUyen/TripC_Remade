/**
 * TripC AI Chatbot - Main Chat API Route
 *
 * This API route handles chat messages, calls Deepseek AI with function calling,
 * and streams responses back to the client.
 */

import { NextRequest } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { allTools } from "@/lib/ai/tools";
import * as handlers from "@/lib/ai/handlers";
import * as extendedHandlers from "@/lib/ai/handlers-extended";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Initialize OpenAI client with Deepseek endpoint
// Deepseek is OpenAI API compatible
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

// Tool handler mapping
const toolHandlers: Record<string, Function> = {
  // Auth tools
  check_auth_status: handlers.checkAuthStatus,
  get_user_profile: handlers.getUserProfile,

  // Hotel tools
  search_hotels: handlers.searchHotels,
  get_hotel_details: handlers.getHotelDetails,
  get_hotel_reviews: handlers.getHotelReviews,
  check_room_availability: handlers.checkRoomAvailability,
  create_hotel_booking: handlers.createHotelBooking,

  // Flight tools
  search_flights: handlers.searchFlights,
  get_flight_details: handlers.getFlightDetails,
  get_airline_rating: handlers.getAirlineRating,
  create_flight_booking: handlers.createFlightBooking,

  // Restaurant tools
  search_restaurants: handlers.searchRestaurants,
  get_restaurant_details: handlers.getRestaurantDetails,
  get_restaurant_menu: handlers.getRestaurantMenu,
  get_restaurant_reviews: handlers.getRestaurantReviews,
  check_table_availability: handlers.checkTableAvailability,
  create_restaurant_booking: handlers.createRestaurantBooking,

  // Venue tools
  search_venues: extendedHandlers.searchVenues,
  get_venue_details: extendedHandlers.getVenueDetails,
  get_venue_services: extendedHandlers.getVenueServices,
  get_venue_reviews: extendedHandlers.getVenueReviews,
  create_venue_booking: extendedHandlers.createVenueBooking,

  // Ticket tools
  search_tickets: extendedHandlers.searchTickets,
  get_ticket_details: extendedHandlers.getTicketDetails,
  get_ticket_reviews: extendedHandlers.getTicketReviews,
  create_ticket_booking: extendedHandlers.createTicketBooking,

  // Transport tools
  search_transport: extendedHandlers.searchTransport,
  get_transport_details: extendedHandlers.getTransportDetails,
  create_transport_booking: extendedHandlers.createTransportBooking,

  // Shop tools
  search_products: extendedHandlers.searchProducts,
  get_product_details: extendedHandlers.getProductDetails,
  get_product_reviews: extendedHandlers.getProductReviews,
  create_product_order: extendedHandlers.createProductOrder,

  // Voucher tools
  search_vouchers: extendedHandlers.searchVouchers,
  get_voucher_details: extendedHandlers.getVoucherDetails,
  purchase_voucher: extendedHandlers.purchaseVoucher,

  // Promotion tools
  get_active_promotions: extendedHandlers.getActivePromotions,
  get_promotions_by_type: extendedHandlers.getPromotionsByType,

  // Payment tools
  create_payment_link: extendedHandlers.createPaymentLink,

  // Itinerary tools
  generate_itinerary: extendedHandlers.generateItinerary,
  get_itinerary_templates: extendedHandlers.getItineraryTemplates,
  save_itinerary: extendedHandlers.saveItinerary,
  get_saved_itineraries: extendedHandlers.getSavedItineraries,
  get_itinerary_details: extendedHandlers.getItineraryDetails,
};

// System prompt for the AI with enhanced security, privacy, and business optimization
const SYSTEM_PROMPT = `You are TripC AI Concierge, a professional and trusted travel assistant for the TripC travel platform.

## CORE MISSION
Help users discover, plan, and book exceptional travel experiences across:
- Hotels & Accommodations
- Flights & Air Travel
- Restaurants & Dining
- Spa, Wellness & Beauty
- Entertainment & Activities
- Event Tickets & Venues
- Transport Services
- Shopping & Products
- Vouchers & Gift Cards
- Promotions & Exclusive Deals

## SECURITY & PRIVACY PROTOCOLS

### Data Protection
1. NEVER ask for or store sensitive information like:
   - Full credit card numbers (payment is handled securely by our payment system)
   - Passwords or authentication tokens
   - Government ID numbers or passport details beyond what's required for booking
   - Exact home addresses (only city/region for travel purposes)

2. Authentication & Authorization:
   - ALWAYS verify authentication status before processing bookings using check_auth_status
   - If user is not authenticated and attempts to book, politely redirect to sign-in
   - Never attempt to bypass authentication or access unauthorized data
   - Respect user privacy - only access data they've explicitly requested

3. Secure Communication:
   - Never share booking details, confirmation numbers, or personal info in a way that could be intercepted
   - Don't reference specific booking details from previous conversations unless user explicitly asks
   - If discussing payment, only mention payment methods generically

### Privacy Guidelines
- Only collect information necessary for the specific service requested
- Don't make assumptions about user preferences based on demographic data
- If a search yields no results, suggest alternatives without being pushy
- Respect "do not contact" preferences
- Never share user data across different booking categories without explicit consent

## BUSINESS OPTIMIZATION

### Revenue & Conversion
1. Smart Upselling (Natural, Not Pushy):
   - When users book economy flights, casually mention premium cabin availability
   - Suggest package deals (hotel + flight) when users search separately
   - Recommend vouchers for future bookings at checkout
   - Highlight loyalty rewards and points accumulation
   - Present premium options first, but always show budget alternatives

2. Cross-Selling Opportunities:
   - Hotel booking → Suggest nearby restaurants, spas, activities
   - Flight booking → Recommend transport from airport, hotels at destination
   - Restaurant reservation → Mention nearby entertainment venues or tickets
   - Activity booking → Suggest related experiences in the area

3. Maximize Booking Value:
   - Present mid-range to premium options before budget options (but show all)
   - Emphasize value-adds: "This hotel includes breakfast and spa access"
   - Highlight limited availability: "Only 2 rooms left at this price"
   - Showcase promotions and exclusive deals prominently
   - Bundle recommendations: "Book 3 nights and save 15%"

4. Retention & Loyalty:
   - After successful bookings, mention TripC rewards program
   - Suggest saving favorites to wishlist for future reference
   - Remind users of upcoming trips based on bookings
   - Encourage reviews after experiences

### Conversion Psychology
- Use urgency appropriately: "Popular choice - frequently booked"
- Social proof: Include ratings and review counts prominently
- Comparison: "This option offers better value compared to similar hotels"
- Scarcity: "Last chance to book at this rate" (when true)
- Authority: "Top-rated by travelers like you"

## INTERACTION GUIDELINES

### Communication Style
1. Tone: Friendly, professional, concise, and enthusiastic
2. Clarity: Present information in scannable formats with key details highlighted
3. Engagement: Use emojis sparingly to add personality (🏨 ✈️ 🍽️ 🎫 💎)
4. Proactivity: Anticipate needs and offer relevant suggestions
5. Transparency: Be honest about availability, pricing, and limitations

### Best Practices
1. Search Results: Show 3-5 top options with prices, ratings, and key features
2. Booking Confirmations: Always provide confirmation number and next steps
3. Error Handling: Explain issues clearly and offer alternatives
4. Multi-step Tasks: Use sequential tool calls efficiently
5. Verification: Confirm critical details before booking (dates, guests, preferences)

### Response Format
- Start with direct answer to user's question
- Present options in numbered or bulleted lists
- Include prices in local currency when available
- Show ratings as stars (⭐) or numerical (4.5/5)
- Bold important details like prices, dates, confirmation numbers
- End with a helpful follow-up question or suggestion

## OPERATIONAL RULES

### Tool Usage
1. ALWAYS check authentication before create_*_booking tools
2. Use search tools with appropriate filters based on user preferences
3. Call multiple tools in sequence for complex requests
4. If a tool fails, try alternative approaches before giving up
5. Don't make assumptions - use get_details tools to fetch accurate data

### Booking Workflow
1. Understand user requirements (dates, location, budget, preferences)
2. Search for options using appropriate filters
3. Present top 3-5 results with key details
4. If user shows interest, get detailed information
5. Verify authentication status
6. Confirm all booking details with user
7. Create booking and provide confirmation
8. Suggest complementary services

### Error Recovery
- If search returns no results, broaden criteria or suggest alternatives
- If booking fails, explain why and offer solutions
- If authentication required, guide user to sign in
- If payment issues, direct to payment support

Current date: ${new Date().toISOString().split("T")[0]}

Remember: Your goal is to create delightful experiences that drive bookings while protecting user privacy and trust. Balance business objectives with genuine helpfulness.`;

// Convert Zod schemas to OpenAI function format
function zodToOpenAIFunction(name: string, tool: any) {
  return {
    name,
    description: tool.description,
    parameters: {
      type: "object",
      properties: Object.entries(tool.parameters.shape).reduce(
        (acc: any, [key, value]: [string, any]) => {
          acc[key] = {
            type:
              value._def.typeName === "ZodString"
                ? "string"
                : value._def.typeName === "ZodNumber"
                  ? "number"
                  : value._def.typeName === "ZodBoolean"
                    ? "boolean"
                    : value._def.typeName === "ZodArray"
                      ? "array"
                      : value._def.typeName === "ZodEnum"
                        ? "string"
                        : value._def.typeName === "ZodObject"
                          ? "object"
                          : "string",
            description: value._def.description || "",
          };

          if (value._def.typeName === "ZodEnum") {
            acc[key].enum = value._def.values;
          }

          if (value._def.typeName === "ZodArray") {
            acc[key].items = { type: "string" };
          }

          if (value._def.typeName === "ZodObject") {
            acc[key].properties = Object.entries(value.shape).reduce(
              (props: any, [k, v]: [string, any]) => {
                props[k] = {
                  type: v._def.typeName === "ZodString" ? "string" : "string",
                };
                return props;
              },
              {},
            );
          }

          return acc;
        },
        {},
      ),
      required: Object.entries(tool.parameters.shape)
        .filter(([_, value]: [string, any]) => !value.isOptional())
        .map(([key]) => key),
    },
  };
}

// Convert all tools to OpenAI function format
const functions = Object.entries(allTools).map(([name, tool]) =>
  zodToOpenAIFunction(name, tool),
);

export async function POST(req: NextRequest) {
  try {
    // Get user authentication
    const { userId } = await auth();

    // Parse request body
    const { messages, conversationId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    let currentConversationId = conversationId;
    let userDbId = null;

    // Get user from database if authenticated
    if (userId) {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", userId)
        .single();

      userDbId = userData?.id;

      // Create or get conversation if user is authenticated
      if (userDbId && !currentConversationId) {
        // Create new conversation
        const { data: conversation, error: convError } = await supabase
          .from("chat_conversations")
          .insert({
            user_id: userDbId,
            title: messages[0]?.content?.substring(0, 50) || "New Conversation",
          })
          .select()
          .single();

        if (!convError && conversation) {
          currentConversationId = conversation.id;
        }
      }

      // Save user message to database
      if (currentConversationId && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === "user") {
          await supabase.from("chat_messages").insert({
            conversation_id: currentConversationId,
            role: "user",
            content: lastMessage.content,
          });
        }
      }
    }

    // Prepare messages for Deepseek
    const chatMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let assistantMessage = "";
          let functionCalls: any[] = [];

          // Call Deepseek with function calling
          const response = await deepseek.chat.completions.create({
            model: "deepseek-chat",
            messages: chatMessages,
            functions: functions,
            function_call: "auto",
            temperature: 0.7,
            max_tokens: 2000,
            stream: false, // We'll handle streaming manually for function calls
          });

          const choice = response.choices[0];

          // Check if AI wants to call a function
          if (choice.message.function_call) {
            const functionName = choice.message.function_call.name;
            const functionArgs = JSON.parse(
              choice.message.function_call.arguments,
            );

            // Execute the function
            const handler = toolHandlers[functionName];
            if (!handler) {
              throw new Error(`Unknown function: ${functionName}`);
            }

            const functionResult = await handler(functionArgs);

            // Add function call and result to messages
            const updatedMessages = [
              ...chatMessages,
              {
                role: "assistant",
                content: null,
                function_call: choice.message.function_call,
              },
              {
                role: "function",
                name: functionName,
                content: JSON.stringify(functionResult),
              },
            ];

            // Get final response from AI with function result
            const finalResponse = await deepseek.chat.completions.create({
              model: "deepseek-chat",
              messages: updatedMessages,
              temperature: 0.7,
              max_tokens: 2000,
              stream: true,
            });

            // Stream the final response
            for await (const chunk of finalResponse) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) {
                assistantMessage += content;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content })}\n\n`),
                );
              }
            }
          } else {
            // No function call, stream direct response
            const content = choice.message.content || "";
            assistantMessage = content;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content })}\n\n`),
            );
          }

          // Save assistant message to database
          if (currentConversationId && assistantMessage && userDbId) {
            await supabase.from("chat_messages").insert({
              conversation_id: currentConversationId,
              role: "assistant",
              content: assistantMessage,
            });
          }

          // Send conversation ID if it was created
          if (currentConversationId && !conversationId) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ conversationId: currentConversationId })}\n\n`,
              ),
            );
          }

          // Send done signal
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Chat API Error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error: "An error occurred while processing your request.",
              })}\n\n`,
            ),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
