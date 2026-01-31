# Entertainment Service API Documentation

## Base URL

```
http://localhost:3000/api/entertainment
```

## Authentication

Write operations (POST, PUT, DELETE) require authentication via Clerk. Include the Clerk session token in your requests.

## Endpoints

### 1. List Entertainment Items

**GET** `/api/entertainment`

Retrieve a list of entertainment items with optional filtering and search.

#### Query Parameters

| Parameter   | Type    | Required | Default | Description                                               |
| ----------- | ------- | -------- | ------- | --------------------------------------------------------- |
| `q`         | string  | No       | -       | Search query (searches title, subtitle, description)      |
| `type`      | string  | No       | -       | Filter by entertainment type (tour, show, activity, etc.) |
| `available` | boolean | No       | -       | Filter by availability (true/false)                       |
| `limit`     | number  | No       | 50      | Maximum results per page (max 100)                        |
| `offset`    | number  | No       | 0       | Pagination offset                                         |

#### Response

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Paris Night Bus Tour",
      "subtitle": "Experience the City of Lights at night",
      "description": "A magical 2-hour bus tour...",
      "type": "tour",
      "provider": "Paris Tours Inc",
      "price": 45.0,
      "currency": "EUR",
      "available": true,
      "location": {
        "city": "Paris",
        "country": "France",
        "lat": 48.8566,
        "lng": 2.3522,
        "address": "Place de la Concorde"
      },
      "metadata": {
        "images": ["paris-night-1.jpg"],
        "duration": "2 hours",
        "capacity": 50,
        "rating": 4.8,
        "tags": ["night tour", "sightseeing"]
      },
      "created_at": "2026-01-30T10:00:00.000Z",
      "updated_at": "2026-01-30T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Example Requests

```bash
# Get all entertainment items
curl http://localhost:3000/api/entertainment

# Search for "Paris" tours
curl "http://localhost:3000/api/entertainment?q=Paris&type=tour"

# Get available shows with pagination
curl "http://localhost:3000/api/entertainment?type=show&available=true&limit=20&offset=0"
```

---

### 2. Get Single Entertainment Item

**GET** `/api/entertainment/:id`

Retrieve a single entertainment item by its ID.

#### Path Parameters

| Parameter | Type | Required | Description             |
| --------- | ---- | -------- | ----------------------- |
| `id`      | uuid | Yes      | Entertainment item UUID |

#### Response

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Paris Night Bus Tour",
    "subtitle": "Experience the City of Lights at night",
    "description": "A magical 2-hour bus tour...",
    "type": "tour",
    "provider": "Paris Tours Inc",
    "price": 45.0,
    "currency": "EUR",
    "available": true,
    "location": {
      "city": "Paris",
      "country": "France",
      "lat": 48.8566,
      "lng": 2.3522,
      "address": "Place de la Concorde"
    },
    "metadata": {
      "images": ["paris-night-1.jpg"],
      "duration": "2 hours",
      "capacity": 50,
      "rating": 4.8,
      "tags": ["night tour", "sightseeing"]
    },
    "created_at": "2026-01-30T10:00:00.000Z",
    "updated_at": "2026-01-30T10:00:00.000Z"
  }
}
```

#### Error Response (404)

```json
{
  "error": "Entertainment item not found"
}
```

#### Example Request

```bash
curl http://localhost:3000/api/entertainment/123e4567-e89b-12d3-a456-426614174000
```

---

### 3. Create Entertainment Item

**POST** `/api/entertainment`

Create a new entertainment item. Requires authentication.

#### Headers

```
Authorization: Bearer <clerk_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "title": "Grand Canyon Helicopter Tour",
  "subtitle": "Aerial adventure over natural wonder",
  "description": "Soar above the majestic Grand Canyon...",
  "type": "activity",
  "provider": "Canyon Tours",
  "price": 299.0,
  "currency": "USD",
  "available": true,
  "location": {
    "city": "Las Vegas",
    "country": "USA",
    "lat": 36.1069,
    "lng": -112.1129,
    "address": "Grand Canyon West"
  },
  "metadata": {
    "images": ["canyon-heli-1.jpg"],
    "duration": "70 minutes",
    "capacity": 6,
    "rating": 5.0,
    "tags": ["adventure", "aerial", "nature"]
  }
}
```

#### Required Fields

- `title` (string)
- `type` (string)

#### Response (201 Created)

```json
{
  "data": {
    "id": "987e6543-e21b-12d3-a456-426614174999",
    "title": "Grand Canyon Helicopter Tour",
    "subtitle": "Aerial adventure over natural wonder",
    "description": "Soar above the majestic Grand Canyon...",
    "type": "activity",
    "provider": "Canyon Tours",
    "price": 299.0,
    "currency": "USD",
    "available": true,
    "location": { "city": "Las Vegas", "country": "USA" },
    "metadata": { "duration": "70 minutes", "capacity": 6 },
    "created_at": "2026-01-30T12:00:00.000Z",
    "updated_at": "2026-01-30T12:00:00.000Z"
  }
}
```

#### Error Responses

**401 Unauthorized**

```json
{
  "error": "Unauthorized - Authentication required"
}
```

**400 Bad Request**

```json
{
  "error": "Missing required fields: title and type are required"
}
```

#### Example Request

```bash
curl -X POST http://localhost:3000/api/entertainment \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tokyo Robot Restaurant Experience",
    "type": "show",
    "price": 80.00,
    "currency": "JPY"
  }'
```

---

### 4. Update Entertainment Item

**PUT** `/api/entertainment/:id`

Update an existing entertainment item. Requires authentication.

#### Path Parameters

| Parameter | Type | Required | Description             |
| --------- | ---- | -------- | ----------------------- |
| `id`      | uuid | Yes      | Entertainment item UUID |

#### Headers

```
Authorization: Bearer <clerk_token>
Content-Type: application/json
```

#### Request Body

Partial update supported. Only include fields you want to update:

```json
{
  "price": 55.0,
  "available": false,
  "metadata": {
    "rating": 4.9,
    "tags": ["updated", "popular"]
  }
}
```

#### Response (200 OK)

```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Paris Night Bus Tour",
    "price": 55.0,
    "available": false,
    "metadata": {
      "rating": 4.9,
      "tags": ["updated", "popular"]
    },
    "updated_at": "2026-01-30T14:00:00.000Z"
  }
}
```

#### Error Responses

**401 Unauthorized**

```json
{
  "error": "Unauthorized - Authentication required"
}
```

**404 Not Found**

```json
{
  "error": "Entertainment item not found"
}
```

**400 Bad Request**

```json
{
  "error": "No valid fields to update"
}
```

#### Example Request

```bash
curl -X PUT http://localhost:3000/api/entertainment/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 55.00,
    "available": false
  }'
```

---

### 5. Delete Entertainment Item

**DELETE** `/api/entertainment/:id`

Delete an entertainment item. Requires authentication.

#### Path Parameters

| Parameter | Type | Required | Description             |
| --------- | ---- | -------- | ----------------------- |
| `id`      | uuid | Yes      | Entertainment item UUID |

#### Headers

```
Authorization: Bearer <clerk_token>
```

#### Response (200 OK)

```json
{
  "message": "Entertainment item deleted successfully"
}
```

#### Error Responses

**401 Unauthorized**

```json
{
  "error": "Unauthorized - Authentication required"
}
```

**500 Internal Server Error**

```json
{
  "error": "Failed to delete entertainment item",
  "details": "error message"
}
```

#### Example Request

```bash
curl -X DELETE http://localhost:3000/api/entertainment/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <clerk_token>"
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "error": "Human-readable error message",
  "details": "Technical details (optional)"
}
```

### HTTP Status Codes

- `200` - OK (successful GET, PUT, DELETE)
- `201` - Created (successful POST)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error (server/database error)

## Testing with cURL

### List all tours

```bash
curl "http://localhost:3000/api/entertainment?type=tour"
```

### Search for entertainment in Paris

```bash
curl "http://localhost:3000/api/entertainment?q=Paris"
```

### Get single item

```bash
curl http://localhost:3000/api/entertainment/{id}
```

### Create new item (requires auth)

```bash
curl -X POST http://localhost:3000/api/entertainment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_clerk_token>" \
  -d @create-entertainment.json
```

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting in production.

## CORS

CORS is configured via Next.js. Adjust in `next.config.js` if needed for production.

## Future API Enhancements

- Booking endpoints for reservations
- Reviews and ratings endpoints
- Favorites/wishlist integration
- Advanced filtering (price range, duration, rating)
- Geolocation-based search
- Availability calendar
- Provider management endpoints
