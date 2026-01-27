# Hotel Service Database Schema

## 📊 Entity Relationship Diagram (ERD)

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│     hotels      │       │   hotel_rooms    │       │   hotel_rates   │
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)          │───┐   │ id (PK)         │
│ slug (UNIQUE)   │   └──→│ hotel_id (FK)    │   └──→│ room_id (FK)    │
│ title           │       │ code             │       │ date            │
│ description     │       │ title            │       │ price_cents     │
│ address         │       │ description      │       │ available_rooms │
│ city            │       │ capacity         │       │ min_nights      │
│ country         │       │ bed_type         │       │ max_nights      │
│ rating          │       │ bed_count        │       │ created_at      │
│ amenities[]     │       │ amenities[]      │       │ updated_at      │
│ images[]        │       │ images[]         │       └─────────────────┘
│ policies        │       │ max_adults       │               │
│ contact         │       │ max_children     │               │
│ status          │       │ status           │               │
│ created_at      │       │ created_at       │               │
│ updated_at      │       │ updated_at       │               │
└─────────────────┘       └──────────────────┘               │
        │                          │                          │
        │                          │                          │
        ↓                          ↓                          ↓
┌─────────────────┐       ┌──────────────────┐               │
│ hotel_bookings  │       │  hotel_reviews   │               │
├─────────────────┤       ├──────────────────┤               │
│ id (PK)         │       │ id (PK)          │               │
│ hotel_id (FK) ──┤       │ hotel_id (FK) ───┤               │
│ room_id (FK) ───┼───────┤ booking_id (FK)  │               │
│ user_id         │       │ user_id          │               │
│ confirmation_cd │       │ overall_rating   │               │
│ check_in_date   │       │ cleanliness_rat  │               │
│ check_out_date  │       │ comfort_rating   │               │
│ nights          │       │ location_rating  │               │
│ guest_info      │       │ service_rating   │               │
│ special_reqs    │       │ value_rating     │               │
│ total_price_cen │       │ review_text      │               │
│ status          │       │ status           │               │
│ created_at      │       │ created_at       │               │
│ updated_at      │       │ updated_at       │               │
└─────────────────┘       └──────────────────┘               │
                                                              │
                          ┌───────────────────────────────────┘
                          ↓
                    (Room availability
                     managed via rates)
```

## 📋 Table Definitions

### 1. `hotels`

Primary table for hotel properties.

| Column        | Type          | Constraints                                   | Description                                            |
| ------------- | ------------- | --------------------------------------------- | ------------------------------------------------------ |
| `id`          | UUID          | PRIMARY KEY, DEFAULT uuid_generate_v4()       | Unique identifier                                      |
| `slug`        | TEXT          | UNIQUE, NOT NULL                              | URL-friendly identifier (e.g., 'luxury-bangkok-hotel') |
| `title`       | TEXT          | NOT NULL                                      | Hotel name                                             |
| `description` | TEXT          | -                                             | Full description                                       |
| `address`     | TEXT          | NOT NULL                                      | Street address                                         |
| `city`        | TEXT          | NOT NULL                                      | City name                                              |
| `country`     | TEXT          | NOT NULL                                      | Country code (ISO 3166-1 alpha-2)                      |
| `latitude`    | DECIMAL(10,8) | -                                             | Latitude coordinate                                    |
| `longitude`   | DECIMAL(11,8) | -                                             | Longitude coordinate                                   |
| `rating`      | DECIMAL(3,2)  | CHECK (rating >= 0 AND rating <= 5)           | Average rating (0-5)                                   |
| `star_rating` | INTEGER       | CHECK (star_rating >= 1 AND star_rating <= 5) | Official star rating (1-5)                             |
| `amenities`   | TEXT[]        | DEFAULT '{}'                                  | Array of amenities (e.g., ['wifi', 'pool', 'gym'])     |
| `images`      | JSONB         | DEFAULT '[]'                                  | Array of image objects {url, alt, caption}             |
| `policies`    | JSONB         | -                                             | Hotel policies (check-in time, cancellation, etc.)     |
| `contact`     | JSONB         | -                                             | Contact info {phone, email, website}                   |
| `status`      | TEXT          | DEFAULT 'active'                              | active, inactive, pending                              |
| `created_at`  | TIMESTAMPTZ   | DEFAULT NOW()                                 | Creation timestamp                                     |
| `updated_at`  | TIMESTAMPTZ   | DEFAULT NOW()                                 | Last update timestamp                                  |

**Indexes:**

- `idx_hotels_slug` ON `slug` (UNIQUE)
- `idx_hotels_city` ON `city`
- `idx_hotels_status` ON `status`

**RLS Policies:**

- Public read access for `status = 'active'`
- Service role full access

---

### 2. `hotel_rooms`

Room types/categories within each hotel.

| Column         | Type         | Constraints                                       | Description                          |
| -------------- | ------------ | ------------------------------------------------- | ------------------------------------ |
| `id`           | UUID         | PRIMARY KEY, DEFAULT uuid_generate_v4()           | Unique identifier                    |
| `hotel_id`     | UUID         | NOT NULL, REFERENCES hotels(id) ON DELETE CASCADE | Parent hotel                         |
| `code`         | TEXT         | NOT NULL                                          | Room type code (e.g., 'DELUXE_KING') |
| `title`        | TEXT         | NOT NULL                                          | Room name (e.g., 'Deluxe King Room') |
| `description`  | TEXT         | -                                                 | Room description                     |
| `capacity`     | INTEGER      | NOT NULL, DEFAULT 2                               | Maximum occupancy                    |
| `bed_type`     | TEXT         | -                                                 | Bed type (e.g., 'King', 'Twin')      |
| `bed_count`    | INTEGER      | DEFAULT 1                                         | Number of beds                       |
| `size_sqm`     | DECIMAL(6,2) | -                                                 | Room size in square meters           |
| `amenities`    | TEXT[]       | DEFAULT '{}'                                      | Room-specific amenities              |
| `images`       | JSONB        | DEFAULT '[]'                                      | Room images                          |
| `max_adults`   | INTEGER      | DEFAULT 2                                         | Maximum adults allowed               |
| `max_children` | INTEGER      | DEFAULT 1                                         | Maximum children allowed             |
| `status`       | TEXT         | DEFAULT 'active'                                  | active, inactive, maintenance        |
| `created_at`   | TIMESTAMPTZ  | DEFAULT NOW()                                     | Creation timestamp                   |
| `updated_at`   | TIMESTAMPTZ  | DEFAULT NOW()                                     | Last update timestamp                |

**Unique Constraint:**

- `UNIQUE(hotel_id, code)` - One room type code per hotel

**Indexes:**

- `idx_hotel_rooms_hotel_id` ON `hotel_id`
- `idx_hotel_rooms_status` ON `status`

**RLS Policies:**

- Public read access for `status = 'active'`
- Service role full access

---

### 3. `hotel_rates`

Daily pricing and availability for each room type.

| Column            | Type        | Constraints                                            | Description                            |
| ----------------- | ----------- | ------------------------------------------------------ | -------------------------------------- |
| `id`              | UUID        | PRIMARY KEY, DEFAULT uuid_generate_v4()                | Unique identifier                      |
| `room_id`         | UUID        | NOT NULL, REFERENCES hotel_rooms(id) ON DELETE CASCADE | Parent room                            |
| `date`            | DATE        | NOT NULL                                               | Specific date for this rate            |
| `price_cents`     | INTEGER     | NOT NULL                                               | Price in cents (e.g., 15000 = $150.00) |
| `available_rooms` | INTEGER     | NOT NULL, DEFAULT 10                                   | Number of rooms available              |
| `min_nights`      | INTEGER     | DEFAULT 1                                              | Minimum stay requirement               |
| `max_nights`      | INTEGER     | -                                                      | Maximum stay allowed                   |
| `created_at`      | TIMESTAMPTZ | DEFAULT NOW()                                          | Creation timestamp                     |
| `updated_at`      | TIMESTAMPTZ | DEFAULT NOW()                                          | Last update timestamp                  |

**Unique Constraint:**

- `UNIQUE(room_id, date)` - One rate per room per date

**Indexes:**

- `idx_hotel_rates_room_date` ON `(room_id, date)`
- `idx_hotel_rates_date` ON `date`
- `idx_hotel_rates_available` ON `available_rooms` WHERE `available_rooms > 0`

**RLS Policies:**

- Public read access (for searching available rooms)
- Service role full access

**Triggers:**

- `update_hotel_rates_updated_at` - Auto-update `updated_at` on changes

---

### 4. `hotel_bookings`

Customer reservations.

| Column              | Type        | Constraints                             | Description                                         |
| ------------------- | ----------- | --------------------------------------- | --------------------------------------------------- |
| `id`                | UUID        | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier                                   |
| `hotel_id`          | UUID        | NOT NULL, REFERENCES hotels(id)         | Booked hotel                                        |
| `room_id`           | UUID        | NOT NULL, REFERENCES hotel_rooms(id)    | Booked room                                         |
| `user_id`           | TEXT        | NOT NULL                                | Clerk user ID                                       |
| `confirmation_code` | TEXT        | UNIQUE, NOT NULL                        | Booking reference (e.g., 'HB-ABC12345')             |
| `check_in_date`     | DATE        | NOT NULL                                | Check-in date                                       |
| `check_out_date`    | DATE        | NOT NULL                                | Check-out date                                      |
| `nights`            | INTEGER     | NOT NULL                                | Number of nights                                    |
| `guest_info`        | JSONB       | NOT NULL                                | Guest details {first_name, last_name, email, phone} |
| `special_requests`  | TEXT        | -                                       | Special requests or notes                           |
| `total_price_cents` | INTEGER     | NOT NULL                                | Total booking cost in cents                         |
| `status`            | TEXT        | DEFAULT 'pending'                       | pending, confirmed, cancelled, completed            |
| `created_at`        | TIMESTAMPTZ | DEFAULT NOW()                           | Booking creation time                               |
| `updated_at`        | TIMESTAMPTZ | DEFAULT NOW()                           | Last update time                                    |

**Indexes:**

- `idx_hotel_bookings_user_id` ON `user_id`
- `idx_hotel_bookings_confirmation` ON `confirmation_code` (UNIQUE)
- `idx_hotel_bookings_status` ON `status`
- `idx_hotel_bookings_dates` ON `(check_in_date, check_out_date)`

**RLS Policies:**

- Users can read their own bookings (`user_id = auth.uid()`)
- Users can insert bookings (authenticated)
- Service role full access

**Triggers:**

- `update_hotel_bookings_updated_at` - Auto-update `updated_at` on changes

---

### 5. `hotel_reviews`

Guest reviews and ratings.

| Column               | Type        | Constraints                                                   | Description                   |
| -------------------- | ----------- | ------------------------------------------------------------- | ----------------------------- |
| `id`                 | UUID        | PRIMARY KEY, DEFAULT uuid_generate_v4()                       | Unique identifier             |
| `hotel_id`           | UUID        | NOT NULL, REFERENCES hotels(id)                               | Reviewed hotel                |
| `booking_id`         | UUID        | REFERENCES hotel_bookings(id)                                 | Associated booking (optional) |
| `user_id`            | TEXT        | NOT NULL                                                      | Clerk user ID                 |
| `overall_rating`     | INTEGER     | NOT NULL, CHECK (overall_rating >= 1 AND overall_rating <= 5) | Overall rating (1-5)          |
| `cleanliness_rating` | INTEGER     | CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5)   | Cleanliness rating            |
| `comfort_rating`     | INTEGER     | CHECK (comfort_rating >= 1 AND comfort_rating <= 5)           | Comfort rating                |
| `location_rating`    | INTEGER     | CHECK (location_rating >= 1 AND location_rating <= 5)         | Location rating               |
| `service_rating`     | INTEGER     | CHECK (service_rating >= 1 AND service_rating <= 5)           | Service rating                |
| `value_rating`       | INTEGER     | CHECK (value_rating >= 1 AND value_rating <= 5)               | Value for money rating        |
| `review_text`        | TEXT        | -                                                             | Written review                |
| `status`             | TEXT        | DEFAULT 'pending'                                             | pending, approved, rejected   |
| `created_at`         | TIMESTAMPTZ | DEFAULT NOW()                                                 | Review submission time        |
| `updated_at`         | TIMESTAMPTZ | DEFAULT NOW()                                                 | Last update time              |

**Indexes:**

- `idx_hotel_reviews_hotel_id` ON `hotel_id`
- `idx_hotel_reviews_user_id` ON `user_id`
- `idx_hotel_reviews_status` ON `status`

**RLS Policies:**

- Public read access for `status = 'approved'`
- Users can insert reviews (authenticated)
- Users can read their own reviews
- Service role full access

**Triggers:**

- `update_hotel_reviews_updated_at` - Auto-update `updated_at` on changes

---

## 🔧 Utility Functions

### Triggers

All tables with `updated_at` have auto-update triggers:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_{table}_updated_at
    BEFORE UPDATE ON {table}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Extensions

Required PostgreSQL extensions:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- For UUID generation
```

---

## 📝 Sample Data

The migration includes 3 sample hotels:

1. **Luxury Bangkok Hotel** (luxury-bangkok-hotel)
   - 5-star hotel in Bangkok, Thailand
   - 3 room types (Deluxe King, Executive Suite, Presidential Suite)
   - Rates seeded for 30 days from migration date

2. **Beachfront Resort Phuket** (beachfront-resort-phuket)
   - 5-star beach resort in Phuket, Thailand
   - 3 room types (Ocean View, Beach Villa, Infinity Pool Villa)
   - Rates seeded for 30 days

3. **Historic Chiang Mai Inn** (historic-chiang-mai-inn)
   - 4-star boutique hotel in Chiang Mai, Thailand
   - 3 room types (Traditional Thai, Garden View, Lanna Suite)
   - Rates seeded for 30 days

Each hotel has:

- Complete address and contact information
- Amenities array
- Multiple images (URLs)
- Policies (check-in/out times, cancellation)
- Rooms with different pricing tiers
- Daily rates with availability

---

## 🔍 Query Examples

### Find available hotels in a city

```sql
SELECT h.*, COUNT(hr.id) as room_count
FROM hotels h
LEFT JOIN hotel_rooms hr ON h.id = hr.hotel_id AND hr.status = 'active'
WHERE h.city = 'Bangkok'
  AND h.status = 'active'
GROUP BY h.id
ORDER BY h.rating DESC;
```

### Check room availability for date range

```sql
SELECT
  hr.id,
  hr.title,
  MIN(hrt.price_cents) as min_price,
  MAX(hrt.price_cents) as max_price,
  MIN(hrt.available_rooms) as min_availability
FROM hotel_rooms hr
JOIN hotel_rates hrt ON hr.id = hrt.room_id
WHERE hr.hotel_id = 'hotel-uuid-here'
  AND hrt.date >= '2025-02-01'
  AND hrt.date < '2025-02-05'
  AND hrt.available_rooms > 0
GROUP BY hr.id, hr.title
HAVING COUNT(*) = 4; -- Must have rates for all 4 nights
```

### Get user's booking history

```sql
SELECT
  hb.*,
  h.title as hotel_name,
  hr.title as room_name
FROM hotel_bookings hb
JOIN hotels h ON hb.hotel_id = h.id
JOIN hotel_rooms hr ON hb.room_id = hr.id
WHERE hb.user_id = 'clerk-user-id'
ORDER BY hb.created_at DESC;
```

### Calculate hotel average rating from reviews

```sql
SELECT
  hotel_id,
  AVG(overall_rating) as avg_rating,
  COUNT(*) as review_count
FROM hotel_reviews
WHERE status = 'approved'
GROUP BY hotel_id;
```

---

## 🛡️ Security Considerations

### Row Level Security (RLS)

All tables have RLS enabled. Key policies:

- **Public Access**: Hotels, rooms, and rates are publicly readable when `status = 'active'`
- **User Access**: Users can only read/modify their own bookings and reviews
- **Admin Access**: Service role bypasses all RLS (for server-side operations)

### Data Privacy

- Guest info (`guest_info` JSONB) stored encrypted at rest by Supabase
- User IDs from Clerk (opaque strings, not email addresses)
- Confirmation codes are unique but non-sequential

### Constraints

- Check constraints prevent invalid ratings (1-5)
- Foreign keys ensure referential integrity
- Unique constraints prevent duplicate data
- NOT NULL constraints ensure required fields

---

## 🔄 Maintenance

### Index Maintenance

```sql
-- Reindex for performance
REINDEX TABLE hotels;
REINDEX TABLE hotel_rooms;
REINDEX TABLE hotel_rates;
REINDEX TABLE hotel_bookings;
REINDEX TABLE hotel_reviews;
```

### Cleanup Old Rates

```sql
-- Delete rates older than 1 year
DELETE FROM hotel_rates
WHERE date < NOW() - INTERVAL '1 year';
```

### Archive Completed Bookings

```sql
-- Archive bookings older than 2 years
UPDATE hotel_bookings
SET status = 'archived'
WHERE check_out_date < NOW() - INTERVAL '2 years'
  AND status = 'completed';
```

---

**Last Updated**: 2025-02-01  
**Schema Version**: 1.0.0  
**Migration File**: `001_create_hotel_schema.sql`
