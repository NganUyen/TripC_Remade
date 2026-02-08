-- Hotel Partner System Migration
-- Creates partner-specific tables for hotel partner portal
-- Date: 2026-02-08

-- =====================================================
-- PARTNER USERS TABLE
-- Stores partner portal user accounts
-- =====================================================
CREATE TABLE IF NOT EXISTS public.partner_users (
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
  CONSTRAINT partner_users_pkey PRIMARY KEY (id),
  CONSTRAINT partner_users_partner_id_fkey FOREIGN KEY (partner_id) 
    REFERENCES public.hotel_partners(id) ON DELETE CASCADE
);

-- Indexes for partner_users
CREATE INDEX IF NOT EXISTS idx_partner_users_partner_id ON public.partner_users(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_users_email ON public.partner_users(email);
CREATE INDEX IF NOT EXISTS idx_partner_users_is_active ON public.partner_users(is_active);

-- =====================================================
-- PARTNER PERMISSIONS TABLE
-- Stores granular permissions for partner users
-- =====================================================
CREATE TABLE IF NOT EXISTS public.partner_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  permission varchar(100) NOT NULL,
  resource_type varchar(50) CHECK (resource_type IN ('hotel', 'room', 'rate', 'booking', 'analytics', 'settings')),
  resource_id uuid,
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  granted_by uuid,
  CONSTRAINT partner_permissions_pkey PRIMARY KEY (id),
  CONSTRAINT partner_permissions_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES public.partner_users(id) ON DELETE CASCADE,
  CONSTRAINT partner_permissions_granted_by_fkey FOREIGN KEY (granted_by) 
    REFERENCES public.partner_users(id) ON DELETE SET NULL,
  CONSTRAINT unique_user_permission UNIQUE (user_id, permission, resource_type, resource_id)
);

-- Indexes for partner_permissions
CREATE INDEX IF NOT EXISTS idx_partner_permissions_user_id ON public.partner_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_permissions_resource ON public.partner_permissions(resource_type, resource_id);

-- =====================================================
-- PARTNER ANALYTICS TABLE
-- Stores daily analytics for partner performance
-- =====================================================
CREATE TABLE IF NOT EXISTS public.partner_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL,
  hotel_id uuid,
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
  
  -- Occupancy metrics
  total_rooms integer NOT NULL DEFAULT 0,
  rooms_booked integer NOT NULL DEFAULT 0,
  occupancy_rate numeric(5,2) DEFAULT 0.00,
  
  -- Performance metrics
  avg_booking_value_cents integer DEFAULT 0,
  avg_nights numeric(4,2) DEFAULT 0.00,
  avg_lead_time_days integer DEFAULT 0,
  
  -- Review metrics
  new_reviews integer NOT NULL DEFAULT 0,
  avg_rating numeric(3,2),
  
  -- Calculated fields
  calculated_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT partner_analytics_pkey PRIMARY KEY (id),
  CONSTRAINT partner_analytics_partner_id_fkey FOREIGN KEY (partner_id) 
    REFERENCES public.hotel_partners(id) ON DELETE CASCADE,
  CONSTRAINT partner_analytics_hotel_id_fkey FOREIGN KEY (hotel_id) 
    REFERENCES public.hotels(id) ON DELETE CASCADE,
  CONSTRAINT unique_partner_hotel_date UNIQUE (partner_id, hotel_id, date)
);

-- Indexes for partner_analytics
CREATE INDEX IF NOT EXISTS idx_partner_analytics_partner_id ON public.partner_analytics(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_analytics_hotel_id ON public.partner_analytics(hotel_id);
CREATE INDEX IF NOT EXISTS idx_partner_analytics_date ON public.partner_analytics(date);
CREATE INDEX IF NOT EXISTS idx_partner_analytics_partner_date ON public.partner_analytics(partner_id, date);

-- =====================================================
-- PARTNER PAYOUTS TABLE
-- Stores monthly payout records for partners
-- =====================================================
CREATE TABLE IF NOT EXISTS public.partner_payouts (
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
  
  CONSTRAINT partner_payouts_pkey PRIMARY KEY (id),
  CONSTRAINT partner_payouts_partner_id_fkey FOREIGN KEY (partner_id) 
    REFERENCES public.hotel_partners(id) ON DELETE CASCADE
);

-- Indexes for partner_payouts
CREATE INDEX IF NOT EXISTS idx_partner_payouts_partner_id ON public.partner_payouts(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_payouts_status ON public.partner_payouts(status);
CREATE INDEX IF NOT EXISTS idx_partner_payouts_period ON public.partner_payouts(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_partner_payouts_paid_at ON public.partner_payouts(paid_at);

-- =====================================================
-- TRIGGERS
-- Automatically update updated_at timestamps
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for each table
CREATE TRIGGER update_partner_users_updated_at 
  BEFORE UPDATE ON public.partner_users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_analytics_updated_at 
  BEFORE UPDATE ON public.partner_analytics 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_payouts_updated_at 
  BEFORE UPDATE ON public.partner_payouts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- Partners can only access their own data
-- =====================================================

-- Enable RLS on all partner tables
ALTER TABLE public.partner_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_payouts ENABLE ROW LEVEL SECURITY;

-- Partner users can view their own record
CREATE POLICY partner_users_select_own ON public.partner_users
  FOR SELECT
  USING (id = auth.uid()::uuid OR partner_id IN (
    SELECT partner_id FROM public.partner_users WHERE id = auth.uid()::uuid
  ));

-- Partner users can update their own record
CREATE POLICY partner_users_update_own ON public.partner_users
  FOR UPDATE
  USING (id = auth.uid()::uuid)
  WITH CHECK (id = auth.uid()::uuid);

-- Partner permissions can be viewed by users in the same partner organization
CREATE POLICY partner_permissions_select ON public.partner_permissions
  FOR SELECT
  USING (user_id IN (
    SELECT id FROM public.partner_users 
    WHERE partner_id = (
      SELECT partner_id FROM public.partner_users WHERE id = auth.uid()::uuid
    )
  ));

-- Partner analytics can be viewed by partner organization members
CREATE POLICY partner_analytics_select ON public.partner_analytics
  FOR SELECT
  USING (partner_id IN (
    SELECT partner_id FROM public.partner_users WHERE id = auth.uid()::uuid
  ));

-- Partner payouts can be viewed by partner organization members
CREATE POLICY partner_payouts_select ON public.partner_payouts
  FOR SELECT
  USING (partner_id IN (
    SELECT partner_id FROM public.partner_users WHERE id = auth.uid()::uuid
  ));

-- =====================================================
-- DEFAULT PERMISSIONS
-- Set up default permission templates
-- =====================================================

-- Create a function to assign default permissions to new partner users
CREATE OR REPLACE FUNCTION assign_default_partner_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Admin role gets all permissions
  IF NEW.role = 'admin' THEN
    INSERT INTO public.partner_permissions (user_id, permission, resource_type)
    VALUES 
      (NEW.id, 'hotels:read', 'hotel'),
      (NEW.id, 'hotels:write', 'hotel'),
      (NEW.id, 'rooms:read', 'room'),
      (NEW.id, 'rooms:write', 'room'),
      (NEW.id, 'rates:read', 'rate'),
      (NEW.id, 'rates:write', 'rate'),
      (NEW.id, 'bookings:read', 'booking'),
      (NEW.id, 'bookings:write', 'booking'),
      (NEW.id, 'analytics:read', 'analytics'),
      (NEW.id, 'settings:read', 'settings'),
      (NEW.id, 'settings:write', 'settings');
  
  -- Manager role gets read/write for operations
  ELSIF NEW.role = 'manager' THEN
    INSERT INTO public.partner_permissions (user_id, permission, resource_type)
    VALUES 
      (NEW.id, 'hotels:read', 'hotel'),
      (NEW.id, 'rooms:read', 'room'),
      (NEW.id, 'rooms:write', 'room'),
      (NEW.id, 'rates:read', 'rate'),
      (NEW.id, 'rates:write', 'rate'),
      (NEW.id, 'bookings:read', 'booking'),
      (NEW.id, 'bookings:write', 'booking'),
      (NEW.id, 'analytics:read', 'analytics');
  
  -- Staff role gets read-only access
  ELSIF NEW.role = 'staff' THEN
    INSERT INTO public.partner_permissions (user_id, permission, resource_type)
    VALUES 
      (NEW.id, 'hotels:read', 'hotel'),
      (NEW.id, 'rooms:read', 'room'),
      (NEW.id, 'rates:read', 'rate'),
      (NEW.id, 'bookings:read', 'booking'),
      (NEW.id, 'bookings:write', 'booking');
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to assign default permissions when user is created
CREATE TRIGGER assign_default_permissions_on_insert
  AFTER INSERT ON public.partner_users
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_partner_permissions();

-- =====================================================
-- HELPER FUNCTIONS
-- Utility functions for partner operations
-- =====================================================

-- Function to get partner's hotel IDs
CREATE OR REPLACE FUNCTION get_partner_hotel_ids(p_partner_id uuid)
RETURNS TABLE(hotel_id uuid) AS $$
BEGIN
  RETURN QUERY
  SELECT hpl.hotel_id
  FROM public.hotel_partner_listings hpl
  WHERE hpl.partner_id = p_partner_id
    AND hpl.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate daily analytics for a partner
CREATE OR REPLACE FUNCTION calculate_partner_daily_analytics(
  p_partner_id uuid,
  p_date date
)
RETURNS void AS $$
DECLARE
  v_hotel_id uuid;
BEGIN
  -- Loop through each hotel for this partner
  FOR v_hotel_id IN 
    SELECT hotel_id FROM get_partner_hotel_ids(p_partner_id)
  LOOP
    -- Insert or update analytics for this hotel and date
    INSERT INTO public.partner_analytics (
      partner_id,
      hotel_id,
      date,
      total_bookings,
      confirmed_bookings,
      cancelled_bookings,
      pending_bookings,
      gross_revenue_cents,
      net_revenue_cents,
      commission_cents,
      refund_cents,
      new_reviews,
      avg_rating
    )
    SELECT
      p_partner_id,
      v_hotel_id,
      p_date,
      COUNT(*) as total_bookings,
      COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_bookings,
      COALESCE(SUM(total_cents), 0) as gross_revenue_cents,
      COALESCE(SUM(total_cents - COALESCE(commission_cents, 0)), 0) as net_revenue_cents,
      COALESCE(SUM(commission_cents), 0) as commission_cents,
      COALESCE(SUM(CASE WHEN status = 'cancelled' THEN total_cents ELSE 0 END), 0) as refund_cents,
      0 as new_reviews, -- Will be updated by separate review trigger
      0.00 as avg_rating
    FROM public.hotel_bookings
    WHERE hotel_id = v_hotel_id
      AND DATE(created_at) = p_date
    ON CONFLICT (partner_id, hotel_id, date) 
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

COMMENT ON TABLE public.partner_users IS 'Partner portal user accounts with role-based access';
COMMENT ON TABLE public.partner_permissions IS 'Granular permissions for partner users';
COMMENT ON TABLE public.partner_analytics IS 'Daily analytics aggregated for partner performance tracking';
COMMENT ON TABLE public.partner_payouts IS 'Monthly payout records for partner revenue settlement';

COMMENT ON COLUMN public.partner_analytics.occupancy_rate IS 'Percentage of rooms booked (rooms_booked / total_rooms * 100)';
COMMENT ON COLUMN public.partner_analytics.avg_lead_time_days IS 'Average days between booking creation and check-in';
COMMENT ON COLUMN public.partner_payouts.gross_amount_cents IS 'Total booking revenue before commissions';
COMMENT ON COLUMN public.partner_payouts.net_amount_cents IS 'Amount after TripC commission deduction';
COMMENT ON COLUMN public.partner_payouts.payout_amount_cents IS 'Final amount paid to partner after all adjustments';
