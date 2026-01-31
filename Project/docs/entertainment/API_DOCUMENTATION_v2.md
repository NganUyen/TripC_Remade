# Entertainment Service API Documentation v2.0

Complete API reference for the TripC Entertainment Ticketing Platform - a full-featured event booking and ticket management system.

## Table of Contents

1. [Discovery & Browse](#discovery--browse)
2. [Session & Ticket Management](#session--ticket-management)
3. [Cart Management](#cart-management)
4. [Booking & Checkout](#booking--checkout)
5. [Wishlist](#wishlist)
6. [Social & Engagement](#social--engagement)
7. [Notifications](#notifications)
8. [Reviews](#reviews)
9. [Urgency Signals](#urgency-signals)
10. [Waitlist](#waitlist)

---

## Discovery & Browse

### List Categories

```
GET /api/entertainment/categories
```

**Query Parameters:**

- `parent_id` (optional): Filter by parent category
- `include_children` (boolean): Include subcategories

**Response:**

```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Music Concerts",
      "slug": "music-concerts",
      "description": "Live music performances",
      "icon": "🎵",
      "parent_id": null,
      "display_order": 1,
      "item_count": 45,
      "children": []
    }
  ]
}
```

---

### Get Category Details

```
GET /api/entertainment/categories/:slug
```

**Query Parameters:**

- `limit` (default: 20, max: 100)
- `offset` (default: 0)
- `sort` (default: created_at): Options: rating, popular, price_low, price_high

**Response:**

```json
{
  "category": {
    "id": "uuid",
    "name": "Music Concerts",
    "slug": "music-concerts"
  },
  "items": [],
  "subcategories": [],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### Trending Items

```
GET /api/entertainment/trending
```

**Query Parameters:**

- `limit` (default: 10, max: 50)
- `category` (optional): Filter by category slug

**Response:**

```json
{
  "trending": [
    {
      "id": "uuid",
      "title": "Hamilton Musical",
      "base_price": 89.99,
      "average_rating": 4.8,
      "trending_score": 95.5,
      "category": {},
      "organizer": {}
    }
  ],
  "last_updated": "2024-01-15T10:00:00Z"
}
```

---

### Advanced Search

```
GET /api/entertainment/search
```

**Query Parameters:**

- `q` (required): Search query
- `category` (optional): Category slug
- `location` (optional): City or venue
- `date_from` (optional): YYYY-MM-DD
- `date_to` (optional): YYYY-MM-DD
- `min_price` (optional): Minimum price
- `max_price` (optional): Maximum price
- `min_rating` (optional): 1-5
- `organizer` (optional): Organizer ID
- `sort` (default: relevance): Options: rating, popular, price_low, price_high, date
- `limit` (default: 20, max: 100)
- `offset` (default: 0)

**Response:**

```json
{
  "results": [],
  "filters": {
    "categories": ["music", "theater"],
    "locations": ["New York", "Los Angeles"],
    "price_range": { "min": 20, "max": 500 },
    "date_range": { "earliest": "2024-02-01", "latest": "2024-12-31" }
  },
  "pagination": {
    "total": 156,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### List Items

```
GET /api/entertainment/items
```

**Query Parameters:**

- `category` (optional): Category ID
- `location` (optional): Location filter
- `organizer` (optional): Organizer ID
- `status` (default: active)
- `sort` (default: created_at): Options: rating, popular, price_low, price_high
- `limit` (default: 20, max: 100)
- `offset` (default: 0)

**Response:**

```json
{
  "items": [],
  "pagination": {}
}
```

---

### Get Item Detail

```
GET /api/entertainment/items/:id
```

**Response:**

```json
{
  "item": {
    "id": "uuid",
    "title": "Hamilton on Broadway",
    "description": "...",
    "base_price": 89.99,
    "currency": "USD",
    "images": ["url1", "url2"],
    "duration_minutes": 180,
    "location": "Richard Rodgers Theatre",
    "category": {},
    "organizer": {},
    "sessions": [
      {
        "id": "uuid",
        "start_time": "2024-02-15T19:30:00Z",
        "end_time": "2024-02-15T22:30:00Z",
        "capacity": 500,
        "booked_count": 450,
        "available_count": 50
      }
    ],
    "ticket_types": [
      {
        "id": "uuid",
        "name": "VIP",
        "description": "Best seats in the house",
        "price": 199.99
      }
    ],
    "reviews_summary": {
      "total": 234,
      "average_rating": 4.7,
      "distribution": { "1": 2, "2": 5, "3": 15, "4": 67, "5": 145 }
    },
    "urgency": {
      "show_selling_fast": true,
      "show_limited_seats": true,
      "remaining_count": 8
    },
    "user_interactions": {
      "is_wishlisted": false,
      "is_following_organizer": true,
      "has_booked_before": false
    }
  }
}
```

---

## Session & Ticket Management

### Get Item Sessions

```
GET /api/entertainment/items/:itemId/sessions
```

**Query Parameters:**

- `date` (optional): Filter by date (YYYY-MM-DD)
- `available_only` (boolean): Only show sessions with availability

**Response:**

```json
{
  "sessions": {
    "2024-02-15": [
      {
        "id": "uuid",
        "start_time": "2024-02-15T19:30:00Z",
        "end_time": "2024-02-15T22:30:00Z",
        "capacity": 500,
        "booked_count": 450,
        "available_count": 50,
        "availability_percentage": 10
      }
    ]
  }
}
```

---

### Get Ticket Types

```
GET /api/entertainment/items/:itemId/ticket-types
```

**Response:**

```json
{
  "ticket_types": [
    {
      "id": "uuid",
      "name": "VIP",
      "description": "Premium seating",
      "price": 199.99,
      "original_price": 249.99,
      "discount_percentage": 20,
      "max_per_booking": 10,
      "available": true
    }
  ],
  "price_summary": {
    "lowest": 89.99,
    "highest": 199.99,
    "currency": "USD"
  }
}
```

---

## Cart Management

### View Cart

```
GET /api/entertainment/cart
```

**Response:**

```json
{
  "cart": {
    "id": "uuid",
    "user_id": "user_xxx",
    "status": "active",
    "created_at": "2024-01-15T10:00:00Z",
    "expires_at": "2024-01-15T10:15:00Z",
    "items": [
      {
        "id": "uuid",
        "item_id": "uuid",
        "session_id": "uuid",
        "ticket_type_id": "uuid",
        "quantity": 2,
        "unit_price": 89.99,
        "total_price": 179.98,
        "item": {},
        "session": {},
        "ticket_type": {}
      }
    ],
    "summary": {
      "subtotal": 179.98,
      "tax": 14.4,
      "total": 194.38,
      "currency": "USD",
      "total_items": 2
    }
  }
}
```

---

### Add to Cart

```
POST /api/entertainment/cart
```

**Request Body:**

```json
{
  "item_id": "uuid",
  "session_id": "uuid",
  "ticket_type_id": "uuid",
  "quantity": 2
}
```

**Response:**

```json
{
  "success": true,
  "cart_item": {},
  "message": "Added 2 tickets to cart"
}
```

---

### Update Cart Item

```
PUT /api/entertainment/cart/:itemId
```

**Request Body:**

```json
{
  "quantity": 3
}
```

---

### Remove from Cart

```
DELETE /api/entertainment/cart/:itemId
```

---

### Clear Cart

```
DELETE /api/entertainment/cart
```

---

## Booking & Checkout

### Create Booking (Checkout)

```
POST /api/entertainment/bookings
```

**Request Body:**

```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+1234567890",
  "payment_method": "credit_card",
  "notes": "Special request"
}
```

**Response:**

```json
{
  "success": true,
  "bookings": [
    {
      "id": "uuid",
      "booking_reference": "ENT-2024-ABC123",
      "total_amount": 194.38,
      "booking_status": "confirmed",
      "payment_status": "pending"
    }
  ],
  "booking_reference": "ENT-2024-ABC123",
  "message": "Booking(s) created successfully"
}
```

---

### Get User Bookings

```
GET /api/entertainment/bookings
```

**Query Parameters:**

- `status` (optional): confirmed, cancelled, completed
- `limit` (default: 50, max: 100)
- `offset` (default: 0)

**Response:**

```json
{
  "bookings": [],
  "pagination": {}
}
```

---

### Get Booking Details

```
GET /api/entertainment/bookings/:reference
```

**Response:**

```json
{
  "booking": {
    "id": "uuid",
    "booking_reference": "ENT-2024-ABC123",
    "total_quantity": 2,
    "total_amount": 194.38,
    "booking_status": "confirmed",
    "payment_status": "paid",
    "item": {},
    "session": {},
    "organizer": {},
    "tickets": [
      {
        "id": "uuid",
        "ticket_number": "ENT-2024-ABC123-T1",
        "qr_code_data": "ENT-2024-ABC123-T1:uuid:item_uuid",
        "status": "valid",
        "ticket_type": {}
      }
    ]
  }
}
```

---

### Cancel Booking

```
PUT /api/entertainment/bookings/:reference
```

**Request Body:**

```json
{
  "action": "cancel",
  "reason": "Change of plans"
}
```

---

### Request Refund

```
PUT /api/entertainment/bookings/:reference
```

**Request Body:**

```json
{
  "action": "request_refund",
  "reason": "Event cancelled"
}
```

---

## Wishlist

### Get Wishlist

```
GET /api/entertainment/wishlist
```

**Response:**

```json
{
  "wishlist": [
    {
      "id": "uuid",
      "item_id": "uuid",
      "created_at": "2024-01-15T10:00:00Z",
      "notify_on_price_drop": true,
      "notify_on_availability": true,
      "item": {}
    }
  ],
  "total": 5
}
```

---

### Add to Wishlist

```
POST /api/entertainment/wishlist
```

**Request Body:**

```json
{
  "item_id": "uuid",
  "notify_on_price_drop": true,
  "notify_on_availability": true
}
```

---

### Remove from Wishlist

```
DELETE /api/entertainment/wishlist/:itemId
```

---

## Social & Engagement

### Check Follow Status

```
GET /api/entertainment/organizers/:organizerId/follow
```

**Response:**

```json
{
  "is_following": true,
  "followed_at": "2024-01-10T08:00:00Z"
}
```

---

### Follow Organizer

```
POST /api/entertainment/organizers/:organizerId/follow
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully followed Hamilton Productions",
  "follow": {}
}
```

---

### Unfollow Organizer

```
DELETE /api/entertainment/organizers/:organizerId/follow
```

---

## Notifications

### Get Notifications

```
GET /api/entertainment/notifications
```

**Query Parameters:**

- `unread_only` (boolean): Only unread notifications
- `type` (optional): booking_confirmed, price_drop, event_reminder, etc.
- `limit` (default: 50, max: 100)
- `offset` (default: 0)

**Response:**

```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "booking_confirmed",
      "title": "Booking Confirmed!",
      "message": "Your booking ENT-2024-ABC123 has been confirmed",
      "read_at": null,
      "created_at": "2024-01-15T10:00:00Z",
      "item": {},
      "booking": {}
    }
  ],
  "unread_count": 3,
  "pagination": {}
}
```

---

### Mark Notification as Read

```
PUT /api/entertainment/notifications/:id
```

---

### Mark All as Read

```
PUT /api/entertainment/notifications/read-all
```

---

### Delete Notification

```
DELETE /api/entertainment/notifications/:id
```

---

## Reviews

### Get Reviews

```
GET /api/entertainment/reviews?item_id=xxx
```

**Query Parameters:**

- `item_id` (required)
- `rating` (optional): Filter by rating (1-5)
- `sort` (default: recent): Options: helpful, rating
- `limit` (default: 20, max: 100)
- `offset` (default: 0)

**Response:**

```json
{
  "reviews": [
    {
      "id": "uuid",
      "rating": 5,
      "review_text": "Amazing show!",
      "reviewer_name": "John D.",
      "helpful_count": 24,
      "created_at": "2024-01-10T10:00:00Z"
    }
  ],
  "rating_distribution": {
    "1": 2,
    "2": 5,
    "3": 15,
    "4": 67,
    "5": 145,
    "total": 234,
    "average": 4.7
  },
  "pagination": {}
}
```

---

### Create Review

```
POST /api/entertainment/reviews
```

**Request Body:**

```json
{
  "item_id": "uuid",
  "rating": 5,
  "review_text": "Amazing experience!",
  "reviewer_name": "John Doe"
}
```

**Note:** Requires completed booking for the item.

---

### Update Review

```
PUT /api/entertainment/reviews/:id
```

**Request Body:**

```json
{
  "rating": 4,
  "review_text": "Updated review text"
}
```

---

### Delete Review

```
DELETE /api/entertainment/reviews/:id
```

---

## Urgency Signals

### Get Urgency Signals

```
GET /api/entertainment/urgency/:itemId
```

**Response:**

```json
{
  "urgency": {
    "item_id": "uuid",
    "show_selling_fast": true,
    "show_limited_seats": true,
    "show_happening_soon": false,
    "show_sold_out": false,
    "show_last_chance": false,
    "remaining_count": 8,
    "hours_until_start": null,
    "last_calculated": "2024-01-15T10:00:00Z"
  }
}
```

**Urgency Badge Types:**

- **Selling Fast**: < 30% availability remaining
- **Limited Seats**: < 10 tickets left
- **Happening Soon**: Next session within 48 hours
- **Sold Out**: No tickets available
- **Last Chance**: Happening soon + limited seats

---

### Calculate Urgency (Cron Job)

```
POST /api/entertainment/urgency/calculate
```

**Headers:**

```
x-api-key: YOUR_CRON_API_KEY
```

**Response:**

```json
{
  "success": true,
  "message": "Urgency calculated for 150 items",
  "results": []
}
```

---

## Waitlist

### Get User Waitlist

```
GET /api/entertainment/waitlist
```

**Response:**

```json
{
  "waitlist": [
    {
      "id": "uuid",
      "item_id": "uuid",
      "session_id": "uuid",
      "position": 15,
      "status": "waiting",
      "notify_via": "email",
      "created_at": "2024-01-15T10:00:00Z",
      "item": {},
      "session": {}
    }
  ],
  "total": 3
}
```

---

### Join Waitlist

```
POST /api/entertainment/waitlist
```

**Request Body:**

```json
{
  "item_id": "uuid",
  "session_id": "uuid",
  "email": "john@example.com",
  "phone": "+1234567890",
  "notify_via": "email"
}
```

---

### Leave Waitlist

```
DELETE /api/entertainment/waitlist/:itemId
```

---

## Authentication

All endpoints (except public discovery endpoints like search, categories, trending) require Clerk authentication.

**Headers:**

```
Authorization: Bearer <clerk_session_token>
```

**Error Responses:**

```json
{
  "error": "Unauthorized - Authentication required"
}
```

---

## Rate Limiting

- **Discovery APIs**: 100 requests/minute
- **Cart/Booking APIs**: 30 requests/minute
- **Write Operations**: 20 requests/minute

---

## Error Handling

**Standard Error Response:**

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

**HTTP Status Codes:**

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Database Schema

The entertainment service uses 16 tables:

1. `entertainment_categories` - Hierarchical categories
2. `entertainment_organizers` - Event organizers
3. `entertainment_items` - Events/attractions
4. `entertainment_sessions` - Date/time slots
5. `entertainment_ticket_types` - Ticket tiers (VIP, Regular, etc.)
6. `entertainment_cart` - Shopping carts
7. `entertainment_cart_items` - Items in cart
8. `entertainment_bookings` - Completed bookings
9. `entertainment_tickets` - Individual tickets with QR codes
10. `entertainment_wishlist` - User favorites
11. `entertainment_organizer_followers` - Social following
12. `entertainment_notifications` - User notifications
13. `entertainment_reviews` - User reviews
14. `entertainment_urgency_signals` - Scarcity badges
15. `entertainment_trending_cache` - Trending algorithm cache
16. `entertainment_waitlist` - Sold-out event waitlist

---

## Migration & Setup

See [migrations_v2_comprehensive.sql](./migrations_v2_comprehensive.sql) for complete database schema.
See [seed_data_v2.sql](./seed_data_v2.sql) for sample test data.

---

## Next Steps

1. Run migrations: Execute `migrations_v2_comprehensive.sql`
2. Seed data: Execute `seed_data_v2.sql`
3. Configure Clerk: Set up authentication
4. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `CRON_API_KEY` (for urgency calculation)
5. Test endpoints using the examples above

---

**Last Updated:** January 15, 2024
**Version:** 2.0.0
**Status:** Production Ready ✅
