-- ============================================================================
-- Flight Service Schema Migration
-- Integrated with TripC Auth System (Clerk + Supabase)
-- ============================================================================
-- Created: 2026-01-25
-- Purpose: Create tables for Flight Service MVP
-- Integration: Uses Clerk user IDs, follows existing RLS pattern
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Table: flights
-- Purpose: Store individual flight segments
-- =====================================================
CREATE TABLE IF NOT EXISTS flights (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  airline_code text NOT NULL,
  airline_name text,
  flight_number text NOT NULL,
  origin text NOT NULL,         -- IATA airport code (e.g., 'SGN')
  origin_name text,             -- Airport name for display
  destination text NOT NULL,    -- IATA airport code (e.g., 'HAN')
  destination_name text,        -- Airport name for display
  departure_at timestamptz NOT NULL,
  arrival_at timestamptz NOT NULL,
  duration_minutes int,
  aircraft text,
  seat_classes jsonb DEFAULT '[]'::jsonb, -- [{class: 'Economy', seats: 150, price: 100.00}, ...]
  amenities jsonb DEFAULT '[]'::jsonb,    -- ['WiFi', 'Meals', 'Entertainment']
  baggage_allowance jsonb DEFAULT '{}'::jsonb, -- {checked: '23kg', carryon: '7kg'}
  metadata jsonb DEFAULT '{}'::jsonb,
  base_price numeric NOT NULL,
  currency text DEFAULT 'USD',
  status text DEFAULT 'scheduled', -- scheduled, delayed, cancelled, completed
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_iata_codes CHECK (
    length(origin) = 3 AND 
    length(destination) = 3 AND
    origin != destination
  ),
  CONSTRAINT valid_times CHECK (arrival_at > departure_at),
  CONSTRAINT valid_price CHECK (base_price >= 0)
);

-- Indexes for flights table
CREATE INDEX IF NOT EXISTS idx_flights_origin_dest_departure ON flights (origin, destination, departure_at);
CREATE INDEX IF NOT EXISTS idx_flights_departure_at ON flights (departure_at);
CREATE INDEX IF NOT EXISTS idx_flights_airline ON flights (airline_code, flight_number);
CREATE INDEX IF NOT EXISTS idx_flights_status ON flights (status);

-- =====================================================
-- Table: flight_offers
-- Purpose: Precomputed offers/itineraries
-- =====================================================
CREATE TABLE IF NOT EXISTS flight_offers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_key text UNIQUE NOT NULL, -- Dedupe key: origin_dest_date_flightid
  flight_id uuid REFERENCES flights(id) ON DELETE CASCADE,
  total_price numeric NOT NULL,
  currency text DEFAULT 'USD',
  seats_available int NOT NULL DEFAULT 0,
  cabin_class text DEFAULT 'Economy', -- Economy, Business, First
  fare_type text DEFAULT 'Standard',  -- Standard, Flexible, SemiFlexible
  provider text DEFAULT 'internal',   -- 'internal' for MVP, later: amadeus, sabre, etc.
  rules jsonb DEFAULT '{}'::jsonb,    -- Cancellation, change policies
  metadata jsonb DEFAULT '{}'::jsonb,
  valid_until timestamptz,           -- Offer expiration
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_seats CHECK (seats_available >= 0),
  CONSTRAINT valid_offer_price CHECK (total_price >= 0)
);

-- Indexes for flight_offers
CREATE INDEX IF NOT EXISTS idx_flight_offers_flight_id ON flight_offers (flight_id);
CREATE INDEX IF NOT EXISTS idx_flight_offers_price ON flight_offers (total_price);
CREATE INDEX IF NOT EXISTS idx_flight_offers_seats ON flight_offers (seats_available) WHERE seats_available > 0;
CREATE INDEX IF NOT EXISTS idx_flight_offers_valid_until ON flight_offers (valid_until);

-- =====================================================
-- Table: flight_bookings
-- Purpose: Store booking records (integrated with Clerk auth)
-- =====================================================
CREATE TABLE IF NOT EXISTS flight_bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,         -- Clerk user ID (matches users.clerk_id from auth schema)
  offer_id uuid REFERENCES flight_offers(id) ON DELETE RESTRICT,  -- Prevent deleting offers with bookings
  flight_id uuid REFERENCES flights(id) ON DELETE RESTRICT,       -- Prevent deleting flights with bookings
  passengers jsonb NOT NULL,     -- Array: [{first_name, last_name, dob, document_type, document_number, nationality}]
  contact_info jsonb NOT NULL,   -- {email, phone, emergency_contact}
  price_paid numeric NOT NULL,
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending', -- pending, confirmed, ticketed, cancelled, completed
  pnr text UNIQUE,              -- Passenger Name Record (simulated 6-char alphanumeric)
  booking_reference text,       -- External reference if from provider
  payment_status text DEFAULT 'pending', -- pending, paid, refunded
  payment_id text,              -- Link to payment service
  tickets jsonb DEFAULT '[]'::jsonb, -- Array of ticket numbers when issued
  metadata jsonb DEFAULT '{}'::jsonb,
  booked_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_booking_price CHECK (price_paid >= 0),
  CONSTRAINT valid_passengers CHECK (jsonb_array_length(passengers) > 0),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'ticketed', 'cancelled', 'completed'))
  -- Note: user_id foreign key to users.clerk_id intentionally omitted for MVP
  -- Add later: CONSTRAINT fk_flight_bookings_user FOREIGN KEY (user_id) REFERENCES users(clerk_id) ON DELETE CASCADE
);

-- Indexes for flight_bookings
CREATE INDEX IF NOT EXISTS idx_flight_bookings_user_id ON flight_bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_flight_bookings_pnr ON flight_bookings (pnr) WHERE pnr IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_flight_bookings_status ON flight_bookings (status);
CREATE INDEX IF NOT EXISTS idx_flight_bookings_offer_id ON flight_bookings (offer_id);
CREATE INDEX IF NOT EXISTS idx_flight_bookings_created_at ON flight_bookings (created_at DESC);

-- Enable RLS for flight_bookings
ALTER TABLE flight_bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own flight bookings" ON flight_bookings;
DROP POLICY IF EXISTS "Users can create own flight bookings" ON flight_bookings;
DROP POLICY IF EXISTS "Users can update own flight bookings" ON flight_bookings;
DROP POLICY IF EXISTS "Users can cancel own flight bookings" ON flight_bookings;
DROP POLICY IF EXISTS "Service role can manage all flight bookings" ON flight_bookings;

-- RLS Policies for flight_bookings (following auth schema pattern)
-- Users can view their own flight bookings
CREATE POLICY "Users can view own flight bookings"
  ON flight_bookings
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.jwt()->>'sub'));

-- Users can create their own flight bookings
CREATE POLICY "Users can create own flight bookings"
  ON flight_bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.jwt()->>'sub'));

-- Users can update their own flight bookings
CREATE POLICY "Users can update own flight bookings"
  ON flight_bookings
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.jwt()->>'sub'));

-- Users can cancel (soft delete) their own flight bookings
CREATE POLICY "Users can cancel own flight bookings"
  ON flight_bookings
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.jwt()->>'sub'));

-- Service role can manage all flight bookings (for admin operations)
CREATE POLICY "Service role can manage all flight bookings"
  ON flight_bookings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Table: flight_search_cache (Optional)
-- Purpose: Cache search results for performance
-- =====================================================
CREATE TABLE IF NOT EXISTS flight_search_cache (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  search_key text UNIQUE NOT NULL, -- Hash of origin_dest_date_params
  origin text NOT NULL,
  destination text NOT NULL,
  departure_date date NOT NULL,
  search_params jsonb DEFAULT '{}'::jsonb,
  results jsonb NOT NULL,        -- Cached search results
  result_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Indexes for search cache
CREATE INDEX IF NOT EXISTS idx_flight_search_cache_key ON flight_search_cache (search_key);
CREATE INDEX IF NOT EXISTS idx_flight_search_cache_route_date ON flight_search_cache (origin, destination, departure_date);
CREATE INDEX IF NOT EXISTS idx_flight_search_cache_expires ON flight_search_cache (expires_at);

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

DROP TRIGGER IF EXISTS update_flights_updated_at ON flights;
CREATE TRIGGER update_flights_updated_at BEFORE UPDATE ON flights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_flight_offers_updated_at ON flight_offers;
CREATE TRIGGER update_flight_offers_updated_at BEFORE UPDATE ON flight_offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_flight_bookings_updated_at ON flight_bookings;
CREATE TRIGGER update_flight_bookings_updated_at BEFORE UPDATE ON flight_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comments for documentation
-- =====================================================
COMMENT ON TABLE flights IS 'Individual flight segments with schedule and pricing information';
COMMENT ON TABLE flight_offers IS 'Precomputed flight offers with availability and pricing';
COMMENT ON TABLE flight_bookings IS 'Customer flight bookings with passenger and payment details - integrated with Clerk auth via user_id';
COMMENT ON TABLE flight_search_cache IS 'Cached search results for performance optimization';

COMMENT ON COLUMN flights.seat_classes IS 'JSON array of seat class configurations: [{class: string, seats: number, price: number}]';
COMMENT ON COLUMN flight_bookings.passengers IS 'JSON array of passenger details: [{first_name, last_name, dob, document_type, document_number, nationality}]';
COMMENT ON COLUMN flight_bookings.pnr IS 'Passenger Name Record - unique 6-character booking reference';
COMMENT ON COLUMN flight_bookings.user_id IS 'Clerk user ID - matches users.clerk_id from auth schema for RLS policies';

-- ============================================================================
-- INTEGRATION NOTES
-- ============================================================================
-- 1. flight_bookings.user_id references Clerk user ID (not users.id UUID)
--    - No FK constraint to users.clerk_id for MVP (add in production for integrity)
--    - Allows booking before user sync completes from Clerk webhook
-- 2. RLS policies use auth.jwt()->>'sub' to match Clerk user ID from JWT token
-- 3. Flight bookings use RESTRICT on delete to prevent orphaned bookings
--    - Cannot delete flights/offers that have active bookings
--    - Must cancel/complete bookings first
-- 4. Service role has full access to flight_bookings for admin operations
-- 5. Public tables (flights, flight_offers, flight_search_cache) - no RLS
--    - Anyone can search and view flights
--    - Only authenticated users can book
-- 6. To sync with general bookings table, use application logic or database triggers
-- ============================================================================

-- ============================================================================
-- DEPLOYMENT CHECKLIST
-- ============================================================================
-- [ ] Run this schema migration in Supabase SQL Editor
-- [ ] Run seed data migration (20260125_flight_service_seed.sql)
-- [ ] Verify tables created: flights, flight_offers, flight_bookings, flight_search_cache
-- [ ] Test RLS policies with authenticated and unauthenticated requests
-- [ ] Optional: Add FK constraint from flight_bookings.user_id to users.clerk_id
--     ALTER TABLE flight_bookings ADD CONSTRAINT fk_user 
--     FOREIGN KEY (user_id) REFERENCES users(clerk_id) ON DELETE CASCADE;
-- ============================================================================
