-- Migration: add total_capacity and commission fields
-- Paste this ENTIRE block into the Supabase SQL editor and run it all at once.

DO $$
BEGIN

  -- 1. Add total_capacity to transport_routes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transport_routes' AND column_name = 'total_capacity'
  ) THEN
    ALTER TABLE public.transport_routes
      ADD COLUMN total_capacity integer DEFAULT 0;
  END IF;

  -- 2. Add commission_rate to transport_providers
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transport_providers' AND column_name = 'commission_rate'
  ) THEN
    ALTER TABLE public.transport_providers
      ADD COLUMN commission_rate numeric DEFAULT 0.10;
  END IF;

  -- 3. Add voucher_enabled to transport_providers
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transport_providers' AND column_name = 'voucher_enabled'
  ) THEN
    ALTER TABLE public.transport_providers
      ADD COLUMN voucher_enabled boolean DEFAULT true;
  END IF;

END $$;

-- 4. Backfill total_capacity from vehicle_type for existing routes
UPDATE public.transport_routes
SET total_capacity = CASE
  WHEN vehicle_type ILIKE '%45 seats%' THEN 45
  WHEN vehicle_type ILIKE '%35 seats%' THEN 35
  WHEN vehicle_type ILIKE '%29 seats%' OR vehicle_type ILIKE '%29 ch%' THEN 29
  WHEN vehicle_type ILIKE '%16 seats%' THEN 16
  WHEN vehicle_type ILIKE '%9 seats%' OR vehicle_type ILIKE '%9 ch%' OR vehicle_type ILIKE '%limousine%' THEN 9
  WHEN vehicle_type ILIKE '%7 seats%' THEN 7
  WHEN vehicle_type ILIKE '%4 seats%' THEN 4
  ELSE 29
END
WHERE total_capacity = 0;

-- 5. Ensure seats_available never exceeds total_capacity
UPDATE public.transport_routes
SET seats_available = LEAST(seats_available, total_capacity)
WHERE seats_available > total_capacity;

-- 6. Add metadata column to vouchers (needed for partner-created vouchers)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE public.vouchers ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vouchers' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE public.vouchers ADD COLUMN is_public boolean DEFAULT false;
  END IF;
END $$;
