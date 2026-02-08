-- Flight Partner System Migration
-- Creates partner-specific tables for flight partner portal
-- Date: 2026-02-08

-- =====================================================
-- FLIGHT PARTNER USERS TABLE
-- Stores flight partner portal user accounts
-- =====================================================
CREATE TABLE IF NOT EXISTS public.flight_partner_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL,
  email varchar(255) NOT NULL UNIQUE,
  full_name varchar(255) NOT NULL,
  phone varchar(50),
  role varchar(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'manager', 'staff')),
  is_active boolean NOT NULL DEFAULT true,
  last_login_at timestamp with time zone,
  password_hash text NOT NULL,
  reset_token text,
  reset_token_expires_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT flight_partner_users_pkey PRIMARY KEY (id),
  CONSTRAINT flight_partner_users_partner_id_fkey FOREIGN KEY (partner_id) 
    REFERENCES public.flight_partners(id) ON DELETE CASCADE
);

-- Indexes for flight_partner_users
CREATE INDEX IF NOT EXISTS idx_flight_partner_users_partner_id ON public.flight_partner_users(partner_id);
CREATE INDEX IF NOT EXISTS idx_flight_partner_users_email ON public.flight_partner_users(email);
CREATE INDEX IF NOT EXISTS idx_flight_partner_users_is_active ON public.flight_partner_users(is_active);

-- =====================================================
-- FLIGHT PARTNER PERMISSIONS TABLE
-- Stores granular permissions for flight partner users
-- =====================================================
CREATE TABLE IF NOT EXISTS public.flight_partner_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  permission varchar(100) NOT NULL,
  resource_type varchar(50) CHECK (resource_type IN ('flight', 'route', 'pricing', 'booking', 'analytics', 'settings')),
  resource_id uuid,
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  granted_by uuid,
  CONSTRAINT flight_partner_permissions_pkey PRIMARY KEY (id),
  CONSTRAINT flight_partner_permissions_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES public.flight_partner_users(id) ON DELETE CASCADE,
  CONSTRAINT flight_partner_permissions_granted_by_fkey FOREIGN KEY (granted_by) 
    REFERENCES public.flight_partner_users(id) ON DELETE SET NULL,
  CONSTRAINT unique_flight_user_permission UNIQUE (user_id, permission, resource_type, resource_id)
);

-- Indexes for flight_partner_permissions
CREATE INDEX IF NOT EXISTS idx_flight_partner_permissions_user_id ON public.flight_partner_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_flight_partner_permissions_resource ON public.flight_partner_permissions(resource_type, resource_id);

-- =====================================================
-- FLIGHT PARTNER ANALYTICS TABLE
-- Stores daily analytics for flight partner performance
-- =====================================================
CREATE TABLE IF NOT EXISTS public.flight_partner_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL,
  flight_id uuid,
  date date NOT NULL,
  
  -- Booking metrics
  total_bookings integer NOT NULL DEFAULT 0,
  confirmed_bookings integer NOT NULL DEFAULT 0,
  cancelled_bookings integer NOT NULL DEFAULT 0,
  pending_bookings integer NOT NULL DEFAULT 0,
  
  -- Revenue metrics (in cents)
  gross_revenue_cents bigint NOT NULL DEFAULT 0,
  net_revenue_cents bigint NOT NULL DEFAULT 0,
  commission_cents bigint NOT NULL DEFAULT 0,
  refund_cents bigint NOT NULL DEFAULT 0,
  
  -- Capacity metrics
  total_seats integer NOT NULL DEFAULT 0,
  seats_booked integer NOT NULL DEFAULT 0,
  load_factor numeric(5,2) DEFAULT 0.00,
  
  -- Performance metrics
  avg_booking_value_cents integer DEFAULT 0,
  avg_passengers_per_booking numeric(4,2) DEFAULT 0.00,
  avg_lead_time_days integer DEFAULT 0,
  
  -- Customer metrics
  new_customers integer NOT NULL DEFAULT 0,
  returning_customers integer NOT NULL DEFAULT 0,
  
  -- Calculated fields
  calculated_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT flight_partner_analytics_pkey PRIMARY KEY (id),
  CONSTRAINT flight_partner_analytics_partner_id_fkey FOREIGN KEY (partner_id) 
    REFERENCES public.flight_partners(id) ON DELETE CASCADE,
  CONSTRAINT unique_flight_partner_date UNIQUE (partner_id, flight_id, date)
);

-- Indexes for flight_partner_analytics
CREATE INDEX IF NOT EXISTS idx_flight_partner_analytics_partner_id ON public.flight_partner_analytics(partner_id);
CREATE INDEX IF NOT EXISTS idx_flight_partner_analytics_flight_id ON public.flight_partner_analytics(flight_id);
CREATE INDEX IF NOT EXISTS idx_flight_partner_analytics_date ON public.flight_partner_analytics(date);
CREATE INDEX IF NOT EXISTS idx_flight_partner_analytics_partner_date ON public.flight_partner_analytics(partner_id, date);

-- =====================================================
-- FLIGHT PARTNER PAYOUTS TABLE
-- Stores monthly payout records for flight partners
-- =====================================================
CREATE TABLE IF NOT EXISTS public.flight_partner_payouts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  
  -- Payout amounts (in cents)
  gross_amount_cents bigint NOT NULL DEFAULT 0,
  commission_cents bigint NOT NULL DEFAULT 0,
  net_amount_cents bigint NOT NULL DEFAULT 0,
  
  -- Adjustments (in cents)
  adjustment_cents bigint DEFAULT 0,
  adjustment_reason text,
  
  -- Final payout
  payout_amount_cents bigint NOT NULL,
  
  -- Status tracking
  status varchar(50) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'disputed')),
  
  -- Booking details
  total_bookings integer NOT NULL DEFAULT 0,
  booking_ids jsonb DEFAULT '[]'::jsonb,
  
  -- Payment details
  payment_method varchar(50),
  payment_reference varchar(255),
  paid_at timestamp with time zone,
  
  -- Dispute tracking
  dispute_reason text,
  dispute_status varchar(50) CHECK (dispute_status IN ('open', 'investigating', 'resolved', 'closed')),
  disputed_at timestamp with time zone,
  resolved_at timestamp with time zone,
  
  -- Notes and metadata
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT flight_partner_payouts_pkey PRIMARY KEY (id),
  CONSTRAINT flight_partner_payouts_partner_id_fkey FOREIGN KEY (partner_id) 
    REFERENCES public.flight_partners(id) ON DELETE CASCADE
);

-- Indexes for flight_partner_payouts
CREATE INDEX IF NOT EXISTS idx_flight_partner_payouts_partner_id ON public.flight_partner_payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_flight_partner_payouts_status ON public.flight_partner_payouts(status);
CREATE INDEX IF NOT EXISTS idx_flight_partner_payouts_period ON public.flight_partner_payouts(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_flight_partner_payouts_paid_at ON public.flight_partner_payouts(paid_at);

-- =====================================================
-- TRIGGERS
-- Automatically update updated_at timestamps
-- =====================================================

-- Function to update updated_at timestamp (reuse existing)
-- CREATE OR REPLACE FUNCTION update_updated_at_column() exists from hotel partner migration

-- Triggers for each table
CREATE TRIGGER update_flight_partner_users_updated_at 
  BEFORE UPDATE ON public.flight_partner_users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flight_partner_analytics_updated_at 
  BEFORE UPDATE ON public.flight_partner_analytics 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flight_partner_payouts_updated_at 
  BEFORE UPDATE ON public.flight_partner_payouts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- Flight partners can only access their own data
-- =====================================================

-- Enable RLS on all flight partner tables
ALTER TABLE public.flight_partner_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_partner_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_partner_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_partner_payouts ENABLE ROW LEVEL SECURITY;

-- Flight partner users can view their own record
CREATE POLICY flight_partner_users_select_own ON public.flight_partner_users
  FOR SELECT
  USING (id = auth.uid()::uuid OR partner_id IN (
    SELECT partner_id FROM public.flight_partner_users WHERE id = auth.uid()::uuid
  ));

-- Flight partner users can update their own record
CREATE POLICY flight_partner_users_update_own ON public.flight_partner_users
  FOR UPDATE
  USING (id = auth.uid()::uuid)
  WITH CHECK (id = auth.uid()::uuid);

-- Flight partner permissions can be viewed by users in the same partner organization
CREATE POLICY flight_partner_permissions_select ON public.flight_partner_permissions
  FOR SELECT
  USING (user_id IN (
    SELECT id FROM public.flight_partner_users 
    WHERE partner_id = (
      SELECT partner_id FROM public.flight_partner_users WHERE id = auth.uid()::uuid
    )
  ));

-- Flight partner analytics can be viewed by partner organization members
CREATE POLICY flight_partner_analytics_select ON public.flight_partner_analytics
  FOR SELECT
  USING (partner_id IN (
    SELECT partner_id FROM public.flight_partner_users WHERE id = auth.uid()::uuid
  ));

-- Flight partner payouts can be viewed by partner organization members
CREATE POLICY flight_partner_payouts_select ON public.flight_partner_payouts
  FOR SELECT
  USING (partner_id IN (
    SELECT partner_id FROM public.flight_partner_users WHERE id = auth.uid()::uuid
  ));

-- =====================================================
-- DEFAULT PERMISSIONS
-- Set up default permission templates for flight partners
-- =====================================================

-- Create a function to assign default permissions to new flight partner users
CREATE OR REPLACE FUNCTION assign_default_flight_partner_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Admin role gets all permissions
  IF NEW.role = 'admin' THEN
    INSERT INTO public.flight_partner_permissions (user_id, permission, resource_type)
    VALUES 
      (NEW.id, 'flights:read', 'flight'),
      (NEW.id, 'flights:write', 'flight'),
      (NEW.id, 'routes:read', 'route'),
      (NEW.id, 'routes:write', 'route'),
      (NEW.id, 'pricing:read', 'pricing'),
      (NEW.id, 'pricing:write', 'pricing'),
      (NEW.id, 'bookings:read', 'booking'),
      (NEW.id, 'bookings:write', 'booking'),
      (NEW.id, 'analytics:read', 'analytics'),
      (NEW.id, 'settings:read', 'settings'),
      (NEW.id, 'settings:write', 'settings');
  
  -- Manager role gets read/write for operations
  ELSIF NEW.role = 'manager' THEN
    INSERT INTO public.flight_partner_permissions (user_id, permission, resource_type)
    VALUES 
      (NEW.id, 'flights:read', 'flight'),
      (NEW.id, 'routes:read', 'route'),
      (NEW.id, 'routes:write', 'route'),
      (NEW.id, 'pricing:read', 'pricing'),
      (NEW.id, 'pricing:write', 'pricing'),
      (NEW.id, 'bookings:read', 'booking'),
      (NEW.id, 'bookings:write', 'booking'),
      (NEW.id, 'analytics:read', 'analytics');
  
  -- Staff role gets read-only access
  ELSIF NEW.role = 'staff' THEN
    INSERT INTO public.flight_partner_permissions (user_id, permission, resource_type)
    VALUES 
      (NEW.id, 'flights:read', 'flight'),
      (NEW.id, 'routes:read', 'route'),
      (NEW.id, 'pricing:read', 'pricing'),
      (NEW.id, 'bookings:read', 'booking'),
      (NEW.id, 'bookings:write', 'booking');
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to assign default permissions when user is created
CREATE TRIGGER assign_default_flight_permissions_on_insert
  AFTER INSERT ON public.flight_partner_users
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_flight_partner_permissions();

-- =====================================================
-- HELPER FUNCTIONS
-- Utility functions for flight partner operations
-- =====================================================

-- Function to get flight partner's flight IDs
CREATE OR REPLACE FUNCTION get_flight_partner_flight_ids(p_partner_id uuid)
RETURNS TABLE(flight_id uuid) AS $$
BEGIN
  RETURN QUERY
  SELECT f.id as flight_id
  FROM public.flights f
  WHERE f.airline_id = p_partner_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate daily analytics for a flight partner
CREATE OR REPLACE FUNCTION calculate_flight_partner_daily_analytics(
  p_partner_id uuid,
  p_date date
)
RETURNS void AS $$
DECLARE
  v_flight_id uuid;
BEGIN
  -- Loop through each flight for this partner
  FOR v_flight_id IN 
    SELECT flight_id FROM get_flight_partner_flight_ids(p_partner_id)
  LOOP
    -- Insert or update analytics for this flight and date
    INSERT INTO public.flight_partner_analytics (
      partner_id,
      flight_id,
      date,
      total_bookings,
      confirmed_bookings,
      cancelled_bookings,
      pending_bookings,
      gross_revenue_cents,
      net_revenue_cents,
      commission_cents,
      refund_cents
    )
    SELECT
      p_partner_id,
      v_flight_id,
      p_date,
      COUNT(*) as total_bookings,
      COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_bookings,
      COALESCE(SUM(total_price), 0) as gross_revenue_cents,
      COALESCE(SUM(total_price - COALESCE(commission_amount, 0)), 0) as net_revenue_cents,
      COALESCE(SUM(commission_amount), 0) as commission_cents,
      COALESCE(SUM(CASE WHEN status = 'cancelled' THEN total_price ELSE 0 END), 0) as refund_cents
    FROM public.flight_bookings
    WHERE flight_id = v_flight_id
      AND DATE(created_at) = p_date
    ON CONFLICT (partner_id, flight_id, date) 
    DO UPDATE SET
      total_bookings = EXCLUDED.total_bookings,
      confirmed_bookings = EXCLUDED.confirmed_bookings,
      cancelled_bookings = EXCLUDED.cancelled_bookings,
      pending_bookings = EXCLUDED.pending_bookings,
      gross_revenue_cents = EXCLUDED.gross_revenue_cents,
      net_revenue_cents = EXCLUDED.net_revenue_cents,
      commission_cents = EXCLUDED.commission_cents,
      refund_cents = EXCLUDED.refund_cents,
      calculated_at = now();
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- Add helpful comments to tables and columns
-- =====================================================

COMMENT ON TABLE public.flight_partner_users IS 'Flight partner portal user accounts with role-based access';
COMMENT ON TABLE public.flight_partner_permissions IS 'Granular permissions for flight partner users';
COMMENT ON TABLE public.flight_partner_analytics IS 'Daily analytics aggregated for flight partner performance tracking';
COMMENT ON TABLE public.flight_partner_payouts IS 'Monthly payout records for flight partner revenue settlement';

COMMENT ON COLUMN public.flight_partner_analytics.load_factor IS 'Percentage of seats filled (seats_booked / total_seats * 100)';
COMMENT ON COLUMN public.flight_partner_analytics.avg_lead_time_days IS 'Average days between booking creation and departure';
COMMENT ON COLUMN public.flight_partner_payouts.gross_amount_cents IS 'Total booking revenue before commissions';
COMMENT ON COLUMN public.flight_partner_payouts.net_amount_cents IS 'Amount after TripC commission deduction';
COMMENT ON COLUMN public.flight_partner_payouts.payout_amount_cents IS 'Final amount paid to partner after all adjustments';
