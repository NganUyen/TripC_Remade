-- ============================================================================
-- TripC - Supabase Schema with Clerk Integration
-- Following Clerk's official integration guide
-- ============================================================================
-- Version: 1.0
-- Database: Supabase (PostgreSQL)
-- Last Updated: January 23, 2026
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- Synced from Clerk via webhooks
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Clerk Integration
  clerk_id TEXT UNIQUE NOT NULL,
  
  -- Basic Info
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  name TEXT,
  image_url TEXT,
  
  -- Membership & Loyalty (TripC specific)
  membership_tier TEXT DEFAULT 'BRONZE' NOT NULL CHECK (membership_tier IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM')),
  tcent_balance INTEGER DEFAULT 0 NOT NULL CHECK (tcent_balance >= 0),
  tcent_pending INTEGER DEFAULT 0 NOT NULL CHECK (tcent_pending >= 0),
  lifetime_spend DECIMAL(12,2) DEFAULT 0 NOT NULL,
  
  -- Preferences
  currency TEXT DEFAULT 'USD',
  language TEXT DEFAULT 'en',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  is_email_verified BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for users table
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tier ON users(membership_tier);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users - Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (clerk_id = (SELECT auth.jwt()->>'sub'));

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (clerk_id = (SELECT auth.jwt()->>'sub'));

-- ============================================================================
-- BOOKINGS TABLE
-- ============================================================================

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User reference (must match authenticated user from RLS policy)
  user_id TEXT NOT NULL,
  
  -- Booking details
  booking_type TEXT NOT NULL CHECK (booking_type IN (
    'hotel', 'flight', 'restaurant', 'activity', 'event', 
    'wellness', 'beauty', 'transport'
  )),
  title TEXT NOT NULL,
  description TEXT,
  
  -- Dates
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Status & Payment
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN (
    'confirmed', 'pending', 'cancelled', 'completed'
  )),
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Additional data
  image_url TEXT,
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for bookings
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_type ON bookings(booking_type);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can view their own bookings
CREATE POLICY "Users can view own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.jwt()->>'sub'));

-- Users can create their own bookings
CREATE POLICY "Users can create own bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.jwt()->>'sub'));

-- Users can update their own bookings
CREATE POLICY "Users can update own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.jwt()->>'sub'));

-- Users can delete their own bookings
CREATE POLICY "Users can delete own bookings"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.jwt()->>'sub'));

-- ============================================================================
-- WISHLIST TABLE
-- ============================================================================

CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User reference (must match authenticated user from RLS policy)
  user_id TEXT NOT NULL,
  
  -- Item details
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT,
  price DECIMAL(10,2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one user can't add the same item twice
  UNIQUE(user_id, item_id)
);

-- Indexes for wishlist
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_wishlist_item ON wishlist(item_type, item_id);

-- Enable RLS
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can view their own wishlist
CREATE POLICY "Users can view own wishlist"
  ON wishlist
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.jwt()->>'sub'));

-- Users can add to their wishlist
CREATE POLICY "Users can add to own wishlist"
  ON wishlist
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.jwt()->>'sub'));

-- Users can remove from their wishlist
CREATE POLICY "Users can remove from own wishlist"
  ON wishlist
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.jwt()->>'sub'));

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User reference (must match authenticated user from RLS policy)
  user_id TEXT NOT NULL,
  
  -- Review target
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  
  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for reviews
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_item ON reviews(item_type, item_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Everyone can read reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can create reviews
CREATE POLICY "Users can create reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.jwt()->>'sub'));

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.jwt()->>'sub'));

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON reviews
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.jwt()->>'sub'));

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- REALTIME SUBSCRIPTIONS (Optional)
-- Enable realtime for tables that need live updates
-- ============================================================================

-- ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
-- ALTER PUBLICATION supabase_realtime ADD TABLE wishlist;

-- ============================================================================
-- COMPLETE!
-- ============================================================================
