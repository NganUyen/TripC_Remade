# Dining Service API Documentation

## Overview

The Dining service provides a complete restaurant booking and review system matching the business flowchart requirements. It includes venue management, reservations, cart functionality, reviews, and availability checking.

## Architecture Alignment with Flowchart

### Main Page Flow

- ✅ **Hero and Search Form** → `GET /api/dining/venues` with search params
- ✅ **Display Restaurant List** → Returns paginated venues with filters
- ✅ **Show No Results Error** → Handled in frontend based on empty results
- ✅ **Venue Grid/List** → Includes ratings, reviews, images

### Restaurant Detail Page Flow

- ✅ **View Info/Photos/Location** → `GET /api/dining/venues/[id]`
- ✅ **View Menu Items** → `GET /api/dining/menus?venue_id=[id]`
- ✅ **View Reviews** → `GET /api/dining/venues/[id]/reviews`
- ✅ **Check Availability** → `GET /api/dining/venues/[id]/availability`
- ✅ **Fill Booking Form** → Frontend form
- ✅ **Add to Cart** → `POST /api/dining/cart`
- ✅ **Create Reservation** → `POST /api/dining/reservations`

### Cart/Booking Flow

- ✅ **View Cart** → `GET /api/dining/cart`
- ✅ **Update/Remove Items** → `PUT/DELETE /api/dining/cart/[id]`
- ✅ **Complete Booking** → `POST /api/dining/cart/checkout`
- ✅ **Send Confirmation** → Email/SMS notifications integrated
- ✅ **Confirmation Details** → Returns reservation codes and details

### Global Actions

- ✅ **Bookmark/Wishlist** → `POST /api/dining/wishlist`
- ✅ **Reviews** → `POST /api/dining/venues/[id]/reviews`
- ✅ **Share** → Can be implemented via frontend
- ⚠️ **Chat** → To be integrated with global chat service
- ⚠️ **Newsletter** → To be integrated with marketing service

## API Endpoints

### Venues

#### List Venues

```
GET /api/dining/venues
```

**Query Parameters:**

- `city` (string): Filter by city
- `district` (string): Filter by district
- `cuisine_type` (string): Comma-separated cuisine types
- `price_range` (string): budget|moderate|upscale|fine_dining
- `min_rating` (number): Minimum rating (1-5)
- `is_featured` (boolean): Featured venues only
- `search` (string): Text search in name/description
- `limit` (number): Results per page (default: 20)
- `offset` (number): Pagination offset

**Response:**

```json
{
  "success": true,
  "data": {
    "venues": [...],
    "total": 45,
    "limit": 20,
    "offset": 0
  }
}
```

#### Get Venue Details

```
GET /api/dining/venues/[id]
```

#### Get Featured Venues

```
GET /api/dining/venues/featured
```

#### Get Venue by Slug

```
GET /api/dining/venues/slug/[slug]
```

### Reviews

#### Get Venue Reviews

```
GET /api/dining/venues/[id]/reviews?limit=20&offset=0
```

**Response:**

```json
{
  "success": true,
  "data": {
    "reviews": [...],
    "stats": {
      "average_rating": 4.5,
      "total_reviews": 150,
      "rating_distribution": {
        "5": 80,
        "4": 45,
        "3": 15,
        "2": 7,
        "1": 3
      },
      "food_avg": 4.6,
      "service_avg": 4.4,
      "ambiance_avg": 4.5,
      "value_avg": 4.3
    }
  }
}
```

#### Create Review

```
POST /api/dining/venues/[id]/reviews
```

**Headers:**

- `x-user-id`: User authentication

**Body:**

```json
{
  "venue_id": "uuid",
  "rating": 5,
  "title": "Excellent experience!",
  "comment": "The food was amazing...",
  "food_rating": 5,
  "service_rating": 5,
  "ambiance_rating": 4,
  "value_rating": 5,
  "photos": ["url1", "url2"],
  "visit_date": "2026-01-15"
}
```

#### Mark Review Helpful

```
PUT /api/dining/reviews/[id]/helpful
```

### Cart

#### Get Cart

```
GET /api/dining/cart
```

**Headers:**

- `x-user-id`: User authentication

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [...],
    "count": 2
  }
}
```

#### Add to Cart

```
POST /api/dining/cart
```

**Body:**

```json
{
  "venue_id": "uuid",
  "reservation_date": "2026-02-20",
  "reservation_time": "19:00",
  "guest_count": 4,
  "special_requests": "Window seat please",
  "occasion": "birthday",
  "dietary_restrictions": ["vegetarian", "gluten_free"],
  "duration_minutes": 120
}
```

#### Update Cart Item

```
PUT /api/dining/cart/[id]
```

#### Remove from Cart

```
DELETE /api/dining/cart/[id]
```

#### Clear Cart

```
DELETE /api/dining/cart
```

#### Checkout Cart

```
POST /api/dining/cart/checkout
```

**Body:**

```json
{
  "guest_name": "John Doe",
  "guest_phone": "+1234567890",
  "guest_email": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "reservations": ["reservation-id-1", "reservation-id-2"],
    "errors": []
  },
  "message": "Successfully created 2 reservation(s)"
}
```

### Reservations

#### Create Reservation

```
POST /api/dining/reservations
```

**Headers:**

- `x-user-id`: User authentication

**Body:**

```json
{
  "venue_id": "uuid",
  "reservation_date": "2026-02-20",
  "reservation_time": "19:00",
  "guest_count": 4,
  "guest_name": "John Doe",
  "guest_phone": "+1234567890",
  "guest_email": "john@example.com",
  "special_requests": "Window seat",
  "occasion": "anniversary",
  "dietary_restrictions": ["vegan"],
  "duration_minutes": 120
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "reservation_code": "ABC12345",
    "status": "pending",
    ...
  }
}
```

#### Get User Reservations

```
GET /api/dining/reservations?limit=50
```

#### Get Reservation by ID

```
GET /api/dining/reservations/[id]
```

#### Update Reservation

```
PUT /api/dining/reservations/[id]
```

#### Cancel Reservation

```
DELETE /api/dining/reservations/[id]
```

#### Check Availability

```
GET /api/dining/reservations/check?venue_id=[id]&date=2026-02-20&time=19:00&guest_count=4
```

### Availability

#### Check Venue Availability

```
GET /api/dining/venues/[id]/availability?date=2026-02-20&time=19:00&guest_count=4
```

**Response:**

```json
{
  "success": true,
  "data": {
    "available": true,
    "capacity": 100,
    "available_capacity": 65,
    "current_reservations": 35,
    "time_slots": [...],
    "reason": null
  }
}
```

#### Get Time Slots

```
GET /api/dining/venues/[id]/timeslots?date=2026-02-20
```

**Response:**

```json
{
  "success": true,
  "data": {
    "date": "2026-02-20",
    "day_of_week": 5,
    "time_slots": [
      {
        "id": "uuid",
        "start_time": "17:00",
        "end_time": "22:00",
        "slot_duration_minutes": 30,
        "max_guests_per_slot": 50,
        "current_reservations": 3,
        "current_guests": 12,
        "available_capacity": 38,
        "is_fully_booked": false
      },
      ...
    ]
  }
}
```

### Menus

#### Get Venue Menus

```
GET /api/dining/menus?venue_id=[id]
```

#### Get Menu Items

```
GET /api/dining/menus/items?menu_id=[id]
```

### Wishlist

#### Get Wishlist

```
GET /api/dining/wishlist
```

**Headers:**

- `x-user-id`: User authentication

#### Add to Wishlist

```
POST /api/dining/wishlist
```

**Body:**

```json
{
  "venue_id": "uuid",
  "notes": "Want to try this place"
}
```

#### Remove from Wishlist

```
DELETE /api/dining/wishlist/[id]
```

## Notifications

The system automatically sends notifications for:

- ✅ Reservation confirmation (Email + SMS)
- ✅ Reservation cancellation (Email + SMS)
- ⚠️ Reservation reminder (24h before) - To be scheduled
- ⚠️ Status updates - To be implemented

## Database Schema

All tables are documented in `/docs/dining/schema.sql`:

- ✅ `dining_venues` - Restaurant information
- ✅ `dining_menus` - Menu categories
- ✅ `dining_menu_items` - Menu items
- ✅ `dining_tables` - Table management
- ✅ `dining_reservations` - Booking records
- ✅ `dining_reviews` - Customer reviews
- ✅ `dining_cart` - Shopping cart for reservations
- ✅ `dining_time_slots` - Available time slots
- ✅ `dining_blocked_dates` - Closed dates
- ✅ `dining_wishlist` - User bookmarks

## Service Layer

Location: `/lib/dining/services/`

- ✅ `venueService.ts` - Venue CRUD and search
- ✅ `menuService.ts` - Menu management
- ✅ `reservationService.ts` - Reservation management with notifications
- ✅ `reviewService.ts` - Review system with statistics
- ✅ `cartService.ts` - Cart and checkout flow
- ✅ `notificationService.ts` - Email/SMS notifications

## Business Flow Coverage

### Completed ✅

1. **Main Page Flow**
   - Search and filter venues
   - Display restaurant list with pagination
   - Featured venues
   - City/cuisine filtering

2. **Restaurant Detail Flow**
   - View venue details
   - Browse menu items
   - Read reviews and ratings
   - Check availability
   - Make reservations

3. **Cart Flow**
   - Add multiple reservations to cart
   - Update cart items
   - Remove from cart
   - Checkout with batch reservation creation
   - Availability validation

4. **Review System**
   - Create reviews with detailed ratings
   - View aggregated statistics
   - Mark reviews as helpful
   - Venue response capability

5. **Notifications**
   - Email confirmations
   - SMS confirmations
   - Cancellation notifications

6. **Wishlist**
   - Save favorite venues
   - Manage bookmarks

### To Be Implemented ⚠️

1. **Real-time Chat Integration** - Integrate with global chat service
2. **Reminder System** - Schedule 24h reminders (cron job needed)
3. **Analytics** - Booking analytics and insights
4. **Payment Integration** - Deposit handling for reservations
5. **Table Assignment** - Automatic table assignment algorithm
6. **Waitlist** - Waitlist functionality for fully booked slots

## Testing Endpoints

Use the `/ping` page to test all dining endpoints:

- Health check for dining database
- Venue search
- Featured venues
- Cart operations
- Availability checks

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

Common error codes:

- `400` - Bad request (missing/invalid parameters)
- `401` - Unauthorized (missing authentication)
- `404` - Resource not found
- `500` - Internal server error

## Authentication

Currently using header-based authentication:

- Header: `x-user-id`
- To be replaced with Clerk JWT tokens

## Next Steps

1. Implement automated reminder system
2. Add payment gateway integration for deposits
3. Build analytics dashboard
4. Integrate with global chat service
5. Add social sharing endpoints
6. Implement automatic table assignment
7. Add waitlist functionality
