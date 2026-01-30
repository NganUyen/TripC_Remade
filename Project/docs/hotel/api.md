# Hotel Service API Reference

Complete REST API documentation for the Hotel Service MVP.

## 🔐 Authentication

### Public Endpoints

No authentication required. Anyone can search and browse hotels.

### Protected Endpoints

Require Clerk authentication. Client must send JWT token:

```http
Authorization: Bearer <clerk_jwt_token>
```

Server verifies token using `@clerk/nextjs/server`:

```typescript
import { verifyClerkAuth } from "@/lib/hotel/clerkAuth";

const user = await verifyClerkAuth(); // Throws if unauthorized
```

---

## 📍 Endpoints Overview

| Method | Endpoint                   | Auth      | Description              |
| ------ | -------------------------- | --------- | ------------------------ |
| GET    | `/api/hotels`              | Public    | List hotels with filters |
| POST   | `/api/hotels`              | Protected | Create a new hotel       |
| GET    | `/api/hotels/[slug]`       | Public    | Get hotel details        |
| GET    | `/api/hotels/[slug]/rooms` | Public    | List rooms for a hotel   |
| POST   | `/api/hotels/[slug]/rooms` | Protected | Create a room            |
| GET    | `/api/hotels/[slug]/rates` | Public    | Get rates by date range  |
| POST   | `/api/hotels/bookings`     | Protected | Create a booking         |

---

## 1. List Hotels

### `GET /api/hotels`

Search and filter available hotels.

#### Query Parameters

| Parameter    | Type   | Required | Description                              |
| ------------ | ------ | -------- | ---------------------------------------- |
| `query`      | string | No       | Search in title and description          |
| `city`       | string | No       | Filter by city                           |
| `country`    | string | No       | Filter by country code (e.g., 'TH')      |
| `min_rating` | number | No       | Minimum rating (0-5)                     |
| `limit`      | number | No       | Results per page (default: 20, max: 100) |
| `offset`     | number | No       | Pagination offset (default: 0)           |

#### Example Request

```bash
curl -X GET "http://localhost:3000/api/hotels?city=Bangkok&min_rating=4&limit=10"
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "slug": "luxury-bangkok-hotel",
      "title": "Luxury Bangkok Hotel",
      "description": "5-star luxury hotel in the heart of Bangkok...",
      "address": "123 Sukhumvit Road",
      "city": "Bangkok",
      "country": "TH",
      "latitude": 13.7563,
      "longitude": 100.5018,
      "rating": 4.8,
      "star_rating": 5,
      "amenities": ["wifi", "pool", "gym", "spa", "restaurant"],
      "images": [
        {
          "url": "https://example.com/hotel1.jpg",
          "alt": "Hotel exterior",
          "caption": "Luxury Bangkok Hotel"
        }
      ],
      "policies": {
        "check_in": "14:00",
        "check_out": "12:00",
        "cancellation": "Free cancellation up to 24 hours before check-in"
      },
      "contact": {
        "phone": "+66-2-123-4567",
        "email": "info@luxurybangkok.com",
        "website": "https://luxurybangkok.com"
      },
      "status": "active",
      "created_at": "2025-01-15T10:00:00.000Z",
      "updated_at": "2025-01-30T15:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 10,
    "offset": 0,
    "has_more": true
  }
}
```

#### Error Responses

**500 Internal Server Error**

```json
{
  "error": "Internal server error",
  "message": "Database query failed"
}
```

---

## 2. Create Hotel

### `POST /api/hotels`

Create a new hotel listing. **Requires authentication.**

#### Request Body

```json
{
  "slug": "new-hotel-bangkok",
  "title": "New Hotel Bangkok",
  "description": "Modern boutique hotel...",
  "address": "456 Silom Road",
  "city": "Bangkok",
  "country": "TH",
  "latitude": 13.7563,
  "longitude": 100.5018,
  "star_rating": 4,
  "amenities": ["wifi", "pool", "gym"],
  "images": [
    {
      "url": "https://example.com/hotel.jpg",
      "alt": "Hotel exterior"
    }
  ],
  "policies": {
    "check_in": "14:00",
    "check_out": "11:00"
  },
  "contact": {
    "phone": "+66-2-987-6543",
    "email": "info@newhotel.com"
  }
}
```

#### Required Fields

- `slug` (unique, URL-friendly)
- `title`
- `address`
- `city`
- `country`

#### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "987fcdeb-51a2-43d7-9876-543210fedcba",
    "slug": "new-hotel-bangkok",
    "title": "New Hotel Bangkok",
    ...
  },
  "message": "Hotel created successfully"
}
```

#### Error Responses

**401 Unauthorized**

```json
{
  "error": "Unauthorized",
  "message": "Authentication required to create hotels"
}
```

**400 Bad Request**

```json
{
  "error": "Missing required fields",
  "message": "slug, title, address, city, and country are required"
}
```

**409 Conflict**

```json
{
  "error": "Duplicate slug",
  "message": "A hotel with this slug already exists"
}
```

---

## 3. Get Hotel Details

### `GET /api/hotels/[slug]`

Retrieve detailed information about a specific hotel, including rooms and reviews.

#### Example Request

```bash
curl -X GET "http://localhost:3000/api/hotels/luxury-bangkok-hotel"
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "slug": "luxury-bangkok-hotel",
    "title": "Luxury Bangkok Hotel",
    "description": "5-star luxury hotel...",
    "address": "123 Sukhumvit Road",
    "city": "Bangkok",
    "country": "TH",
    "rating": 4.8,
    "star_rating": 5,
    "amenities": ["wifi", "pool", "gym", "spa"],
    "images": [...],
    "policies": {...},
    "contact": {...},
    "rooms": [
      {
        "id": "room-uuid-1",
        "code": "DELUXE_KING",
        "title": "Deluxe King Room",
        "description": "Spacious room with king bed...",
        "capacity": 2,
        "bed_type": "King",
        "bed_count": 1,
        "size_sqm": 35,
        "amenities": ["wifi", "tv", "minibar"],
        "images": [...],
        "max_adults": 2,
        "max_children": 1,
        "status": "active"
      }
    ],
    "reviews": {
      "items": [
        {
          "id": "review-uuid-1",
          "user_id": "user_123",
          "overall_rating": 5,
          "cleanliness_rating": 5,
          "comfort_rating": 5,
          "review_text": "Amazing stay! Highly recommended.",
          "created_at": "2025-01-20T10:00:00.000Z"
        }
      ],
      "count": 15,
      "average_rating": 4.7
    },
    "created_at": "2025-01-15T10:00:00.000Z",
    "updated_at": "2025-01-30T15:30:00.000Z"
  }
}
```

#### Error Responses

**404 Not Found**

```json
{
  "error": "Hotel not found"
}
```

---

## 4. List Rooms

### `GET /api/hotels/[slug]/rooms`

Get all available room types for a hotel.

#### Example Request

```bash
curl -X GET "http://localhost:3000/api/hotels/luxury-bangkok-hotel/rooms"
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "room-uuid-1",
      "hotel_id": "hotel-uuid",
      "code": "DELUXE_KING",
      "title": "Deluxe King Room",
      "description": "Spacious 35 sqm room...",
      "capacity": 2,
      "bed_type": "King",
      "bed_count": 1,
      "size_sqm": 35,
      "amenities": ["wifi", "tv", "minibar", "safe"],
      "images": [
        {
          "url": "https://example.com/deluxe-king.jpg",
          "alt": "Deluxe King Room"
        }
      ],
      "max_adults": 2,
      "max_children": 1,
      "status": "active",
      "created_at": "2025-01-15T10:00:00.000Z",
      "updated_at": "2025-01-30T15:30:00.000Z"
    }
  ]
}
```

---

## 5. Create Room

### `POST /api/hotels/[slug]/rooms`

Add a new room type to a hotel. **Requires authentication.**

#### Request Body

```json
{
  "code": "SUPERIOR_TWIN",
  "title": "Superior Twin Room",
  "description": "Comfortable room with twin beds",
  "capacity": 2,
  "bed_type": "Twin",
  "bed_count": 2,
  "size_sqm": 30,
  "amenities": ["wifi", "tv", "desk"],
  "max_adults": 2,
  "max_children": 1
}
```

#### Required Fields

- `code` (unique per hotel)
- `title`

#### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "new-room-uuid",
    "hotel_id": "hotel-uuid",
    "code": "SUPERIOR_TWIN",
    "title": "Superior Twin Room",
    ...
  },
  "message": "Room created successfully"
}
```

#### Error Responses

**409 Conflict**

```json
{
  "error": "Duplicate room code",
  "message": "A room with this code already exists for this hotel"
}
```

---

## 6. Get Rates

### `GET /api/hotels/[slug]/rates`

Fetch available rates for hotel rooms within a date range.

#### Query Parameters

| Parameter | Type          | Required | Description             |
| --------- | ------------- | -------- | ----------------------- |
| `start`   | string        | Yes      | Start date (YYYY-MM-DD) |
| `end`     | string        | Yes      | End date (YYYY-MM-DD)   |
| `room_id` | string (UUID) | No       | Filter by specific room |

#### Example Request

```bash
curl -X GET "http://localhost:3000/api/hotels/luxury-bangkok-hotel/rates?start=2025-02-01&end=2025-02-05"
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "rates": [
      {
        "id": "rate-uuid-1",
        "room_id": "room-uuid-1",
        "date": "2025-02-01",
        "price_cents": 15000,
        "available_rooms": 5,
        "min_nights": 1,
        "max_nights": null,
        "room": {
          "id": "room-uuid-1",
          "code": "DELUXE_KING",
          "title": "Deluxe King Room",
          ...
        }
      },
      {
        "id": "rate-uuid-2",
        "room_id": "room-uuid-1",
        "date": "2025-02-02",
        "price_cents": 15000,
        "available_rooms": 3,
        "min_nights": 1,
        "room": {...}
      }
    ],
    "rates_by_room": {
      "room-uuid-1": [
        { "date": "2025-02-01", "price_cents": 15000, ... },
        { "date": "2025-02-02", "price_cents": 15000, ... }
      ],
      "room-uuid-2": [...]
    },
    "summary": {
      "total_rooms_available": 2,
      "date_range": {
        "start": "2025-02-01",
        "end": "2025-02-05"
      },
      "lowest_rate": 12000,
      "highest_rate": 35000
    }
  }
}
```

#### Error Responses

**400 Bad Request**

```json
{
  "error": "Missing date parameters",
  "message": "start and end dates are required (YYYY-MM-DD format)"
}
```

**400 Bad Request**

```json
{
  "error": "Invalid date range",
  "message": "End date must be after start date"
}
```

---

## 7. Create Booking

### `POST /api/hotels/bookings`

Create a new hotel booking. **Requires authentication.**

#### Request Body

```json
{
  "hotel_id": "123e4567-e89b-12d3-a456-426614174000",
  "room_id": "room-uuid-1",
  "check_in_date": "2025-02-15",
  "check_out_date": "2025-02-18",
  "guest_info": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567"
  },
  "special_requests": "Late check-in, room on high floor"
}
```

#### Required Fields

- `hotel_id`
- `room_id`
- `check_in_date` (YYYY-MM-DD)
- `check_out_date` (YYYY-MM-DD)
- `guest_info` (object with first_name, last_name, email)

#### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "hotel_id": "hotel-uuid",
    "room_id": "room-uuid",
    "user_id": "user_2abc123xyz",
    "confirmation_code": "HB-X7Y2K9P4",
    "check_in_date": "2025-02-15",
    "check_out_date": "2025-02-18",
    "nights": 3,
    "guest_info": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-123-4567"
    },
    "special_requests": "Late check-in, room on high floor",
    "total_price_cents": 45000,
    "status": "pending",
    "hotel_name": "Luxury Bangkok Hotel",
    "room_name": "Deluxe King Room",
    "created_at": "2025-02-01T14:30:00.000Z",
    "updated_at": "2025-02-01T14:30:00.000Z"
  },
  "message": "Booking created successfully"
}
```

#### Error Responses

**401 Unauthorized**

```json
{
  "error": "Unauthorized",
  "message": "Authentication required to create bookings"
}
```

**400 Bad Request**

```json
{
  "error": "Missing required fields",
  "message": "hotel_id, room_id, check_in_date, check_out_date, and guest_info are required"
}
```

**400 Bad Request**

```json
{
  "error": "Invalid dates",
  "message": "Check-out date must be after check-in date"
}
```

**400 Bad Request**

```json
{
  "error": "Room not available",
  "message": "No rooms available on: 2025-02-16, 2025-02-17"
}
```

**404 Not Found**

```json
{
  "error": "Hotel not found"
}
```

**404 Not Found**

```json
{
  "error": "Room not found or does not belong to this hotel"
}
```

---

## 🧪 Testing with curl

### List Hotels

```bash
curl -X GET "http://localhost:3000/api/hotels?city=Bangkok&limit=5"
```

### Get Hotel Details

```bash
curl -X GET "http://localhost:3000/api/hotels/luxury-bangkok-hotel"
```

### Get Rooms

```bash
curl -X GET "http://localhost:3000/api/hotels/luxury-bangkok-hotel/rooms"
```

### Get Rates

```bash
curl -X GET "http://localhost:3000/api/hotels/luxury-bangkok-hotel/rates?start=2025-02-01&end=2025-02-05"
```

### Create Booking (with Clerk token)

```bash
curl -X POST "http://localhost:3000/api/hotels/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_JWT_TOKEN" \
  -d '{
    "hotel_id": "hotel-uuid-here",
    "room_id": "room-uuid-here",
    "check_in_date": "2025-02-15",
    "check_out_date": "2025-02-18",
    "guest_info": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+1-555-0000"
    }
  }'
```

---

## 📊 Rate Limiting

Consider implementing rate limiting for production:

```typescript
// Example with Upstash Redis
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 h"), // 100 requests per hour
  analytics: true,
});

// In API route
const { success } = await ratelimit.limit(identifier);
if (!success) {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 });
}
```

---

## 🔍 Error Code Reference

| Status | Code                  | Meaning                                          |
| ------ | --------------------- | ------------------------------------------------ |
| 200    | OK                    | Request successful                               |
| 201    | Created               | Resource created successfully                    |
| 400    | Bad Request           | Invalid request parameters                       |
| 401    | Unauthorized          | Authentication required or failed                |
| 404    | Not Found             | Resource not found                               |
| 409    | Conflict              | Duplicate resource (unique constraint violation) |
| 429    | Too Many Requests     | Rate limit exceeded                              |
| 500    | Internal Server Error | Server-side error                                |

---

## 📝 OpenAPI Specification

For a complete OpenAPI 3.0 specification, see [openapi.yaml](./openapi.yaml).

---

**API Version**: 1.0.0  
**Last Updated**: 2025-02-01  
**Base URL**: `https://tripc.com` (production) | `http://localhost:3000` (development)
