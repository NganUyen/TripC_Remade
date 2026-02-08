-- =============================================================================
-- MIGRATION: 20260208_shop_partners.sql
-- Shop Partner/Vendor System
-- All changes are additive and non-breaking.
-- =============================================================================

-- =============================================================================
-- 1. NEW TABLES
-- =============================================================================

-- 1.1 shop_partners - Partner Business Profiles
CREATE TABLE public.shop_partners (
  id uuid NOT NULL DEFAULT gen_random_uuid(),

  -- Basic Info
  slug character varying NOT NULL UNIQUE,
  business_name character varying NOT NULL,
  display_name character varying,
  description text,
  logo_url character varying,
  cover_url character varying,

  -- Contact
  email character varying NOT NULL,
  phone character varying,
  website character varying,

  -- Business Details
  business_type character varying DEFAULT 'individual'::character varying
    CHECK (business_type::text = ANY (ARRAY['individual'::character varying, 'business'::character varying, 'enterprise'::character varying]::text[])),
  business_registration_number character varying,
  tax_id character varying,

  -- Address
  address_line1 character varying,
  address_line2 character varying,
  city character varying,
  state_province character varying,
  postal_code character varying,
  country_code character varying DEFAULT 'VN'::character varying,

  -- Status & Verification
  status character varying NOT NULL DEFAULT 'pending'::character varying
    CHECK (status::text = ANY (ARRAY['pending'::character varying, 'approved'::character varying, 'suspended'::character varying, 'banned'::character varying]::text[])),
  verified_at timestamp with time zone,
  verified_by uuid,
  rejection_reason text,

  -- Link to brands table for public storefront
  brand_id uuid UNIQUE,

  -- Metrics (denormalized for performance)
  product_count integer DEFAULT 0 CHECK (product_count >= 0),
  order_count integer DEFAULT 0 CHECK (order_count >= 0),
  total_sales_cents bigint DEFAULT 0 CHECK (total_sales_cents >= 0),
  rating_avg numeric DEFAULT 0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
  rating_count integer DEFAULT 0 CHECK (rating_count >= 0),
  follower_count integer DEFAULT 0 CHECK (follower_count >= 0),

  -- Payout Settings (placeholder for future)
  payout_method character varying,
  payout_details jsonb DEFAULT '{}'::jsonb,
  commission_rate numeric DEFAULT 0.15 CHECK (commission_rate >= 0 AND commission_rate <= 1),

  -- Metadata
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,

  CONSTRAINT shop_partners_pkey PRIMARY KEY (id),
  CONSTRAINT shop_partners_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id),
  CONSTRAINT shop_partners_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id)
);

CREATE INDEX idx_shop_partners_slug ON public.shop_partners(slug);
CREATE INDEX idx_shop_partners_status ON public.shop_partners(status);
CREATE INDEX idx_shop_partners_brand_id ON public.shop_partners(brand_id);
CREATE INDEX idx_shop_partners_created_at ON public.shop_partners(created_at DESC);

COMMENT ON TABLE public.shop_partners IS 'Vendor/seller business profiles for the marketplace';
COMMENT ON COLUMN public.shop_partners.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN public.shop_partners.commission_rate IS 'Platform commission rate (0.15 = 15%)';
COMMENT ON COLUMN public.shop_partners.brand_id IS 'Link to brands table for public storefront page';

-- 1.2 shop_partner_members - Partner Team Members
CREATE TABLE public.shop_partner_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL,
  user_id uuid NOT NULL,

  role character varying NOT NULL DEFAULT 'staff'::character varying
    CHECK (role::text = ANY (ARRAY['owner'::character varying, 'staff'::character varying]::text[])),

  permissions jsonb DEFAULT '{"products": true, "orders": true, "analytics": false}'::jsonb,

  invited_by uuid,
  invited_at timestamp with time zone,
  accepted_at timestamp with time zone,

  status character varying NOT NULL DEFAULT 'active'::character varying
    CHECK (status::text = ANY (ARRAY['pending'::character varying, 'active'::character varying, 'removed'::character varying]::text[])),

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  CONSTRAINT shop_partner_members_pkey PRIMARY KEY (id),
  CONSTRAINT shop_partner_members_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.shop_partners(id) ON DELETE CASCADE,
  CONSTRAINT shop_partner_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT shop_partner_members_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.users(id),
  CONSTRAINT shop_partner_members_unique_partner_user UNIQUE (partner_id, user_id)
);

CREATE INDEX idx_shop_partner_members_partner_id ON public.shop_partner_members(partner_id);
CREATE INDEX idx_shop_partner_members_user_id ON public.shop_partner_members(user_id);

COMMENT ON TABLE public.shop_partner_members IS 'Partner team members with role-based access';
COMMENT ON COLUMN public.shop_partner_members.role IS 'owner = full access, staff = limited access';

-- 1.3 shop_partner_audit_logs - Activity Tracking
CREATE TABLE public.shop_partner_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL,
  actor_id uuid,

  action character varying NOT NULL,
  entity_type character varying NOT NULL,
  entity_id uuid,

  old_values jsonb,
  new_values jsonb,

  ip_address inet,
  user_agent text,

  created_at timestamp with time zone DEFAULT now(),

  CONSTRAINT shop_partner_audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT shop_partner_audit_logs_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.shop_partners(id) ON DELETE CASCADE,
  CONSTRAINT shop_partner_audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id)
);

CREATE INDEX idx_shop_partner_audit_logs_partner_id ON public.shop_partner_audit_logs(partner_id);
CREATE INDEX idx_shop_partner_audit_logs_created_at ON public.shop_partner_audit_logs(created_at DESC);
CREATE INDEX idx_shop_partner_audit_logs_entity ON public.shop_partner_audit_logs(entity_type, entity_id);

COMMENT ON TABLE public.shop_partner_audit_logs IS 'Audit trail for partner actions';

-- =============================================================================
-- 2. TABLE MODIFICATIONS
-- =============================================================================

-- 2.1 Add partner_id and moderation columns to shop_products
ALTER TABLE public.shop_products
  ADD COLUMN IF NOT EXISTS partner_id uuid;

ALTER TABLE public.shop_products
  ADD CONSTRAINT shop_products_partner_id_fkey
    FOREIGN KEY (partner_id) REFERENCES public.shop_partners(id);

CREATE INDEX IF NOT EXISTS idx_shop_products_partner_id ON public.shop_products(partner_id);

ALTER TABLE public.shop_products
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS review_notes text;

ALTER TABLE public.shop_products
  ADD CONSTRAINT shop_products_reviewed_by_fkey
    FOREIGN KEY (reviewed_by) REFERENCES public.users(id);

-- Update status check to include 'flagged'
ALTER TABLE public.shop_products
  DROP CONSTRAINT IF EXISTS shop_products_status_check;

ALTER TABLE public.shop_products
  ADD CONSTRAINT shop_products_status_check
    CHECK (status::text = ANY (ARRAY['draft'::character varying, 'active'::character varying, 'archived'::character varying, 'flagged'::character varying]::text[]));

COMMENT ON COLUMN public.shop_products.partner_id IS 'Owner partner for marketplace products (NULL = platform-owned)';
COMMENT ON COLUMN public.shop_products.reviewed_by IS 'Admin who reviewed/approved/flagged the product';

-- 2.2 Add partner_id to order_items
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS partner_id uuid;

ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_partner_id_fkey
    FOREIGN KEY (partner_id) REFERENCES public.shop_partners(id);

CREATE INDEX IF NOT EXISTS idx_order_items_partner_id ON public.order_items(partner_id);

COMMENT ON COLUMN public.order_items.partner_id IS 'Partner who owns the product (denormalized from shop_products)';

-- =============================================================================
-- 3. ROW LEVEL SECURITY
-- =============================================================================

-- 3.1 shop_partners RLS
ALTER TABLE public.shop_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_partners_public_read" ON public.shop_partners
  FOR SELECT
  USING (status = 'approved' AND deleted_at IS NULL);

CREATE POLICY "shop_partners_auth_insert" ON public.shop_partners
  FOR INSERT
  WITH CHECK (true);

-- 3.2 shop_partner_members RLS
ALTER TABLE public.shop_partner_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_partner_members_self_read" ON public.shop_partner_members
  FOR SELECT
  USING (true);

-- 3.3 shop_partner_audit_logs RLS
ALTER TABLE public.shop_partner_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_partner_audit_logs_read" ON public.shop_partner_audit_logs
  FOR SELECT
  USING (true);

-- Note: Service role client (used in queries.ts) bypasses RLS entirely.
-- These policies are baseline for direct Supabase client access.

-- =============================================================================
-- 4. TRIGGERS & FUNCTIONS
-- =============================================================================

-- 4.1 Update partner product_count on product changes
CREATE OR REPLACE FUNCTION public.fn_update_partner_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status = 'active' AND OLD.status != 'active') THEN
    IF NEW.partner_id IS NOT NULL THEN
      UPDATE public.shop_partners
      SET product_count = product_count + 1, updated_at = now()
      WHERE id = NEW.partner_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status != 'active') THEN
    IF COALESCE(OLD.partner_id, NEW.partner_id) IS NOT NULL THEN
      UPDATE public.shop_partners
      SET product_count = GREATEST(0, product_count - 1), updated_at = now()
      WHERE id = COALESCE(OLD.partner_id, NEW.partner_id);
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_partner_product_count
  AFTER INSERT OR UPDATE OR DELETE ON public.shop_products
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_partner_product_count();

-- 4.2 Auto-populate partner_id on order_items from product
CREATE OR REPLACE FUNCTION public.fn_order_items_set_partner()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    SELECT partner_id INTO NEW.partner_id
    FROM public.shop_products
    WHERE id = NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_items_set_partner
  BEFORE INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_order_items_set_partner();

-- 4.3 Updated_at trigger for shop_partners
CREATE OR REPLACE FUNCTION public.fn_shop_partners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_shop_partners_updated_at
  BEFORE UPDATE ON public.shop_partners
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_shop_partners_updated_at();
