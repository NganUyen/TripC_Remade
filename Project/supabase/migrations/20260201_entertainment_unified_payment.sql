-- =====================================================================
-- ENTERTAINMENT UNIFIED PAYMENT PIPELINE INTEGRATION
-- =====================================================================
-- Purpose: Align entertainment_bookings with unified payment system
-- Date: 2026-02-01
-- Dependency: Requires existing entertainment schema and bookings ledger
-- =====================================================================

-- =====================================================================
-- PART 1: SCHEMA ALIGNMENT
-- =====================================================================

-- Add booking_id foreign key to link to unified payment ledger
-- Note: SET NULL instead of CASCADE to preserve domain records if ledger is cleaned up
ALTER TABLE public.entertainment_bookings
  ADD COLUMN IF NOT EXISTS booking_id uuid UNIQUE REFERENCES public.bookings(id) ON DELETE SET NULL;

-- Add user identity fields (Clerk ID + optional internal UUID)
ALTER TABLE public.entertainment_bookings
  ADD COLUMN IF NOT EXISTS external_user_ref text, -- Clerk ID for API traceability
  ADD COLUMN IF NOT EXISTS user_uuid uuid REFERENCES public.users(id); -- Optional internal UUID

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_entertainment_bookings_booking 
  ON public.entertainment_bookings(booking_id);
CREATE INDEX IF NOT EXISTS idx_entertainment_bookings_external_user 
  ON public.entertainment_bookings(external_user_ref);
CREATE INDEX IF NOT EXISTS idx_entertainment_bookings_user_uuid
  ON public.entertainment_bookings(user_uuid);

-- Add held_count to ticket_types for inventory management
ALTER TABLE public.entertainment_ticket_types
  ADD COLUMN IF NOT EXISTS held_count integer DEFAULT 0;

-- Add confirmation_code field if not exists
-- Note: This is the unified pipeline confirmation code. booking_reference is legacy.
ALTER TABLE public.entertainment_bookings
  ADD COLUMN IF NOT EXISTS confirmation_code text UNIQUE;

-- Create index on confirmation_code
CREATE INDEX IF NOT EXISTS idx_entertainment_bookings_confirmation
  ON public.entertainment_bookings(confirmation_code);

COMMENT ON COLUMN public.entertainment_bookings.booking_id IS 'Foreign key to bookings ledger (single source of truth for payment status). SET NULL on delete to preserve domain records.';
COMMENT ON COLUMN public.entertainment_bookings.external_user_ref IS 'Clerk user ID for external API traceability';
COMMENT ON COLUMN public.entertainment_bookings.user_uuid IS 'Internal UUID mapped from Clerk ID (nullable if mapping fails)';
COMMENT ON COLUMN public.entertainment_bookings.confirmation_code IS 'Unified pipeline confirmation code (booking_reference is legacy)';
COMMENT ON COLUMN public.entertainment_bookings.payment_status IS 'LEGACY: Use bookings.payment_status as source of truth';
COMMENT ON COLUMN public.entertainment_bookings.payment_method IS 'LEGACY: Provider stored in payment_transactions table';
COMMENT ON COLUMN public.entertainment_bookings.payment_reference IS 'LEGACY: Use payment_transactions table as source of truth';
COMMENT ON COLUMN public.entertainment_ticket_types.held_count IS 'Number of tickets temporarily reserved during checkout (pending payment)';

-- =====================================================================
-- PART 2: INVENTORY MANAGEMENT RPC FUNCTIONS
-- =====================================================================

-- ---------------------------------------------------------------------
-- Function: hold_entertainment_tickets
-- Purpose: Temporarily reserve tickets during checkout initialization
-- Returns: TRUE if successful, FALSE if insufficient availability
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.hold_entertainment_tickets(
  p_ticket_type_id uuid,
  p_quantity integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_available integer;
  v_total_available integer;
  v_total_sold integer;
  v_held_count integer;
BEGIN
  -- Validate inputs
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than 0';
  END IF;

  -- Get current availability (with row lock to prevent race conditions)
  SELECT 
    total_available,
    total_sold,
    COALESCE(held_count, 0)
  INTO 
    v_total_available,
    v_total_sold,
    v_held_count
  FROM public.entertainment_ticket_types
  WHERE id = p_ticket_type_id
  FOR UPDATE; -- Row-level lock

  -- Check if ticket type exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket type not found: %', p_ticket_type_id;
  END IF;

  -- Calculate available capacity
  v_available := v_total_available - v_total_sold - v_held_count;

  -- Check if sufficient tickets available
  IF v_available < p_quantity THEN
    RAISE NOTICE 'Insufficient tickets. Available: %, Requested: %', v_available, p_quantity;
    RETURN false;
  END IF;

  -- Increment held_count
  UPDATE public.entertainment_ticket_types
  SET 
    held_count = COALESCE(held_count, 0) + p_quantity
    -- Note: updated_at omitted for migration safety (column may not exist in older schemas)
  WHERE id = p_ticket_type_id;

  RAISE NOTICE 'Successfully held % tickets for ticket_type_id %', p_quantity, p_ticket_type_id;
  RETURN true;
END;
$$;

-- ---------------------------------------------------------------------
-- Function: confirm_entertainment_tickets
-- Purpose: Convert held tickets to sold after successful payment
-- Returns: TRUE if successful, FALSE on failure
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.confirm_entertainment_tickets(
  p_ticket_type_id uuid,
  p_quantity integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate inputs
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than 0';
  END IF;

  -- Convert held to sold (atomic update with inventory check)
  -- Only updates if sufficient held_count available
  UPDATE public.entertainment_ticket_types
  SET 
    held_count = GREATEST(0, COALESCE(held_count, 0) - p_quantity),
    total_sold = COALESCE(total_sold, 0) + p_quantity
    -- Note: updated_at omitted for migration safety
  WHERE id = p_ticket_type_id
    AND COALESCE(held_count, 0) >= p_quantity;

  -- Return whether update succeeded (FOUND = row was updated)
  IF NOT FOUND THEN
    RAISE WARNING 'Failed to confirm tickets. Either ticket_type not found or insufficient held_count for ticket_type_id: %', p_ticket_type_id;
    RETURN false;
  END IF;

  RAISE NOTICE 'Successfully confirmed % tickets for ticket_type_id %', p_quantity, p_ticket_type_id;
  RETURN true;
END;
$$;

-- ---------------------------------------------------------------------
-- Function: release_entertainment_tickets
-- Purpose: Release held tickets back to inventory (payment failed/timeout)
-- Returns: TRUE if successful
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.release_entertainment_tickets(
  p_ticket_type_id uuid,
  p_quantity integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate inputs
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than 0';
  END IF;

  -- Lock row first to prevent race conditions with concurrent confirm/release
  PERFORM 1
  FROM public.entertainment_ticket_types
  WHERE id = p_ticket_type_id
  FOR UPDATE;

  -- Check if ticket type exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket type not found: %', p_ticket_type_id;
  END IF;

  -- Release held tickets back to inventory
  UPDATE public.entertainment_ticket_types
  SET held_count = GREATEST(0, COALESCE(held_count, 0) - p_quantity)
  WHERE id = p_ticket_type_id;

  RAISE NOTICE 'Successfully released % tickets for ticket_type_id %', p_quantity, p_ticket_type_id;
  RETURN true;
END;
$$;

-- =====================================================================
-- PART 2B: RPC SECURITY - RESTRICT TO SERVICE_ROLE ONLY
-- =====================================================================
-- Prevent clients from calling RPCs directly (only backend/service_role)

REVOKE ALL ON FUNCTION public.hold_entertainment_tickets(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_entertainment_tickets(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_entertainment_tickets(uuid, integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.hold_entertainment_tickets(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_entertainment_tickets(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_entertainment_tickets(uuid, integer) TO service_role;

-- =====================================================================
-- PART 3: ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Enable RLS on entertainment_bookings (if not already enabled)
ALTER TABLE public.entertainment_bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.entertainment_bookings;
DROP POLICY IF EXISTS "Service role has full access" ON public.entertainment_bookings;

-- Policy: Users can view their own bookings (using Clerk JWT pattern)
CREATE POLICY "Users can view their own bookings"
  ON public.entertainment_bookings
  FOR SELECT
  USING (
    -- Match Clerk ID from JWT (same pattern as event_bookings)
    external_user_ref = auth.jwt()->>'sub'
    OR user_uuid IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
    )
  );

-- Policy: Service role (backend) has full access
CREATE POLICY "Service role has full access"
  ON public.entertainment_bookings
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================================
-- PART 4: HELPER VIEWS (OPTIONAL)
-- =====================================================================

-- View: entertainment_bookings_with_payment_status
-- Purpose: Join with bookings ledger to show unified payment status
CREATE OR REPLACE VIEW public.entertainment_bookings_with_payment_status AS
SELECT 
  eb.*,
  b.payment_status AS ledger_payment_status,
  b.total_amount AS ledger_total_amount,
  b.currency AS ledger_currency,
  b.status AS ledger_booking_status,
  b.created_at AS ledger_created_at,
  -- Payment provider from latest transaction (if exists)
  (
    SELECT pt.provider 
    FROM payment_transactions pt 
    WHERE pt.booking_id = b.id 
      AND pt.status = 'success'
    ORDER BY pt.created_at DESC 
    LIMIT 1
  ) AS ledger_payment_provider
FROM public.entertainment_bookings eb
LEFT JOIN public.bookings b ON eb.booking_id = b.id;

COMMENT ON VIEW public.entertainment_bookings_with_payment_status IS 'Entertainment bookings joined with unified payment ledger for consolidated view';

-- =====================================================================
-- PART 5: MIGRATION VERIFICATION QUERIES
-- =====================================================================

-- Verify schema changes
DO $$
BEGIN
  -- Check if booking_id column exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'entertainment_bookings' 
    AND column_name = 'booking_id'
  ) THEN
    RAISE NOTICE '✓ Column booking_id added successfully';
  ELSE
    RAISE WARNING '✗ Column booking_id NOT found';
  END IF;

  -- Check if external_user_ref column exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'entertainment_bookings' 
    AND column_name = 'external_user_ref'
  ) THEN
    RAISE NOTICE '✓ Column external_user_ref added successfully';
  ELSE
    RAISE WARNING '✗ Column external_user_ref NOT found';
  END IF;

  -- Check if held_count column exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'entertainment_ticket_types' 
    AND column_name = 'held_count'
  ) THEN
    RAISE NOTICE '✓ Column held_count added to ticket_types successfully';
  ELSE
    RAISE WARNING '✗ Column held_count NOT found in ticket_types';
  END IF;

  -- Check if RPC functions exist
  IF EXISTS (
    SELECT 1 
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'hold_entertainment_tickets'
  ) THEN
    RAISE NOTICE '✓ Function hold_entertainment_tickets created successfully';
  ELSE
    RAISE WARNING '✗ Function hold_entertainment_tickets NOT found';
  END IF;

  IF EXISTS (
    SELECT 1 
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'confirm_entertainment_tickets'
  ) THEN
    RAISE NOTICE '✓ Function confirm_entertainment_tickets created successfully';
  ELSE
    RAISE WARNING '✗ Function confirm_entertainment_tickets NOT found';
  END IF;

  IF EXISTS (
    SELECT 1 
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'release_entertainment_tickets'
  ) THEN
    RAISE NOTICE '✓ Function release_entertainment_tickets created successfully';
  ELSE
    RAISE WARNING '✗ Function release_entertainment_tickets NOT found';
  END IF;
END $$;

-- =====================================================================
-- END OF MIGRATION
-- =====================================================================
