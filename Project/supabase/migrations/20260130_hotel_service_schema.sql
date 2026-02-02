-- =====================================================
-- Hotel Service Schema Migration
-- Purpose: Create complete hotel booking system schema
-- Date: 2026-01-30
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Table: hotels
-- Purpose: Store hotel property information
-- =====================================================
CREATE TABLE IF NOT EXISTS hotels (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  address jsonb NOT NULL,  -- {line1, line2, city, country, postal_code, lat, lng}
  star_rating integer CHECK (star_rating BETWEEN 1 AND 5),
  images jsonb DEFAULT '[]'::jsonb,
  amenities jsonb DEFAULT '[]'::jsonb,
  policies jsonb,  -- {check_in, check_out, cancellation, pets, smoking}
  best_price integer,  -- Cached lowest price in cents
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for hotels
CREATE INDEX IF NOT EXISTS idx_hotels_slug ON hotels(slug);
CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels((address->>'city'));
CREATE INDEX IF NOT EXISTS idx_hotels_star_rating ON hotels(star_rating);
CREATE INDEX IF NOT EXISTS idx_hotels_best_price ON hotels(best_price);

-- =====================================================
-- Table: hotel_rooms
-- Purpose: Store room types for each hotel
-- =====================================================
CREATE TABLE IF NOT EXISTS hotel_rooms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE,
  code text NOT NULL,
  title text NOT NULL,
  description text,
  capacity integer NOT NULL,
  bed_type text,
  bed_count integer DEFAULT 1,
  size_sqm numeric(6,2),
  amenities jsonb DEFAULT '[]'::jsonb,
  max_adults integer DEFAULT 2,
  max_children integer DEFAULT 2,
  is_accessible boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(hotel_id, code)
);

-- Create indexes for hotel_rooms
CREATE INDEX IF NOT EXISTS idx_hotel_rooms_hotel_id ON hotel_rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_rooms_capacity ON hotel_rooms(capacity);

-- =====================================================
-- Table: hotel_partners
-- Purpose: Store partner/OTA information
-- =====================================================
CREATE TABLE IF NOT EXISTS hotel_partners (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  logo_url text,
  website_url text,
  commission_rate numeric(5,4) NOT NULL,
  is_active boolean DEFAULT true,
  api_config jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for hotel_partners
CREATE INDEX IF NOT EXISTS idx_hotel_partners_code ON hotel_partners(code);
CREATE INDEX IF NOT EXISTS idx_hotel_partners_active ON hotel_partners(is_active);

-- =====================================================
-- Table: hotel_partner_listings
-- Purpose: Link hotels to partners (many-to-many)
-- =====================================================
CREATE TABLE IF NOT EXISTS hotel_partner_listings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES hotel_partners(id) ON DELETE CASCADE,
  partner_hotel_id text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(hotel_id, partner_id)
);

-- Create indexes for hotel_partner_listings
CREATE INDEX IF NOT EXISTS idx_partner_listings_hotel_id ON hotel_partner_listings(hotel_id);
CREATE INDEX IF NOT EXISTS idx_partner_listings_partner_id ON hotel_partner_listings(partner_id);

-- =====================================================
-- Table: hotel_rates
-- Purpose: Store room rates by partner and date
-- =====================================================
CREATE TABLE IF NOT EXISTS hotel_rates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id uuid REFERENCES hotel_rooms(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES hotel_partners(id) ON DELETE CASCADE,
  date date NOT NULL,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  original_price_cents integer,
  discount_percentage numeric(5,2) DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  available_rooms integer DEFAULT 0,
  refundable boolean DEFAULT true,
  breakfast_included boolean DEFAULT false,
  is_best_price boolean DEFAULT false,
  tcent_earn_rate numeric(5,4) DEFAULT 0.05,
  tcent_eligible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(room_id, partner_id, date)
);

-- Create indexes for hotel_rates
CREATE INDEX IF NOT EXISTS idx_hotel_rates_room_id ON hotel_rates(room_id);
CREATE INDEX IF NOT EXISTS idx_hotel_rates_date ON hotel_rates(date);
CREATE INDEX IF NOT EXISTS idx_hotel_rates_best_price ON hotel_rates(is_best_price) WHERE is_best_price = true;
CREATE INDEX IF NOT EXISTS idx_hotel_rates_availability ON hotel_rates(date, available_rooms) WHERE available_rooms > 0;

-- =====================================================
-- Table: hotel_bookings
-- Purpose: Store hotel booking records
-- =====================================================
CREATE TABLE IF NOT EXISTS hotel_bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,  -- Clerk user ID
  hotel_id uuid REFERENCES hotels(id) ON DELETE RESTRICT,
  room_id uuid REFERENCES hotel_rooms(id) ON DELETE RESTRICT,
  partner_id uuid REFERENCES hotel_partners(id) ON DELETE RESTRICT,
  
  -- Booking Reference
  confirmation_code text UNIQUE NOT NULL,
  partner_booking_ref text,
  
  -- Dates
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  nights_count smallint GENERATED ALWAYS AS (check_out_date - check_in_date) STORED,
  
  -- Guest Information
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text NOT NULL,
  guest_count jsonb NOT NULL,
  special_requests text,
  
  -- Pricing (all in cents)
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
  working_pass_applied boolean DEFAULT false,
  working_pass_discount_cents integer DEFAULT 0,
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show', 'modified')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'partially_refunded', 'failed')),
  payment_id text,
  
  -- Modification Support
  is_modified boolean DEFAULT false,
  original_booking_id uuid REFERENCES hotel_bookings(id),
  modification_count integer DEFAULT 0,
  modified_at timestamptz,
  
  -- Cancellation
  cancellation_policy text,
  cancelled_at timestamptz,
  cancellation_reason text,
  refund_amount_cents integer,
  refund_processed_at timestamptz,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CHECK (check_out_date > check_in_date),
  CHECK (total_cents >= 0)
);

-- Create indexes for hotel_bookings
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_user_id ON hotel_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_hotel_id ON hotel_bookings(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_room_id ON hotel_bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_confirmation_code ON hotel_bookings(confirmation_code);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_dates ON hotel_bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_status ON hotel_bookings(status);
CREATE INDEX IF NOT EXISTS idx_hotel_bookings_created_at ON hotel_bookings(created_at DESC);

-- =====================================================
-- Insert default partners
-- =====================================================
INSERT INTO hotel_partners (code, name, commission_rate, is_active) VALUES
  ('DIRECT', 'TripC Direct Booking', 0.0000, true),
  ('AGODA', 'Agoda', 0.1800, true),
  ('BOOKING_COM', 'Booking.com', 0.1500, true),
  ('EXPEDIA', 'Expedia', 0.1800, true),
  ('HOTELS_COM', 'Hotels.com', 0.1800, true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- Update trigger for updated_at columns
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to all tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_hotels_updated_at') THEN
    CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_hotel_rooms_updated_at') THEN
    CREATE TRIGGER update_hotel_rooms_updated_at BEFORE UPDATE ON hotel_rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_hotel_partners_updated_at') THEN
    CREATE TRIGGER update_hotel_partners_updated_at BEFORE UPDATE ON hotel_partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_hotel_partner_listings_updated_at') THEN
    CREATE TRIGGER update_hotel_partner_listings_updated_at BEFORE UPDATE ON hotel_partner_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_hotel_rates_updated_at') THEN
    CREATE TRIGGER update_hotel_rates_updated_at BEFORE UPDATE ON hotel_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_hotel_bookings_updated_at') THEN
    CREATE TRIGGER update_hotel_bookings_updated_at BEFORE UPDATE ON hotel_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END$$;

-- =====================================================
-- Grant permissions (adjust as needed)
-- =====================================================
-- Grant access to authenticated users
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;

-- =====================================================
-- DEPLOYMENT NOTES
-- =====================================================
-- 1. Run this migration in Supabase SQL Editor
-- 2. Then run 002_add_more_hotels.sql to seed hotel data
-- 3. Verify tables created: hotels, hotel_rooms, hotel_partners, 
--    hotel_partner_listings, hotel_rates, hotel_bookings
-- 4. Check indexes are created for performance
-- 5. Verify hotel_bookings has user_id column (text type for Clerk)
-- =====================================================
