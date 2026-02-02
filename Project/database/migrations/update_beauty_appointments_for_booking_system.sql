-- Migration: Update beauty_appointments table to work with unified booking system
-- The existing table already has most required fields
-- This migration only adds foreign key constraint for booking_id if needed

-- Add foreign key constraint for booking_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'beauty_appointments_booking_id_fkey'
    ) THEN
        ALTER TABLE public.beauty_appointments 
        ADD CONSTRAINT beauty_appointments_booking_id_fkey 
        FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update RLS policies to include user_id lookups
DROP POLICY IF EXISTS "Users can view their own beauty appointments" ON public.beauty_appointments;

CREATE POLICY "Users can view their own beauty appointments"
    ON public.beauty_appointments
    FOR SELECT
    USING (
        user_id = auth.uid()::text
        OR user_id IN (
            SELECT clerk_id FROM public.users WHERE id = auth.uid()
        )
    );

-- Service role has full access
DROP POLICY IF EXISTS "Service role has full access to beauty appointments" ON public.beauty_appointments;

CREATE POLICY "Service role has full access to beauty appointments"
    ON public.beauty_appointments
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Comments
COMMENT ON TABLE public.beauty_appointments IS 'Stores beauty service appointments linked to bookings';
COMMENT ON COLUMN public.beauty_appointments.booking_id IS 'References the parent booking in the bookings table';
COMMENT ON COLUMN public.beauty_appointments.user_id IS 'User identifier (Clerk ID as text, or GUEST for guest bookings)';
COMMENT ON COLUMN public.beauty_appointments.metadata IS 'Additional data including total_amount, currency, payment_status';
