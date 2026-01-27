-- ============================================================================
-- Flight Service - ENHANCED SCHEMA (Business Flow Aligned)
-- ============================================================================
-- Purpose: Complete implementation matching flowchart business requirements
-- Modules: Search, Offers, Booking, Checkout, Ticketing, Post-Booking
-- Created: January 26, 2026
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy search

-- ============================================================================
-- MODULE A: SEARCH & SELECTION
-- ============================================================================

-- Suppliers (GDS providers: Amadeus, Sabre, internal)
CREATE TABLE IF NOT EXISTS flight_suppliers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text UNIQUE NOT NULL,  -- 'AMADEUS', 'SABRE', 'INTERNAL'
  name text NOT NULL,
  api_endpoint text,
  api_key_encrypted text,
  is_active boolean DEFAULT true,
  priority int DEFAULT 0,  -- Higher = search first
  response_time_avg_ms int,
  success_rate numeric(5,2),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_flight_suppliers_active ON flight_suppliers (is_active, priority DESC);

-- Search sessions (track user searches for analytics)
CREATE TABLE IF NOT EXISTS flight_search_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text,  -- Clerk ID (nullable for anonymous)
  origin text NOT NULL,
  destination text NOT NULL,
  departure_date date NOT NULL,
  return_date date,
  passenger_adults int DEFAULT 1,
  passenger_children int DEFAULT 0,
  passenger_infants int DEFAULT 0,
  cabin_class text DEFAULT 'ECONOMY',  -- ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST
  trip_type text DEFAULT 'ONE_WAY',  -- ONE_WAY, ROUND_TRIP, MULTI_CITY
  filters jsonb DEFAULT '{}'::jsonb,  -- {max_price, carriers, max_stops, etc}
  searched_at timestamptz DEFAULT now(),
  results_count int DEFAULT 0,
  selected_offer_id uuid,  -- FK to flight_offers
  converted boolean DEFAULT false,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX idx_search_sessions_user ON flight_search_sessions (user_id, searched_at DESC);
CREATE INDEX idx_search_sessions_route ON flight_search_sessions (origin, destination, departure_date);
CREATE INDEX idx_search_sessions_converted ON flight_search_sessions (converted) WHERE converted = true;

-- ============================================================================
-- ENHANCED: flight_offers (expanded for business logic)
-- ============================================================================

-- Drop existing and recreate with full business attributes
DROP TABLE IF EXISTS flight_offers CASCADE;

CREATE TABLE flight_offers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_key text UNIQUE NOT NULL,
  flight_id uuid REFERENCES flights(id) ON DELETE RESTRICT,
  supplier_id uuid REFERENCES flight_suppliers(id),
  supplier_offer_id text,  -- External supplier's offer ID
  
  -- Pricing
  total_price numeric NOT NULL,
  base_fare numeric NOT NULL,
  taxes_fees numeric NOT NULL,
  currency text DEFAULT 'USD',
  
  -- Inventory
  seats_available int NOT NULL DEFAULT 0,
  last_seat_available boolean DEFAULT false,  -- Urgency indicator
  
  -- Cabin & Fare
  cabin_class text DEFAULT 'ECONOMY',
  fare_family text DEFAULT 'STANDARD',  -- STANDARD, FLEXIBLE, PREMIUM
  fare_basis_code text,  -- Airline fare code
  booking_class text,  -- Y, B, M, etc
  
  -- Flexibility
  refundable boolean DEFAULT false,
  changeable boolean DEFAULT false,
  change_fee numeric DEFAULT 0,
  cancellation_fee numeric DEFAULT 0,
  
  -- Baggage
  baggage_included jsonb DEFAULT '{}'::jsonb,  -- {checked: 2, carryon: 1, weight: '23kg'}
  baggage_fee numeric DEFAULT 0,
  
  -- Rules
  fare_rules_id uuid,  -- FK to fare_rules table
  advance_purchase_required int,  -- Days before departure
  minimum_stay int,  -- Nights
  maximum_stay int,
  blackout_dates jsonb DEFAULT '[]'::jsonb,
  
  -- Metadata
  provider text DEFAULT 'internal',
  valid_until timestamptz,
  popularity_score int DEFAULT 0,  -- For sorting
  is_featured boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_seats CHECK (seats_available >= 0),
  CONSTRAINT valid_offer_price CHECK (total_price >= 0),
  CONSTRAINT valid_pricing CHECK (total_price = base_fare + taxes_fees)
);

CREATE INDEX idx_flight_offers_flight_id ON flight_offers (flight_id);
CREATE INDEX idx_flight_offers_price ON flight_offers (total_price);
CREATE INDEX idx_flight_offers_seats ON flight_offers (seats_available) WHERE seats_available > 0;
CREATE INDEX idx_flight_offers_valid_until ON flight_offers (valid_until);
CREATE INDEX idx_flight_offers_cabin ON flight_offers (cabin_class, fare_family);
CREATE INDEX idx_flight_offers_supplier ON flight_offers (supplier_id, supplier_offer_id);
CREATE INDEX idx_flight_offers_refundable ON flight_offers (refundable) WHERE refundable = true;

-- ============================================================================
-- MODULE B: OFFERS & PRESENTATION
-- ============================================================================

-- Fare Rules (detailed T&C for each offer)
CREATE TABLE IF NOT EXISTS fare_rules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id uuid REFERENCES flight_offers(id) ON DELETE CASCADE,
  
  -- Cancellation
  cancellation_allowed boolean DEFAULT true,
  cancellation_window_hours int,  -- Hours before departure
  cancellation_fee_percent numeric(5,2),
  cancellation_fee_fixed numeric,
  no_show_fee numeric,
  
  -- Changes
  changes_allowed boolean DEFAULT true,
  change_window_hours int,
  change_fee_percent numeric(5,2),
  change_fee_fixed numeric,
  same_day_change_fee numeric,
  
  -- Restrictions
  advance_purchase_days int,
  minimum_stay_nights int,
  maximum_stay_nights int,
  saturday_night_stay_required boolean DEFAULT false,
  
  -- Penalties
  reissue_fee numeric,
  upgrade_fee numeric,
  downgrade_refund_percent numeric(5,2),
  
  -- Baggage
  checked_baggage_count int DEFAULT 0,
  checked_baggage_weight text,
  carryon_baggage_count int DEFAULT 1,
  excess_baggage_fee_per_kg numeric,
  
  -- Seat Selection
  seat_selection_allowed boolean DEFAULT true,
  seat_selection_fee numeric DEFAULT 0,
  advance_seat_selection boolean DEFAULT false,
  
  -- Other
  meal_included boolean DEFAULT false,
  lounge_access boolean DEFAULT false,
  priority_boarding boolean DEFAULT false,
  fast_track_security boolean DEFAULT false,
  
  -- Full text rules
  rules_text text,  -- Human-readable T&C
  rules_html text,  -- Formatted HTML
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_fare_rules_offer ON fare_rules (offer_id);

-- User Preferences (stored search preferences)
CREATE TABLE IF NOT EXISTS user_flight_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,  -- Clerk ID
  
  -- Preferences
  preferred_cabin text DEFAULT 'ECONOMY',
  preferred_airlines jsonb DEFAULT '[]'::jsonb,  -- ['VN', 'VJ']
  excluded_airlines jsonb DEFAULT '[]'::jsonb,
  max_stops int DEFAULT 2,
  preferred_departure_time text,  -- 'morning', 'afternoon', 'evening', 'night'
  preferred_arrival_time text,
  seat_preference text,  -- 'window', 'aisle', 'middle'
  meal_preference text,  -- 'vegetarian', 'halal', 'kosher', etc
  
  -- Loyalty
  frequent_flyer_programs jsonb DEFAULT '[]'::jsonb,  -- [{airline: 'VN', number: '123'}]
  
  -- Notifications
  price_alert_enabled boolean DEFAULT false,
  price_alert_threshold_percent numeric(5,2),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_user_preferences_user ON user_flight_preferences (user_id);

-- Price Alerts (monitor price changes for routes)
CREATE TABLE IF NOT EXISTS price_alerts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  departure_date date,
  target_price numeric,
  current_lowest_price numeric,
  is_active boolean DEFAULT true,
  last_checked_at timestamptz,
  notification_sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_price_alerts_active ON price_alerts (user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_price_alerts_route ON price_alerts (origin, destination, departure_date);

-- ============================================================================
-- MODULE C: BOOKING & CHECKOUT & TICKETING
-- ============================================================================

-- Enhanced flight_bookings
DROP TABLE IF EXISTS flight_bookings CASCADE;

CREATE TABLE flight_bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User & Offer
  user_id text NOT NULL,  -- Clerk ID
  offer_id uuid REFERENCES flight_offers(id) ON DELETE RESTRICT,
  flight_id uuid REFERENCES flights(id) ON DELETE RESTRICT,
  search_session_id uuid REFERENCES flight_search_sessions(id),
  
  -- Booking Reference
  pnr text UNIQUE NOT NULL,  -- 6-char Passenger Name Record
  booking_reference text,  -- External supplier reference
  supplier_id uuid REFERENCES flight_suppliers(id),
  
  -- Passenger Information
  passengers jsonb NOT NULL,  -- [{first_name, last_name, dob, document_type, document_number, nationality, frequent_flyer}]
  passenger_count int GENERATED ALWAYS AS (jsonb_array_length(passengers)) STORED,
  lead_passenger_email text NOT NULL,
  lead_passenger_phone text NOT NULL,
  
  -- Contact Information
  contact_info jsonb NOT NULL,  -- {email, phone, emergency_contact: {name, phone}}
  billing_address jsonb,  -- {line1, city, postal_code, country}
  
  -- Pricing
  price_paid numeric NOT NULL,
  base_fare numeric NOT NULL,
  taxes_fees numeric NOT NULL,
  total_baggage_fees numeric DEFAULT 0,
  total_seat_fees numeric DEFAULT 0,
  total_meal_fees numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  
  -- Loyalty & Discounts
  tcent_used int DEFAULT 0,  -- Loyalty points redeemed
  tcent_earned int DEFAULT 0,  -- Points earned from booking
  discount_code text,
  discount_amount numeric DEFAULT 0,
  promo_applied jsonb,  -- {code, type, amount}
  
  -- Booking Status
  status text DEFAULT 'PENDING',  -- PENDING, CONFIRMED, TICKETED, CANCELLED, COMPLETED, REFUNDED
  booking_type text DEFAULT 'CONFIRMED',  -- CONFIRMED, HOLD, FLEXIBLE
  
  -- Hold Booking (soft booking)
  hold_until timestamptz,  -- For unpaid hold bookings
  hold_payment_deadline timestamptz,
  is_hold_booking boolean DEFAULT false,
  
  -- Payment
  payment_status text DEFAULT 'PENDING',  -- PENDING, AUTHORIZED, PAID, REFUNDED, FAILED
  payment_id text,  -- Payment gateway transaction ID
  payment_method text,  -- CARD, TCENT, BANK_TRANSFER
  payment_completed_at timestamptz,
  
  -- Ticketing
  ticketing_status text DEFAULT 'PENDING',  -- PENDING, ISSUED, FAILED
  ticketing_deadline timestamptz,  -- Must ticket before this time
  tickets jsonb DEFAULT '[]'::jsonb,  -- [{ticket_number, passenger_id, issued_at, eticket_url}]
  
  -- Ancillaries
  seat_assignments jsonb DEFAULT '{}'::jsonb,  -- {passenger_id: 'seat_number'}
  baggage_allowance jsonb DEFAULT '{}'::jsonb,
  meal_selections jsonb DEFAULT '{}'::jsonb,
  special_requests text,
  
  -- Fare Rules Acceptance
  fare_rules_accepted boolean DEFAULT false,
  fare_rules_accepted_at timestamptz,
  fare_rules_version int,
  terms_accepted boolean DEFAULT false,
  terms_accepted_at timestamptz,
  
  -- Modifications
  is_modified boolean DEFAULT false,
  original_booking_id uuid,  -- If rebooked
  modification_fee numeric DEFAULT 0,
  
  -- Cancellation & Refund
  cancelled_by text,  -- user_id or 'system' or 'admin'
  cancellation_reason text,
  refund_amount numeric,
  refund_status text,  -- PENDING, APPROVED, PROCESSED, DENIED
  refund_processed_at timestamptz,
  
  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,
  agent_id text,  -- Support agent handling booking
  booking_source text DEFAULT 'WEB',  -- WEB, MOBILE_APP, API, ADMIN
  
  -- Timestamps
  booked_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  ticketed_at timestamptz,
  cancelled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_booking_price CHECK (price_paid >= 0),
  CONSTRAINT valid_passengers CHECK (jsonb_array_length(passengers) > 0),
  CONSTRAINT valid_status CHECK (status IN ('PENDING', 'CONFIRMED', 'TICKETED', 'CANCELLED', 'COMPLETED', 'REFUNDED', 'FAILED')),
  CONSTRAINT valid_pricing CHECK (price_paid = base_fare + taxes_fees + total_baggage_fees + total_seat_fees + total_meal_fees - discount_amount)
);

CREATE INDEX idx_flight_bookings_user_id ON flight_bookings (user_id, created_at DESC);
CREATE INDEX idx_flight_bookings_pnr ON flight_bookings (pnr);
CREATE INDEX idx_flight_bookings_status ON flight_bookings (status);
CREATE INDEX idx_flight_bookings_payment_status ON flight_bookings (payment_status) WHERE payment_status != 'PAID';
CREATE INDEX idx_flight_bookings_hold ON flight_bookings (hold_until) WHERE is_hold_booking = true AND payment_status = 'PENDING';
CREATE INDEX idx_flight_bookings_ticketing ON flight_bookings (ticketing_deadline) WHERE ticketing_status = 'PENDING';

-- Payment Transactions
CREATE TABLE IF NOT EXISTS booking_payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES flight_bookings(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  
  -- Payment Gateway
  gateway text NOT NULL,  -- 'PAYOS', 'STRIPE', 'VNPAY'
  transaction_id text UNIQUE NOT NULL,
  external_transaction_id text,  -- Gateway's transaction ID
  
  -- Amount
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  tcent_amount int DEFAULT 0,  -- If paid partially with points
  
  -- Status
  status text DEFAULT 'PENDING',  -- PENDING, AUTHORIZED, CAPTURED, FAILED, REFUNDED, CANCELLED
  payment_method text,  -- CARD, BANK_TRANSFER, WALLET, TCENT
  card_last4 text,
  card_brand text,
  
  -- Timestamps
  authorized_at timestamptz,
  captured_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  refunded_at timestamptz,
  refund_reason text,
  
  -- Webhook Data
  gateway_response jsonb,
  webhook_received_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_booking_payments_booking ON booking_payments (booking_id);
CREATE INDEX idx_booking_payments_transaction ON booking_payments (transaction_id);
CREATE INDEX idx_booking_payments_status ON booking_payments (status);
CREATE INDEX idx_booking_payments_user ON booking_payments (user_id, created_at DESC);

-- Issued Tickets
CREATE TABLE IF NOT EXISTS booking_tickets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES flight_bookings(id) ON DELETE CASCADE,
  
  -- Ticket Details
  ticket_number text UNIQUE NOT NULL,  -- 13-digit e-ticket number
  passenger_index int NOT NULL,  -- Index in passengers array
  passenger_name text NOT NULL,
  
  -- Flight Details
  flight_id uuid REFERENCES flights(id),
  fare_basis_code text,
  booking_class text,
  
  -- Status
  status text DEFAULT 'ISSUED',  -- ISSUED, VOID, REFUNDED, EXCHANGED
  issued_at timestamptz DEFAULT now(),
  issued_by text,  -- user_id or 'system'
  
  -- Documents
  eticket_url text,  -- URL to downloadable e-ticket PDF
  eticket_pdf_path text,  -- Storage path
  
  -- Validations
  is_valid boolean DEFAULT true,
  void_reason text,
  voided_at timestamptz,
  
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_booking_tickets_booking ON booking_tickets (booking_id);
CREATE INDEX idx_booking_tickets_number ON booking_tickets (ticket_number);
CREATE INDEX idx_booking_tickets_status ON booking_tickets (status) WHERE status = 'ISSUED';

-- ============================================================================
-- MODULE D: POST-BOOKING MANAGEMENT
-- ============================================================================

-- Booking Notifications (email/SMS log)
CREATE TABLE IF NOT EXISTS booking_notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES flight_bookings(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  
  -- Notification Details
  type text NOT NULL,  -- 'CONFIRMATION', 'PAYMENT_SUCCESS', 'TICKET_ISSUED', 'REMINDER', 'CANCELLATION', 'REFUND'
  channel text NOT NULL,  -- 'EMAIL', 'SMS', 'PUSH', 'IN_APP'
  recipient text NOT NULL,  -- Email or phone
  
  -- Status
  status text DEFAULT 'PENDING',  -- PENDING, SENT, DELIVERED, FAILED, BOUNCED
  sent_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  
  -- Content
  subject text,
  body text,
  template_id text,
  template_data jsonb,
  
  -- External Service
  provider text,  -- 'SENDGRID', 'TWILIO', 'FIREBASE'
  external_id text,
  
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_notifications_booking ON booking_notifications (booking_id, created_at DESC);
CREATE INDEX idx_notifications_status ON booking_notifications (status) WHERE status = 'PENDING';
CREATE INDEX idx_notifications_type ON booking_notifications (type, created_at DESC);

-- Booking Modifications History
CREATE TABLE IF NOT EXISTS booking_modifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES flight_bookings(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  
  -- Modification Type
  type text NOT NULL,  -- 'PASSENGER_UPDATE', 'DATE_CHANGE', 'FLIGHT_CHANGE', 'SEAT_ASSIGNMENT', 'BAGGAGE_ADD', 'MEAL_SELECT'
  
  -- Changes
  field_name text,
  old_value jsonb,
  new_value jsonb,
  
  -- Fee
  fee_charged numeric DEFAULT 0,
  
  -- Approval
  requires_approval boolean DEFAULT false,
  approval_status text,  -- PENDING, APPROVED, REJECTED
  approved_by text,
  approved_at timestamptz,
  rejection_reason text,
  
  -- Agent
  modified_by text NOT NULL,  -- user_id or agent_id
  modification_source text DEFAULT 'USER',  -- USER, AGENT, SYSTEM
  
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_modifications_booking ON booking_modifications (booking_id, created_at DESC);
CREATE INDEX idx_modifications_approval ON booking_modifications (approval_status) WHERE requires_approval = true;

-- Loyalty Transactions (Tcent earning/redemption)
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,
  booking_id uuid REFERENCES flight_bookings(id),
  
  -- Transaction
  type text NOT NULL,  -- 'EARN', 'REDEEM', 'REFUND', 'EXPIRE', 'BONUS'
  amount int NOT NULL,  -- Tcent points (can be negative for redemption)
  balance_after int NOT NULL,
  
  -- Earning Rules
  earning_rate numeric(5,2),  -- e.g., 1.5 for 150% earning
  base_amount numeric,  -- Amount booking before multiplier
  multiplier_reason text,  -- 'GOLD_MEMBER', 'PROMOTION', 'REFERRAL'
  
  -- Expiry
  expires_at timestamptz,
  is_expired boolean DEFAULT false,
  
  -- Status
  status text DEFAULT 'COMPLETED',  -- PENDING, COMPLETED, REVERSED
  reversed_at timestamptz,
  reversal_reason text,
  
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_loyalty_user ON loyalty_transactions (user_id, created_at DESC);
CREATE INDEX idx_loyalty_booking ON loyalty_transactions (booking_id);
CREATE INDEX idx_loyalty_expires ON loyalty_transactions (user_id, expires_at) WHERE is_expired = false;

-- Check-in Records
CREATE TABLE IF NOT EXISTS booking_checkins (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES flight_bookings(id) ON DELETE CASCADE,
  passenger_index int NOT NULL,
  
  -- Check-in Details
  checked_in_at timestamptz DEFAULT now(),
  boarding_pass_number text,
  boarding_group text,  -- 'A', 'B', 'C'
  boarding_position int,
  gate text,
  seat_assigned text,
  
  -- Status
  status text DEFAULT 'CHECKED_IN',  -- CHECKED_IN, BOARDED, NO_SHOW
  boarded_at timestamptz,
  
  -- Document
  boarding_pass_url text,  -- QR code / PDF
  
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_checkins_booking ON booking_checkins (booking_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on user-specific tables
ALTER TABLE flight_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_flight_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own flight bookings" ON flight_bookings;
DROP POLICY IF EXISTS "Users can create own flight bookings" ON flight_bookings;
DROP POLICY IF EXISTS "Users can update own flight bookings" ON flight_bookings;
DROP POLICY IF EXISTS "Users can cancel own flight bookings" ON flight_bookings;
DROP POLICY IF EXISTS "Service role can manage all flight bookings" ON flight_bookings;

-- RLS Policies for flight_bookings
CREATE POLICY "Users view own bookings" ON flight_bookings
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.jwt()->>'sub'));

CREATE POLICY "Users create own bookings" ON flight_bookings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.jwt()->>'sub'));

CREATE POLICY "Users update own bookings" ON flight_bookings
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.jwt()->>'sub'));

CREATE POLICY "Service role full access" ON flight_bookings
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- RLS for payments
CREATE POLICY "Users view own payments" ON booking_payments
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.jwt()->>'sub'));

CREATE POLICY "Service role manage payments" ON booking_payments
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- RLS for preferences
CREATE POLICY "Users manage own preferences" ON user_flight_preferences
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.jwt()->>'sub'))
  WITH CHECK (user_id = (SELECT auth.jwt()->>'sub'));

-- RLS for loyalty
CREATE POLICY "Users view own loyalty" ON loyalty_transactions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.jwt()->>'sub'));

CREATE POLICY "Service role manage loyalty" ON loyalty_transactions
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at trigger function (already exists from base schema)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DROP TRIGGER IF EXISTS update_flight_suppliers_updated_at ON flight_suppliers;
CREATE TRIGGER update_flight_suppliers_updated_at BEFORE UPDATE ON flight_suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_flight_offers_updated_at ON flight_offers;
CREATE TRIGGER update_flight_offers_updated_at BEFORE UPDATE ON flight_offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_flight_bookings_updated_at ON flight_bookings;
CREATE TRIGGER update_flight_bookings_updated_at BEFORE UPDATE ON flight_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fare_rules_updated_at ON fare_rules;
CREATE TRIGGER update_fare_rules_updated_at BEFORE UPDATE ON fare_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_flight_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_flight_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_booking_payments_updated_at ON booking_payments;
CREATE TRIGGER update_booking_payments_updated_at BEFORE UPDATE ON booking_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_booking_tickets_updated_at ON booking_tickets;
CREATE TRIGGER update_booking_tickets_updated_at BEFORE UPDATE ON booking_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate PNR trigger
CREATE OR REPLACE FUNCTION generate_pnr()
RETURNS TRIGGER AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- No O, I, 0, 1 to avoid confusion
  result text := '';
  i int;
BEGIN
  IF NEW.pnr IS NULL THEN
    LOOP
      result := '';
      FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
      END LOOP;
      
      -- Check uniqueness
      IF NOT EXISTS (SELECT 1 FROM flight_bookings WHERE pnr = result) THEN
        NEW.pnr := result;
        EXIT;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_pnr_trigger ON flight_bookings;
CREATE TRIGGER generate_pnr_trigger
  BEFORE INSERT ON flight_bookings
  FOR EACH ROW EXECUTE FUNCTION generate_pnr();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE flight_suppliers IS 'External GDS/supplier integrations (Amadeus, Sabre, internal)';
COMMENT ON TABLE flight_search_sessions IS 'Track user search behavior for analytics and conversion optimization';
COMMENT ON TABLE flight_offers IS 'Complete flight offers with pricing, fare rules, and business attributes';
COMMENT ON TABLE fare_rules IS 'Detailed cancellation/change policies and restrictions per offer';
COMMENT ON TABLE user_flight_preferences IS 'Saved user preferences for personalized search';
COMMENT ON TABLE price_alerts IS 'User price monitoring for routes';
COMMENT ON TABLE flight_bookings IS 'Complete booking records with payment, ticketing, and modifications';
COMMENT ON TABLE booking_payments IS 'Payment transaction log with gateway integration';
COMMENT ON TABLE booking_tickets IS 'Issued e-tickets with ticket numbers';
COMMENT ON TABLE booking_notifications IS 'Email/SMS notification delivery log';
COMMENT ON TABLE booking_modifications IS 'History of all booking changes and modifications';
COMMENT ON TABLE loyalty_transactions IS 'Tcent points earning and redemption transactions';
COMMENT ON TABLE booking_checkins IS 'Online check-in and boarding pass generation';

-- ============================================================================
-- DEPLOYMENT NOTES
-- ============================================================================
-- This schema implements the complete flight booking business flow:
-- 1. Search & Selection (Module A)
-- 2. Offers & Presentation (Module B)
-- 3. Booking & Checkout & Ticketing (Module C)
-- 4. Post-Booking Management (Module D)
--
-- Next Steps:
-- 1. Run this migration in Supabase
-- 2. Insert default supplier (INTERNAL)
-- 3. Implement API endpoints for new tables
-- 4. Add payment gateway webhooks
-- 5. Create notification service
-- 6. Build check-in functionality
-- ============================================================================
