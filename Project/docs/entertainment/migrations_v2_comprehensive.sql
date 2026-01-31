-- =====================================================================
-- ENTERTAINMENT SERVICE - COMPREHENSIVE DATABASE SCHEMA v2.0
-- =====================================================================
-- Purpose: Full-featured event/ticket booking platform
-- Based on: E-commerce ticketing flowchart analysis
-- Date: January 30, 2026
-- Author: Senior BA & Fullstack Developer
-- =====================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For better text search

-- =====================================================================
-- 1. CATEGORIES TABLE
-- =====================================================================
-- Hierarchical category structure for events
CREATE TABLE IF NOT EXISTS public.entertainment_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  parent_id uuid REFERENCES public.entertainment_categories(id) ON DELETE CASCADE,
  icon_url text,
  banner_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_entertainment_categories_parent ON public.entertainment_categories(parent_id);
CREATE INDEX idx_entertainment_categories_slug ON public.entertainment_categories(slug);
CREATE INDEX idx_entertainment_categories_active ON public.entertainment_categories(is_active);

-- =====================================================================
-- 2. ORGANIZERS/PROVIDERS TABLE
-- =====================================================================
-- Event organizers and providers
CREATE TABLE IF NOT EXISTS public.entertainment_organizers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  logo_url text,
  cover_image_url text,
  email text,
  phone text,
  website text,
  social_links jsonb DEFAULT '{}'::jsonb, -- Twitter, Facebook, Instagram, etc.
  rating_average numeric(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  follower_count integer DEFAULT 0,
  event_count integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_entertainment_organizers_slug ON public.entertainment_organizers(slug);
CREATE INDEX idx_entertainment_organizers_verified ON public.entertainment_organizers(is_verified);

-- =====================================================================
-- 3. ENHANCED ENTERTAINMENT ITEMS TABLE
-- =====================================================================
-- Main events/entertainment table with enhanced fields
DROP TABLE IF EXISTS public.entertainment_items CASCADE;

CREATE TABLE public.entertainment_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Information
  title text NOT NULL,
  subtitle text,
  description text,
  type text NOT NULL, -- tour, show, activity, attraction, concert, sport
  slug text NOT NULL UNIQUE,
  
  -- Relationships
  category_id uuid REFERENCES public.entertainment_categories(id) ON DELETE SET NULL,
  organizer_id uuid REFERENCES public.entertainment_organizers(id) ON DELETE CASCADE,
  
  -- Pricing
  min_price numeric(10,2), -- Minimum ticket price
  max_price numeric(10,2), -- Maximum ticket price
  currency varchar(3) DEFAULT 'USD',
  
  -- Status & Availability
  status text DEFAULT 'draft', -- draft, published, cancelled, completed
  is_featured boolean DEFAULT false,
  is_trending boolean DEFAULT false,
  available boolean DEFAULT true,
  
  -- Location
  location jsonb, -- {city, country, lat, lng, address, venue}
  
  -- Media
  images jsonb DEFAULT '[]'::jsonb, -- Array of image URLs
  video_url text,
  
  -- Capacity & Booking Info
  base_capacity integer DEFAULT 0, -- Default capacity if no sessions
  total_bookings integer DEFAULT 0,
  total_views integer DEFAULT 0,
  total_wishlist integer DEFAULT 0,
  
  -- Rating & Reviews
  rating_average numeric(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  
  -- Urgency Settings
  urgency_threshold integer DEFAULT 20, -- Show "selling fast" when < this many left
  low_stock_threshold integer DEFAULT 10, -- Show "only X left"
  
  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb, -- duration, tags, difficulty, etc.
  
  -- SEO
  seo_title text,
  seo_description text,
  seo_keywords text[],
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  start_date timestamptz, -- Event start date
  end_date timestamptz -- Event end date
);

-- Indexes for performance
CREATE INDEX idx_entertainment_items_category ON public.entertainment_items(category_id);
CREATE INDEX idx_entertainment_items_organizer ON public.entertainment_items(organizer_id);
CREATE INDEX idx_entertainment_items_type ON public.entertainment_items(type);
CREATE INDEX idx_entertainment_items_status ON public.entertainment_items(status);
CREATE INDEX idx_entertainment_items_featured ON public.entertainment_items(is_featured);
CREATE INDEX idx_entertainment_items_trending ON public.entertainment_items(is_trending);
CREATE INDEX idx_entertainment_items_slug ON public.entertainment_items(slug);
CREATE INDEX idx_entertainment_items_dates ON public.entertainment_items(start_date, end_date);
CREATE INDEX idx_entertainment_items_price_range ON public.entertainment_items(min_price, max_price);

-- Full-text search index
CREATE INDEX idx_entertainment_items_search ON public.entertainment_items 
  USING gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(description, '')));

-- =====================================================================
-- 4. SESSIONS TABLE
-- =====================================================================
-- Date/time slots for events
CREATE TABLE IF NOT EXISTS public.entertainment_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id uuid NOT NULL REFERENCES public.entertainment_items(id) ON DELETE CASCADE,
  
  -- Session Details
  session_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  duration_minutes integer,
  
  -- Capacity & Availability
  capacity integer NOT NULL,
  booked_count integer DEFAULT 0,
  available_count integer GENERATED ALWAYS AS (capacity - booked_count) STORED,
  
  -- Pricing (can override item prices)
  price_override numeric(10,2), -- If null, use ticket type prices
  
  -- Status
  status text DEFAULT 'available', -- available, sold_out, cancelled
  is_active boolean DEFAULT true,
  
  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_entertainment_sessions_item ON public.entertainment_sessions(item_id);
CREATE INDEX idx_entertainment_sessions_date ON public.entertainment_sessions(session_date);
CREATE INDEX idx_entertainment_sessions_status ON public.entertainment_sessions(status);
CREATE INDEX idx_entertainment_sessions_active ON public.entertainment_sessions(is_active);

-- =====================================================================
-- 5. TICKET TYPES TABLE
-- =====================================================================
-- Different ticket tiers (VIP, Regular, Student, etc.)
CREATE TABLE IF NOT EXISTS public.entertainment_ticket_types (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id uuid NOT NULL REFERENCES public.entertainment_items(id) ON DELETE CASCADE,
  
  -- Ticket Type Info
  name text NOT NULL, -- VIP, Regular, Student, Early Bird, etc.
  description text,
  display_order integer DEFAULT 0,
  
  -- Pricing
  price numeric(10,2) NOT NULL,
  original_price numeric(10,2), -- For showing discounts
  currency varchar(3) DEFAULT 'USD',
  
  -- Limits
  max_quantity_per_order integer DEFAULT 10,
  total_available integer, -- Total tickets of this type
  total_sold integer DEFAULT 0,
  
  -- Benefits
  benefits jsonb DEFAULT '[]'::jsonb, -- Array of benefits for this tier
  
  -- Status
  is_active boolean DEFAULT true,
  
  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_entertainment_ticket_types_item ON public.entertainment_ticket_types(item_id);
CREATE INDEX idx_entertainment_ticket_types_active ON public.entertainment_ticket_types(is_active);

-- =====================================================================
-- 6. CART TABLE
-- =====================================================================
-- Shopping cart for users
CREATE TABLE IF NOT EXISTS public.entertainment_cart (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL, -- Clerk user ID
  
  -- Status
  status text DEFAULT 'active', -- active, checked_out, abandoned
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

CREATE INDEX idx_entertainment_cart_user ON public.entertainment_cart(user_id);
CREATE INDEX idx_entertainment_cart_status ON public.entertainment_cart(status);

-- =====================================================================
-- 7. CART ITEMS TABLE
-- =====================================================================
-- Items in shopping cart
CREATE TABLE IF NOT EXISTS public.entertainment_cart_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id uuid NOT NULL REFERENCES public.entertainment_cart(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.entertainment_items(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.entertainment_sessions(id) ON DELETE CASCADE,
  ticket_type_id uuid REFERENCES public.entertainment_ticket_types(id) ON DELETE CASCADE,
  
  -- Quantity & Pricing
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  currency varchar(3) DEFAULT 'USD',
  
  -- Reservation (temporary hold)
  reserved_until timestamptz,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_entertainment_cart_items_cart ON public.entertainment_cart_items(cart_id);
CREATE INDEX idx_entertainment_cart_items_item ON public.entertainment_cart_items(item_id);
CREATE INDEX idx_entertainment_cart_items_session ON public.entertainment_cart_items(session_id);

-- =====================================================================
-- 8. BOOKINGS TABLE
-- =====================================================================
-- Confirmed bookings/purchases
CREATE TABLE IF NOT EXISTS public.entertainment_bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference text NOT NULL UNIQUE, -- Human-readable reference (e.g., ENT-2026-001234)
  
  -- User & Item
  user_id text NOT NULL, -- Clerk user ID
  item_id uuid NOT NULL REFERENCES public.entertainment_items(id),
  session_id uuid REFERENCES public.entertainment_sessions(id),
  organizer_id uuid REFERENCES public.entertainment_organizers(id),
  
  -- Contact Information
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  
  -- Booking Details
  total_quantity integer NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  currency varchar(3) DEFAULT 'USD',
  
  -- Payment Status
  payment_status text DEFAULT 'pending', -- pending, paid, failed, refunded
  payment_method text, -- credit_card, paypal, etc.
  payment_reference text,
  payment_date timestamptz,
  
  -- Booking Status
  booking_status text DEFAULT 'confirmed', -- confirmed, cancelled, completed, no_show
  
  -- Cancellation
  cancellation_reason text,
  cancelled_at timestamptz,
  refund_amount numeric(10,2),
  refund_date timestamptz,
  
  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,
  notes text,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_entertainment_bookings_user ON public.entertainment_bookings(user_id);
CREATE INDEX idx_entertainment_bookings_item ON public.entertainment_bookings(item_id);
CREATE INDEX idx_entertainment_bookings_session ON public.entertainment_bookings(session_id);
CREATE INDEX idx_entertainment_bookings_reference ON public.entertainment_bookings(booking_reference);
CREATE INDEX idx_entertainment_bookings_payment_status ON public.entertainment_bookings(payment_status);
CREATE INDEX idx_entertainment_bookings_booking_status ON public.entertainment_bookings(booking_status);

-- =====================================================================
-- 9. TICKETS TABLE
-- =====================================================================
-- Individual tickets issued (QR codes, seat numbers, etc.)
CREATE TABLE IF NOT EXISTS public.entertainment_tickets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number text NOT NULL UNIQUE, -- Unique ticket number
  booking_id uuid NOT NULL REFERENCES public.entertainment_bookings(id) ON DELETE CASCADE,
  ticket_type_id uuid REFERENCES public.entertainment_ticket_types(id),
  
  -- Ticket Details
  attendee_name text,
  attendee_email text,
  seat_number text,
  
  -- QR Code & Validation
  qr_code_url text,
  qr_code_data text NOT NULL, -- Data encoded in QR code
  
  -- Redemption
  is_redeemed boolean DEFAULT false,
  redeemed_at timestamptz,
  redeemed_by text, -- Staff ID who scanned it
  
  -- Status
  status text DEFAULT 'valid', -- valid, used, cancelled, refunded
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_entertainment_tickets_booking ON public.entertainment_tickets(booking_id);
CREATE INDEX idx_entertainment_tickets_number ON public.entertainment_tickets(ticket_number);
CREATE INDEX idx_entertainment_tickets_qr ON public.entertainment_tickets(qr_code_data);
CREATE INDEX idx_entertainment_tickets_status ON public.entertainment_tickets(status);

-- =====================================================================
-- 10. WISHLIST TABLE
-- =====================================================================
-- User wishlists/favorites
CREATE TABLE IF NOT EXISTS public.entertainment_wishlist (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL, -- Clerk user ID
  item_id uuid NOT NULL REFERENCES public.entertainment_items(id) ON DELETE CASCADE,
  
  -- Notification Preferences
  notify_on_discount boolean DEFAULT false,
  notify_on_availability boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, item_id)
);

CREATE INDEX idx_entertainment_wishlist_user ON public.entertainment_wishlist(user_id);
CREATE INDEX idx_entertainment_wishlist_item ON public.entertainment_wishlist(item_id);

-- =====================================================================
-- 11. FOLLOWERS TABLE
-- =====================================================================
-- Users following organizers
CREATE TABLE IF NOT EXISTS public.entertainment_followers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL, -- Clerk user ID
  organizer_id uuid NOT NULL REFERENCES public.entertainment_organizers(id) ON DELETE CASCADE,
  
  -- Notification Preferences
  notify_new_events boolean DEFAULT true,
  notify_updates boolean DEFAULT true,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, organizer_id)
);

CREATE INDEX idx_entertainment_followers_user ON public.entertainment_followers(user_id);
CREATE INDEX idx_entertainment_followers_organizer ON public.entertainment_followers(organizer_id);

-- =====================================================================
-- 12. NOTIFICATIONS TABLE
-- =====================================================================
-- User notifications and alerts
CREATE TABLE IF NOT EXISTS public.entertainment_notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL, -- Clerk user ID
  
  -- Notification Details
  type text NOT NULL, -- booking_confirmed, event_reminder, price_drop, etc.
  title text NOT NULL,
  message text NOT NULL,
  
  -- Related Entities
  item_id uuid REFERENCES public.entertainment_items(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES public.entertainment_bookings(id) ON DELETE CASCADE,
  
  -- Status
  is_read boolean DEFAULT false,
  read_at timestamptz,
  
  -- Delivery
  sent_via jsonb DEFAULT '[]'::jsonb, -- ['email', 'push', 'in_app']
  
  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_entertainment_notifications_user ON public.entertainment_notifications(user_id);
CREATE INDEX idx_entertainment_notifications_read ON public.entertainment_notifications(is_read);
CREATE INDEX idx_entertainment_notifications_type ON public.entertainment_notifications(type);

-- =====================================================================
-- 13. REVIEWS TABLE
-- =====================================================================
-- User reviews and ratings
CREATE TABLE IF NOT EXISTS public.entertainment_reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id uuid NOT NULL REFERENCES public.entertainment_items(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES public.entertainment_bookings(id) ON DELETE SET NULL,
  user_id text NOT NULL, -- Clerk user ID
  
  -- Review Content
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  
  -- Media
  images jsonb DEFAULT '[]'::jsonb,
  
  -- Moderation
  is_verified_purchase boolean DEFAULT false,
  is_approved boolean DEFAULT true,
  is_flagged boolean DEFAULT false,
  
  -- Engagement
  helpful_count integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_entertainment_reviews_item ON public.entertainment_reviews(item_id);
CREATE INDEX idx_entertainment_reviews_user ON public.entertainment_reviews(user_id);
CREATE INDEX idx_entertainment_reviews_rating ON public.entertainment_reviews(rating);
CREATE INDEX idx_entertainment_reviews_approved ON public.entertainment_reviews(is_approved);

-- =====================================================================
-- 14. URGENCY SIGNALS TABLE
-- =====================================================================
-- Real-time urgency badges and signals
CREATE TABLE IF NOT EXISTS public.entertainment_urgency_signals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id uuid REFERENCES public.entertainment_items(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.entertainment_sessions(id) ON DELETE CASCADE,
  
  -- Signal Type
  signal_type text NOT NULL, -- selling_fast, only_x_left, happening_soon, sold_out
  
  -- Signal Data
  remaining_quantity integer,
  percentage_sold numeric(5,2),
  time_until_event interval,
  
  -- Display
  badge_text text NOT NULL, -- "Selling Fast!", "Only 5 left!", etc.
  badge_color text DEFAULT 'orange',
  priority integer DEFAULT 0, -- Higher priority shows first
  
  -- Status
  is_active boolean DEFAULT true,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  
  UNIQUE(item_id, session_id, signal_type)
);

CREATE INDEX idx_entertainment_urgency_item ON public.entertainment_urgency_signals(item_id);
CREATE INDEX idx_entertainment_urgency_session ON public.entertainment_urgency_signals(session_id);
CREATE INDEX idx_entertainment_urgency_type ON public.entertainment_urgency_signals(signal_type);
CREATE INDEX idx_entertainment_urgency_active ON public.entertainment_urgency_signals(is_active);

-- =====================================================================
-- 15. TRENDING CACHE TABLE
-- =====================================================================
-- Pre-calculated trending items for performance
CREATE TABLE IF NOT EXISTS public.entertainment_trending_cache (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id uuid NOT NULL REFERENCES public.entertainment_items(id) ON DELETE CASCADE,
  
  -- Trending Metrics
  trending_score numeric(10,2) NOT NULL,
  views_24h integer DEFAULT 0,
  bookings_24h integer DEFAULT 0,
  wishlist_24h integer DEFAULT 0,
  revenue_24h numeric(10,2) DEFAULT 0,
  
  -- Ranking
  trending_rank integer,
  category_rank integer,
  
  -- Timestamps
  calculated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '1 hour'),
  
  UNIQUE(item_id)
);

CREATE INDEX idx_entertainment_trending_score ON public.entertainment_trending_cache(trending_score DESC);
CREATE INDEX idx_entertainment_trending_rank ON public.entertainment_trending_cache(trending_rank);
CREATE INDEX idx_entertainment_trending_expires ON public.entertainment_trending_cache(expires_at);

-- =====================================================================
-- 16. WAITLIST TABLE
-- =====================================================================
-- Waitlist for sold-out events
CREATE TABLE IF NOT EXISTS public.entertainment_waitlist (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id uuid NOT NULL REFERENCES public.entertainment_items(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.entertainment_sessions(id) ON DELETE CASCADE,
  user_id text NOT NULL, -- Clerk user ID
  
  -- Contact Info
  email text NOT NULL,
  phone text,
  
  -- Status
  status text DEFAULT 'waiting', -- waiting, notified, converted, expired
  notified_at timestamptz,
  
  -- Position
  position integer, -- Position in waitlist
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '48 hours')
);

CREATE INDEX idx_entertainment_waitlist_item ON public.entertainment_waitlist(item_id);
CREATE INDEX idx_entertainment_waitlist_session ON public.entertainment_waitlist(session_id);
CREATE INDEX idx_entertainment_waitlist_user ON public.entertainment_waitlist(user_id);
CREATE INDEX idx_entertainment_waitlist_status ON public.entertainment_waitlist(status);

-- =====================================================================
-- TRIGGERS FOR AUTO-UPDATE
-- =====================================================================

-- Update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_entertainment_categories_updated_at 
  BEFORE UPDATE ON public.entertainment_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entertainment_organizers_updated_at 
  BEFORE UPDATE ON public.entertainment_organizers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entertainment_items_updated_at 
  BEFORE UPDATE ON public.entertainment_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entertainment_sessions_updated_at 
  BEFORE UPDATE ON public.entertainment_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entertainment_ticket_types_updated_at 
  BEFORE UPDATE ON public.entertainment_ticket_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entertainment_cart_updated_at 
  BEFORE UPDATE ON public.entertainment_cart
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entertainment_cart_items_updated_at 
  BEFORE UPDATE ON public.entertainment_cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entertainment_bookings_updated_at 
  BEFORE UPDATE ON public.entertainment_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entertainment_tickets_updated_at 
  BEFORE UPDATE ON public.entertainment_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entertainment_reviews_updated_at 
  BEFORE UPDATE ON public.entertainment_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =====================================================================

-- Function to update item ratings when review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_item_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.entertainment_items
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.entertainment_reviews
      WHERE item_id = COALESCE(NEW.item_id, OLD.item_id)
        AND is_approved = true
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.entertainment_reviews
      WHERE item_id = COALESCE(NEW.item_id, OLD.item_id)
        AND is_approved = true
    )
  WHERE id = COALESCE(NEW.item_id, OLD.item_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.entertainment_reviews
  FOR EACH ROW EXECUTE FUNCTION update_item_rating();

-- Function to update organizer follower count
CREATE OR REPLACE FUNCTION update_organizer_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.entertainment_organizers
  SET follower_count = (
    SELECT COUNT(*)
    FROM public.entertainment_followers
    WHERE organizer_id = COALESCE(NEW.organizer_id, OLD.organizer_id)
  )
  WHERE id = COALESCE(NEW.organizer_id, OLD.organizer_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_follower_count_on_follow_change
  AFTER INSERT OR DELETE ON public.entertainment_followers
  FOR EACH ROW EXECUTE FUNCTION update_organizer_follower_count();

-- Function to update item wishlist count
CREATE OR REPLACE FUNCTION update_item_wishlist_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.entertainment_items
  SET total_wishlist = (
    SELECT COUNT(*)
    FROM public.entertainment_wishlist
    WHERE item_id = COALESCE(NEW.item_id, OLD.item_id)
  )
  WHERE id = COALESCE(NEW.item_id, OLD.item_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wishlist_count_on_wishlist_change
  AFTER INSERT OR DELETE ON public.entertainment_wishlist
  FOR EACH ROW EXECUTE FUNCTION update_item_wishlist_count();

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================

-- Enable RLS on all tables
ALTER TABLE public.entertainment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entertainment_organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entertainment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entertainment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entertainment_ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entertainment_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entertainment_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entertainment_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entertainment_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entertainment_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entertainment_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entertainment_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entertainment_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entertainment_urgency_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entertainment_trending_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entertainment_waitlist ENABLE ROW LEVEL SECURITY;

-- Public read policies (categories, organizers, items, sessions, ticket types)
CREATE POLICY "Public read active categories"
  ON public.entertainment_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read organizers"
  ON public.entertainment_organizers FOR SELECT
  USING (true);

CREATE POLICY "Public read published items"
  ON public.entertainment_items FOR SELECT
  USING (status = 'published' AND available = true);

CREATE POLICY "Public read active sessions"
  ON public.entertainment_sessions FOR SELECT
  USING (is_active = true AND status = 'available');

CREATE POLICY "Public read active ticket types"
  ON public.entertainment_ticket_types FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read urgency signals"
  ON public.entertainment_urgency_signals FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read trending"
  ON public.entertainment_trending_cache FOR SELECT
  USING (expires_at > now());

CREATE POLICY "Public read approved reviews"
  ON public.entertainment_reviews FOR SELECT
  USING (is_approved = true);

-- User-specific policies (cart, wishlist, bookings, etc.)
CREATE POLICY "Users manage own cart"
  ON public.entertainment_cart FOR ALL
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users manage own cart items"
  ON public.entertainment_cart_items FOR ALL
  TO authenticated
  USING (cart_id IN (
    SELECT id FROM public.entertainment_cart 
    WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users view own bookings"
  ON public.entertainment_bookings FOR SELECT
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users view own tickets"
  ON public.entertainment_tickets FOR SELECT
  TO authenticated
  USING (booking_id IN (
    SELECT id FROM public.entertainment_bookings 
    WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users manage own wishlist"
  ON public.entertainment_wishlist FOR ALL
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users manage own follows"
  ON public.entertainment_followers FOR ALL
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users view own notifications"
  ON public.entertainment_notifications FOR SELECT
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users manage own reviews"
  ON public.entertainment_reviews FOR ALL
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users manage own waitlist entries"
  ON public.entertainment_waitlist FOR ALL
  TO authenticated
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Admin policies (authenticated users can write to certain tables)
CREATE POLICY "Authenticated users can create bookings"
  ON public.entertainment_bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- =====================================================================
-- COMMENTS
-- =====================================================================

COMMENT ON TABLE public.entertainment_categories IS 'Hierarchical categories for entertainment items';
COMMENT ON TABLE public.entertainment_organizers IS 'Event organizers and providers';
COMMENT ON TABLE public.entertainment_items IS 'Main entertainment items/events';
COMMENT ON TABLE public.entertainment_sessions IS 'Date/time sessions for events';
COMMENT ON TABLE public.entertainment_ticket_types IS 'Ticket tiers (VIP, Regular, etc.)';
COMMENT ON TABLE public.entertainment_cart IS 'Shopping carts for users';
COMMENT ON TABLE public.entertainment_cart_items IS 'Items in shopping carts';
COMMENT ON TABLE public.entertainment_bookings IS 'Confirmed bookings/purchases';
COMMENT ON TABLE public.entertainment_tickets IS 'Individual tickets with QR codes';
COMMENT ON TABLE public.entertainment_wishlist IS 'User favorites/wishlists';
COMMENT ON TABLE public.entertainment_followers IS 'Users following organizers';
COMMENT ON TABLE public.entertainment_notifications IS 'User notifications and alerts';
COMMENT ON TABLE public.entertainment_reviews IS 'User reviews and ratings';
COMMENT ON TABLE public.entertainment_urgency_signals IS 'Real-time urgency badges';
COMMENT ON TABLE public.entertainment_trending_cache IS 'Pre-calculated trending items';
COMMENT ON TABLE public.entertainment_waitlist IS 'Waitlist for sold-out events';

-- =====================================================================
-- END OF SCHEMA
-- =====================================================================
