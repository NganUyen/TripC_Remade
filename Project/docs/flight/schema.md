# Flight Service Database Schema

## Overview

The Flight Service uses a PostgreSQL database (via Supabase) with 4 main tables designed for optimal query performance and data integrity.

## Tables

### 1. flights

Stores individual flight segments with schedule and pricing information.

**Purpose**: Single-flight records representing actual scheduled flights.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Unique flight identifier |
| `airline_code` | text | NOT NULL | IATA airline code (e.g., "VN") |
| `airline_name` | text | - | Full airline name |
| `flight_number` | text | NOT NULL | Flight number (e.g., "210") |
| `origin` | text | NOT NULL | Origin IATA code (3 chars) |
| `origin_name` | text | - | Origin airport name |
| `destination` | text | NOT NULL | Destination IATA code (3 chars) |
| `destination_name` | text | - | Destination airport name |
| `departure_at` | timestamptz | NOT NULL | Departure time (with timezone) |
| `arrival_at` | timestamptz | NOT NULL | Arrival time (with timezone) |
| `duration_minutes` | int | - | Flight duration in minutes |
| `aircraft` | text | - | Aircraft type (e.g., "Airbus A321") |
| `seat_classes` | jsonb | DEFAULT '[]' | Seat class configurations (see below) |
| `amenities` | jsonb | DEFAULT '[]' | Available amenities (WiFi, Meals, etc.) |
| `baggage_allowance` | jsonb | DEFAULT '{}' | Baggage limits (see below) |
| `metadata` | jsonb | DEFAULT '{}' | Additional flight metadata |
| `base_price` | numeric | NOT NULL, >= 0 | Base price for economy seat |
| `currency` | text | DEFAULT 'USD' | Price currency code |
| `status` | text | DEFAULT 'scheduled' | Flight status (scheduled/delayed/cancelled/completed) |
| `created_at` | timestamptz | DEFAULT now() | Record creation timestamp |
| `updated_at` | timestamptz | DEFAULT now() | Last update timestamp |

**Constraints**:
- `valid_iata_codes`: Origin and destination must be 3 characters and different
- `valid_times`: Arrival must be after departure
- `valid_price`: Base price must be non-negative

**Indexes**:
- `idx_flights_origin_dest_departure` on (origin, destination, departure_at)
- `idx_flights_departure_at` on (departure_at)
- `idx_flights_airline` on (airline_code, flight_number)
- `idx_flights_status` on (status)

**seat_classes JSON structure**:
```json
[
  {
    "class": "Economy",
    "seats": 150,
    "price": 89.99
  },
  {
    "class": "Business",
    "seats": 20,
    "price": 249.99
  }
]
```

**baggage_allowance JSON structure**:
```json
{
  "checked": "23kg",
  "carryon": "7kg"
}
```

---

### 2. flight_offers

Precomputed flight offers with pricing and availability.

**Purpose**: Represents bookable offers that may include promotions, fare types, and availability.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Unique offer identifier |
| `offer_key` | text | UNIQUE, NOT NULL | Deduplication key (route_date_flight_cabin_fare) |
| `flight_id` | uuid | REFERENCES flights(id) | Associated flight |
| `total_price` | numeric | NOT NULL, >= 0 | Total offer price |
| `currency` | text | DEFAULT 'USD' | Price currency |
| `seats_available` | int | NOT NULL, >= 0 | Available seats for this offer |
| `cabin_class` | text | DEFAULT 'Economy' | Economy/Business/First |
| `fare_type` | text | DEFAULT 'Standard' | Standard/Flexible/SemiFlexible |
| `provider` | text | DEFAULT 'internal' | Offer provider (internal for MVP) |
| `rules` | jsonb | DEFAULT '{}' | Fare rules (cancellation, changes) |
| `metadata` | jsonb | DEFAULT '{}' | Additional offer metadata |
| `valid_until` | timestamptz | - | Offer expiration time |
| `created_at` | timestamptz | DEFAULT now() | Record creation |
| `updated_at` | timestamptz | DEFAULT now() | Last update |

**Constraints**:
- `valid_seats`: Seats available must be non-negative
- `valid_offer_price`: Total price must be non-negative

**Indexes**:
- `idx_flight_offers_flight_id` on (flight_id)
- `idx_flight_offers_price` on (total_price)
- `idx_flight_offers_seats` on (seats_available) WHERE seats_available > 0
- `idx_flight_offers_valid_until` on (valid_until)

**offer_key format**: `{origin}_{destination}_{YYYYMMDD}_{airline}{flight}_{cabin}_{fare}`

Example: `SGN_HAN_20260220_VN210_ECO_STD`

---

### 3. flight_bookings

Customer flight bookings with passenger and payment information.

**Purpose**: Stores confirmed and pending flight bookings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Unique booking identifier |
| `user_id` | text | NOT NULL | Clerk user ID |
| `offer_id` | uuid | REFERENCES flight_offers(id) | Booked offer (nullable if offer deleted) |
| `flight_id` | uuid | REFERENCES flights(id) | Booked flight (nullable if flight deleted) |
| `passengers` | jsonb | NOT NULL | Array of passenger details (see below) |
| `contact_info` | jsonb | NOT NULL | Contact information (email, phone) |
| `price_paid` | numeric | NOT NULL, >= 0 | Amount paid |
| `currency` | text | DEFAULT 'USD' | Payment currency |
| `status` | text | DEFAULT 'pending' | pending/confirmed/ticketed/cancelled/completed |
| `pnr` | text | UNIQUE | Passenger Name Record (6-char alphanumeric) |
| `booking_reference` | text | - | External booking reference |
| `payment_status` | text | DEFAULT 'pending' | pending/paid/refunded |
| `payment_id` | text | - | Payment service transaction ID |
| `tickets` | jsonb | DEFAULT '[]' | Array of ticket numbers (when issued) |
| `metadata` | jsonb | DEFAULT '{}' | Additional booking metadata |
| `booked_at` | timestamptz | DEFAULT now() | Booking creation time |
| `confirmed_at` | timestamptz | - | Confirmation timestamp |
| `cancelled_at` | timestamptz | - | Cancellation timestamp |
| `created_at` | timestamptz | DEFAULT now() | Record creation |
| `updated_at` | timestamptz | DEFAULT now() | Last update |

**Constraints**:
- `valid_booking_price`: Price paid must be non-negative
- `valid_passengers`: At least one passenger required
- `valid_status`: Status must be one of allowed values

**Indexes**:
- `idx_flight_bookings_user_id` on (user_id)
- `idx_flight_bookings_pnr` on (pnr) WHERE pnr IS NOT NULL
- `idx_flight_bookings_status` on (status)
- `idx_flight_bookings_offer_id` on (offer_id)
- `idx_flight_bookings_created_at` on (created_at DESC)

**passengers JSON structure**:
```json
[
  {
    "first_name": "John",
    "last_name": "Doe",
    "dob": "1990-01-15",
    "document_type": "passport",
    "document_number": "A12345678",
    "nationality": "VN"
  }
]
```

**contact_info JSON structure**:
```json
{
  "email": "john@example.com",
  "phone": "+84901234567",
  "emergency_contact": "+84909876543"
}
```

---

### 4. flight_search_cache (Optional)

Caches search results for performance optimization.

**Purpose**: Stores frequently accessed search results to reduce database load.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Unique cache entry ID |
| `search_key` | text | UNIQUE, NOT NULL | Hash of search parameters |
| `origin` | text | NOT NULL | Origin IATA code |
| `destination` | text | NOT NULL | Destination IATA code |
| `departure_date` | date | NOT NULL | Departure date |
| `search_params` | jsonb | DEFAULT '{}' | Additional search parameters |
| `results` | jsonb | NOT NULL | Cached search results |
| `result_count` | int | DEFAULT 0 | Number of results |
| `created_at` | timestamptz | DEFAULT now() | Cache creation time |
| `expires_at` | timestamptz | NOT NULL | Cache expiration time |

**Constraints**:
- `valid_expiry`: Expiration must be after creation

**Indexes**:
- `idx_flight_search_cache_key` on (search_key)
- `idx_flight_search_cache_route_date` on (origin, destination, departure_date)
- `idx_flight_search_cache_expires` on (expires_at)

**Usage**: Cache results for 5-15 minutes to handle high traffic on popular routes.

---

## Relationships

```
flights (1) ←---(N) flight_offers
   ↑
   |
   |
flight_bookings (N)---→ (1) flight_offers
flight_bookings (N)---→ (1) flights
```

- Each **flight** can have multiple **offers** (different cabin classes, fare types)
- Each **booking** references one **offer** and one **flight**
- Bookings maintain references even if offers are deleted (ON DELETE SET NULL)

## Triggers

### updated_at Auto-Update

All tables with `updated_at` columns have triggers that automatically update the timestamp on any UPDATE operation:

```sql
CREATE TRIGGER update_flights_updated_at 
  BEFORE UPDATE ON flights
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

Similar triggers exist for `flight_offers` and `flight_bookings`.

## Data Integrity

### Referential Integrity
- Foreign keys ensure valid references between tables
- `ON DELETE CASCADE` for offers when flights are deleted
- `ON DELETE SET NULL` for bookings when offers/flights are deleted

### Constraints
- IATA codes validated to be exactly 3 characters
- Dates validated (arrival after departure, expiry after creation)
- Prices validated to be non-negative
- At least one passenger required for bookings

### Indexes
- Optimized for common query patterns (route search, user bookings)
- Partial indexes for active/available records
- Covering indexes for frequently joined queries

## Sample Queries

### Search flights between two cities
```sql
SELECT fo.*, f.*
FROM flight_offers fo
JOIN flights f ON fo.flight_id = f.id
WHERE f.origin = 'SGN'
  AND f.destination = 'HAN'
  AND DATE(f.departure_at) = '2026-02-20'
  AND fo.seats_available > 0
  AND fo.valid_until > NOW()
ORDER BY fo.total_price ASC;
```

### Get user's bookings
```sql
SELECT fb.*, f.*, fo.cabin_class, fo.fare_type
FROM flight_bookings fb
LEFT JOIN flights f ON fb.flight_id = f.id
LEFT JOIN flight_offers fo ON fb.offer_id = fo.id
WHERE fb.user_id = 'user_clerk_id'
ORDER BY fb.created_at DESC;
```

### Check seat availability
```sql
SELECT seats_available
FROM flight_offers
WHERE id = 'offer-uuid'
  AND valid_until > NOW()
  AND seats_available >= 2
FOR UPDATE; -- Lock for concurrent booking protection
```

## Migration Notes

- Run `20260125_flight_service_schema.sql` first to create tables
- Run `20260125_flight_service_seed.sql` to populate sample data
- For production, adjust seed data dates to future dates
- Consider adding Row Level Security (RLS) policies in Supabase for additional security

## Performance Considerations

- **Composite Indexes**: Route searches use (origin, destination, departure_at) index
- **Partial Indexes**: Only index available seats to reduce index size
- **JSONB Indexes**: Consider GIN indexes on JSONB columns for complex queries
- **Connection Pooling**: Use Supabase's built-in connection pooling
- **Query Optimization**: Use EXPLAIN ANALYZE for slow queries

## Security Notes

- User IDs from Clerk are stored as text (not foreign keys)
- Sensitive passenger data in JSONB (consider encryption at rest)
- PNR uniqueness ensures no duplicate booking references
- Server-side validation required before any data modifications
