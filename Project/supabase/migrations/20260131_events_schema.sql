-- Migration: Events Schema
-- Description: Creates events, event_sessions, event_ticket_types, and event_bookings tables
-- Date: 2026-01-31

-- =============================================================================
-- Table 1: events (main event listing)
-- =============================================================================
CREATE TABLE IF NOT EXISTS events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  -- Basic Info
  title text NOT NULL,
  slug text UNIQUE,
  description text,
  short_description text,
  
  -- Location
  venue_name text,
  address text,
  city text,
  district text,
  latitude numeric,
  longitude numeric,
  location_summary text,
  
  -- Categorization
  category text CHECK (category IN ('concert', 'festival', 'sports', 'theater', 'exhibition', 'conference', 'workshop', 'other')),
  tags text[] DEFAULT '{}',
  
  -- Media
  cover_image_url text,
  images text[] DEFAULT '{}',
  
  -- Ratings & Reviews
  average_rating numeric DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
  review_count integer DEFAULT 0 CHECK (review_count >= 0),
  
  -- Organizer
  organizer_name text,
  organizer_logo_url text,
  organizer_contact text,
  
  -- Event Details
  highlights text[] DEFAULT '{}',
  inclusions text[] DEFAULT '{}',
  exclusions text[] DEFAULT '{}',
  terms_and_conditions text,
  important_info text,
  age_restriction text,
  dress_code text,
  
  -- Display
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  
  -- SEO
  meta_title text,
  meta_description text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT events_pkey PRIMARY KEY (id)
);

-- =============================================================================
-- Table 2: event_sessions (date/time slots for events)
-- =============================================================================
CREATE TABLE IF NOT EXISTS event_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  
  -- Session Timing
  session_date date NOT NULL,
  start_time time NOT NULL,
  end_time time,
  timezone text DEFAULT 'Asia/Ho_Chi_Minh',
  
  -- Session Info
  name text, -- e.g., "Morning Show", "Evening Performance"
  description text,
  
  -- Door/Entry
  doors_open_time time,
  
  -- Session Status
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'on_sale', 'sold_out', 'cancelled', 'completed')),
  
  -- Capacity (aggregate from ticket_types, can be overridden)
  total_capacity integer,
  
  -- Session-specific venue override
  venue_override text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT event_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT event_sessions_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- =============================================================================
-- Table 3: event_ticket_types (GA, VIP, etc. per session)
-- =============================================================================
CREATE TABLE IF NOT EXISTS event_ticket_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  session_id uuid NOT NULL,
  
  -- Ticket Info
  name text NOT NULL, -- e.g., "General Admission", "VIP", "Early Bird"
  description text,
  
  -- Pricing (whole units, not cents - matching hotel pattern)
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  original_price numeric(12,2), -- for showing discounts
  currency text DEFAULT 'VND',
  
  -- Capacity Management
  total_capacity integer NOT NULL CHECK (total_capacity >= 0),
  sold_count integer DEFAULT 0 CHECK (sold_count >= 0),
  held_count integer DEFAULT 0 CHECK (held_count >= 0), -- temporary holds during checkout
  
  -- Constraints
  min_per_order integer DEFAULT 1 CHECK (min_per_order >= 1),
  max_per_order integer DEFAULT 10 CHECK (max_per_order >= 1),
  
  -- Ticket Features (what's included)
  perks text[] DEFAULT '{}', -- e.g., ['Priority entry', 'Free drink', 'Meet & greet']
  
  -- Sale Window
  sale_start_at timestamptz,
  sale_end_at timestamptz,
  
  -- Display
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  badge text, -- e.g., "Best Value", "Selling Fast"
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT event_ticket_types_pkey PRIMARY KEY (id),
  CONSTRAINT event_ticket_types_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT event_ticket_types_session_id_fkey FOREIGN KEY (session_id) REFERENCES event_sessions(id) ON DELETE CASCADE,
  CONSTRAINT event_ticket_types_capacity_check CHECK (sold_count + held_count <= total_capacity)
);

-- =============================================================================
-- Table 4: event_bookings (domain table linked to unified bookings)
-- =============================================================================
CREATE TABLE IF NOT EXISTS event_bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  -- Link to unified booking (1:1)
  booking_id uuid UNIQUE,
  
  -- User reference
  user_uuid uuid,
  external_user_ref text, -- Clerk user ID
  
  -- Event references
  event_id uuid NOT NULL,
  session_id uuid NOT NULL,
  ticket_type_id uuid NOT NULL,
  
  -- Booking details
  confirmation_code text NOT NULL UNIQUE,
  
  -- Quantities
  adult_count integer DEFAULT 0 CHECK (adult_count >= 0),
  child_count integer DEFAULT 0 CHECK (child_count >= 0),
  total_tickets integer GENERATED ALWAYS AS (adult_count + child_count) STORED,
  
  -- Pricing (stored at time of booking - immutable)
  unit_price numeric(12,2) NOT NULL,
  total_amount numeric(12,2) NOT NULL,
  currency text DEFAULT 'VND',
  
  -- Discounts applied
  discount_amount numeric(12,2) DEFAULT 0,
  tcent_used integer DEFAULT 0,
  tcent_earned integer DEFAULT 0,
  
  -- Guest Info
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text,
  
  -- Attendee details (array for multiple attendees)
  attendees jsonb DEFAULT '[]', -- [{name, email, phone, dob?}]
  
  -- Special requests
  special_requests text,
  
  -- E-Tickets
  qr_codes jsonb DEFAULT '[]', -- [{code, ticket_number, attendee_name, scanned_at?}]
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'refunded', 'no_show')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'partially_refunded', 'failed')),
  
  -- Timestamps
  confirmed_at timestamptz,
  checked_in_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  refund_amount numeric(12,2),
  refunded_at timestamptz,
  
  -- Metadata
  metadata jsonb DEFAULT '{}',
  booking_source text DEFAULT 'web',
  user_agent text,
  ip_address inet,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT event_bookings_pkey PRIMARY KEY (id),
  CONSTRAINT event_bookings_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  CONSTRAINT event_bookings_user_uuid_fkey FOREIGN KEY (user_uuid) REFERENCES users(id),
  CONSTRAINT event_bookings_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id),
  CONSTRAINT event_bookings_session_id_fkey FOREIGN KEY (session_id) REFERENCES event_sessions(id),
  CONSTRAINT event_bookings_ticket_type_id_fkey FOREIGN KEY (ticket_type_id) REFERENCES event_ticket_types(id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- events indexes
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_is_featured ON events(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- event_sessions indexes
CREATE INDEX IF NOT EXISTS idx_event_sessions_event_id ON event_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_event_sessions_date ON event_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_event_sessions_status ON event_sessions(status);
CREATE INDEX IF NOT EXISTS idx_event_sessions_event_date ON event_sessions(event_id, session_date);

-- event_ticket_types indexes
CREATE INDEX IF NOT EXISTS idx_event_ticket_types_event_id ON event_ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_event_ticket_types_session_id ON event_ticket_types(session_id);
CREATE INDEX IF NOT EXISTS idx_event_ticket_types_availability ON event_ticket_types(session_id) WHERE is_active = true;

-- event_bookings indexes
CREATE INDEX IF NOT EXISTS idx_event_bookings_user_uuid ON event_bookings(user_uuid);
CREATE INDEX IF NOT EXISTS idx_event_bookings_external_user_ref ON event_bookings(external_user_ref);
CREATE INDEX IF NOT EXISTS idx_event_bookings_event_id ON event_bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_event_bookings_session_id ON event_bookings(session_id);
CREATE INDEX IF NOT EXISTS idx_event_bookings_confirmation_code ON event_bookings(confirmation_code);
CREATE INDEX IF NOT EXISTS idx_event_bookings_status ON event_bookings(status);
CREATE INDEX IF NOT EXISTS idx_event_bookings_created_at ON event_bookings(created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;

-- events: Public read, admin write
CREATE POLICY "Public can view active events"
  ON events FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role can manage events"
  ON events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- event_sessions: Public read, admin write
CREATE POLICY "Public can view event sessions"
  ON event_sessions FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage event sessions"
  ON event_sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- event_ticket_types: Public read, admin write
CREATE POLICY "Public can view active ticket types"
  ON event_ticket_types FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role can manage ticket types"
  ON event_ticket_types FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- event_bookings: User can view own, service role can manage all
CREATE POLICY "Users can view own event bookings"
  ON event_bookings FOR SELECT
  USING (
    external_user_ref = auth.jwt()->>'sub'
    OR user_uuid IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can create own event bookings"
  ON event_bookings FOR INSERT
  WITH CHECK (
    external_user_ref = auth.jwt()->>'sub'
    OR user_uuid IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can update own event bookings"
  ON event_bookings FOR UPDATE
  USING (
    external_user_ref = auth.jwt()->>'sub'
    OR user_uuid IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Service role can manage event bookings"
  ON event_bookings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_events_updated_at') THEN
    CREATE TRIGGER update_events_updated_at 
      BEFORE UPDATE ON events 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_event_sessions_updated_at') THEN
    CREATE TRIGGER update_event_sessions_updated_at 
      BEFORE UPDATE ON event_sessions 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_event_ticket_types_updated_at') THEN
    CREATE TRIGGER update_event_ticket_types_updated_at 
      BEFORE UPDATE ON event_ticket_types 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_event_bookings_updated_at') THEN
    CREATE TRIGGER update_event_bookings_updated_at 
      BEFORE UPDATE ON event_bookings 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;

-- =============================================================================
-- HELPER FUNCTION: Check ticket availability with locking
-- =============================================================================
CREATE OR REPLACE FUNCTION check_event_ticket_availability(
  p_ticket_type_id uuid,
  p_quantity integer
)
RETURNS TABLE (
  available boolean,
  remaining_capacity integer,
  current_price numeric
) AS $$
DECLARE
  v_ticket event_ticket_types%ROWTYPE;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT * INTO v_ticket
  FROM event_ticket_types
  WHERE id = p_ticket_type_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0::numeric;
    RETURN;
  END IF;
  
  -- Calculate remaining capacity
  remaining_capacity := v_ticket.total_capacity - v_ticket.sold_count - v_ticket.held_count;
  current_price := v_ticket.price;
  available := remaining_capacity >= p_quantity AND v_ticket.is_active;
  
  RETURN QUERY SELECT available, remaining_capacity, current_price;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- HELPER FUNCTION: Hold tickets during checkout
-- =============================================================================
CREATE OR REPLACE FUNCTION hold_event_tickets(
  p_ticket_type_id uuid,
  p_quantity integer
)
RETURNS boolean AS $$
DECLARE
  v_available boolean;
BEGIN
  -- Check availability and lock
  SELECT (total_capacity - sold_count - held_count >= p_quantity AND is_active)
  INTO v_available
  FROM event_ticket_types
  WHERE id = p_ticket_type_id
  FOR UPDATE;
  
  IF v_available THEN
    UPDATE event_ticket_types
    SET held_count = held_count + p_quantity
    WHERE id = p_ticket_type_id;
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- HELPER FUNCTION: Convert held tickets to sold (on payment success)
-- =============================================================================
CREATE OR REPLACE FUNCTION confirm_event_tickets(
  p_ticket_type_id uuid,
  p_quantity integer
)
RETURNS boolean AS $$
BEGIN
  UPDATE event_ticket_types
  SET 
    held_count = held_count - p_quantity,
    sold_count = sold_count + p_quantity
  WHERE id = p_ticket_type_id
    AND held_count >= p_quantity;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- HELPER FUNCTION: Release held tickets (on checkout timeout/cancel)
-- =============================================================================
CREATE OR REPLACE FUNCTION release_event_tickets(
  p_ticket_type_id uuid,
  p_quantity integer
)
RETURNS boolean AS $$
BEGIN
  UPDATE event_ticket_types
  SET held_count = GREATEST(0, held_count - p_quantity)
  WHERE id = p_ticket_type_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE events IS 'Main events listing table - concerts, festivals, sports, etc.';
COMMENT ON TABLE event_sessions IS 'Individual date/time sessions for events (supports multi-day events)';
COMMENT ON TABLE event_ticket_types IS 'Ticket tiers with capacity tracking (GA, VIP, Early Bird, etc.)';
COMMENT ON TABLE event_bookings IS 'Domain booking records linked to unified bookings table';

COMMENT ON COLUMN event_ticket_types.sold_count IS 'Number of tickets sold (confirmed)';
COMMENT ON COLUMN event_ticket_types.held_count IS 'Number of tickets temporarily held during checkout';
COMMENT ON COLUMN event_bookings.qr_codes IS 'Array of QR code objects for e-ticket entry validation';
COMMENT ON COLUMN event_bookings.external_user_ref IS 'Clerk user ID for RLS policies';
