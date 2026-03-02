-- ============================================================================
-- PARTNER ENTITIES SCHEMA - CORRECTED v2
-- Uses actual existing table structures from the database
-- Run in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. Add owner_user_id to hotels (currently missing)
--    Real hotels table uses: id, slug, name, description, address(jsonb),
--    star_rating, images, amenities, policies, contact(jsonb), metadata
-- ============================================================================
ALTER TABLE public.hotels
  ADD COLUMN IF NOT EXISTS owner_user_id text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS average_rating numeric DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS room_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS property_type text DEFAULT 'Hotel',
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS business_registration_number text,
  ADD COLUMN IF NOT EXISTS tax_id text,
  ADD COLUMN IF NOT EXISTS certificate_urls text[];

CREATE INDEX IF NOT EXISTS idx_hotels_owner_user_id ON public.hotels(owner_user_id);

-- ============================================================================
-- 2. Add owner_user_id to transport_providers (currently has owner_id text)
--    Real transport_providers: id, name, logo_url, rating, created_at,
--    owner_id text, contact_email, contact_phone, address, website, description
-- ============================================================================
-- owner_id already exists in transport_providers - will use it as owner_user_id
-- Add alias column for consistency
ALTER TABLE public.transport_providers
  ADD COLUMN IF NOT EXISTS operator_type text DEFAULT 'bus',
  ADD COLUMN IF NOT EXISTS fleet_size integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vehicle_types text[],
  ADD COLUMN IF NOT EXISTS service_regions text[],
  ADD COLUMN IF NOT EXISTS headquarters_city text,
  ADD COLUMN IF NOT EXISTS business_registration_number text,
  ADD COLUMN IF NOT EXISTS tax_id text,
  ADD COLUMN IF NOT EXISTS operating_license text,
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_transport_providers_owner_id ON public.transport_providers(owner_id);

-- ============================================================================
-- 3. Add owner_user_id to flight_partners (currently: id, airline_code, name,
--    logo_url, website_url, commission_rate, is_active, api_config, status)
-- ============================================================================
ALTER TABLE public.flight_partners
  ADD COLUMN IF NOT EXISTS owner_user_id text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS headquarters_city text,
  ADD COLUMN IF NOT EXISTS headquarters_country text DEFAULT 'VN',
  ADD COLUMN IF NOT EXISTS hub_airports text[],
  ADD COLUMN IF NOT EXISTS fleet_size integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS air_operator_certificate text,
  ADD COLUMN IF NOT EXISTS business_registration_number text,
  ADD COLUMN IF NOT EXISTS tax_id text,
  ADD COLUMN IF NOT EXISTS display_name text;

CREATE INDEX IF NOT EXISTS idx_flight_partners_owner_user_id ON public.flight_partners(owner_user_id);

-- ============================================================================
-- 4. Create activity_operators table (no existing table for this)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.activity_operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id TEXT NOT NULL,

    company_name TEXT NOT NULL,
    display_name TEXT,
    description TEXT,
    activity_types TEXT[] DEFAULT '{}',

    base_city TEXT,
    service_areas TEXT[] DEFAULT '{}',

    email TEXT,
    phone TEXT,
    website TEXT,

    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,

    average_rating NUMERIC DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,

    logo_url TEXT,

    business_registration_number TEXT,
    tax_id TEXT,
    tourism_license TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_operators_owner ON public.activity_operators(owner_user_id);

-- ============================================================================
-- 5. Create partner_profiles table (unified tracking across all portal types)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.partner_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id TEXT NOT NULL,
    partner_type TEXT NOT NULL CHECK (partner_type IN (
        'restaurant', 'hotel', 'transport', 'flight', 'activity'
    )),
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN (
        'pending', 'approved', 'suspended', 'rejected'
    )),
    entity_id UUID,
    business_name TEXT NOT NULL,
    business_email TEXT,
    business_phone TEXT,
    tax_id TEXT,
    business_registration_number TEXT,
    rejection_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(owner_user_id, partner_type)
);

CREATE INDEX IF NOT EXISTS idx_partner_profiles_user ON public.partner_profiles(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_type ON public.partner_profiles(partner_type);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_entity ON public.partner_profiles(entity_id);

-- ============================================================================
-- 6. updated_at trigger function (safe to re-run)
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_partner_profiles_updated_at ON public.partner_profiles;
CREATE TRIGGER update_partner_profiles_updated_at
    BEFORE UPDATE ON public.partner_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_activity_operators_updated_at ON public.activity_operators;
CREATE TRIGGER update_activity_operators_updated_at
    BEFORE UPDATE ON public.activity_operators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. Enable RLS
-- ============================================================================
ALTER TABLE public.partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_operators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view partner_profiles" ON public.partner_profiles;
CREATE POLICY "Public can view partner_profiles"
    ON public.partner_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view active activity operators" ON public.activity_operators;
CREATE POLICY "Public can view active activity operators"
    ON public.activity_operators FOR SELECT USING (is_active = true);
