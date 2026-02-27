-- Partner Clerk Auth Migration
-- 1. Creates flight_partners table (referenced by flight_partner_users FK but never defined)
-- 2. Adds clerk_user_id to portal user tables for Clerk JWT integration
-- Date: 2026-02-27

-- =====================================================
-- FLIGHT PARTNERS TABLE
-- Top-level airline / flight partner record
-- =====================================================
CREATE TABLE IF NOT EXISTS public.flight_partners (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  airline_code text NOT NULL,          -- IATA 2-char or internal code used in flights.airline_code
  name text NOT NULL,
  logo_url text,
  website_url text,
  commission_rate numeric(5,4) NOT NULL DEFAULT 0.08,
  is_active boolean NOT NULL DEFAULT true,
  api_config jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT flight_partners_pkey PRIMARY KEY (id),
  CONSTRAINT flight_partners_airline_code_unique UNIQUE (airline_code)
);

CREATE INDEX IF NOT EXISTS idx_flight_partners_airline_code
  ON public.flight_partners(airline_code);
CREATE INDEX IF NOT EXISTS idx_flight_partners_active
  ON public.flight_partners(is_active);

-- =====================================================
-- FLIGHT PARTNER USERS TABLE
-- Must be created here because flight_partners (its FK target) was
-- missing when 20260208_flight_partner_system.sql ran, causing that
-- migration to fail and leaving this table absent.
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

CREATE INDEX IF NOT EXISTS idx_flight_partner_users_partner_id
  ON public.flight_partner_users(partner_id);
CREATE INDEX IF NOT EXISTS idx_flight_partner_users_email
  ON public.flight_partner_users(email);
CREATE INDEX IF NOT EXISTS idx_flight_partner_users_is_active
  ON public.flight_partner_users(is_active);

-- =====================================================
-- ADD CLERK USER ID TO PARTNER USER TABLES
-- Allows linking Clerk-authenticated users to partner portal accounts
-- =====================================================

-- Hotel partner users: add clerk_user_id
ALTER TABLE public.partner_users
  ADD COLUMN IF NOT EXISTS clerk_user_id text UNIQUE;

CREATE INDEX IF NOT EXISTS idx_partner_users_clerk_user_id
  ON public.partner_users(clerk_user_id);

-- Flight partner users: add clerk_user_id
ALTER TABLE public.flight_partner_users
  ADD COLUMN IF NOT EXISTS clerk_user_id text UNIQUE;

CREATE INDEX IF NOT EXISTS idx_flight_partner_users_clerk_user_id
  ON public.flight_partner_users(clerk_user_id);
