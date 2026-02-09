# Shop Partner System - Database Schema

> **Apply To**: `docs/PROJECT_SCHEMA.sql`  
> **Migration File**: Create in `supabase/migrations/YYYYMMDDHHMMSS_shop_partners.sql`

## 📋 Overview

This document contains SQL snippets to add the Partner/Vendor system to the Shop module. All changes are additive and non-breaking.

---

## 1. New Tables

### 1.1 `shop_partners` - Partner Business Profiles

```sql
-- =============================================================================
-- SHOP PARTNERS TABLE
-- Represents vendor/seller businesses
-- =============================================================================
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
  verified_by uuid, -- FK to users.id (admin)
  rejection_reason text,
  
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
  deleted_at timestamp with time zone, -- Soft delete
  
  CONSTRAINT shop_partners_pkey PRIMARY KEY (id)
);

-- Indexes
CREATE INDEX idx_shop_partners_slug ON public.shop_partners(slug);
CREATE INDEX idx_shop_partners_status ON public.shop_partners(status);
CREATE INDEX idx_shop_partners_created_at ON public.shop_partners(created_at DESC);

-- Comments
COMMENT ON TABLE public.shop_partners IS 'Vendor/seller business profiles for the marketplace';
COMMENT ON COLUMN public.shop_partners.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN public.shop_partners.commission_rate IS 'Platform commission rate (0.15 = 15%)';
```

---

### 1.2 `shop_partner_members` - Partner Team Members

```sql
-- =============================================================================
-- SHOP PARTNER MEMBERS TABLE
-- Links users to partner accounts with roles
-- =============================================================================
CREATE TABLE public.shop_partner_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL,
  user_id uuid NOT NULL,
  
  -- Role
  role character varying NOT NULL DEFAULT 'staff'::character varying 
    CHECK (role::text = ANY (ARRAY['owner'::character varying, 'staff'::character varying]::text[])),
  
  -- Permissions (JSON for flexibility)
  permissions jsonb DEFAULT '{"products": true, "orders": true, "analytics": false}'::jsonb,
  
  -- Invitation
  invited_by uuid,
  invited_at timestamp with time zone,
  accepted_at timestamp with time zone,
  
  -- Status
  status character varying NOT NULL DEFAULT 'active'::character varying 
    CHECK (status::text = ANY (ARRAY['pending'::character varying, 'active'::character varying, 'removed'::character varying]::text[])),
  
  -- Metadata
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT shop_partner_members_pkey PRIMARY KEY (id),
  CONSTRAINT shop_partner_members_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.shop_partners(id) ON DELETE CASCADE,
  CONSTRAINT shop_partner_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT shop_partner_members_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES public.users(id),
  CONSTRAINT shop_partner_members_unique_partner_user UNIQUE (partner_id, user_id)
);

-- Indexes
CREATE INDEX idx_shop_partner_members_partner_id ON public.shop_partner_members(partner_id);
CREATE INDEX idx_shop_partner_members_user_id ON public.shop_partner_members(user_id);

-- Comments
COMMENT ON TABLE public.shop_partner_members IS 'Partner team members with role-based access';
COMMENT ON COLUMN public.shop_partner_members.role IS 'owner = full access, staff = limited access';
```

---

### 1.3 `shop_partner_audit_logs` - Activity Tracking

```sql
-- =============================================================================
-- SHOP PARTNER AUDIT LOGS TABLE
-- Tracks important actions for compliance and debugging
-- =============================================================================
CREATE TABLE public.shop_partner_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL,
  actor_id uuid, -- User who performed action
  
  -- Action Details
  action character varying NOT NULL,
  entity_type character varying NOT NULL, -- 'product', 'order', 'partner', etc.
  entity_id uuid,
  
  -- Change Data
  old_values jsonb,
  new_values jsonb,
  
  -- Context
  ip_address inet,
  user_agent text,
  
  -- Timestamp
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT shop_partner_audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT shop_partner_audit_logs_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.shop_partners(id) ON DELETE CASCADE,
  CONSTRAINT shop_partner_audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id)
);

-- Indexes
CREATE INDEX idx_shop_partner_audit_logs_partner_id ON public.shop_partner_audit_logs(partner_id);
CREATE INDEX idx_shop_partner_audit_logs_created_at ON public.shop_partner_audit_logs(created_at DESC);
CREATE INDEX idx_shop_partner_audit_logs_entity ON public.shop_partner_audit_logs(entity_type, entity_id);

-- Partitioning suggestion for high-volume production
COMMENT ON TABLE public.shop_partner_audit_logs IS 'Audit trail for partner actions. Consider partitioning by month in production.';
```

---

## 2. Table Modifications

### 2.1 Add `partner_id` to `shop_products`

```sql
-- =============================================================================
-- MODIFY shop_products TO ADD PARTNER OWNERSHIP
-- =============================================================================

-- Add column
ALTER TABLE public.shop_products
  ADD COLUMN partner_id uuid;

-- Add foreign key
ALTER TABLE public.shop_products
  ADD CONSTRAINT shop_products_partner_id_fkey 
    FOREIGN KEY (partner_id) REFERENCES public.shop_partners(id);

-- Add index for partner product lookups
CREATE INDEX idx_shop_products_partner_id ON public.shop_products(partner_id);

-- Add reviewed_by for admin moderation
ALTER TABLE public.shop_products
  ADD COLUMN reviewed_by uuid,
  ADD COLUMN reviewed_at timestamp with time zone,
  ADD COLUMN review_notes text;

ALTER TABLE public.shop_products
  ADD CONSTRAINT shop_products_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) REFERENCES public.users(id);

-- Modify status check to include 'flagged'
ALTER TABLE public.shop_products
  DROP CONSTRAINT IF EXISTS shop_products_status_check;

ALTER TABLE public.shop_products
  ADD CONSTRAINT shop_products_status_check 
    CHECK (status::text = ANY (ARRAY['draft'::character varying, 'active'::character varying, 'archived'::character varying, 'flagged'::character varying]::text[]));

COMMENT ON COLUMN public.shop_products.partner_id IS 'Owner partner for marketplace products (NULL = platform-owned)';
COMMENT ON COLUMN public.shop_products.reviewed_by IS 'Admin who reviewed/approved/flagged the product';
```

---

### 2.2 Add `partner_id` to `order_items`

```sql
-- =============================================================================
-- MODIFY order_items TO TRACK PARTNER FOR EACH LINE ITEM
-- =============================================================================

-- Add column for denormalized partner reference (helps with order splitting)
ALTER TABLE public.order_items
  ADD COLUMN partner_id uuid;

ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_partner_id_fkey 
    FOREIGN KEY (partner_id) REFERENCES public.shop_partners(id);

CREATE INDEX idx_order_items_partner_id ON public.order_items(partner_id);

COMMENT ON COLUMN public.order_items.partner_id IS 'Partner who owns the product (denormalized from shop_products)';
```

---

## 3. Row Level Security (RLS) Policies

### 3.1 `shop_partners` Policies

```sql
-- Enable RLS
ALTER TABLE public.shop_partners ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read approved partners (limited fields handled in API)
CREATE POLICY "shop_partners_public_read" ON public.shop_partners
  FOR SELECT
  USING (status = 'approved' AND deleted_at IS NULL);

-- Policy: Partner members can read their own partner
CREATE POLICY "shop_partners_member_read" ON public.shop_partners
  FOR SELECT
  USING (
    id IN (
      SELECT partner_id FROM public.shop_partner_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Policy: Partner owner can update their own partner
CREATE POLICY "shop_partners_owner_update" ON public.shop_partners
  FOR UPDATE
  USING (
    id IN (
      SELECT partner_id FROM public.shop_partner_members 
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  )
  WITH CHECK (
    id IN (
      SELECT partner_id FROM public.shop_partner_members 
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

-- Policy: Authenticated users can insert (apply as partner)
CREATE POLICY "shop_partners_auth_insert" ON public.shop_partners
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Note: Service role bypasses RLS for admin operations
```

---

### 3.2 `shop_partner_members` Policies

```sql
-- Enable RLS
ALTER TABLE public.shop_partner_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own memberships
CREATE POLICY "shop_partner_members_self_read" ON public.shop_partner_members
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Partner owners can read all members of their partner
CREATE POLICY "shop_partner_members_owner_read" ON public.shop_partner_members
  FOR SELECT
  USING (
    partner_id IN (
      SELECT partner_id FROM public.shop_partner_members 
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

-- Policy: Partner owners can manage members
CREATE POLICY "shop_partner_members_owner_manage" ON public.shop_partner_members
  FOR ALL
  USING (
    partner_id IN (
      SELECT partner_id FROM public.shop_partner_members 
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );
```

---

### 3.3 `shop_products` Updated Policies

```sql
-- Update existing policy to include partner check

-- Policy: Partners can CRUD their own products
CREATE POLICY "shop_products_partner_manage" ON public.shop_products
  FOR ALL
  USING (
    partner_id IN (
      SELECT partner_id FROM public.shop_partner_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
  WITH CHECK (
    partner_id IN (
      SELECT partner_id FROM public.shop_partner_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Policy: Public can read active products
CREATE POLICY "shop_products_public_read" ON public.shop_products
  FOR SELECT
  USING (status = 'active');
```

---

### 3.4 Storage Bucket Policies

```sql
-- =============================================================================
-- SUPABASE STORAGE POLICIES FOR PARTNER PRODUCT IMAGES
-- =============================================================================

-- Create bucket (run via Supabase Dashboard or API)
-- INSERT INTO storage.buckets (id, name, public, avif_autodetection)
-- VALUES ('shop-products', 'shop-products', true, true);

-- Policy: Partners can upload to their folder
CREATE POLICY "shop_products_storage_partner_upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'shop-products' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.shop_partner_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Policy: Partners can update/delete their files
CREATE POLICY "shop_products_storage_partner_manage"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'shop-products' AND
  (storage.foldername(name))[1] IN (
    SELECT partner_id::text FROM public.shop_partner_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "shop_products_storage_partner_delete"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'shop-products' AND
  (storage.foldername(name))[1] IN (
    SELECT partner_id::text FROM public.shop_partner_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Policy: Public can read all files in bucket
CREATE POLICY "shop_products_storage_public_read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'shop-products');
```

---

## 4. Triggers & Functions

### 4.1 Auto-create Owner Membership

```sql
-- =============================================================================
-- TRIGGER: Auto-create owner membership when partner is created
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_shop_partner_create_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- The creating user becomes the owner
  INSERT INTO public.shop_partner_members (
    partner_id,
    user_id,
    role,
    status,
    accepted_at
  ) VALUES (
    NEW.id,
    auth.uid(),
    'owner',
    'active',
    now()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_shop_partner_create_owner
  AFTER INSERT ON public.shop_partners
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_shop_partner_create_owner();
```

---

### 4.2 Update Partner Product Count

```sql
-- =============================================================================
-- TRIGGER: Update partner product_count on product changes
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_update_partner_product_count()
RETURNS TRIGGER AS $$
BEGIN
  -- On INSERT or status change to 'active'
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status = 'active' AND OLD.status != 'active') THEN
    IF NEW.partner_id IS NOT NULL THEN
      UPDATE public.shop_partners 
      SET product_count = product_count + 1, updated_at = now()
      WHERE id = NEW.partner_id;
    END IF;
  END IF;
  
  -- On DELETE or status change from 'active'
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
```

---

### 4.3 Auto-populate Partner ID on Order Items

```sql
-- =============================================================================
-- TRIGGER: Copy partner_id from product to order_items
-- =============================================================================
CREATE OR REPLACE FUNCTION public.fn_order_items_set_partner()
RETURNS TRIGGER AS $$
BEGIN
  SELECT partner_id INTO NEW.partner_id
  FROM public.shop_products
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_items_set_partner
  BEFORE INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_order_items_set_partner();
```

---

## 5. Migration Script Order

```sql
-- =============================================================================
-- MIGRATION: YYYYMMDDHHMMSS_shop_partners.sql
-- Run this as a single migration file
-- =============================================================================

-- 1. Create new tables (order matters for FKs)
-- shop_partners first
-- shop_partner_members second
-- shop_partner_audit_logs third

-- 2. Modify existing tables
-- ALTER shop_products
-- ALTER order_items

-- 3. Enable RLS and create policies
-- shop_partners policies
-- shop_partner_members policies
-- shop_products updated policies

-- 4. Create triggers and functions
-- fn_shop_partner_create_owner
-- fn_update_partner_product_count
-- fn_order_items_set_partner

-- 5. Create storage bucket (via Supabase Dashboard or API)
-- Create 'shop-products' bucket with policies
```

---

## 6. Rollback Script

```sql
-- =============================================================================
-- ROLLBACK: Revert partner changes (TEST ONLY)
-- =============================================================================

-- Drop triggers
DROP TRIGGER IF EXISTS trg_shop_partner_create_owner ON public.shop_partners;
DROP TRIGGER IF EXISTS trg_update_partner_product_count ON public.shop_products;
DROP TRIGGER IF EXISTS trg_order_items_set_partner ON public.order_items;

-- Drop functions
DROP FUNCTION IF EXISTS public.fn_shop_partner_create_owner();
DROP FUNCTION IF EXISTS public.fn_update_partner_product_count();
DROP FUNCTION IF EXISTS public.fn_order_items_set_partner();

-- Drop RLS policies
DROP POLICY IF EXISTS "shop_partners_public_read" ON public.shop_partners;
DROP POLICY IF EXISTS "shop_partners_member_read" ON public.shop_partners;
DROP POLICY IF EXISTS "shop_partners_owner_update" ON public.shop_partners;
DROP POLICY IF EXISTS "shop_partners_auth_insert" ON public.shop_partners;
DROP POLICY IF EXISTS "shop_partner_members_self_read" ON public.shop_partner_members;
DROP POLICY IF EXISTS "shop_partner_members_owner_read" ON public.shop_partner_members;
DROP POLICY IF EXISTS "shop_partner_members_owner_manage" ON public.shop_partner_members;
DROP POLICY IF EXISTS "shop_products_partner_manage" ON public.shop_products;

-- Remove columns from existing tables
ALTER TABLE public.shop_products DROP COLUMN IF EXISTS partner_id;
ALTER TABLE public.shop_products DROP COLUMN IF EXISTS reviewed_by;
ALTER TABLE public.shop_products DROP COLUMN IF EXISTS reviewed_at;
ALTER TABLE public.shop_products DROP COLUMN IF EXISTS review_notes;
ALTER TABLE public.order_items DROP COLUMN IF EXISTS partner_id;

-- Drop new tables (reverse order of creation)
DROP TABLE IF EXISTS public.shop_partner_audit_logs;
DROP TABLE IF EXISTS public.shop_partner_members;
DROP TABLE IF EXISTS public.shop_partners;

-- Storage bucket should be deleted via Supabase Dashboard
```

---

## Summary

| Table | Action | Description |
|-------|--------|-------------|
| `shop_partners` | CREATE | Partner business profiles |
| `shop_partner_members` | CREATE | User-to-partner relationships |
| `shop_partner_audit_logs` | CREATE | Activity tracking |
| `shop_products` | ALTER | Add `partner_id`, `reviewed_by`, `reviewed_at`, `review_notes` |
| `order_items` | ALTER | Add `partner_id` |
| Storage | CREATE | `shop-products` bucket with RLS |
