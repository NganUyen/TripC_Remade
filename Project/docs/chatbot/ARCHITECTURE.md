# TripC AI Chatbot - System Architecture

## Overview

The TripC AI Chatbot is an intelligent conversational assistant powered by Deepseek API that helps users search, explore, and book travel services across 11 different categories.

## System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│                      (ChatWidget Component)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API Route Layer                           │
│                     /api/chat/messages                          │
│                                                                 │
│  • Request validation                                           │
│  • Authentication check                                         │
│  • Rate limiting                                                │
│  • Message streaming                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Deepseek AI Engine                           │
│                                                                 │
│  • Natural language understanding                               │
│  • Intent recognition                                           │
│  • Function/tool calling                                        │
│  • Response generation                                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Tool Registry                              │
│                                                                 │
│  Authentication  │  Hotels      │  Flights     │  Restaurants   │
│  Venues          │  Tickets     │  Transport   │  Shop          │
│  Vouchers        │  Promotions  │  Payments                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Service Handlers                             │
│                                                                 │
│  • Supabase queries                                             │
│  • Business logic                                               │
│  • Data transformation                                          │
│  • Error handling                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                 │
│                                                                 │
│  Supabase (Postgres)  │  Convex (Real-time)  │  Clerk (Auth)   │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Chat API (`/api/chat/messages`)

**Responsibilities:**

- Receive user messages
- Verify authentication via Clerk
- Build conversation context
- Call Deepseek API with tool definitions
- Handle function calls
- Stream responses back to client
- Store conversation history

**Tech Stack:**

- Next.js API Route (Edge Runtime)
- Deepseek API SDK
- Streaming responses using Server-Sent Events

### 2. Tool Registry

Centralized registry of all available tools/functions that the AI can call.

**Tool Categories:**

1. **Authentication Tools**
   - `check_auth_status`: Verify if user is logged in
   - `get_user_profile`: Get current user details

2. **Hotel Tools**
   - `search_hotels`: Search for hotels by location/dates
   - `get_hotel_details`: Get specific hotel information
   - `get_hotel_reviews`: Fetch hotel reviews
   - `check_room_availability`: Check room availability
   - `create_hotel_booking`: Book a hotel room

3. **Flight Tools**
   - `search_flights`: Search for flights
   - `get_flight_details`: Get flight information
   - `get_airline_rating`: Get airline ratings
   - `create_flight_booking`: Book a flight

4. **Restaurant Tools**
   - `search_restaurants`: Search for restaurants
   - `get_restaurant_menu`: Get menu details
   - `get_restaurant_reviews`: Fetch reviews
   - `check_table_availability`: Check availability
   - `create_restaurant_booking`: Book a table

5. **Venue Tools (Spa/Wellness/Beauty/Entertainment)**
   - `search_venues`: Search for venues
   - `get_venue_services`: Get service offerings
   - `get_venue_reviews`: Fetch reviews
   - `create_venue_booking`: Book a service

6. **Ticket Tools (Tours/Activities/Attractions)**
   - `search_tickets`: Search for events/activities
   - `get_ticket_details`: Get ticket information
   - `get_ticket_reviews`: Fetch reviews
   - `create_ticket_booking`: Book tickets

7. **Transport Tools**
   - `search_transport`: Search for transport options
   - `get_transport_details`: Get transport information
   - `create_transport_booking`: Book transport

8. **Shop Tools**
   - `search_products`: Search for products
   - `get_product_details`: Get product information
   - `get_product_reviews`: Fetch product reviews
   - `create_product_order`: Order products

9. **Voucher Tools**
   - `search_vouchers`: Search for vouchers
   - `get_voucher_details`: Get voucher information
   - `purchase_voucher`: Buy vouchers

10. **Promotion Tools**
    - `get_active_promotions`: Get active promotions
    - `get_promotions_by_type`: Get promotions by service type

11. **Payment Tools**
    - `create_payment_link`: Generate payment link for booking

### 3. Service Handlers

Each handler connects to the appropriate database/API:

```typescript
class HotelHandler {
  async searchHotels(params: SearchParams): Promise<Hotel[]>;
  async getHotelDetails(hotelId: string): Promise<HotelDetails>;
  async createBooking(bookingData: BookingData): Promise<Booking>;
}
```

### 4. Conversation Manager

**Responsibilities:**

- Store conversation history in Supabase
- Retrieve previous conversations
- Manage context window
- Handle conversation branching

**Database Schema:**

```sql
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'function')),
  content TEXT,
  function_call JSONB,
  function_result JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Data Flow

### User Query Flow

1. **User sends message** → ChatWidget
2. **Message sent to API** → POST /api/chat/messages
3. **Authentication check** → Verify Clerk session
4. **Load conversation context** → Fetch recent messages
5. **Build prompt with tools** → Include tool definitions
6. **Call Deepseek API** → Send to AI with function calling
7. **Process response:**
   - If text response → Stream to client
   - If function call → Execute tool → Get result → Call AI again → Stream response
8. **Save to database** → Store conversation
9. **Return to user** → Display in ChatWidget

### Booking Flow Example

```
User: "Book a hotel in Da Nang for tomorrow"
  ↓
AI identifies intent: book_hotel
  ↓
AI calls: search_hotels(location="Da Nang", checkin="2026-01-29")
  ↓
System executes: Query Supabase hotels table
  ↓
Returns: [Hotel A, Hotel B, Hotel C]
  ↓
AI presents options: "I found 3 hotels. Here are the top options..."
  ↓
User: "Book Hotel A"
  ↓
AI calls: check_auth_status()
  ↓
System: Returns user authentication status
  ↓
If authenticated:
  AI calls: create_hotel_booking(hotel_id="A", ...)
  ↓
  System: Creates booking in database
  ↓
  AI: "Great! Your booking is confirmed. Confirmation #12345"
Else:
  AI: "Please sign in to complete your booking"
```

## Security & Privacy

### Authentication

- All booking operations require authentication
- Clerk JWT validation on every request
- User-specific data isolation

### Rate Limiting

- 20 messages per minute per user
- 100 messages per hour per user
- IP-based rate limiting for unauthenticated users

### Data Privacy

- Conversation encryption at rest
- PII detection and redaction
- GDPR-compliant data deletion
- No conversation data shared with Deepseek beyond session context

### Input Validation

- Message length limits (max 2000 characters)
- Function parameter validation
- SQL injection prevention
- XSS protection

## Performance Optimization

### Caching Strategy

- Cache hotel/flight search results for 5 minutes
- Cache product catalog for 30 minutes
- Cache promotion data for 15 minutes
- Cache user profile for session duration

### Streaming

- Use Server-Sent Events for real-time responses
- Progressive message rendering
- Chunked function result delivery

### Database Optimization

- Index conversation_id for fast message retrieval
- Partition messages by date for old conversation archival
- Use connection pooling

## Error Handling

### Graceful Degradation

1. **AI API Failure** → Fallback to predefined responses
2. **Database Error** → Cache locally, retry with exponential backoff
3. **Tool Execution Error** → Return error to AI for user-friendly explanation
4. **Network Issues** → Queue messages for retry

### User Feedback

- Clear error messages
- Retry buttons for failed operations
- Status indicators for long-running operations

## Monitoring & Analytics

### Metrics to Track

- Message volume per day/hour
- Tool usage frequency
- Booking conversion rate
- Average response time
- Error rate by tool
- User satisfaction scores

### Logging

- All AI requests/responses
- Function calls and results
- Errors with stack traces
- Performance metrics

## Deployment Architecture

### Development

```
Local Next.js → Deepseek API
              → Local Supabase
              → Clerk (development)
```

### Production

```
Vercel Edge Functions → Deepseek API (with failover)
                      → Supabase (production)
                      → Clerk (production)
                      → Redis (rate limiting)
                      → Sentry (error tracking)
```

## Future Enhancements

### Phase 2

- Multi-language support (Vietnamese, English, Japanese)
- Voice input/output
- Image understanding for travel photos
- Multi-turn conversation memory

### Phase 3

- Personalized recommendations based on history
- Predictive booking suggestions
- Integration with calendar apps
- Collaborative trip planning

### Phase 4

- AR/VR integration for virtual tours
- Blockchain-based loyalty program
- AI travel agent with autonomous booking
- Integration with external travel APIs

## Technology Stack Summary

- **AI Engine:** Deepseek API (function calling)
- **Frontend:** React, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Next.js 14 API Routes (Edge Runtime)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Clerk
- **Real-time:** Server-Sent Events (SSE)
- **Caching:** In-memory + Redis (production)
- **Monitoring:** Sentry + Custom analytics
- **Deployment:** Vercel

## API Rate Limits

### Deepseek API

- Free tier: 500 requests/day
- Pro tier: 10,000 requests/day
- Enterprise: Unlimited (negotiated)

### Recommended Tier

- **Development:** Free tier
- **Production:** Pro tier with rate limiting to stay within budget
