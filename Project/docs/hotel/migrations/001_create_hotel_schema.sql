-- ============================================================================
-- Hotel Service Schema Migration
-- Integrated with TripC Auth System (Clerk + Supabase)
-- Based on TripC Platform Architecture Flowchart
-- ============================================================================
-- Created: 2026-01-26
-- Updated: 2026-01-26 (Added Partner System & Price Comparison)
-- Purpose: Create tables for Hotel Service MVP with Partner Integration
-- Integration: Uses Clerk user IDs, follows existing RLS pattern
-- Business Model: Multi-partner hotel aggregation with price comparison
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- =====================================================
-- MIGRATION STRATEGY: Handle Existing Tables
-- =====================================================
-- Drop existing tables if they exist (for clean migration)
-- WARNING: This will delete all existing data!
-- Comment out these lines if you want to preserve data
DROP TABLE IF EXISTS hotel_booking_modifications CASCADE;
DROP TABLE IF EXISTS hotel_reviews CASCADE;
DROP TABLE IF EXISTS hotel_bookings CASCADE;
DROP TABLE IF EXISTS hotel_rates CASCADE;
DROP TABLE IF EXISTS hotel_partner_listings CASCADE;
DROP TABLE IF EXISTS hotel_rooms CASCADE;
DROP TABLE IF EXISTS hotel_partners CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;

-- =====================================================
-- Table: hotels
-- Purpose: Store hotel properties
-- =====================================================
CREATE TABLE hotels (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  address jsonb DEFAULT '{}'::jsonb,  -- {line1, line2, city, state, country, postal_code, lat, lng}
  star_rating smallint CHECK (star_rating >= 0 AND star_rating <= 5),
  images jsonb DEFAULT '[]'::jsonb,  -- [{url, caption, is_primary}]
  amenities jsonb DEFAULT '[]'::jsonb,  -- ['wifi', 'pool', 'gym', 'parking', 'restaurant']
  policies jsonb DEFAULT '{}'::jsonb,  -- {check_in, check_out, cancellation, pets, smoking}
  contact jsonb DEFAULT '{}'::jsonb,  -- {phone, email, website}
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for hotels
CREATE INDEX IF NOT EXISTS idx_hotels_slug ON hotels (slug);
CREATE INDEX IF NOT EXISTS idx_hotels_status ON hotels (status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_hotels_star_rating ON hotels (star_rating);
CREATE INDEX IF NOT EXISTS idx_hotels_name ON hotels USING gin (name gin_trgm_ops);  -- For fuzzy search
CREATE INDEX IF NOT EXISTS idx_hotels_address_city ON hotels ((address->>'city'));
CREATE INDEX IF NOT EXISTS idx_hotels_address_country ON hotels ((address->>'country'));

-- =====================================================
-- Table: hotel_rooms
-- Purpose: Store room types/categories for hotels
-- =====================================================
CREATE TABLE hotel_rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE,
  code text NOT NULL,  -- e.g., "DELUXE_1", "SUITE_OCEAN"
  title text NOT NULL,
  description text,
  capacity smallint DEFAULT 1 CHECK (capacity > 0),
  bed_type text,  -- 'king', 'queen', 'twin', 'double'
  bed_count smallint DEFAULT 1,
  size_sqm numeric(6,2),
  floor_range text,  -- e.g., "10-15"
  view_type text,  -- 'ocean', 'city', 'garden', 'mountain'
  images jsonb DEFAULT '[]'::jsonb,
  amenities jsonb DEFAULT '[]'::jsonb,  -- ['wifi', 'minibar', 'safe', 'tv', 'balcony']
  is_smoking boolean DEFAULT false,
  is_accessible boolean DEFAULT false,
  max_adults smallint DEFAULT 2,
  max_children smallint DEFAULT 1,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE (hotel_id, code)
);

-- Indexes for hotel_rooms
CREATE INDEX IF NOT EXISTS idx_hotel_rooms_hotel_id ON hotel_rooms (hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_rooms_status ON hotel_rooms (status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_hotel_rooms_capacity ON hotel_rooms (capacity);

-- =====================================================
-- Table: hotel_partners
-- Purpose: Booking partners (Agoda, Booking.com, etc.)
-- =====================================================
CREATE TABLE hotel_partners (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text UNIQUE NOT NULL,  -- 'AGODA', 'BOOKING_COM', 'EXPEDIA', 'DIRECT'
  name text NOT NULL,
  description text,
  logo_url text,
  website_url text,
  commission_rate numeric(5,4) DEFAULT 0.10,  -- 10% commission
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,  -- Higher priority shown first
  contact jsonb DEFAULT '{}'::jsonb,
  api_config jsonb DEFAULT '{}'::jsonb,  -- API credentials and settings
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for hotel_partners
CREATE INDEX IF NOT EXISTS idx_hotel_partners_code ON hotel_partners (code);
CREATE INDEX IF NOT EXISTS idx_hotel_partners_active ON hotel_partners (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_hotel_partners_priority ON hotel_partners (priority DESC);

-- =====================================================
-- Table: hotel_partner_listings
-- Purpose: Link hotels to partners (same hotel can be on multiple partners)
-- =====================================================
CREATE TABLE hotel_partner_listings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES hotel_partners(id) ON DELETE CASCADE,
  partner_hotel_id text NOT NULL,  -- Hotel ID in partner's system
  partner_hotel_url text,  -- Deep link to hotel on partner site
  is_active boolean DEFAULT true,
  last_synced_at timestamptz,
  sync_status text DEFAULT 'active',  -- 'active', 'error', 'disabled'
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE (hotel_id, partner_id)
);

-- Indexes for hotel_partner_listings
CREATE INDEX IF NOT EXISTS idx_hotel_partner_listings_hotel_id ON hotel_partner_listings (hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_partner_listings_partner_id ON hotel_partner_listings (partner_id);
CREATE INDEX IF NOT EXISTS idx_hotel_partner_listings_active ON hotel_partner_listings (is_active) WHERE is_active = true;

-- =====================================================
-- Table: hotel_rates
-- Purpose: Daily rates and availability (partner-specific)
-- =====================================================
CREATE TABLE hotel_rates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id uuid REFERENCES hotel_rooms(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES hotel_partners(id) ON DELETE CASCADE,  -- NEW: Partner-specific rates
  date date NOT NULL,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  currency text NOT NULL DEFAULT 'USD',
  available_rooms smallint DEFAULT 0 CHECK (available_rooms >= 0),
  min_nights smallint DEFAULT 1,
  max_nights smallint,
  cancellation_policy text DEFAULT 'flexible',  -- 'flexible', 'moderate', 'strict'
  refundable boolean DEFAULT true,
  breakfast_included boolean DEFAULT false,
  rate_plan text DEFAULT 'standard',  -- 'standard', 'advance_purchase', 'last_minute'
  
  -- Price comparison fields
  original_price_cents integer,  -- Before discount
  discount_percentage numeric(5,2),  -- Discount %
  is_best_price boolean DEFAULT false,  -- Flag for best price
  price_match_guarantee boolean DEFAULT false,
  
  -- Loyalty integration
  tcent_earn_rate numeric(5,4) DEFAULT 0.05,  -- 5% TCent earning
  tcent_eligible boolean DEFAULT true,
  
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE (room_id, partner_id, date)  -- Updated unique constraint
);

-- Indexes for hotel_rates
CREATE INDEX IF NOT EXISTS idx_hotel_rates_room_id ON hotel_rates (room_id);
CREATE INDEX IF NOT EXISTS idx_hotel_rates_partner_id ON hotel_rates (partner_id);
CREATE INDEX IF NOT EXISTS idx_hotel_rates_date ON hotel_rates (date);
CREATE INDEX IF NOT EXISTS idx_hotel_rates_available ON hotel_rates (available_rooms) WHERE available_rooms > 0;
CREATE INDEX IF NOT EXISTS idx_hotel_rates_room_date_range ON hotel_rates (room_id, date);
CREATE INDEX IF NOT EXISTS idx_hotel_rates_best_price ON hotel_rates (is_best_price) WHERE is_best_price = true;
CREATE INDEX IF NOT EXISTS idx_hotel_rates_room_partner_date ON hotel_rates (room_id, partner_id, date);

-- =====================================================
-- Table: hotel_bookings
-- Purpose: Store hotel booking records with partner integration
-- =====================================================
CREATE TABLE hotel_bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,  -- Clerk user ID
  hotel_id uuid REFERENCES hotels(id) ON DELETE RESTRICT,
  room_id uuid REFERENCES hotel_rooms(id) ON DELETE RESTRICT,
  partner_id uuid REFERENCES hotel_partners(id) ON DELETE RESTRICT,  -- NEW: Booking partner
  
  -- Booking Reference
  confirmation_code text UNIQUE NOT NULL,  -- 8-char alphanumeric
  partner_booking_ref text,  -- Booking reference from partner system
  
  -- Dates
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  nights_count smallint GENERATED ALWAYS AS (check_out_date - check_in_date) STORED,
  
  -- Guest Information
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text NOT NULL,
  guest_count jsonb NOT NULL,  -- {adults: 2, children: 1, infants: 0}
  special_requests text,
  
  -- Pricing
  total_cents integer NOT NULL CHECK (total_cents >= 0),
  nightly_rate_cents integer NOT NULL,
  tax_cents integer DEFAULT 0,
  fees_cents integer DEFAULT 0,
  discount_cents integer DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  
  -- Partner Commission
  commission_cents integer DEFAULT 0,
  commission_rate numeric(5,4),
  
  -- Loyalty (TCent System)
  tcent_used integer DEFAULT 0,
  tcent_earned integer DEFAULT 0,
  tcent_earn_rate numeric(5,4) DEFAULT 0.05,
  working_pass_applied boolean DEFAULT false,  -- NEW: Working Pass usage
  working_pass_discount_cents integer DEFAULT 0,
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show', 'modified')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'partially_refunded', 'failed')),
  payment_id text,
  
  -- Modification Support (NEW)
  is_modified boolean DEFAULT false,
  original_booking_id uuid REFERENCES hotel_bookings(id),
  modification_count integer DEFAULT 0,
  modified_at timestamptz,
  
  -- Cancellation
  cancellation_policy text,
  cancelled_at timestamptz,
  cancelled_by text,  -- user_id or 'system'
  cancellation_reason text,
  cancellation_fee_cents integer,
  refund_amount_cents integer,
  refund_status text,  -- 'pending', 'processed', 'failed'
  refunded_at timestamptz,
  
  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,
  booking_source text DEFAULT 'web',  -- 'web', 'mobile', 'api'
  user_agent text,
  ip_address inet,
  
  -- Timestamps
  booked_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_dates CHECK (check_out_date > check_in_date),
  CONSTRAINT valid_pricing CHECK (total_cents = nightly_rate_cents * nights_count + tax_cents + fees_cents - discount_cents - working_pass_discount_cents)
);

-- Indexes for hotel_bookings
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_user_id ON hotel_bookings (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_confirmation ON hotel_bookings (confirmation_code);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_hotel_id ON hotel_bookings (hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_room_id ON hotel_bookings (room_id);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_partner_id ON hotel_bookings (partner_id);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_status ON hotel_bookings (status);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_dates ON hotel_bookings (check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_modified ON hotel_bookings (is_modified) WHERE is_modified = true;
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_original ON hotel_bookings (original_booking_id) WHERE original_booking_id IS NOT NULL;

-- Enable RLS for hotel_bookings
ALTER TABLE hotel_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hotel_bookings
CREATE POLICY "Users can view own hotel bookings"
  ON hotel_bookings
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.jwt()->>'sub'));

CREATE POLICY "Users can create own hotel bookings"
  ON hotel_bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.jwt()->>'sub'));

CREATE POLICY "Users can update own hotel bookings"
  ON hotel_bookings
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.jwt()->>'sub'));

CREATE POLICY "Service role can manage all hotel bookings"
  ON hotel_bookings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Table: hotel_reviews
-- Purpose: Guest reviews and ratings
-- =====================================================
CREATE TABLE hotel_reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES hotel_bookings(id) ON DELETE SET NULL,
  user_id text NOT NULL,
  
  -- Ratings (1-5)
  overall_rating smallint NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  cleanliness_rating smallint CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  comfort_rating smallint CHECK (comfort_rating >= 1 AND comfort_rating <= 5),
  location_rating smallint CHECK (location_rating >= 1 AND location_rating <= 5),
  service_rating smallint CHECK (service_rating >= 1 AND service_rating <= 5),
  value_rating smallint CHECK (value_rating >= 1 AND value_rating <= 5),
  
  -- Review Content
  title text,
  comment text,
  pros text[],
  cons text[],
  
  -- Traveler Info
  traveler_type text,  -- 'business', 'couple', 'family', 'solo', 'group'
  
  -- Moderation
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderated_at timestamptz,
  moderated_by text,
  
  -- Engagement
  helpful_count integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for hotel_reviews
CREATE INDEX IF NOT EXISTS idx_hotel_reviews_hotel_id ON hotel_reviews (hotel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hotel_reviews_user_id ON hotel_reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_hotel_reviews_status ON hotel_reviews (status) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_hotel_reviews_rating ON hotel_reviews (overall_rating);

-- Enable RLS for hotel_reviews
ALTER TABLE hotel_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hotel_reviews
CREATE POLICY "Anyone can view approved reviews"
  ON hotel_reviews
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can create own reviews"
  ON hotel_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.jwt()->>'sub'));

CREATE POLICY "Users can update own reviews"
  ON hotel_reviews
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.jwt()->>'sub'));

CREATE POLICY "Service role can manage all reviews"
  ON hotel_reviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Table: hotel_booking_modifications
-- Purpose: Track booking modification history
-- =====================================================
CREATE TABLE hotel_booking_modifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES hotel_bookings(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  
  -- What changed
  modification_type text NOT NULL,  -- 'dates', 'room', 'guests', 'cancellation'
  old_values jsonb NOT NULL,
  new_values jsonb NOT NULL,
  
  -- Pricing impact
  price_difference_cents integer DEFAULT 0,
  refund_amount_cents integer DEFAULT 0,
  additional_charge_cents integer DEFAULT 0,
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  processed_at timestamptz,
  processed_by text,
  
  -- Notes
  reason text,
  admin_notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for hotel_booking_modifications
CREATE INDEX IF NOT EXISTS idx_hotel_booking_modifications_booking_id ON hotel_booking_modifications (booking_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hotel_booking_modifications_user_id ON hotel_booking_modifications (user_id);
CREATE INDEX IF NOT EXISTS idx_hotel_booking_modifications_status ON hotel_booking_modifications (status);

-- Enable RLS for hotel_booking_modifications
ALTER TABLE hotel_booking_modifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hotel_booking_modifications
CREATE POLICY "Users can view own booking modifications"
  ON hotel_booking_modifications
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.jwt()->>'sub'));

CREATE POLICY "Users can create own booking modifications"
  ON hotel_booking_modifications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.jwt()->>'sub'));

CREATE POLICY "Service role can manage all modifications"
  ON hotel_booking_modifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Triggers for updated_at timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_hotels_updated_at ON hotels;
CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hotel_rooms_updated_at ON hotel_rooms;
CREATE TRIGGER update_hotel_rooms_updated_at BEFORE UPDATE ON hotel_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hotel_rates_updated_at ON hotel_rates;
CREATE TRIGGER update_hotel_rates_updated_at BEFORE UPDATE ON hotel_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hotel_bookings_updated_at ON hotel_bookings;
CREATE TRIGGER update_hotel_bookings_updated_at BEFORE UPDATE ON hotel_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hotel_reviews_updated_at ON hotel_reviews;
CREATE TRIGGER update_hotel_reviews_updated_at BEFORE UPDATE ON hotel_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hotel_partners_updated_at ON hotel_partners;
CREATE TRIGGER update_hotel_partners_updated_at BEFORE UPDATE ON hotel_partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hotel_partner_listings_updated_at ON hotel_partner_listings;
CREATE TRIGGER update_hotel_partner_listings_updated_at BEFORE UPDATE ON hotel_partner_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hotel_booking_modifications_updated_at ON hotel_booking_modifications;
CREATE TRIGGER update_hotel_booking_modifications_updated_at BEFORE UPDATE ON hotel_booking_modifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comments for documentation
-- =====================================================
COMMENT ON TABLE hotels IS 'Hotel properties with location, amenities, and policies';
COMMENT ON TABLE hotel_rooms IS 'Room types/categories available at each hotel';
COMMENT ON TABLE hotel_partners IS 'Booking partners (Agoda, Booking.com, etc.) for price comparison';
COMMENT ON TABLE hotel_partner_listings IS 'Links hotels to multiple partners - enables price comparison';
COMMENT ON TABLE hotel_rates IS 'Daily pricing and availability per partner - supports multi-partner pricing';
COMMENT ON TABLE hotel_bookings IS 'Guest reservations with partner integration - integrated with Clerk auth via user_id';
COMMENT ON TABLE hotel_reviews IS 'Guest reviews and ratings for hotels';
COMMENT ON TABLE hotel_booking_modifications IS 'Tracks booking changes and modification history';

COMMENT ON COLUMN hotel_bookings.user_id IS 'Clerk user ID - matches users.clerk_id from auth schema for RLS policies';
COMMENT ON COLUMN hotel_bookings.confirmation_code IS 'Unique 8-character booking reference';
COMMENT ON COLUMN hotel_bookings.partner_id IS 'Booking partner - enables partner-specific handling';
COMMENT ON COLUMN hotel_bookings.working_pass_applied IS 'Whether Working Pass discount was applied';
COMMENT ON COLUMN hotel_rates.available_rooms IS 'Number of rooms available for this rate on this date from this partner';
COMMENT ON COLUMN hotel_rates.is_best_price IS 'Flag indicating this is the best price across all partners';
COMMENT ON COLUMN hotel_partner_listings.partner_hotel_id IS 'Hotel ID in partners system for API integration';

-- ============================================================================
-- SEED DATA (Sample Hotels for Testing)
-- ============================================================================

-- Insert booking partners
INSERT INTO hotel_partners (code, name, description, logo_url, commission_rate, priority) VALUES
('DIRECT', 'Direct Booking', 'Book directly with the hotel', '/images/partners/direct.png', 0.0000, 100),
('AGODA', 'Agoda', 'Leading Asian travel booking platform', '/images/partners/agoda.png', 0.1500, 90),
('BOOKING_COM', 'Booking.com', 'Global hotel booking leader', '/images/partners/booking.png', 0.1200, 85),
('EXPEDIA', 'Expedia', 'Comprehensive travel platform', '/images/partners/expedia.png', 0.1400, 80),
('HOTELS_COM', 'Hotels.com', 'Rewards program with free nights', '/images/partners/hotels.png', 0.1300, 75)
ON CONFLICT (code) DO NOTHING;

-- Insert sample hotels
INSERT INTO hotels (slug, name, description, address, star_rating, amenities, policies) VALUES
(
  'grand-saigon-hotel',
  'Grand Saigon Hotel',
  'Luxury hotel in the heart of Ho Chi Minh City with stunning city views',
  '{"line1": "123 Le Loi Street", "city": "Ho Chi Minh City", "country": "Vietnam", "postal_code": "700000", "lat": 10.7769, "lng": 106.7009}'::jsonb,
  5,
  '["wifi", "pool", "gym", "spa", "restaurant", "bar", "parking", "concierge", "room_service"]'::jsonb,
  '{"check_in": "14:00", "check_out": "12:00", "cancellation": "flexible", "pets": false, "smoking": false}'::jsonb
),
(
  'hanoi-pearl-hotel',
  'Hanoi Pearl Hotel',
  'Boutique hotel near the Old Quarter with traditional Vietnamese charm',
  '{"line1": "45 Hang Bac Street", "city": "Hanoi", "country": "Vietnam", "postal_code": "100000", "lat": 21.0285, "lng": 105.8542}'::jsonb,
  4,
  '["wifi", "restaurant", "bar", "airport_shuttle", "tour_desk"]'::jsonb,
  '{"check_in": "14:00", "check_out": "12:00", "cancellation": "moderate", "pets": false, "smoking": false}'::jsonb
),
(
  'danang-beach-resort',
  'Da Nang Beach Resort',
  'Beachfront resort with private beach access and ocean views',
  '{"line1": "888 Vo Nguyen Giap", "city": "Da Nang", "country": "Vietnam", "postal_code": "550000", "lat": 16.0544, "lng": 108.2022}'::jsonb,
  5,
  '["wifi", "pool", "gym", "spa", "beach_access", "restaurant", "bar", "water_sports"]'::jsonb,
  '{"check_in": "15:00", "check_out": "11:00", "cancellation": "strict", "pets": false, "smoking": false}'::jsonb
);

-- Insert sample rooms
WITH hotel_ids AS (
  SELECT id, slug FROM hotels
)
INSERT INTO hotel_rooms (hotel_id, code, title, description, capacity, bed_type, bed_count, amenities, max_adults, max_children)
SELECT 
  h.id,
  room_data.code,
  room_data.title,
  room_data.description,
  room_data.capacity,
  room_data.bed_type,
  room_data.bed_count,
  room_data.amenities,
  room_data.max_adults,
  room_data.max_children
FROM hotel_ids h
CROSS JOIN LATERAL (
  VALUES
    ('DELUXE', 'Deluxe Room', 'Spacious room with city view', 2, 'king', 1, '["wifi", "tv", "minibar", "safe", "coffee_maker"]'::jsonb, 2, 1),
    ('SUITE', 'Executive Suite', 'Luxurious suite with separate living area', 4, 'king', 1, '["wifi", "tv", "minibar", "safe", "coffee_maker", "balcony", "bathtub"]'::jsonb, 3, 2),
    ('STANDARD', 'Standard Room', 'Comfortable room with essential amenities', 2, 'queen', 1, '["wifi", "tv", "safe"]'::jsonb, 2, 0)
) AS room_data(code, title, description, capacity, bed_type, bed_count, amenities, max_adults, max_children)
WHERE h.slug IN ('grand-saigon-hotel', 'hanoi-pearl-hotel', 'danang-beach-resort');

-- Link hotels to partners
WITH hotel_ids AS (
  SELECT id, slug FROM hotels
),
partner_ids AS (
  SELECT id, code FROM hotel_partners
)
INSERT INTO hotel_partner_listings (hotel_id, partner_id, partner_hotel_id, is_active)
SELECT 
  h.id,
  p.id,
  CONCAT(p.code, '_', h.slug),  -- Generate partner-specific hotel ID
  true
FROM hotel_ids h
CROSS JOIN partner_ids p;

-- Insert sample rates with partner pricing (next 30 days)
WITH room_ids AS (
  SELECT r.id as room_id, r.hotel_id, r.code as room_code FROM hotel_rooms r
),
partner_ids AS (
  SELECT id, code, commission_rate FROM hotel_partners
)
INSERT INTO hotel_rates (
  room_id, 
  partner_id, 
  date, 
  price_cents, 
  original_price_cents,
  discount_percentage,
  currency, 
  available_rooms, 
  refundable, 
  breakfast_included,
  is_best_price,
  tcent_earn_rate,
  tcent_eligible
)
SELECT 
  r.room_id,
  p.id,
  CURRENT_DATE + i,
  -- Base price varies by room type, day, and partner
  CASE 
    -- Weekend pricing
    WHEN i % 7 IN (5, 6) THEN
      CASE r.room_code
        WHEN 'STANDARD' THEN 10000 + (p.commission_rate * 10000)::integer
        WHEN 'DELUXE' THEN 15000 + (p.commission_rate * 15000)::integer
        WHEN 'SUITE' THEN 25000 + (p.commission_rate * 25000)::integer
      END
    -- Weekday pricing
    ELSE
      CASE r.room_code
        WHEN 'STANDARD' THEN 8000 + (p.commission_rate * 8000)::integer
        WHEN 'DELUXE' THEN 12000 + (p.commission_rate * 12000)::integer
        WHEN 'SUITE' THEN 20000 + (p.commission_rate * 20000)::integer
      END
  END,
  -- Original price (before discount)
  CASE 
    WHEN i % 7 IN (5, 6) THEN
      CASE r.room_code
        WHEN 'STANDARD' THEN 12000
        WHEN 'DELUXE' THEN 18000
        WHEN 'SUITE' THEN 30000
      END
    ELSE
      CASE r.room_code
        WHEN 'STANDARD' THEN 10000
        WHEN 'DELUXE' THEN 15000
        WHEN 'SUITE' THEN 25000
      END
  END,
  -- Discount percentage (varies by partner)
  CASE p.code
    WHEN 'DIRECT' THEN 0.00
    WHEN 'AGODA' THEN 10.00
    WHEN 'BOOKING_COM' THEN 15.00
    WHEN 'EXPEDIA' THEN 12.00
    WHEN 'HOTELS_COM' THEN 8.00
  END,
  'USD',
  CASE 
    WHEN i % 7 IN (5, 6) THEN 5  -- Less availability on weekends
    ELSE 10  -- More availability on weekdays
  END,
  true,  -- refundable
  CASE p.code
    WHEN 'DIRECT' THEN true  -- Direct bookings include breakfast
    ELSE false
  END,
  false,  -- is_best_price (will be calculated)
  CASE p.code
    WHEN 'DIRECT' THEN 0.10  -- 10% TCent for direct bookings
    ELSE 0.05  -- 5% TCent for partner bookings
  END,
  true  -- tcent_eligible
FROM room_ids r
CROSS JOIN partner_ids p
CROSS JOIN generate_series(0, 29) AS i;

-- Update is_best_price flag for each room/date combination
WITH best_prices AS (
  SELECT 
    room_id,
    date,
    MIN(price_cents) as min_price
  FROM hotel_rates
  GROUP BY room_id, date
)
UPDATE hotel_rates hr
SET is_best_price = true
FROM best_prices bp
WHERE hr.room_id = bp.room_id
  AND hr.date = bp.date
  AND hr.price_cents = bp.min_price;

-- ============================================================================
-- DEPLOYMENT NOTES
-- ============================================================================
-- 1. Run this migration in Supabase SQL Editor
-- 2. Verify tables created: 
--    - hotels, hotel_rooms, hotel_partners, hotel_partner_listings
--    - hotel_rates (with partner_id), hotel_bookings (with partner support)
--    - hotel_reviews, hotel_booking_modifications
-- 3. Test RLS policies with authenticated and unauthenticated requests
-- 4. Sample data includes:
--    - 3 hotels (Saigon, Hanoi, Da Nang)
--    - 5 partners (Direct, Agoda, Booking.com, Expedia, Hotels.com)
--    - 9 rooms (3 per hotel)
--    - 450 rate records (30 days × 3 rooms × 5 partners) with price comparison
-- 5. Verify best_price flags are set correctly for price comparison
-- ============================================================================
-- BUSINESS MODEL ALIGNMENT
-- ============================================================================
-- This schema supports the TripC platform flowchart business model:
-- ✓ Multi-partner hotel aggregation (hotel_partners, hotel_partner_listings)
-- ✓ Price comparison across partners (is_best_price flag)
-- ✓ TCent loyalty system integration (tcent_earned, tcent_used, working_pass)
-- ✓ Booking modifications (hotel_booking_modifications table)
-- ✓ Partner-specific rates (partner_id in hotel_rates)
-- ✓ Commission tracking (commission_rate, commission_cents)
-- ============================================================================
