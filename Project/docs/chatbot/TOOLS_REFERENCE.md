# TripC AI Chatbot - Tools Reference

Complete reference for all 40+ tools available to the AI chatbot.

## Table of Contents

1. [Authentication Tools](#authentication-tools)
2. [Hotel Tools](#hotel-tools)
3. [Flight Tools](#flight-tools)
4. [Restaurant Tools](#restaurant-tools)
5. [Venue Tools](#venue-tools)
6. [Ticket Tools](#ticket-tools)
7. [Transport Tools](#transport-tools)
8. [Shop Tools](#shop-tools)
9. [Voucher Tools](#voucher-tools)
10. [Promotion Tools](#promotion-tools)
11. [Payment Tools](#payment-tools)

---

## Authentication Tools

### `check_auth_status`

Check if the user is currently logged in.

**Parameters:** None

**Returns:**

```json
{
  "authenticated": true,
  "userId": "clerk-user-id",
  "message": "User is authenticated."
}
```

**When to Use:**

- Before any booking operation
- To personalize recommendations
- To access user-specific data

**Example Conversation:**

```
User: Book a hotel in Bangkok
AI: [calls check_auth_status()]
AI: I'll help you book a hotel! Let me search for options in Bangkok...
```

---

### `get_user_profile`

Get the current user's profile information.

**Parameters:** None

**Returns:**

```json
{
  "success": true,
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "membership_tier": "gold",
    "tcent_balance": 5000,
    "joined_date": "2025-01-15T00:00:00Z"
  }
}
```

**Use Cases:**

- Display personalized greetings
- Check T₵ent balance for voucher purchases
- Offer tier-specific benefits

---

## Hotel Tools

### `search_hotels`

Search for hotels by location, dates, and preferences.

**Parameters:**

- `location` (required): City or location name
- `checkin_date` (required): Check-in date (YYYY-MM-DD)
- `checkout_date` (required): Check-out date (YYYY-MM-DD)
- `guests` (optional): Number of guests (default: 2)
- `min_price` (optional): Minimum price per night
- `max_price` (optional): Maximum price per night
- `min_rating` (optional): Minimum rating (1-5)
- `amenities` (optional): Array of required amenities

**Returns:**

```json
{
  "success": true,
  "count": 5,
  "hotels": [
    {
      "id": "hotel-123",
      "name": "Luxury Beach Resort",
      "location": "Da Nang, Vietnam",
      "price_per_night": 120,
      "rating": 4.8,
      "amenities": ["pool", "wifi", "restaurant"],
      "image_url": "https://..."
    }
  ]
}
```

**Example:**

```typescript
search_hotels({
  location: "Da Nang",
  checkin_date: "2026-02-01",
  checkout_date: "2026-02-05",
  min_rating: 4.0,
  max_price: 200,
});
```

---

### `get_hotel_details`

Get detailed information about a specific hotel.

**Parameters:**

- `hotel_id` (required): The unique ID of the hotel

**Returns:**

```json
{
  "success": true,
  "hotel": {
    "id": "hotel-123",
    "name": "Luxury Beach Resort",
    "description": "5-star beachfront resort...",
    "amenities": ["pool", "spa", "wifi"],
    "policies": {
      "check_in": "14:00",
      "check_out": "12:00",
      "cancellation": "Free cancellation up to 24h"
    },
    "room_types": [...]
  }
}
```

---

### `get_hotel_reviews`

Fetch reviews for a specific hotel.

**Parameters:**

- `hotel_id` (required): The unique ID of the hotel
- `limit` (optional): Max reviews to return (default: 10)

**Returns:**

```json
{
  "success": true,
  "count": 10,
  "reviews": [
    {
      "rating": 5,
      "comment": "Amazing stay! Beautiful beach view.",
      "author": "Sarah M.",
      "created_at": "2026-01-20T00:00:00Z"
    }
  ]
}
```

---

### `check_room_availability`

Check if specific rooms are available for given dates.

**Parameters:**

- `hotel_id` (required): Hotel ID
- `room_type` (required): Room type (e.g., "deluxe", "suite")
- `checkin_date` (required): Check-in date
- `checkout_date` (required): Check-out date

**Returns:**

```json
{
  "success": true,
  "available": true,
  "message": "Room is available for the selected dates"
}
```

---

### `create_hotel_booking`

Create a hotel booking (requires authentication).

**Parameters:**

- `hotel_id` (required): Hotel ID
- `room_type` (required): Room type to book
- `checkin_date` (required): Check-in date
- `checkout_date` (required): Check-out date
- `guests` (required): Number of guests
- `special_requests` (optional): Special requests

**Returns:**

```json
{
  "success": true,
  "booking_id": "booking-uuid",
  "confirmation_number": "A1B2C3D4",
  "hotel_name": "Luxury Beach Resort",
  "checkin": "2026-02-01",
  "checkout": "2026-02-05",
  "nights": 4,
  "total_price": 480,
  "status": "pending",
  "message": "Booking created successfully! Please complete payment."
}
```

---

## Flight Tools

### `search_flights`

Search for flights between two locations.

**Parameters:**

- `origin` (required): Origin airport code or city
- `destination` (required): Destination airport code or city
- `departure_date` (required): Departure date (YYYY-MM-DD)
- `return_date` (optional): Return date for round-trip
- `passengers` (optional): Number of passengers (default: 1)
- `class` (optional): "economy" | "business" | "first"
- `max_price` (optional): Maximum price per person

**Returns:**

```json
{
  "success": true,
  "count": 8,
  "flights": [
    {
      "id": "flight-456",
      "airline": "Vietnam Airlines",
      "flight_number": "VN123",
      "origin": "SGN",
      "destination": "HAN",
      "departure_time": "2026-02-01T08:00:00Z",
      "arrival_time": "2026-02-01T10:15:00Z",
      "duration": "2h 15m",
      "price": 150,
      "available_seats": 45
    }
  ]
}
```

---

### `create_flight_booking`

Book a flight (requires authentication).

**Parameters:**

- `flight_id` (required): Flight ID
- `passengers` (required): Array of passenger information
  - `first_name`: Passenger first name
  - `last_name`: Passenger last name
  - `date_of_birth`: Date of birth (YYYY-MM-DD)
  - `passport_number` (optional): Passport number
- `contact_email` (required): Contact email
- `contact_phone` (required): Contact phone

**Returns:**

```json
{
  "success": true,
  "booking_id": "booking-uuid",
  "confirmation_number": "VN123XYZ",
  "flight_number": "VN123",
  "airline": "Vietnam Airlines",
  "route": "SGN → HAN",
  "departure": "2026-02-01T08:00:00Z",
  "passengers": 2,
  "total_price": 300,
  "status": "pending"
}
```

---

## Restaurant Tools

### `search_restaurants`

Search for restaurants by location and preferences.

**Parameters:**

- `location` (required): City or area name
- `cuisine` (optional): Cuisine type
- `date` (optional): Reservation date
- `time` (optional): Reservation time
- `party_size` (optional): Number of people
- `price_range` (optional): "budget" | "moderate" | "fine-dining"
- `min_rating` (optional): Minimum rating

**Returns:**

```json
{
  "success": true,
  "count": 6,
  "restaurants": [
    {
      "id": "restaurant-789",
      "name": "Golden Dragon",
      "cuisine": ["Chinese", "Dim Sum"],
      "location": "Bangkok, Thailand",
      "price_range": "moderate",
      "rating": 4.7,
      "image_url": "https://..."
    }
  ]
}
```

---

### `create_restaurant_booking`

Book a restaurant table (requires authentication).

**Parameters:**

- `restaurant_id` (required): Restaurant ID
- `date` (required): Reservation date (YYYY-MM-DD)
- `time` (required): Reservation time (HH:MM)
- `party_size` (required): Number of people
- `special_requests` (optional): Dietary requirements, etc.

**Returns:**

```json
{
  "success": true,
  "booking_id": "reservation-uuid",
  "confirmation_number": "GD789ABC",
  "restaurant_name": "Golden Dragon",
  "date": "2026-02-01",
  "time": "19:00",
  "party_size": 4,
  "status": "pending"
}
```

---

## Venue Tools (Spa/Wellness/Beauty/Entertainment)

### `search_venues`

Search for spa, wellness, beauty, or entertainment venues.

**Parameters:**

- `location` (required): City or area
- `category` (required): "spa" | "wellness" | "beauty" | "entertainment"
- `date` (optional): Service date
- `min_rating` (optional): Minimum rating
- `price_range` (optional): "budget" | "moderate" | "premium"

---

### `create_venue_booking`

Book a service at a venue (requires authentication).

**Parameters:**

- `venue_id` (required): Venue ID
- `service_id` (required): Specific service to book
- `date` (required): Service date
- `time` (required): Service time
- `duration` (optional): Duration in minutes
- `notes` (optional): Additional preferences

---

## Ticket Tools (Tours/Activities/Attractions)

### `search_tickets`

Search for tours, activities, attractions, or events.

**Parameters:**

- `location` (required): City or area
- `category` (optional): "tour" | "activity" | "attraction" | "event"
- `date` (optional): Event/activity date
- `min_rating` (optional): Minimum rating
- `max_price` (optional): Maximum price per ticket

---

### `create_ticket_booking`

Book tickets (requires authentication).

**Parameters:**

- `ticket_id` (required): Ticket/event ID
- `date` (required): Date of visit
- `quantity` (required): Number of tickets
- `time_slot` (optional): Preferred time slot

---

## Transport Tools

### `search_transport`

Search for transport services.

**Parameters:**

- `service_type` (required): "airport-transfer" | "taxi" | "car-rental" | "private-driver"
- `pickup_location` (required): Pickup address
- `dropoff_location` (optional): Drop-off address
- `date` (required): Service date
- `time` (required): Pickup time
- `passengers` (optional): Number of passengers
- `luggage` (optional): Number of luggage pieces

---

### `create_transport_booking`

Book transport (requires authentication).

**Parameters:**

- `transport_id` (required): Transport option ID
- `pickup_location` (required): Pickup address
- `dropoff_location` (optional): Drop-off address
- `date` (required): Service date
- `time` (required): Pickup time
- `passengers` (required): Number of passengers
- `contact_phone` (required): Contact phone
- `flight_number` (optional): For airport transfers

---

## Shop Tools

### `search_products`

Search for products in the TripC shop.

**Parameters:**

- `query` (optional): Search query
- `category` (optional): Product category
- `min_price` (optional): Minimum price
- `max_price` (optional): Maximum price
- `min_rating` (optional): Minimum rating
- `brand` (optional): Filter by brand

---

### `create_product_order`

Order products (requires authentication).

**Parameters:**

- `product_id` (required): Product ID
- `quantity` (required): Quantity to order
- `variant` (optional): Product variant (size, color)
- `shipping_address` (required): Shipping address object

---

## Voucher Tools

### `search_vouchers`

Search for available vouchers and gift cards.

**Parameters:**

- `category` (optional): Voucher category
- `min_value` (optional): Minimum value
- `max_value` (optional): Maximum value

---

### `purchase_voucher`

Purchase a voucher (requires authentication and sufficient T₵ent).

**Parameters:**

- `voucher_id` (required): Voucher ID
- `quantity` (optional): Number of vouchers
- `recipient_email` (optional): For gift vouchers
- `personal_message` (optional): Gift message

**Returns:**

```json
{
  "success": true,
  "purchase_id": "purchase-uuid",
  "voucher_name": "Spa Day Package",
  "quantity": 1,
  "tcent_spent": 500,
  "remaining_balance": 4500,
  "message": "Voucher purchased successfully!"
}
```

---

## Promotion Tools

### `get_active_promotions`

Get all currently active promotions.

**Parameters:**

- `limit` (optional): Max promotions to return (default: 20)

**Returns:**

```json
{
  "success": true,
  "count": 15,
  "promotions": [
    {
      "id": "promo-123",
      "title": "20% Off All Hotels",
      "description": "Book any hotel and save 20%",
      "service_type": "hotel",
      "discount_percentage": 20,
      "valid_until": "2026-03-01T00:00:00Z",
      "code": "HOTEL20"
    }
  ]
}
```

---

### `get_promotions_by_type`

Get promotions for a specific service type.

**Parameters:**

- `service_type` (required): Service type to filter

---

## Payment Tools

### `create_payment_link`

Create a payment link for a booking.

**Parameters:**

- `booking_id` (required): Booking ID
- `booking_type` (required): Type of booking

**Returns:**

```json
{
  "success": true,
  "payment_link": "https://tripc.app/payment/booking-uuid",
  "booking_id": "booking-uuid",
  "amount": 480,
  "currency": "USD",
  "message": "Payment link created successfully"
}
```

---

## Tool Usage Best Practices

### 1. Always Check Authentication

Before any booking operation:

```typescript
const authStatus = await check_auth_status();
if (!authStatus.authenticated) {
  return "Please sign in to make bookings";
}
```

### 2. Chain Tools for Complex Tasks

```typescript
// 1. Search hotels
const hotels = await search_hotels({...})

// 2. Show top 3 options to user
// User selects one

// 3. Check room availability
const available = await check_room_availability({...})

// 4. If available, create booking
const booking = await create_hotel_booking({...})

// 5. Create payment link
const payment = await create_payment_link({...})
```

### 3. Handle Errors Gracefully

```typescript
const result = await search_hotels({...})
if (result.error) {
  return "I couldn't find any hotels. Try different dates?"
}
```

### 4. Provide Context

Always explain what you're doing:

```
"Let me search for hotels in Da Nang..."
[calls search_hotels]
"I found 5 great options! Here are the top 3..."
```

### 5. Confirm Before Booking

```
"Great choice! I'll book the Luxury Beach Resort for:
- Check-in: Feb 1, 2026
- Check-out: Feb 5, 2026
- 2 guests
- Total: $480

Shall I proceed with the booking?"
```

---

## Error Handling

### Common Error Responses

```json
{
  "error": "Failed to search hotels",
  "details": "Database connection failed"
}
```

### How AI Should Handle Errors

1. **Parse the error**
2. **Explain in friendly terms**
3. **Offer alternatives**

Example:

```
"I'm having trouble connecting to our hotel database right now.
Would you like to try searching for flights instead, or shall
we try hotels again in a moment?"
```

---

## Performance Tips

1. **Limit search results** - Use `limit` parameter (default: 10)
2. **Cache frequently accessed data** - Hotel/flight details
3. **Batch operations** - Multiple bookings in sequence
4. **Timeout handling** - Gracefully handle slow responses

---

## Security Considerations

1. **Never expose sensitive data** - Passport numbers, payment info
2. **Validate all inputs** - Zod schemas handle this automatically
3. **Check permissions** - RLS policies protect user data
4. **Rate limit** - Prevent abuse of expensive operations

---

For implementation details, see:

- [Architecture](./ARCHITECTURE.md)
- [API Reference](./API_REFERENCE.md)
- [README](./README.md)
