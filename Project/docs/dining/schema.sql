-- ============================================================================
-- DINING SERVICE ENHANCED SCHEMA
-- ============================================================================
-- This migration adds the full dining service tables matching the business flow
-- Includes: Reviews, Cart, Enhanced Reservations, Time Slots, Blocked Dates
-- ============================================================================

-- DINING VENUES TABLE (Enhanced)
-- ============================================================================
CREATE TABLE IF NOT EXISTS dining_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  
  -- Location details
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  district VARCHAR(100),
  ward VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_summary TEXT,
  
  -- Contact
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  
  -- Categorization
  cuisine_type TEXT[], -- Array of cuisine types
  price_range VARCHAR(20) CHECK (price_range IN ('budget', 'moderate', 'upscale', 'fine_dining')),
  
  -- Capacity and Operations
  capacity INTEGER NOT NULL DEFAULT 50,
  operating_hours JSONB, -- { "monday": { "open": "09:00", "close": "22:00" }, ... }
  
  -- Status and Features
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  -- Ratings
  average_rating DECIMAL(3, 2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  
  -- Media
  cover_image_url TEXT,
  images TEXT[], -- Array of image URLs
  
  -- Additional metadata
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amenities TEXT[], -- e.g., ['wifi', 'parking', 'outdoor_seating']
  tags TEXT[], -- e.g., ['romantic', 'family_friendly', 'business']
  metadata JSONB, -- Flexible storage for additional data
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for dining_venues
CREATE INDEX IF NOT EXISTS idx_dining_venues_city ON dining_venues(city);
CREATE INDEX IF NOT EXISTS idx_dining_venues_slug ON dining_venues(slug);
CREATE INDEX IF NOT EXISTS idx_dining_venues_is_active ON dining_venues(is_active);
CREATE INDEX IF NOT EXISTS idx_dining_venues_is_featured ON dining_venues(is_featured);
CREATE INDEX IF NOT EXISTS idx_dining_venues_cuisine_type ON dining_venues USING GIN(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_dining_venues_rating ON dining_venues(average_rating DESC);

-- DINING MENUS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS dining_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES dining_venues(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dining_menus_venue ON dining_menus(venue_id);

-- DINING MENU ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS dining_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES dining_menus(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES dining_venues(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2), -- For showing discounts
  currency VARCHAR(3) DEFAULT 'USD',
  category VARCHAR(100), -- e.g., 'appetizer', 'main_course', 'dessert'
  dietary_tags TEXT[], -- e.g., ['vegetarian', 'vegan', 'gluten_free']
  allergens TEXT[], -- e.g., ['nuts', 'dairy', 'shellfish']
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dining_menu_items_menu ON dining_menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_dining_menu_items_venue ON dining_menu_items(venue_id);

-- DINING TABLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS dining_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES dining_venues(id) ON DELETE CASCADE,
  table_number VARCHAR(50) NOT NULL,
  name VARCHAR(100),
  min_capacity INTEGER NOT NULL DEFAULT 2,
  max_capacity INTEGER NOT NULL DEFAULT 4,
  section VARCHAR(100), -- e.g., 'main_dining', 'patio', 'private_room'
  floor INTEGER DEFAULT 1,
  features TEXT[], -- e.g., ['window_view', 'booth', 'high_top']
  is_active BOOLEAN DEFAULT true,
  is_reservable BOOLEAN DEFAULT true,
  premium_charge DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(venue_id, table_number)
);

CREATE INDEX IF NOT EXISTS idx_dining_tables_venue ON dining_tables(venue_id);

-- DINING RESERVATIONS TABLE (Enhanced)
-- ============================================================================
CREATE TABLE IF NOT EXISTS dining_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID, -- Link to unified bookings table if exists
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES dining_venues(id) ON DELETE CASCADE,
  table_id UUID REFERENCES dining_tables(id) ON DELETE SET NULL,
  
  -- Reservation code
  reservation_code VARCHAR(50) UNIQUE NOT NULL DEFAULT UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)),
  
  -- Reservation details
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 120,
  guest_count INTEGER NOT NULL CHECK (guest_count > 0),
  
  -- Guest information
  guest_name VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50),
  guest_email VARCHAR(255),
  special_requests TEXT,
  occasion VARCHAR(100), -- e.g., 'birthday', 'anniversary', 'business'
  dietary_restrictions TEXT[],
  
  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show')),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmed_by UUID REFERENCES users(id), -- Staff who confirmed
  seated_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  
  -- Payment
  deposit_amount DECIMAL(10, 2) DEFAULT 0.00,
  deposit_paid BOOLEAN DEFAULT false,
  
  -- Internal notes
  internal_notes TEXT,
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dining_reservations_user ON dining_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_dining_reservations_venue ON dining_reservations(venue_id);
CREATE INDEX IF NOT EXISTS idx_dining_reservations_date ON dining_reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_dining_reservations_status ON dining_reservations(status);
CREATE INDEX IF NOT EXISTS idx_dining_reservations_code ON dining_reservations(reservation_code);

-- DINING REVIEWS TABLE (NEW)
-- ============================================================================
CREATE TABLE IF NOT EXISTS dining_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES dining_venues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES dining_reservations(id) ON DELETE SET NULL,
  
  -- Rating (1-5 stars)
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  
  -- Detailed ratings
  food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  ambiance_rating INTEGER CHECK (ambiance_rating >= 1 AND ambiance_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  
  -- Review content
  title VARCHAR(255),
  comment TEXT,
  photos TEXT[], -- Array of photo URLs
  visit_date DATE,
  
  -- Moderation
  is_verified BOOLEAN DEFAULT false, -- Verified purchase/visit
  is_featured BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  
  -- Venue response
  response_text TEXT,
  response_date TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One review per user per venue
  UNIQUE(venue_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_dining_reviews_venue ON dining_reviews(venue_id);
CREATE INDEX IF NOT EXISTS idx_dining_reviews_user ON dining_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_dining_reviews_status ON dining_reviews(status);
CREATE INDEX IF NOT EXISTS idx_dining_reviews_rating ON dining_reviews(rating DESC);

-- DINING CART TABLE (NEW)
-- ============================================================================
CREATE TABLE IF NOT EXISTS dining_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES dining_venues(id) ON DELETE CASCADE,
  
  -- Cached venue info for quick display
  venue_name VARCHAR(255),
  venue_image TEXT,
  
  -- Reservation details
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  guest_count INTEGER NOT NULL CHECK (guest_count > 0),
  special_requests TEXT,
  occasion VARCHAR(100),
  dietary_restrictions TEXT[],
  table_id UUID REFERENCES dining_tables(id) ON DELETE SET NULL,
  duration_minutes INTEGER DEFAULT 120,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dining_cart_user ON dining_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_dining_cart_venue ON dining_cart(venue_id);

-- DINING TIME SLOTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS dining_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES dining_venues(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 30,
  max_reservations_per_slot INTEGER,
  max_guests_per_slot INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dining_time_slots_venue ON dining_time_slots(venue_id);
CREATE INDEX IF NOT EXISTS idx_dining_time_slots_day ON dining_time_slots(day_of_week);

-- DINING BLOCKED DATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS dining_blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES dining_venues(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  start_time TIME, -- Optional: block specific time range
  end_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dining_blocked_dates_venue ON dining_blocked_dates(venue_id);
CREATE INDEX IF NOT EXISTS idx_dining_blocked_dates_range ON dining_blocked_dates(start_date, end_date);

-- DINING WISHLIST TABLE (NEW)
-- ============================================================================
CREATE TABLE IF NOT EXISTS dining_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES dining_venues(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, venue_id)
);

CREATE INDEX IF NOT EXISTS idx_dining_wishlist_user ON dining_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_dining_wishlist_venue ON dining_wishlist(venue_id);

-- TRIGGER: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dining_venues_updated_at BEFORE UPDATE ON dining_venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dining_menus_updated_at BEFORE UPDATE ON dining_menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dining_menu_items_updated_at BEFORE UPDATE ON dining_menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dining_tables_updated_at BEFORE UPDATE ON dining_tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dining_reservations_updated_at BEFORE UPDATE ON dining_reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dining_reviews_updated_at BEFORE UPDATE ON dining_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dining_cart_updated_at BEFORE UPDATE ON dining_cart
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dining_time_slots_updated_at BEFORE UPDATE ON dining_time_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
