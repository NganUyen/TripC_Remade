-- ============================================================================
-- TripC SuperApp - Supabase Database Schema
-- ============================================================================
-- Version: 2.0
-- Database: Supabase (PostgreSQL 15+)
-- Last Updated: January 23, 2026
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
CREATE EXTENSION IF NOT EXISTS "vector"; -- For AI features (pgvector)

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Auth Integration (Clerk)
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  auth_user_id UUID UNIQUE, -- Supabase Auth user ID (if used)
  
  -- Basic Info
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(50),
  name VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  
  -- Profile
  image_url VARCHAR(500),
  bio TEXT,
  date_of_birth DATE,
  gender VARCHAR(20),
  
  -- Membership & Loyalty
  membership_tier VARCHAR(20) DEFAULT 'BRONZE' NOT NULL,
  tcent_balance INT DEFAULT 0 NOT NULL,
  tcent_pending INT DEFAULT 0 NOT NULL,
  lifetime_spend DECIMAL(12,2) DEFAULT 0 NOT NULL,
  
  -- Preferences
  currency VARCHAR(3) DEFAULT 'USD',
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Location
  city VARCHAR(100),
  country VARCHAR(100),
  coordinates GEOGRAPHY(POINT),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  is_email_verified BOOLEAN DEFAULT false,
  is_phone_verified BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_tier CHECK (membership_tier IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM')),
  CONSTRAINT valid_tcent CHECK (tcent_balance >= 0 AND tcent_pending >= 0)
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tier ON users(membership_tier);
CREATE INDEX idx_users_location ON users USING GIST(coordinates);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE users;


-- Bookings Table (Base for all service types)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Service Type
  booking_type VARCHAR(50) NOT NULL CHECK (booking_type IN (
    'hotel', 'flight', 'restaurant', 'activity', 'event', 
    'wellness', 'beauty', 'transport'
  )),
  
  -- Common Fields
  title VARCHAR(500) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  
  -- Dates
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'cancelled', 'completed', 'refunded', 'no_show'
  )),
  
  -- Financial
  price DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  base_price DECIMAL(12,2),
  taxes DECIMAL(12,2) DEFAULT 0,
  fees DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  tcent_used DECIMAL(12,2) DEFAULT 0,
  
  -- Link to detailed booking
  detail_id UUID,
  
  -- Metadata
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_type ON bookings(booking_type);
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

ALTER PUBLICATION supabase_realtime ADD TABLE bookings;


-- Wishlist Table
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  item_type VARCHAR(50) NOT NULL,
  item_id UUID NOT NULL,
  
  title VARCHAR(500) NOT NULL,
  image_url VARCHAR(500),
  price DECIMAL(12,2),
  location VARCHAR(255),
  rating DECIMAL(3,2),
  
  tags TEXT[],
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, item_id)
);

CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE INDEX idx_wishlist_item_type ON wishlist(item_type);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own wishlist" ON wishlist
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

ALTER PUBLICATION supabase_realtime ADD TABLE wishlist;


-- Reviews Table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  item_type VARCHAR(50) NOT NULL,
  item_id UUID NOT NULL,
  
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  
  -- Structured ratings
  cleanliness_rating INT CHECK (cleanliness_rating IS NULL OR (cleanliness_rating >= 1 AND cleanliness_rating <= 5)),
  service_rating INT CHECK (service_rating IS NULL OR (service_rating >= 1 AND service_rating <= 5)),
  value_rating INT CHECK (value_rating IS NULL OR (value_rating >= 1 AND value_rating <= 5)),
  
  photos TEXT[],
  
  is_verified BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending',
  helpful_count INT DEFAULT 0,
  
  provider_response TEXT,
  provider_response_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_item ON reviews(item_type, item_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View approved reviews" ON reviews
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users create reviews" ON reviews
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

ALTER PUBLICATION supabase_realtime ADD TABLE reviews;


-- ============================================================================
-- HOTEL SERVICE TABLES
-- ============================================================================

CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  coordinates GEOGRAPHY(POINT),
  
  phone VARCHAR(50),
  email VARCHAR(255),
  star_rating DECIMAL(2,1) CHECK (star_rating >= 0 AND star_rating <= 5),
  
  images JSONB,
  amenities JSONB,
  description TEXT,
  
  check_in_time TIME,
  check_out_time TIME,
  
  is_active BOOLEAN DEFAULT true,
  is_partner BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_hotels_location ON hotels USING GIST(coordinates);
CREATE INDEX idx_hotels_city ON hotels(city, country);
CREATE INDEX idx_hotels_slug ON hotels(slug);


CREATE TABLE hotel_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  room_type VARCHAR(50),
  max_occupancy INT NOT NULL,
  max_adults INT NOT NULL,
  
  images JSONB,
  amenities JSONB,
  base_price_per_night DECIMAL(10,2) NOT NULL,
  
  total_rooms INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_hotel_rooms_hotel ON hotel_rooms(hotel_id);


CREATE TABLE hotel_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE REFERENCES bookings(id),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  hotel_id UUID NOT NULL REFERENCES hotels(id),
  room_id UUID NOT NULL REFERENCES hotel_rooms(id),
  
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  nights INT GENERATED ALWAYS AS (check_out_date - check_in_date) STORED,
  
  adults INT NOT NULL,
  children INT DEFAULT 0,
  
  room_rate_per_night DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  
  booking_status VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) NOT NULL,
  confirmation_code VARCHAR(50) UNIQUE NOT NULL,
  
  special_requests TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_dates CHECK (check_out_date > check_in_date),
  CONSTRAINT valid_guests CHECK (adults > 0)
);

CREATE INDEX idx_hotel_bookings_user ON hotel_bookings(user_id);
CREATE INDEX idx_hotel_bookings_hotel ON hotel_bookings(hotel_id);
CREATE INDEX idx_hotel_bookings_dates ON hotel_bookings(check_in_date, check_out_date);

ALTER TABLE hotel_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own hotel bookings" ON hotel_bookings
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

ALTER PUBLICATION supabase_realtime ADD TABLE hotel_bookings;


-- ============================================================================
-- FLIGHT SERVICE TABLES
-- ============================================================================

CREATE TABLE flight_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id VARCHAR(255) UNIQUE NOT NULL,
  
  itinerary JSONB NOT NULL,
  origin VARCHAR(10) NOT NULL,
  destination VARCHAR(10) NOT NULL,
  departure_date DATE NOT NULL,
  
  total_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  cabin_class VARCHAR(20),
  baggage_allowance JSONB,
  refundable BOOLEAN DEFAULT false,
  
  quote_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_flight_offers_route ON flight_offers(origin, destination, departure_date);


CREATE TABLE flight_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE REFERENCES bookings(id),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  offer_id VARCHAR(255) NOT NULL,
  pnr VARCHAR(100) UNIQUE,
  ticket_numbers JSONB,
  passengers JSONB NOT NULL,
  
  total_amount DECIMAL(10,2) NOT NULL,
  booking_status VARCHAR(50) NOT NULL,
  confirmation_code VARCHAR(50) UNIQUE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_flight_bookings_user ON flight_bookings(user_id);
CREATE INDEX idx_flight_bookings_pnr ON flight_bookings(pnr);

ALTER TABLE flight_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own flights" ON flight_bookings
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));


-- ============================================================================
-- DINING SERVICE TABLES
-- ============================================================================

CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  coordinates GEOGRAPHY(POINT),
  
  cuisine_types JSONB NOT NULL,
  price_range VARCHAR(10),
  
  images JSONB,
  operating_hours JSONB,
  
  is_active BOOLEAN DEFAULT true,
  accepts_reservations BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_restaurants_location ON restaurants USING GIST(coordinates);
CREATE INDEX idx_restaurants_city ON restaurants(city);


CREATE TABLE dining_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE REFERENCES bookings(id),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  party_size INT NOT NULL CHECK (party_size > 0),
  
  guest_name VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50) NOT NULL,
  
  booking_status VARCHAR(50) NOT NULL,
  confirmation_code VARCHAR(50) UNIQUE NOT NULL,
  
  special_requests TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_dining_bookings_user ON dining_bookings(user_id);
CREATE INDEX idx_dining_bookings_restaurant ON dining_bookings(restaurant_id);


-- ============================================================================
-- TRANSPORT SERVICE TABLES
-- ============================================================================

CREATE TABLE vehicle_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category_type VARCHAR(50) NOT NULL,
  
  max_passengers INT NOT NULL,
  max_luggage INT NOT NULL,
  amenities JSONB,
  
  base_price_per_km DECIMAL(10,2),
  image_url VARCHAR(500),
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE transport_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE REFERENCES bookings(id),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  trip_type VARCHAR(20) NOT NULL,
  pickup_location JSONB NOT NULL,
  dropoff_location JSONB NOT NULL,
  
  is_airport_pickup BOOLEAN DEFAULT false,
  flight_number VARCHAR(50),
  
  pickup_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  passenger_count INT NOT NULL,
  luggage_count INT NOT NULL,
  
  category_id UUID NOT NULL REFERENCES vehicle_categories(id),
  
  total_amount DECIMAL(10,2) NOT NULL,
  booking_status VARCHAR(50) NOT NULL,
  confirmation_code VARCHAR(50) UNIQUE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transport_bookings_user ON transport_bookings(user_id);


-- ============================================================================
-- SHOP SERVICE TABLES
-- ============================================================================

CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  parent_id UUID REFERENCES product_categories(id),
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  category_id UUID NOT NULL REFERENCES product_categories(id),
  description TEXT,
  images JSONB NOT NULL,
  
  base_price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Vector embedding for semantic search
  embedding vector(1536),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_embedding ON products USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);


CREATE TABLE product_skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(100) UNIQUE NOT NULL,
  
  attributes JSONB NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_skus_product ON product_skus(product_id);


CREATE TABLE shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_fee DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  
  shipping_address JSONB NOT NULL,
  
  order_status VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) NOT NULL,
  
  tracking_numbers JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shop_orders_user ON shop_orders(user_id);
CREATE INDEX idx_shop_orders_number ON shop_orders(order_number);


-- ============================================================================
-- WELLNESS & BEAUTY TABLES
-- ============================================================================

CREATE TABLE wb_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  provider_type VARCHAR(50) NOT NULL,
  
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  coordinates GEOGRAPHY(POINT),
  
  images JSONB,
  amenities JSONB,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_wb_providers_location ON wb_providers USING GIST(coordinates);


CREATE TABLE wb_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES wb_providers(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  duration_minutes INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE wb_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE REFERENCES bookings(id),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  provider_id UUID NOT NULL REFERENCES wb_providers(id),
  service_id UUID NOT NULL REFERENCES wb_services(id),
  
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  
  total_amount DECIMAL(10,2) NOT NULL,
  booking_status VARCHAR(50) NOT NULL,
  confirmation_code VARCHAR(50) UNIQUE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_wb_bookings_user ON wb_bookings(user_id);


-- ============================================================================
-- VOUCHER & REWARDS SYSTEM
-- ============================================================================

CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  
  voucher_type VARCHAR(50) NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  min_spend DECIMAL(10,2) DEFAULT 0,
  
  total_usage_limit INT,
  current_usage_count INT DEFAULT 0,
  
  is_purchasable BOOLEAN DEFAULT false,
  tcent_price INT,
  
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vouchers_code ON vouchers(code);


CREATE TABLE user_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  voucher_id UUID NOT NULL REFERENCES vouchers(id),
  
  status VARCHAR(50) NOT NULL,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_user_vouchers_user ON user_vouchers(user_id);


CREATE TABLE tcent_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  amount INT NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  
  balance_after INT,
  
  reference_type VARCHAR(50),
  reference_id UUID,
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tcent_ledger_user ON tcent_ledger(user_id);
CREATE INDEX idx_tcent_ledger_status ON tcent_ledger(status);


CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  quest_type VARCHAR(50) NOT NULL,
  
  reward_amount INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE quest_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES quests(id),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  submission_data JSONB NOT NULL,
  status VARCHAR(50) NOT NULL,
  
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quest_submissions_user ON quest_submissions(user_id);


-- ============================================================================
-- SUPABASE STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('product-images', 'product-images', true),
  ('hotel-images', 'hotel-images', true),
  ('review-photos', 'review-photos', true),
  ('documents', 'documents', false);

-- Storage policies
CREATE POLICY "Public avatar access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );


-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Update Tcent balance
CREATE OR REPLACE FUNCTION update_tcent_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'AVAILABLE' AND OLD.status = 'PENDING' THEN
    UPDATE users 
    SET 
      tcent_balance = tcent_balance + NEW.amount,
      tcent_pending = tcent_pending - NEW.amount
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tcent_status_change AFTER UPDATE ON tcent_ledger
  FOR EACH ROW EXECUTE FUNCTION update_tcent_balance();


-- Semantic search function
CREATE OR REPLACE FUNCTION search_similar_products(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name varchar,
  similarity float
)
LANGUAGE sql
AS $$
  SELECT
    id,
    name,
    1 - (embedding <=> query_embedding) as similarity
  FROM products
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;


-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
