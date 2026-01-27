# Flight Service API Documentation

## Base URL

```
http://localhost:3000/api
```

For production, replace with your deployed domain.

---

## Endpoints

### 1. Health Check

**GET** `/ping`

Check the health status of the API and database.

**Authentication**: None (Public)

**Query Parameters**: None

**Response**: 200 OK

```json
{
  "status": "ok",
  "timestamp": "2026-01-25T10:30:00.000Z",
  "api": "ok",
  "database": "ok",
  "version": "1.0.0"
}
```

**Error Response**: 503 Service Unavailable

```json
{
  "status": "degraded",
  "timestamp": "2026-01-25T10:30:00.000Z",
  "api": "ok",
  "database": "error",
  "version": "1.0.0",
  "error": "Database connection failed"
}
```

**cURL Example**:
```bash
curl http://localhost:3000/api/ping
```

---

### 2. Flight Search

**GET** `/flight/search`

Search for available flights.

**Authentication**: None (Public)

**Query Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `origin` | string | Yes | Origin IATA code (3 letters) | SGN |
| `destination` | string | Yes | Destination IATA code (3 letters) | HAN |
| `date` | string | Yes | Departure date (YYYY-MM-DD) | 2026-02-20 |
| `cabin_class` | string | No | Economy/Business/First | Economy |
| `limit` | number | No | Results per page (max 100) | 20 |
| `offset` | number | No | Pagination offset | 0 |

**Response**: 200 OK

```json
{
  "success": true,
  "query": {
    "origin": "SGN",
    "destination": "HAN",
    "date": "2026-02-20",
    "cabin_class": "all"
  },
  "results": {
    "total": 5,
    "limit": 20,
    "offset": 0,
    "offers": [
      {
        "offer_id": "123e4567-e89b-12d3-a456-426614174000",
        "price": 65.00,
        "currency": "USD",
        "seats_available": 50,
        "cabin_class": "Economy",
        "fare_type": "Standard",
        "valid_until": "2026-02-20T04:00:00.000Z",
        "flight": {
          "id": "789e4567-e89b-12d3-a456-426614174111",
          "airline": {
            "code": "VJ",
            "name": "VietJet Air"
          },
          "flight_number": "VJ320",
          "route": {
            "origin": {
              "code": "SGN",
              "name": "Tan Son Nhat International Airport"
            },
            "destination": {
              "code": "HAN",
              "name": "Noi Bai International Airport"
            }
          },
          "schedule": {
            "departure": "2026-02-20T08:30:00+07:00",
            "arrival": "2026-02-20T10:45:00+07:00",
            "duration_minutes": 135
          },
          "aircraft": "Airbus A320",
          "amenities": ["Snacks Available"],
          "baggage": {
            "checked": "20kg",
            "carryon": "7kg"
          },
          "status": "scheduled"
        }
      }
    ]
  }
}
```

**Error Responses**:

400 Bad Request - Missing parameters:
```json
{
  "error": "Missing required parameters",
  "message": "origin, destination, and date are required",
  "example": "/api/flight/search?origin=SGN&destination=HAN&date=2026-02-20"
}
```

400 Bad Request - Invalid IATA code:
```json
{
  "error": "Invalid origin airport code",
  "message": "Must be 3-letter IATA code"
}
```

**cURL Examples**:

Basic search:
```bash
curl 'http://localhost:3000/api/flight/search?origin=SGN&destination=HAN&date=2026-02-20'
```

With cabin class filter:
```bash
curl 'http://localhost:3000/api/flight/search?origin=SGN&destination=HAN&date=2026-02-20&cabin_class=Business'
```

With pagination:
```bash
curl 'http://localhost:3000/api/flight/search?origin=SGN&destination=HAN&date=2026-02-20&limit=10&offset=0'
```

---

### 3. Create Booking

**POST** `/flight/book`

Create a flight booking for an authenticated user.

**Authentication**: Required (Clerk)

**Headers**:
```
Authorization: Bearer <CLERK_JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:

```json
{
  "offer_id": "123e4567-e89b-12d3-a456-426614174000",
  "passengers": [
    {
      "first_name": "John",
      "last_name": "Doe",
      "dob": "1990-01-15",
      "document_type": "passport",
      "document_number": "A12345678",
      "nationality": "VN"
    }
  ],
  "contact_info": {
    "email": "john@example.com",
    "phone": "+84901234567",
    "emergency_contact": "+84909876543"
  }
}
```

**Response**: 201 Created

```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {
    "id": "456e7890-e89b-12d3-a456-426614174222",
    "pnr": "A1B2C3",
    "status": "confirmed",
    "payment_status": "pending",
    "total_price": 65.00,
    "currency": "USD",
    "passengers_count": 1,
    "flight": {
      "airline": "VJ",
      "flight_number": "VJ320",
      "route": "SGN → HAN",
      "departure": "2026-02-20T08:30:00+07:00",
      "arrival": "2026-02-20T10:45:00+07:00"
    },
    "booked_at": "2026-01-25T10:30:00.000Z"
  },
  "next_steps": {
    "payment": "Payment integration pending - for MVP, booking is auto-confirmed",
    "confirmation": "Booking confirmation email would be sent via Notification Service",
    "manage": "/my-bookings/456e7890-e89b-12d3-a456-426614174222"
  }
}
```

**Error Responses**:

401 Unauthorized:
```json
{
  "error": "Unauthorized",
  "message": "Authentication required. Please sign in to book flights."
}
```

400 Bad Request - Missing fields:
```json
{
  "error": "Missing offer_id",
  "message": "offer_id is required"
}
```

400 Bad Request - Invalid passengers:
```json
{
  "error": "Invalid passengers data",
  "message": "passengers must be an array with at least one passenger containing first_name and last_name"
}
```

404 Not Found - Offer not found:
```json
{
  "error": "Offer not found",
  "message": "The specified offer does not exist"
}
```

400 Bad Request - Insufficient seats:
```json
{
  "error": "Insufficient seats",
  "message": "Only 2 seats available, but 3 requested"
}
```

**cURL Example**:

```bash
curl -X POST 'http://localhost:3000/api/flight/book' \
  -H 'Authorization: Bearer YOUR_CLERK_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "offer_id": "123e4567-e89b-12d3-a456-426614174000",
    "passengers": [
      {
        "first_name": "John",
        "last_name": "Doe",
        "dob": "1990-01-15",
        "document_type": "passport",
        "document_number": "A12345678",
        "nationality": "VN"
      }
    ],
    "contact_info": {
      "email": "john@example.com",
      "phone": "+84901234567"
    }
  }'
```

---

### 4. Get Booking Details

**GET** `/flight/booking/:id`

Retrieve details of a specific booking.

**Authentication**: Required (Clerk)

**Headers**:
```
Authorization: Bearer <CLERK_JWT_TOKEN>
```

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Booking ID |

**Response**: 200 OK

```json
{
  "success": true,
  "booking": {
    "id": "456e7890-e89b-12d3-a456-426614174222",
    "pnr": "A1B2C3",
    "status": "confirmed",
    "payment_status": "pending",
    "price": {
      "amount": 65.00,
      "currency": "USD"
    },
    "passengers": [
      {
        "first_name": "John",
        "last_name": "Doe",
        "dob": "1990-01-15",
        "document_type": "passport",
        "document_number": "A12345678",
        "nationality": "VN"
      }
    ],
    "contact_info": {
      "email": "john@example.com",
      "phone": "+84901234567"
    },
    "flight": {
      "airline": {
        "code": "VJ",
        "name": "VietJet Air"
      },
      "flight_number": "VJ320",
      "route": {
        "origin": {
          "code": "SGN",
          "name": "Tan Son Nhat International Airport"
        },
        "destination": {
          "code": "HAN",
          "name": "Noi Bai International Airport"
        }
      },
      "schedule": {
        "departure": "2026-02-20T08:30:00+07:00",
        "arrival": "2026-02-20T10:45:00+07:00",
        "duration_minutes": 135
      },
      "aircraft": "Airbus A320",
      "amenities": ["Snacks Available"],
      "baggage": {
        "checked": "20kg",
        "carryon": "7kg"
      }
    },
    "cabin_class": "Economy",
    "fare_type": "Standard",
    "tickets": [],
    "dates": {
      "booked_at": "2026-01-25T10:30:00.000Z",
      "confirmed_at": "2026-01-25T10:30:00.000Z",
      "cancelled_at": null
    }
  }
}
```

**Error Responses**:

401 Unauthorized:
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

404 Not Found:
```json
{
  "error": "Booking not found"
}
```

403 Forbidden:
```json
{
  "error": "Forbidden",
  "message": "You do not have access to this booking"
}
```

**cURL Example**:

```bash
curl -X GET 'http://localhost:3000/api/flight/booking/456e7890-e89b-12d3-a456-426614174222' \
  -H 'Authorization: Bearer YOUR_CLERK_JWT_TOKEN'
```

---

### 5. Cancel Booking

**DELETE** `/flight/booking/:id`

Cancel a flight booking.

**Authentication**: Required (Clerk)

**Headers**:
```
Authorization: Bearer <CLERK_JWT_TOKEN>
```

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Booking ID |

**Response**: 200 OK

```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "booking_id": "456e7890-e89b-12d3-a456-426614174222",
  "note": "Refund processing would be handled by Payment Service in production"
}
```

**Error Responses**:

401 Unauthorized:
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

404 Not Found:
```json
{
  "error": "Booking not found"
}
```

403 Forbidden:
```json
{
  "error": "Forbidden",
  "message": "You cannot cancel this booking"
}
```

400 Bad Request - Already cancelled:
```json
{
  "error": "Already cancelled",
  "message": "This booking is already cancelled"
}
```

**cURL Example**:

```bash
curl -X DELETE 'http://localhost:3000/api/flight/booking/456e7890-e89b-12d3-a456-426614174222' \
  -H 'Authorization: Bearer YOUR_CLERK_JWT_TOKEN'
```

---

## Error Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - No access to resource |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |
| 503 | Service Unavailable - System degraded |

---

## Rate Limiting

Currently no rate limiting is implemented in the MVP. For production:

- Implement rate limiting at API Gateway level
- Suggested limits: 100 requests/minute per user
- Search endpoint: 30 requests/minute per IP

---

## Authentication

All protected endpoints require Clerk authentication.

### Getting a JWT Token

1. Sign in via Clerk (`/sign-in` page)
2. JWT token is automatically managed by Clerk SDK
3. For API testing, extract token from browser session

### Testing with cURL

```bash
# 1. Get token from browser DevTools:
# - Open DevTools > Application > Cookies
# - Find __session cookie
# - Copy the value

# 2. Use in cURL:
curl -H "Authorization: Bearer YOUR_TOKEN" ...
```

---

## Best Practices

### Client-Side Usage

```typescript
// Using fetch in a React component
async function searchFlights() {
  const response = await fetch(
    '/api/flight/search?origin=SGN&destination=HAN&date=2026-02-20'
  );
  const data = await response.json();
  
  if (!response.ok) {
    console.error(data.error);
    return;
  }
  
  // Handle data.results.offers
}
```

### Authenticated Requests

```typescript
// Clerk automatically handles auth in Next.js
async function createBooking(bookingData) {
  const response = await fetch('/api/flight/book', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingData),
  });
  
  if (response.status === 401) {
    // Redirect to sign-in
    window.location.href = '/sign-in';
    return;
  }
  
  const data = await response.json();
  return data;
}
```

### Error Handling

Always check `response.ok` and handle error responses:

```typescript
const response = await fetch(...);
const data = await response.json();

if (!data.success) {
  // Handle error
  alert(data.message || data.error);
}
```

---

## Testing Checklist

- [ ] Health check returns 200
- [ ] Search without auth works
- [ ] Search with valid params returns results
- [ ] Search with invalid IATA code returns 400
- [ ] Booking without auth returns 401
- [ ] Booking with valid data creates booking
- [ ] Booking with insufficient seats returns 400
- [ ] Get booking requires auth
- [ ] Get booking returns correct data
- [ ] Cancel booking updates status
- [ ] Cancel already-cancelled booking returns 400

---

## Pagination

Search results support pagination:

```bash
# First page (20 results)
curl '.../flight/search?origin=SGN&destination=HAN&date=2026-02-20&limit=20&offset=0'

# Second page
curl '.../flight/search?origin=SGN&destination=HAN&date=2026-02-20&limit=20&offset=20'
```

Response includes pagination metadata:

```json
{
  "results": {
    "total": 50,
    "limit": 20,
    "offset": 0,
    "offers": [...]
  }
}
```

---

## Support

For API issues:
- Check this documentation
- Review [schema.md](./schema.md) for data structures
- See [README.md](./README.md) for setup instructions
- Check console logs for detailed error messages
