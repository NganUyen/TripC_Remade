# Hotel Service API Documentation

## Overview

The Hotel Service API provides comprehensive hotel booking functionality aligned with the TripC Platform Architecture flowchart. It supports multi-partner hotel aggregation, price comparison, TCent loyalty integration, and Working Pass benefits.

## Base URL

```
/api/hotels
```

## Authentication

Most booking-related endpoints require Clerk authentication. Include the Clerk session token in requests.

Protected endpoints:

- POST `/bookings` - Create booking
- GET `/bookings/my-bookings` - View user's bookings
- POST `/bookings/[id]/modify` - Modify booking

## Core Concepts

### Partner System

Hotels are available through multiple booking partners (Agoda, Booking.com, Expedia, etc.). Each partner may have different:

- Prices for the same room
- Commission rates (affects TCent earning)
- Availability

### TCent Loyalty System

- Earn TCent on bookings (1 cent = 1 TCent)
- Partner-specific earn rates (5-10%)
- Working Pass bonus (50% extra)
- Tier bonuses (10-50% based on membership)
- Redeem TCent up to 30% of booking value

### Working Pass

Premium subscription for business travelers:

- 10% discount (minimum 3 nights)
- 50% bonus TCent earning
- Free cancellation (up to 24h before check-in)
- Flexible check-in/check-out

---

## Endpoints

### 1. Get Hotel Details

**GET** `/api/hotels/[slug]`

Get detailed information about a specific hotel.

**Parameters:**

- `slug` (path) - Hotel slug identifier

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "marina-bay-sands",
    "name": "Marina Bay Sands",
    "description": "Luxury hotel...",
    "address": "10 Bayfront Avenue",
    "city": "Singapore",
    "country": "Singapore",
    "star_rating": 5,
    "images": ["url1", "url2"],
    "amenities": ["pool", "spa", "gym"],
    "rooms": [...],
    "average_rating": 4.5,
    "review_count": 1250
  }
}
```

---

### 2. Get Available Partners

**GET** `/api/hotels/[slug]/partners`

Get all booking partners available for a hotel.

**Parameters:**

- `slug` (path) - Hotel slug identifier

**Response:**

```json
{
  "success": true,
  "data": {
    "hotel": {
      "id": "uuid",
      "slug": "marina-bay-sands",
      "name": "Marina Bay Sands"
    },
    "partners": {
      "direct": [
        {
          "partner_id": "uuid",
          "code": "DIRECT",
          "name": "Direct Booking",
          "logo_url": "...",
          "priority": 1,
          "commission_rate": 0.10
        }
      ],
      "aggregators": [
        {
          "partner_id": "uuid",
          "code": "AGODA",
          "name": "Agoda",
          "logo_url": "...",
          "priority": 2,
          "commission_rate": 0.06
        },
        ...
      ],
      "all": [...]
    },
    "total_partners": 5
  }
}
```

---

### 3. Get Room Rates

**GET** `/api/hotels/[slug]/rates`

Fetch available rates for hotel rooms with partner-based pricing.

**Query Parameters:**

- `start` (required) - Start date (YYYY-MM-DD)
- `end` (required) - End date (YYYY-MM-DD)
- `room_id` (optional) - Filter by specific room
- `partner_id` (optional) - Filter by specific partner
- `group_by` (optional) - How to group results: `room` | `partner` | `both` (default: both)

**Response:**

```json
{
  "success": true,
  "data": {
    "rates": [
      {
        "id": "uuid",
        "room_id": "uuid",
        "partner_id": "uuid",
        "date": "2024-01-15",
        "price_cents": 35000,
        "available_rooms": 5,
        "is_best_price": true,
        "discount_percentage": 0.15,
        "room": { "title": "Deluxe Room", ... },
        "partner": { "name": "Agoda", ... }
      },
      ...
    ],
    "grouped_rates": {
      "room_uuid_partner_uuid": {
        "room": {...},
        "partner": {...},
        "rates": [...]
      }
    },
    "summary": {
      "total_rates": 150,
      "total_combinations": 15,
      "date_range": { "start": "2024-01-15", "end": "2024-01-20" },
      "lowest_rate": 32000,
      "highest_rate": 45000,
      "best_price": {
        "price_cents": 32000,
        "partner": "Agoda",
        "room": "Deluxe Room"
      }
    },
    "grouping": "both"
  }
}
```

---

### 4. Compare Prices Across Partners

**GET** `/api/hotels/[slug]/compare-prices`

Compare prices for the same room across all booking partners.

**Query Parameters:**

- `start` (required) - Check-in date (YYYY-MM-DD)
- `end` (required) - Check-out date (YYYY-MM-DD)
- `room_id` (optional) - Specific room to compare

**Response:**

```json
{
  "success": true,
  "data": {
    "hotel": { "id": "uuid", "slug": "...", "name": "..." },
    "date_range": { "start": "2024-01-15", "end": "2024-01-20", "nights": 5 },
    "comparison": [
      {
        "room_id": "uuid",
        "room_title": "Deluxe Room",
        "partners": [
          {
            "partner_id": "uuid",
            "partner_name": "Agoda",
            "partner_code": "AGODA",
            "total_price_cents": 175000,
            "average_nightly_cents": 35000,
            "discount_percentage": 0.15,
            "is_best_price": true,
            "tcent_earn_rate": 0.06,
            "estimated_tcent": 10500,
            "nightly_breakdown": [...]
          },
          {
            "partner_id": "uuid",
            "partner_name": "Booking.com",
            "partner_code": "BOOKING",
            "total_price_cents": 182500,
            "average_nightly_cents": 36500,
            "is_best_price": false,
            "tcent_earn_rate": 0.05,
            "estimated_tcent": 9125
          }
        ],
        "price_range": {
          "lowest_cents": 175000,
          "highest_cents": 190000,
          "savings_cents": 15000
        }
      }
    ]
  }
}
```

---

### 5. Create Booking

**POST** `/api/hotels/bookings`

Create a new hotel booking with partner selection, TCent, and Working Pass support.

**Authentication:** Required

**Request Body:**

```json
{
  "hotel_id": "uuid",
  "room_id": "uuid",
  "partner_id": "uuid",
  "check_in_date": "2024-01-15",
  "check_out_date": "2024-01-20",
  "guest_info": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+65 1234 5678",
    "adults": 2,
    "children": 1
  },
  "special_requests": "Late check-in",
  "tcent_to_use": 5000,
  "has_working_pass": true,
  "user_tier": "gold"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "confirmation_code": "ABC123XYZ",
    "status": "pending",
    "hotel_name": "Marina Bay Sands",
    "room_name": "Deluxe Room",
    "partner_name": "Agoda",
    "check_in_date": "2024-01-15",
    "check_out_date": "2024-01-20",
    "nights": 5,
    "pricing_breakdown": {
      "base_price_cents": 175000,
      "working_pass_discount_cents": 17500,
      "tcent_redemption_cents": 5000,
      "total_discount_cents": 22500,
      "final_amount_cents": 152500
    },
    "loyalty": {
      "tcent_used": 5000,
      "tcent_earned": 15750,
      "tcent_breakdown": {
        "base": 9150,
        "working_pass_bonus": 4575,
        "tier_bonus": 2025
      }
    },
    "working_pass": {
      "applied": true,
      "benefits": {
        "discount_applicable": true,
        "discount_cents": 17500,
        "discount_percentage": 0.1,
        "tcent_bonus_applicable": true,
        "tcent_bonus_percentage": 0.5,
        "free_cancellation": true,
        "flexible_checkin": true,
        "priority_support": true,
        "total_value_cents": 22000
      }
    }
  },
  "message": "Booking created successfully"
}
```

---

### 6. Get User's Bookings

**GET** `/api/hotels/bookings/my-bookings`

Retrieve current user's hotel bookings with modification history.

**Authentication:** Required

**Query Parameters:**

- `status` (optional) - Filter by status: `pending`, `confirmed`, `cancelled`, etc.
- `upcoming` (optional) - true to show only upcoming bookings
- `limit` (optional) - Number of results (default: 20)
- `offset` (optional) - Pagination offset (default: 0)

**Response:**

```json
{
  "success": true,
  "data": {
    "bookings": [...],
    "categorized": {
      "upcoming": [...],
      "past": [...],
      "cancelled": [...],
      "active": [...]
    },
    "stats": {
      "total_bookings": 15,
      "upcoming_count": 3,
      "past_count": 10,
      "cancelled_count": 2,
      "active_count": 0,
      "total_spent_cents": 2450000,
      "total_tcent_earned": 147000
    }
  },
  "pagination": {
    "total": 15,
    "limit": 20,
    "offset": 0,
    "has_more": false
  }
}
```

---

### 7. Modify Booking

**POST** `/api/hotels/bookings/[id]/modify`

Request modifications to an existing booking (dates, room, or guest count).

**Authentication:** Required

**Parameters:**

- `id` (path) - Booking ID

**Request Body:**

```json
{
  "modification_type": "dates",
  "new_values": {
    "check_in_date": "2024-01-16",
    "check_out_date": "2024-01-21"
  },
  "reason": "Business meeting rescheduled"
}
```

**Modification Types:**

1. `dates` - Change check-in/check-out dates
2. `room` - Change room type
3. `guests` - Change number of guests

**Response:**

```json
{
  "success": true,
  "data": {
    "modification": {
      "id": "uuid",
      "booking_id": "uuid",
      "modification_type": "dates",
      "old_values": {
        "check_in_date": "2024-01-15",
        "check_out_date": "2024-01-20"
      },
      "new_values": {
        "check_in_date": "2024-01-16",
        "check_out_date": "2024-01-21"
      },
      "price_difference_cents": 5000,
      "status": "pending",
      "created_at": "2024-01-10T10:00:00Z"
    },
    "booking": {
      "id": "uuid",
      "status": "confirmed",
      "is_modified": true,
      "modification_count": 1
    },
    "action_required": "Additional payment of $50.00 SGD required",
    "message": "Modification request submitted. Pending approval."
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error title",
  "message": "Detailed error description"
}
```

**Common HTTP Status Codes:**

- `200` - Success
- `201` - Created (new booking)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `404` - Not Found (hotel/booking not found)
- `500` - Internal Server Error

---

## Flowchart Alignment

This API implementation aligns with the TripC Platform Architecture flowchart:

1. **Partner Selection** (Flowchart: "Single Partner" vs "Show Popular Ones")
   - `/partners` endpoint lists available partners
   - `/compare-prices` enables price comparison across partners
   - Booking requires `partner_id` selection

2. **Price Comparison** (Flowchart: Price comparison decision point)
   - `/compare-prices` aggregates rates from all partners
   - Identifies best prices with `is_best_price` flag
   - Shows potential savings

3. **TCent Integration** (Flowchart: Loyalty system throughout)
   - Earn TCent on bookings (partner-specific rates)
   - Redeem TCent (up to 30% of booking)
   - Working Pass bonus (50% extra)
   - Tier-based bonuses

4. **Working Pass** (Flowchart: Premium user benefits)
   - 10% discount on eligible bookings
   - Free cancellation
   - Flexible check-in/out
   - Priority support

5. **Booking Modifications** (Flowchart: "Modify Booking" flow)
   - `/modify` endpoint supports date/room/guest changes
   - Price difference calculation
   - Modification history tracking

6. **User Flow** (Flowchart: Complete booking journey)
   - Discovery → Selection → Partner Choice → Price Comparison → Booking → Management

---

## TCent Calculation Examples

### Basic Booking (No Working Pass, Standard Tier)

```
Booking Amount: $350 SGD
Partner Earn Rate: 6% (Agoda)
TCent Earned: 350 × 0.06 = 21 TC
```

### With Working Pass (Gold Tier)

```
Booking Amount: $350 SGD
Partner Earn Rate: 6%
Base TCent: 350 × 0.06 = 21 TC
Working Pass Bonus (50%): 21 × 0.50 = 10.5 TC
Gold Tier Bonus (20%): 21 × 0.20 = 4.2 TC
Total TCent: 21 + 10.5 + 4.2 = 35.7 TC
```

### TCent Redemption

```
Booking Amount: $350 SGD
Max Redeemable (30%): $105 SGD = 105 TC
User Has: 150 TC
Can Use: min(105, 150) = 105 TC
Final Amount: $350 - $105 = $245 SGD
```

---

## Working Pass Benefits Examples

### Eligible Booking (3+ nights)

```
Booking Amount: $500 SGD (5 nights)
Working Pass Discount (10%): $50 SGD
TCent Bonus (50%): +15 TC (on top of base 30 TC)
Free Cancellation: Included
Total Value: ~$95 SGD in benefits
```

### Not Eligible (Less than 3 nights)

```
Booking Amount: $200 SGD (2 nights)
Working Pass Discount: Not applicable (< 3 nights)
TCent Bonus (50%): +5 TC (still applicable)
Free Cancellation: Still available
Total Value: ~$50 SGD in benefits
```

---

## Best Practices

1. **Always check partner availability** before booking
2. **Compare prices** across partners for best deals
3. **Use TCent strategically** - maximize earning on expensive bookings
4. **Working Pass** pays for itself after 2-3 bookings
5. **Modify bookings early** to avoid price increases
6. **Check modification policies** before booking

---

## Testing

Sample requests using cURL:

```bash
# Get hotel details
curl GET 'http://localhost:3000/api/hotels/marina-bay-sands'

# Compare prices
curl GET 'http://localhost:3000/api/hotels/marina-bay-sands/compare-prices?start=2024-01-15&end=2024-01-20'

# Create booking (requires auth token)
curl -X POST 'http://localhost:3000/api/hotels/bookings' \
  -H 'Authorization: Bearer YOUR_CLERK_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "hotel_id": "uuid",
    "room_id": "uuid",
    "partner_id": "uuid",
    "check_in_date": "2024-01-15",
    "check_out_date": "2024-01-20",
    "guest_info": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "adults": 2
    },
    "has_working_pass": true
  }'
```

---

## Next Steps

1. Implement user TCent balance tracking
2. Add real-time availability sync with partners
3. Implement booking confirmation workflow
4. Add payment processing integration
5. Create admin panel for managing partners
6. Implement recommendation engine
7. Add review and rating system integration
