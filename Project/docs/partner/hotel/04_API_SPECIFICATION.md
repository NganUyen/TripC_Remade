# Hotel Partner API Specification

## 📡 API Overview

This document specifies all API endpoints for the Hotel Partner Portal.

**Base URL**: `https://tripc.com/api/partner/hotel`

**Authentication**: Bearer token (JWT)

**Content-Type**: `application/json`

**Rate Limiting**: 
- Standard: 100 requests/minute
- Burst: 200 requests/minute
- Webhooks: No limit

---

## 🔐 Authentication

### Login

```http
POST /api/partner/auth/login
```

**Request Body**:
```json
{
  "email": "partner@hotel.com",
  "password": "securePassword123"
}
```

**Response**: 
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "refresh_token_string",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "email": "partner@hotel.com",
      "name": "John Doe",
      "partner_id": "partner_uuid",
      "role": "admin",
      "permissions": ["hotels:read", "hotels:write", "bookings:read"]
    }
  }
}
```

---

## 1. Hotel Management APIs

### List Hotels

```http
GET /api/partner/hotels
```

**Query Parameters**:
- `status` (optional): Filter by status (draft, active, inactive)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Items per page

**Headers**:
```
Authorization: Bearer {token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "hotels": [
      {
        "id": "uuid",
        "slug": "luxury-hotel-hanoi",
        "name": "Luxury Hotel Hanoi",
        "address": {
          "line1": "123 Main Street",
          "city": "Hanoi",
          "country": "VN"
        },
        "star_rating": 5,
        "status": "active",
        "images": ["url1", "url2"],
        "room_count": 25,
        "active_bookings": 12,
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-02-08T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

### Get Hotel Details

```http
GET /api/partner/hotels/:id
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "luxury-hotel-hanoi",
    "name": "Luxury Hotel Hanoi",
    "description": "Full hotel description...",
    "address": {
      "line1": "123 Main Street",
      "city": "Hanoi",
      "country": "VN",
      "postal_code": "100000",
      "coordinates": {
        "lat": 21.0285,
        "lng": 105.8542
      }
    },
    "star_rating": 5,
    "amenities": ["wifi", "pool", "gym", "restaurant"],
    "images": [
      {
        "url": "https://cdn.tripc.com/hotels/...",
        "caption": "Exterior view",
        "is_primary": true
      }
    ],
    "policies": {
      "check_in_time": "14:00",
      "check_out_time": "12:00",
      "cancellation_policy": "flexible",
      "children_policy": "Children of all ages welcome",
      "pet_policy": "Pets not allowed"
    },
    "contact": {
      "phone": "+84-24-1234-5678",
      "email": "info@luxuryhotel.com",
      "website": "https://luxuryhotel.com"
    },
    "status": "active",
    "room_types": 5,
    "total_rooms": 120,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-02-08T00:00:00Z"
  }
}
```

### Create Hotel

```http
POST /api/partner/hotels
```

**Request Body**:
```json
{
  "name": "New Luxury Hotel",
  "slug": "new-luxury-hotel",
  "description": "A beautiful hotel...",
  "address": {
    "line1": "456 Beach Road",
    "city": "Da Nang",
    "country": "VN",
    "postal_code": "550000"
  },
  "star_rating": 4,
  "amenities": ["wifi", "pool", "restaurant", "bar"],
  "policies": {
    "check_in_time": "14:00",
    "check_out_time": "12:00",
    "cancellation_policy": "moderate"
  },
  "contact": {
    "phone": "+84-236-1234-567",
    "email": "info@newhotel.com"
  }
}
```

**Response**: (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "new_hotel_uuid",
    "slug": "new-luxury-hotel",
    "name": "New Luxury Hotel",
    "status": "draft",
    "created_at": "2026-02-08T12:00:00Z"
  }
}
```

### Update Hotel

```http
PATCH /api/partner/hotels/:id
```

**Request Body**: (partial update allowed)
```json
{
  "description": "Updated description...",
  "amenities": ["wifi", "pool", "gym", "spa"],
  "star_rating": 5
}
```

**Response**: (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "updated_at": "2026-02-08T12:30:00Z",
    "changes": ["description", "amenities", "star_rating"]
  }
}
```

### Upload Hotel Photos

```http
POST /api/partner/hotels/:id/photos
```

**Content-Type**: `multipart/form-data`

**Request Body**:
```
file: [image file]
caption: "Lobby view"
category: "lobby"
is_primary: false
```

**Response**: (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "photo_uuid",
    "url": "https://cdn.tripc.com/hotels/...",
    "thumbnail_url": "https://cdn.tripc.com/hotels/.../thumb.jpg",
    "caption": "Lobby view",
    "category": "lobby",
    "is_primary": false,
    "uploaded_at": "2026-02-08T13:00:00Z"
  }
}
```

---

## 2. Room Management APIs

### List Rooms

```http
GET /api/partner/hotels/:hotel_id/rooms
```

**Query Parameters**:
- `status` (optional): Filter by status

**Response**:
```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": "uuid",
        "hotel_id": "hotel_uuid",
        "code": "DLX-001",
        "title": "Deluxe Room",
        "description": "Spacious room with...",
        "capacity": 2,
        "max_adults": 2,
        "max_children": 1,
        "bed_type": "King",
        "bed_count": 1,
        "size_sqm": 35,
        "amenities": ["wifi", "tv", "minibar"],
        "images": ["url1", "url2"],
        "status": "active",
        "base_rate_cents": 15000,
        "total_inventory": 20,
        "created_at": "2026-01-15T00:00:00Z"
      }
    ]
  }
}
```

### Create Room

```http
POST /api/partner/hotels/:hotel_id/rooms
```

**Request Body**:
```json
{
  "code": "STE-001",
  "title": "Executive Suite",
  "description": "Luxurious suite with separate living area",
  "capacity": 4,
  "max_adults": 3,
  "max_children": 1,
  "bed_type": "King",
  "bed_count": 1,
  "size_sqm": 65,
  "amenities": ["wifi", "tv", "minibar", "coffee_maker", "balcony"],
  "total_inventory": 5
}
```

**Response**: (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "room_uuid",
    "code": "STE-001",
    "title": "Executive Suite",
    "status": "draft",
    "created_at": "2026-02-08T14:00:00Z"
  }
}
```

---

## 3. Rate Management APIs

### Get Rates

```http
GET /api/partner/hotels/:hotel_id/rooms/:room_id/rates
```

**Query Parameters**:
- `start_date` (required): YYYY-MM-DD
- `end_date` (required): YYYY-MM-DD
- `partner_id` (optional): Filter by specific partner

**Response**:
```json
{
  "success": true,
  "data": {
    "rates": [
      {
        "id": "uuid",
        "room_id": "room_uuid",
        "partner_id": "partner_uuid",  
        "date": "2026-02-10",
        "price_cents": 15000,
        "currency": "USD",
        "available_rooms": 18,
        "min_nights": 1,
        "max_nights": 30,
        "cancellation_policy": "flexible",
        "refundable": true,
        "breakfast_included": false,
        "is_best_price": true,
        "created_at": "2026-01-20T00:00:00Z",
        "updated_at": "2026-02-01T10:00:00Z"
      }
    ]
  }
}
```

### Bulk Update Rates

```http
POST /api/partner/hotels/:hotel_id/rooms/:room_id/rates/bulk
```

**Request Body**:
```json
{
  "start_date": "2026-03-01",
  "end_date": "2026-03-31",
  "rate_plan": {
    "price_cents": 18000,
    "available_rooms": 15,
    "min_nights": 2,
    "cancellation_policy": "moderate",
    "breakfast_included": true
  },
  "apply_to_weekends_only": false,
  "exclude_dates": ["2026-03-15", "2026-03-16"]
}
```

**Response**: (200 OK)
```json
{
  "success": true,
  "data": {
    "updated_dates": 29,
    "excluded_dates": 2,
    "start_date": "2026-03-01",
    "end_date": "2026-03-31",
    "message": "Rates updated successfully"
  }
}
```

### Update Single Rate

```http
PATCH /api/partner/hotels/:hotel_id/rooms/:room_id/rates/:date
```

**Request Body**:
```json
{
  "price_cents": 20000,
  "available_rooms": 10
}
```

**Response**: (200 OK)
```json
{
  "success": true,
  "data": {
    "room_id": "room_uuid",
    "date": "2026-02-15",
    "price_cents": 20000,
    "available_rooms": 10,
    "updated_at": "2026-02-08T15:00:00Z"
  }
}
```

---

## 4. Booking Management APIs

### List Bookings

```http
GET /api/partner/bookings
```

**Query Parameters**:
- `hotel_id` (optional): Filter by hotel
- `status` (optional): confirmed, checked_in, checked_out, cancelled
- `check_in_date` (optional): YYYY-MM-DD
- `check_out_date` (optional): YYYY-MM-DD
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response**:
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "uuid",
        "booking_id": "main_booking_uuid",
        "confirmation_code": "TC12345",
        "hotel_id": "hotel_uuid",
        "hotel_name": "Luxury Hotel Hanoi",
        "room_id": "room_uuid",
        "room_name": "Deluxe Room",
        "partner_id": "partner_uuid",
        "check_in_date": "2026-02-15",
        "check_out_date": "2026-02-18",
        "nights_count": 3,
        "guest_name": "John Smith",
        "guest_email": "john@email.com",
        "guest_phone": "+1-555-1234",
        "guest_count": {
          "adults": 2,
          "children": 0
        },
        "total_cents": 45000,
        "commission_cents": 4500,
        "payout_cents": 40500,
        "currency": "USD",
        "status": "confirmed",
        "payment_status": "paid",
        "booking_source": "tripc_web",
        "special_requests": "Late check-in please",
        "booked_at": "2026-02-01T10:30:00Z",
        "confirmed_at": "2026-02-01T10:31:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "pages": 8
    },
    "summary": {
      "total_bookings": 156,
      "confirmed": 89,
      "checked_in": 12,
      "checked_out": 45,
      "cancelled": 10,
      "total_revenue_cents": 678900,
      "total_commission_cents": 67890
    }
  }
}
```

### Get Booking Details

```http
GET /api/partner/bookings/:id
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "confirmation_code": "TC12345",
    "hotel": {
      "id": "hotel_uuid",
      "name": "Luxury Hotel Hanoi",
      "address": "123 Main Street, Hanoi",
      "contact": {
        "phone": "+84-24-1234-5678",
        "email": "info@hotel.com"
      }
    },
    "room": {
      "id": "room_uuid",
      "title": "Deluxe Room",
      "bed_type": "King Bed",
      "capacity": 2
    },
    "dates": {
      "check_in": "2026-02-15",
      "check_out": "2026-02-18",
      "nights": 3,
      "check_in_time": "14:00",
      "check_out_time": "12:00"
    },
    "guest": {
      "name": "John Smith",
      "email": "john@email.com",
      "phone": "+1-555-1234",
      "adults": 2,
      "children": 0,
      "special_requests": "Late check-in please"
    },
    "pricing": {
      "base_price_cents": 45000,
      "tax_cents": 4500,
      "fees_cents": 900,
      "discount_cents": 5400,
      "total_cents": 45000,
      "commission_cents": 4500,
      "commission_rate": 0.10,
      "partner_payout_cents": 40500,
      "currency": "USD",
      "nightly_breakdown": [
        {
          "date": "2026-02-15",
          "rate_cents": 15000
        },
        {
          "date": "2026-02-16",
          "rate_cents": 15000
        },
        {
          "date": "2026-02-17",
          "rate_cents": 15000
        }
      ]
    },
    "status": {
      "booking_status": "confirmed",
      "payment_status": "paid",
      "modification_count": 0,
      "is_modified": false
    },
    "timestamps": {
      "booked_at": "2026-02-01T10:30:00Z",
      "confirmed_at": "2026-02-01T10:31:00Z",
      "checked_in_at": null,
      "checked_out_at": null
    },
    "booking_source": "tripc_web",
    "user_agent": "Mozilla/5.0...",
    "metadata": {
      "tcent_used": 0,
      "tcent_earned": 2250,
      "working_pass_applied": false
    }
  }
}
```

### Update Booking Status

```http
PATCH /api/partner/bookings/:id/status
```

**Request Body**:
```json
{
  "status": "checked_in",
  "room_number": "301",
  "notes": "Guest arrived early, room ready"
}
```

**Response**: (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "checked_in",
    "checked_in_at": "2026-02-15T11:30:00Z",
    "room_number": "301"
  }
}
```

### Cancel Booking (Partner-Initiated)

```http
POST /api/partner/bookings/:id/cancel
```

**Request Body**:
```json
{
  "reason": "Property maintenance required",
  "refund_full_amount": true,
  "notes": "Will contact guest for alternative dates"
}
```

**Response**: (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "cancelled",
    "cancelled_at": "2026-02-08T16:00:00Z",
    "cancelled_by": "partner",
    "refund_amount_cents": 45000,
    "refund_status": "processing",
    "message": "Booking cancelled successfully. Customer will be refunded within 5-7 business days."
  }
}
```

---

## 5. Analytics APIs

### Dashboard Metrics

```http
GET /api/partner/analytics/dashboard
```

**Query Parameters**:
- `hotel_id` (optional): Specific hotel
- `start_date` (optional): YYYY-MM-DD
- `end_date` (optional): YYYY-MM-DD

**Response**:
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2026-02-01",
      "end": "2026-02-08"
    },
    "metrics": {
      "total_bookings": 45,
      "confirmed_bookings": 38,
      "cancelled_bookings": 7,
      "occupancy_rate": 78.5,
      "adr_cents": 16500,
      "revpar_cents": 12953,
      "total_revenue_cents": 627000,
      "commission_cents": 62700,
      "net_revenue_cents": 564300,
      "avg_lead_time_days": 18,
      "avg_length_of_stay": 2.8,
      "cancellation_rate": 15.6
    },
    "trends": {
      "bookings_change_percent": 12.5,
      "revenue_change_percent": 8.3,
      "occupancy_change_percent": 5.2
    },
    "channel_breakdown": [
      {
        "channel": "tripc_direct",
        "bookings": 25,
        "revenue_cents": 375000,
        "commission_rate": 0.10
      },
      {
        "channel": "booking_com",
        "bookings": 15,
        "revenue_cents": 195000,
        "commission_rate": 0.15
      },
      {
        "channel": "walk_in",
        "bookings": 5,
        "revenue_cents": 57000,
        "commission_rate": 0.00
      }
    ]
  }
}
```

### Occupancy Report

```http
GET /api/partner/analytics/occupancy
```

**Query Parameters**:
- `hotel_id` (required)
- `start_date` (required)
- `end_date` (required)
- `granularity` (optional): daily, weekly, monthly

**Response**:
```json
{
  "success": true,
  "data": {
    "hotel_id": "hotel_uuid",
    "period": {
      "start": "2026-02-01",
      "end": "2026-02-29"
    },
    "overall_occupancy_rate": 82.3,
    "total_room_nights_available": 3480,
    "total_room_nights_booked": 2864,
    "daily_data": [
      {
        "date": "2026-02-01",
        "available_rooms": 120,
        "booked_rooms": 95,
        "occupancy_rate": 79.2
      }
      // ... more days
    ],
    "room_type_breakdown": [
      {
        "room_type_id": "uuid",
        "room_type_name": "Deluxe Room",
        "occupancy_rate": 85.5,
        "total_nights_available": 600,
        "total_nights_booked": 513
      }
    ]
  }
}
```

### Revenue Report

```http
GET /api/partner/analytics/revenue
```

**Response**: Similar structure with revenue focus

---

## 6. Review Management APIs

### List Reviews

```http
GET /api/partner/reviews
```

**Query Parameters**:
- `hotel_id` (optional)
- `status` (optional): pending, approved, rejected
- `rating` (optional): 1-5
- `page` (optional)
- `limit` (optional)

**Response**:
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "hotel_id": "hotel_uuid",
        "hotel_name": "Luxury Hotel Hanoi",
        "booking_id": "booking_uuid",
        "user": {
          "name": "Jane Doe",
          "verified": true
        },
        "ratings": {
          "overall": 5,
          "cleanliness": 5,
          "comfort": 5,
          "location": 4,
          "service": 5,
          "value": 4
        },
        "title": "Amazing stay!",
        "comment": "The hotel exceeded our expectations. Staff was...",
        "pros": ["Excellent service", "Great location", "Clean rooms"],
        "cons": ["WiFi could be faster"],
        "traveler_type": "couple",
        "status": "approved",
        "helpful_count": 12,
        "partner_response": null,
        "created_at": "2026-02-05T10:00:00Z",
        "moderated_at": "2026-02-05T11:00:00Z"
      }
    ],
    "summary": {
      "total_reviews": 234,
      "average_rating": 4.6,
      "pending_reviews": 3,
      "response_rate": 89.5
    }
  }
}
```

### Respond to Review

```http
POST /api/partner/reviews/:id/respond
```

**Request Body**:
```json
{
  "response": "Thank you for your wonderful review! We're thrilled to hear you enjoyed your stay. We've taken note of your WiFi feedback and are working on upgrades. We hope to welcome you again soon!"
}
```

**Response**: (200 OK)
```json
{
  "success": true,
  "data": {
    "review_id": "uuid",
    "response": "Thank you for your wonderful review!...",
    "responded_at": "2026-02-08T17:00:00Z",
    "responded_by": "partner"
  }
}
```

---

## 7. Payout APIs

### List Payouts

```http
GET /api/partner/payouts
```

**Query Parameters**:
- `status` (optional): pending, paid, overdue
- `year` (optional)
- `month` (optional)

**Response**:
```json
{
  "success": true,
  "data": {
    "payouts": [
      {
        "id": "uuid",
        "partner_id": "partner_uuid",
        "period": {
          "start": "2026-01-01",
          "end": "2026-01-31"
        },
        "total_bookings": 89,
        "gross_revenue_cents": 1345000,
        "commission_cents": 134500,
        "adjustments_cents": -5000,
        "net_payout_cents": 1205500,
        "currency": "USD",
        "status": "paid",
        "paid_at": "2026-02-10T00:00:00Z",
        "payment_method": "bank_transfer",
        "payment_reference": "TRF-2026-02-10-12345",
        "created_at": "2026-02-01T00:00:00Z"
      }
    ]
  }
}
```

### Get Payout Details

```http
GET /api/partner/payouts/:id
```

**Response**: Detailed payout with booking breakdown

---

## 8. Notification APIs

### Get Notifications

```http
GET /api/partner/notifications
```

**Query Parameters**:
- `unread_only` (optional): true/false
- `type` (optional): booking, review, payout, alert
- `page` (optional)
- `limit` (optional)

**Response**:
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "booking",
        "title": "New Booking Received",
        "message": "New booking for Deluxe Room, 3 nights, $450",
        "data": {
          "booking_id": "booking_uuid",
          "confirmation_code": "TC12345"
        },
        "is_read": false,
        "created_at": "2026-02-08T18:00:00Z"
      }
    ],
    "unread_count": 5
  }
}
```

### Mark as Read

```http
POST /api/partner/notifications/:id/read
```

**Response**: (200 OK)

---

## 9. Webhook Events

Partners can subscribe to webhook events for real-time updates.

### Configure Webhooks

```http
POST /api/partner/webhooks
```

**Request Body**:
```json
{
  "url": "https://partner-system.com/webhooks/tripc",
  "events": [
    "booking.created",
    "booking.confirmed",
    "booking.cancelled",
    "booking.modified",
    "review.posted",
    "payout.processed"
  ],
  "secret": "webhook_secret_key"
}
```

### Webhook Payload Format

```json
{
  "id": "event_uuid",
  "type": "booking.created",
  "timestamp": "2026-02-08T10:30:00Z",
  "data": {
    "booking_id": "uuid",
    "confirmation_code": "TC12345",
    "hotel_id": "hotel_uuid",
    "check_in_date": "2026-02-15",
    "check_out_date": "2026-02-18",
    "total_cents": 45000
  },
  "signature": "sha256_hmac_signature"
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "check_out_date",
        "message": "Check-out date must be after check-in date"
      }
    ]
  }
}
```

### Error Codes

- `400` Bad Request - Invalid input
- `401` Unauthorized - Invalid or missing token
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `409` Conflict - Resource conflict (e.g., duplicate)
- `422` Unprocessable Entity - Validation error
- `429` Too Many Requests - Rate limit exceeded
- `500` Internal Server Error - Server error

---

**Document Version**: 1.0  
**Last Updated**: February 8, 2026  
**Maintained By**: TripC Development Team
