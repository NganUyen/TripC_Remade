# Hotel Partner Database Schema

## 📊 Complete Entity Relationship Diagram

```
┌──────────────────────┐
│   hotel_partners     │ (Partner Organization)
├──────────────────────┤
│ id (PK)              │
│ code (UNIQUE)        │──┐
│ name                 │  │
│ description          │  │
│ logo_url             │  │
│ website_url          │  │
│ commission_rate      │  │
│ is_active            │  │
│ priority             │  │
│ contact (JSONB)      │  │
│ api_config (JSONB)   │  │
│ metadata (JSONB)     │  │
│ created_at           │  │
│ updated_at           │  │
└──────────────────────┘  │
         │                │
         │ (1:M)          │
         ↓                │
┌──────────────────────┐  │
│ hotel_partner_       │  │
│      listings        │  │ (Hotel-Partner Relationship)
├──────────────────────┤  │
│ id (PK)              │  │
│ hotel_id (FK) ───────┼──┼─┐
│ partner_id (FK) ──────┼─┘ │
│ partner_hotel_id     │    │
│ partner_hotel_url    │    │
│ is_active            │    │
│ last_synced_at       │    │
│ sync_status          │    │
│ metadata (JSONB)     │    │
│ created_at           │    │
│ updated_at           │    │
└──────────────────────┘    │
                            │
┌──────────────────────┐    │
│       hotels         │ ←──┘ (Hotel Property)
├──────────────────────┤
│ id (PK)              │───┐
│ slug (UNIQUE)        │   │
│ name                 │   │
│ description          │   │
│ address (JSONB)      │   │
│ star_rating          │   │
│ images (JSONB)       │   │
│ amenities (JSONB)    │   │
│ policies (JSONB)     │   │
│ contact (JSONB)      │   │
│ status               │   │
│ metadata (JSONB)     │   │
│ created_at           │   │
│ updated_at           │   │
└──────────────────────┘   │
         │                 │
         │ (1:M)           │
         ↓                 │
┌──────────────────────┐   │
│    hotel_rooms       │   │ (Room Types)
├──────────────────────┤   │
│ id (PK)              │   │
│ hotel_id (FK) ───────┼───┘
│ code                 │───┐
│ title                │   │
│ description          │   │
│ capacity             │   │
│ bed_type             │   │
│ bed_count            │   │
│ size_sqm             │   │
│ floor_range          │   │
│ view_type            │   │
│ images (JSONB)       │   │
│ amenities (JSONB)    │   │
│ is_smoking           │   │
│ is_accessible        │   │
│ max_adults           │   │
│ max_children         │   │
│ status               │   │
│ metadata (JSONB)     │   │
│ created_at           │   │
│ updated_at           │   │
└──────────────────────┘   │
         │                 │
         │ (1:M)           │
         ↓                 │
┌──────────────────────┐   │
│    hotel_rates       │   │ (Daily Pricing & Availability)
├──────────────────────┤   │
│ id (PK)              │   │
│ room_id (FK) ────────┼───┘
│ partner_id (FK)      │───┐
│ date                 │   │
│ price_cents          │   │
│ currency             │   │
│ available_rooms      │   │
│ min_nights           │   │
│ max_nights           │   │
│ cancellation_policy  │   │
│ refundable           │   │
│ breakfast_included   │   │
│ rate_plan            │   │
│ original_price_cents │   │
│ discount_percentage  │   │
│ is_best_price        │   │
│ price_match_guarantee│   │
│ tcent_earn_rate      │   │
│ tcent_eligible       │   │
│ metadata (JSONB)     │   │
│ created_at           │   │
│ updated_at           │   │
└──────────────────────┘   │
                           │
           ┌───────────────┘
           │
           ↓
┌──────────────────────┐
│   hotel_bookings     │ (Customer Reservations)
├──────────────────────┤
│ id (PK)              │
│ booking_id (FK)      │ → bookings table
│ user_uuid (FK)       │ → users table
│ hotel_id (FK)        │ → hotels table
│ room_id (FK)         │ → hotel_rooms table
│ partner_id (FK)      │ → hotel_partners table
│ confirmation_code    │
│ partner_booking_ref  │
│ check_in_date        │
│ check_out_date       │
│ nights_count         │
│ guest_name           │
│ guest_email          │
│ guest_phone          │
│ guest_count (JSONB)  │
│ special_requests     │
│ total_cents          │
│ nightly_rate_cents   │
│ tax_cents            │
│ fees_cents           │
│ discount_cents       │
│ currency             │
│ commission_cents     │
│ commission_rate      │
│ tcent_used           │
│ tcent_earned         │
│ tcent_earn_rate      │
│ working_pass_applied │
│ working_pass_disc... │
│ status               │
│ payment_status       │
│ payment_id           │
│ is_modified          │
│ original_booking_id  │
│ modification_count   │
│ modified_at          │
│ cancellation_policy  │
│ cancelled_at         │
│ cancelled_by         │
│ cancellation_reason  │
│ cancellation_fee_... │
│ refund_amount_cents  │
│ refund_status        │
│ refunded_at          │
│ metadata (JSONB)     │
│ booking_source       │
│ user_agent           │
│ ip_address           │
│ booked_at            │
│ confirmed_at         │
│ created_at           │
│ updated_at           │
└──────────────────────┘
         │
         │ (1:M)
         ↓
┌──────────────────────┐
│ hotel_booking_       │
│   modifications      │ (Change History)
├──────────────────────┤
│ id (PK)              │
│ booking_id (FK)      │
│ modification_type    │
│ old_values (JSONB)   │
│ new_values (JSONB)   │
│ price_difference_... │
│ refund_amount_cents  │
│ reason               │
│ requested_by         │
│ processed_by         │
│ status               │
│ processed_at         │
│ created_at           │
└──────────────────────┘
         │
         ↓
┌──────────────────────┐
│   hotel_reviews      │ (Customer Feedback)
├──────────────────────┤
│ id (PK)              │
│ hotel_id (FK)        │
│ booking_id (FK)      │
│ user_uuid (FK)       │
│ overall_rating       │
│ cleanliness_rating   │
│ comfort_rating       │
│ location_rating      │
│ service_rating       │
│ value_rating         │
│ title                │
│ comment              │
│ pros (ARRAY)         │
│ cons (ARRAY)         │
│ traveler_type        │
│ status               │
│ moderated_at         │
│ moderated_by         │
│ helpful_count        │
│ created_at           │
│ updated_at           │
└──────────────────────┘
```

## 📋 Table Definitions

### 1. `hotel_partners`

**Purpose**: Stores partner organization information (hotel chains, independent hotels, OTAs)

| Column            | Type         | Constraints                         | Description                                      |
|-------------------|--------------|-------------------------------------|--------------------------------------------------|
| `id`              | UUID         | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier                          |
| `code`            | TEXT         | UNIQUE, NOT NULL                    | Partner code (e.g., 'BOOKING_COM', 'DIRECT')    |
| `name`            | TEXT         | NOT NULL                            | Partner display name                             |
| `description`     | TEXT         | -                                   | Partner description                              |
| `logo_url`        | TEXT         | -                                   | Partner logo URL                                 |
| `website_url`     | TEXT         | -                                   | Partner website                                  |
| `commission_rate` | NUMERIC      | DEFAULT 0.10                        | Commission rate (decimal, e.g., 0.15 = 15%)     |
| `is_active`       | BOOLEAN      | DEFAULT true                        | Whether partner is active                        |
| `priority`        | INTEGER      | DEFAULT 0                           | Display priority (higher = shown first)          |
| `contact`         | JSONB        | DEFAULT '{}'                        | Contact information: {email, phone, address}     |
| `api_config`      | JSONB        | DEFAULT '{}'                        | API credentials and endpoints                    |
| `metadata`        | JSONB        | DEFAULT '{}'                        | Additional partner metadata                      |
| `created_at`      | TIMESTAMPTZ  | DEFAULT NOW()                       | Creation timestamp                               |
| `updated_at`      | TIMESTAMPTZ  | DEFAULT NOW()                       | Last update timestamp                            |

**Indexes**:
- `idx_hotel_partners_code` ON `code` (UNIQUE)
- `idx_hotel_partners_active` ON `is_active`
- `idx_hotel_partners_priority` ON `priority`

**Example Data**:
```json
{
  "code": "DIRECT",
  "name": "Direct Booking",
  "commission_rate": 0.10,
  "contact": {
    "email": "partner@hotel.com",
    "phone": "+84-123-456-789"
  },
  "api_config": {
    "base_url": "https://api.hotel.com/v1",
    "api_key": "encrypted_key",
    "webhook_url": "https://tripc.com/webhooks/hotel-booking"
  }
}
```

---

### 2. `hotel_partner_listings`

**Purpose**: Links hotels to partners (many-to-many relationship)

| Column               | Type        | Constraints                         | Description                                |
|----------------------|-------------|-------------------------------------|--------------------------------------------|
| `id`                 | UUID        | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier                    |
| `hotel_id`           | UUID        | FK → hotels(id)                     | Hotel reference                            |
| `partner_id`         | UUID        | FK → hotel_partners(id)             | Partner reference                          |
| `partner_hotel_id`   | TEXT        | NOT NULL                            | Hotel ID in partner's system               |
| `partner_hotel_url`  | TEXT        | -                                   | Direct link to hotel on partner platform   |
| `is_active`          | BOOLEAN     | DEFAULT true                        | Whether listing is active                  |
| `last_synced_at`     | TIMESTAMPTZ | -                                   | Last successful sync timestamp             |
| `sync_status`        | TEXT        | DEFAULT 'active'                    | 'active', 'syncing', 'error', 'disabled'   |
| `metadata`           | JSONB       | DEFAULT '{}'                        | Sync errors, rate differences, etc.        |
| `created_at`         | TIMESTAMPTZ | DEFAULT NOW()                       | Creation timestamp                         |
| `updated_at`         | TIMESTAMPTZ | DEFAULT NOW()                       | Last update timestamp                      |

**Indexes**:
- `idx_hotel_listings_hotel` ON `hotel_id`
- `idx_hotel_listings_partner` ON `partner_id`
- `idx_hotel_listings_active` ON `is_active`
- `unique_hotel_partner` UNIQUE(`hotel_id`, `partner_id`)

**Business Rules**:
- A hotel can be listed with multiple partners
- Each hotel-partner combination must be unique
- `sync_status` tracks integration health

---

### 3. `hotels`

**Purpose**: Core hotel property information

**(Already exists - see main schema)**

**Partner-Relevant Fields**:
- `status`: 'active', 'inactive', 'pending' (pending = awaiting approval)
- `metadata.partner_id`: Which partner owns this property
- `metadata.onboarding_status`: 'draft', 'submitted', 'approved', 'live'

---

### 4. `hotel_rooms`

**Purpose**: Room types within hotels

**(Already exists - see main schema)**

**Partner-Relevant Fields**:
- `code`: Room code in partner's system
- `status`: 'active', 'inactive', 'maintenance'

---

### 5. `hotel_rates`

**Purpose**: Daily pricing and availability per room

**(Already exists - see main schema)**

**Partner-Specific Fields**:
- `partner_id`: Which partner is providing this rate
- `is_best_price`: Whether this is the best available price
- `price_match_guarantee`: Whether price matching is offered

**Key Points for Partners**:
- Partners update rates through API or portal
- Each room can have different rates from different partners
- System automatically marks `is_best_price` based on comparisons
- `available_rooms` must be updated in real-time

---

### 6. `hotel_bookings`

**Purpose**: Customer reservations

**(Already exists - see main schema)**

**Partner-Relevant Fields**:
- `partner_id`: Which partner processed the booking
- `partner_booking_ref`: Booking reference in partner's system
- `commission_cents`: TripC commission amount
- `commission_rate`: Applied commission rate
- `booking_source`: 'web', 'mobile', 'api', 'partner_portal'

**Booking Statuses**:
- `pending`: Awaiting confirmation
- `confirmed`: Confirmed by hotel
- `checked_in`: Guest has arrived
- `checked_out`: Stay completed
- `cancelled`: Booking cancelled
- `no_show`: Guest didn't arrive
- `modified`: Booking has been changed

**Payment Statuses**:
- `pending`: Payment not yet processed
- `paid`: Payment successful
- `refunded`: Full refund issued
- `partially_refunded`: Partial refund issued
- `failed`: Payment failed

---

### 7. `hotel_booking_modifications`

**Purpose**: Track changes to bookings

**(Already exists - see main schema)**

**Modification Types**:
- `date_change`: Check-in/out dates modified
- `room_change`: Different room type
- `guest_change`: Guest details updated
- `cancellation`: Booking cancelled
- `upgrade`: Room upgraded
- `downgrade`: Room downgraded

---

### 8. `hotel_reviews`

**Purpose**: Customer feedback and ratings

**(Already exists - see main schema)**

**Review Statuses**:
- `pending`: Awaiting moderation
- `approved`: Published on platform
- `rejected`: Not suitable for publication
- `flagged`: Requires attention

---

## 🆕 Additional Partner Tables

### 9. `partner_users` (NEW)

**Purpose**: User accounts for partner portal (separate from customer users)

| Column            | Type         | Constraints                         | Description                            |
|-------------------|--------------|-------------------------------------|----------------------------------------|
| `id`              | UUID         | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier            |
| `partner_id`      | UUID         | FK → hotel_partners(id)             | Associated partner                     |
| `email`           | TEXT         | UNIQUE, NOT NULL                    | Login email                            |
| `password_hash`   | TEXT         | NOT NULL                            | Bcrypt hashed password                 |
| `first_name`      | TEXT         | NOT NULL                            | First name                             |
| `last_name`       | TEXT         | NOT NULL                            | Last name                              |
| `phone`           | TEXT         | -                                   | Phone number                           |
| `role`            | TEXT         | NOT NULL                            | 'admin', 'manager', 'staff'            |
| `permissions`     | JSONB        | DEFAULT '[]'                        | Permission array                       |
| `is_active`       | BOOLEAN      | DEFAULT true                        | Account status                         |
| `last_login_at`   | TIMESTAMPTZ  | -                                   | Last login timestamp                   |
| `created_at`      | TIMESTAMPTZ  | DEFAULT NOW()                       | Creation timestamp                     |
| `updated_at`      | TIMESTAMPTZ  | DEFAULT NOW()                       | Last update timestamp                  |

**Indexes**:
- `idx_partner_users_email` ON `email` (UNIQUE)
- `idx_partner_users_partner` ON `partner_id`

---

### 10. `partner_permissions` (NEW)

**Purpose**: Granular permission management

| Column        | Type         | Constraints                         | Description                        |
|---------------|--------------|-------------------------------------|------------------------------------|
| `id`          | UUID         | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier        |
| `user_id`     | UUID         | FK → partner_users(id)              | User reference                     |
| `hotel_id`    | UUID         | FK → hotels(id), NULL allowed       | Specific hotel (NULL = all hotels) |
| `resource`    | TEXT         | NOT NULL                            | 'hotels', 'rooms', 'rates', etc.   |
| `actions`     | TEXT[]       | NOT NULL                            | ['read', 'write', 'delete']        |
| `created_at`  | TIMESTAMPTZ  | DEFAULT NOW()                       | Creation timestamp                 |

**Permission Examples**:
```json
{
  "user_id": "uuid-123",
  "hotel_id": null,  // All hotels
  "resource": "rates",
  "actions": ["read", "write"]
}

{
  "user_id": "uuid-456",
  "hotel_id": "hotel-uuid-789",  // Specific hotel only
  "resource": "bookings",
  "actions": ["read"]
}
```

---

### 11. `partner_analytics` (NEW)

**Purpose**: Pre-calculated analytics for dashboard performance

| Column              | Type         | Constraints                         | Description                      |
|---------------------|--------------|-------------------------------------|----------------------------------|
| `id`                | UUID         | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier      |
| `partner_id`        | UUID         | FK → hotel_partners(id)             | Partner reference                |
| `hotel_id`          | UUID         | FK → hotels(id), NULL allowed       | Specific hotel or all            |
| `metric_date`       | DATE         | NOT NULL                            | Date of metrics                  |
| `total_bookings`    | INTEGER      | DEFAULT 0                           | Number of bookings               |
| `total_revenue_cents` | BIGINT     | DEFAULT 0                           | Total revenue in cents           |
| `commission_cents`  | BIGINT       | DEFAULT 0                           | Commission earned                |
| `occupancy_rate`    | NUMERIC      | DEFAULT 0                           | Occupancy rate (0-1)             |
| `avg_daily_rate_cents` | INTEGER   | DEFAULT 0                           | ADR in cents                     |
| `revpar_cents`      | INTEGER      | DEFAULT 0                           | RevPAR in cents                  |
| `cancellation_count` | INTEGER     | DEFAULT 0                           | Number of cancellations          |
| `avg_lead_time_days` | INTEGER     | DEFAULT 0                           | Average booking lead time        |
| `avg_length_of_stay` | NUMERIC     | DEFAULT 0                           | Average nights per booking       |
| `metadata`          | JSONB        | DEFAULT '{}'                        | Additional metrics               |
| `created_at`        | TIMESTAMPTZ  | DEFAULT NOW()                       | Creation timestamp               |

**Indexes**:
- `idx_analytics_partner_date` ON `partner_id, metric_date`
- `idx_analytics_hotel_date` ON `hotel_id, metric_date`

**Update Frequency**: Daily batch job

---

### 12. `partner_payouts` (NEW)

**Purpose**: Track commission payments to TripC

| Column              | Type         | Constraints                         | Description                      |
|---------------------|--------------|-------------------------------------|----------------------------------|
| `id`                | UUID         | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier      |
| `partner_id`        | UUID         | FK → hotel_partners(id)             | Partner reference                |
| `period_start`      | DATE         | NOT NULL                            | Payout period start              |
| `period_end`        | DATE         | NOT NULL                            | Payout period end                |
| `total_bookings`    | INTEGER      | DEFAULT 0                           | Number of bookings               |
| `gross_revenue_cents` | BIGINT     | DEFAULT 0                           | Total booking value              |
| `commission_cents`  | BIGINT       | DEFAULT 0                           | TripC commission owed            |
| `adjustments_cents` | INTEGER      | DEFAULT 0                           | Refunds, chargebacks             |
| `net_payout_cents`  | BIGINT       | DEFAULT 0                           | Amount to pay                    |
| `currency`          | TEXT         | DEFAULT 'USD'                       | Currency code                    |
| `status`            | TEXT         | DEFAULT 'pending'                   | 'pending', 'paid', 'overdue'     |
| `paid_at`           | TIMESTAMPTZ  | -                                   | Payment timestamp                |
| `payment_method`    | TEXT         | -                                   | 'bank_transfer', 'stripe'        |
| `payment_reference` | TEXT         | -                                   | Transaction ID                   |
| `metadata`          | JSONB        | DEFAULT '{}'                        | Invoice details                  |
| `created_at`        | TIMESTAMPTZ  | DEFAULT NOW()                       | Creation timestamp               |

**Indexes**:
- `idx_payouts_partner` ON `partner_id`
- `idx_payouts_period` ON `period_end`

---

## 🔐 Row Level Security (RLS) Policies

### For `hotel_partners`
```sql
-- Partners can read their own data
CREATE POLICY partner_read_own ON hotel_partners
  FOR SELECT
  USING (id = get_current_partner_id());

-- Service role has full access
CREATE POLICY service_full_access ON hotel_partners
  FOR ALL
  USING (auth.role() = 'service_role');
```

### For `hotels`
```sql
-- Partners can read hotels they manage
CREATE POLICY partner_read_hotels ON hotels
  FOR SELECT
  USING (
    id IN (
      SELECT hotel_id 
      FROM hotel_partner_listings 
      WHERE partner_id = get_current_partner_id()
    )
  );

-- Partners can update their hotels
CREATE POLICY partner_update_hotels ON hotels
  FOR UPDATE
  USING (
    id IN (
      SELECT hotel_id 
      FROM hotel_partner_listings 
      WHERE partner_id = get_current_partner_id()
    )
  );
```

### For `hotel_bookings`
```sql
-- Partners can read bookings for their hotels
CREATE POLICY partner_read_bookings ON hotel_bookings
  FOR SELECT
  USING (partner_id = get_current_partner_id());

-- Partners can update booking status
CREATE POLICY partner_update_bookings ON hotel_bookings
  FOR UPDATE
  USING (partner_id = get_current_partner_id())
  WITH CHECK (
    -- Can only update specific fields
    old.partner_id = new.partner_id
  );
```

## 📊 Key Indexes

```sql
-- Composite indexes for common queries
CREATE INDEX idx_rates_room_date_partner 
  ON hotel_rates(room_id, date, partner_id);

CREATE INDEX idx_bookings_partner_status 
  ON hotel_bookings(partner_id, status, check_in_date);

CREATE INDEX idx_bookings_hotel_checkin 
  ON hotel_bookings(hotel_id, check_in_date) 
  WHERE status NOT IN ('cancelled');

-- GIN indexes for JSONB columns
CREATE INDEX idx_hotels_amenities 
  ON hotels USING GIN (amenities);

CREATE INDEX idx_rooms_amenities 
  ON hotel_rooms USING GIN (amenities);
```

## 🔄 Database Functions

### `get_current_partner_id()`
```sql
CREATE OR REPLACE FUNCTION get_current_partner_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.partner_id', true)::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### `calculate_occupancy_rate()`
```sql
CREATE OR REPLACE FUNCTION calculate_occupancy_rate(
  p_hotel_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS NUMERIC AS $$
DECLARE
  total_room_nights INTEGER;
  booked_nights INTEGER;
BEGIN
  -- Calculate total available room nights
  SELECT SUM(available_rooms) INTO total_room_nights
  FROM hotel_rates
  WHERE room_id IN (
    SELECT id FROM hotel_rooms WHERE hotel_id = p_hotel_id
  )
  AND date >= p_start_date AND date < p_end_date;
  
  -- Calculate booked nights
  SELECT COUNT(*) INTO booked_nights
  FROM hotel_bookings
  WHERE hotel_id = p_hotel_id
  AND check_in_date >= p_start_date 
  AND check_in_date < p_end_date
  AND status NOT IN ('cancelled', 'no_show');
  
  -- Return occupancy rate
  IF total_room_nights > 0 THEN
    RETURN ROUND((booked_nights::NUMERIC / total_room_nights) * 100, 2);
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### `update_hotel_best_price()`
```sql
CREATE OR REPLACE FUNCTION update_hotel_best_price()
RETURNS TRIGGER AS $$
BEGIN
  -- When a rate is inserted/updated, recalculate best price
  UPDATE hotel_rates
  SET is_best_price = (
    price_cents = (
      SELECT MIN(price_cents)
      FROM hotel_rates
      WHERE room_id = NEW.room_id
      AND date = NEW.date
      AND available_rooms > 0
    )
  )
  WHERE room_id = NEW.room_id AND date = NEW.date;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_best_price
  AFTER INSERT OR UPDATE ON hotel_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_hotel_best_price();
```

## 🎯 Data Integrity Rules

### Business Constraints

```sql
-- Ensure check-out is after check-in
ALTER TABLE hotel_bookings
  ADD CONSTRAINT check_valid_dates
  CHECK (check_out_date > check_in_date);

-- Ensure positive prices
ALTER TABLE hotel_rates
  ADD CONSTRAINT check_positive_price
  CHECK (price_cents > 0);

-- Ensure valid commission rate
ALTER TABLE hotel_partners
  ADD CONSTRAINT check_valid_commission
  CHECK (commission_rate >= 0 AND commission_rate <= 1);

-- Ensure valid room capacity
ALTER TABLE hotel_rooms
  ADD CONSTRAINT check_positive_capacity
  CHECK (capacity > 0 AND max_adults > 0);
```

## 📈 Performance Considerations

### Partitioning Strategy

For large-scale deployments, consider partitioning:

```sql
-- Partition hotel_rates by month
CREATE TABLE hotel_rates_2026_01 PARTITION OF hotel_rates
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- Partition hotel_bookings by year
CREATE TABLE hotel_bookings_2026 PARTITION OF hotel_bookings
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

### Caching Strategy

- **Redis Cache**: Store frequently accessed rates (today + next 7 days)
- **CDN**: Cache hotel images and static content
- **Application Cache**: Partner configuration and settings

---

**Document Version**: 1.0  
**Last Updated**: February 8, 2026  
**Maintained By**: TripC Development Team
