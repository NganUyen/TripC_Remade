-- Migration: Create activity_bookings table for storing activity bookings after payment settlement
-- This table is used by the ActivitySettlementHandler to store confirmed activity bookings

CREATE TABLE IF NOT EXISTS public.activity_bookings (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    booking_id uuid UNIQUE NOT NULL,
    user_uuid uuid,
    external_user_ref text,
    activity_id uuid NOT NULL,
    confirmation_code text UNIQUE NOT NULL,
    booking_date date NOT NULL,
    participant_count integer DEFAULT 1 CHECK (participant_count > 0),
    ticket_details jsonb DEFAULT '{}'::jsonb,
    total_amount numeric NOT NULL CHECK (total_amount >= 0),
    currency text DEFAULT 'USD'::text NOT NULL,
    guest_name text NOT NULL,
    guest_email text NOT NULL,
    guest_phone text,
    special_requests text,
    status text DEFAULT 'confirmed'::text CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
    payment_status text DEFAULT 'pending'::text CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    confirmed_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT activity_bookings_pkey PRIMARY KEY (id),
    CONSTRAINT activity_bookings_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE,
    CONSTRAINT activity_bookings_user_uuid_fkey FOREIGN KEY (user_uuid) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT activity_bookings_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_bookings_booking_id ON public.activity_bookings(booking_id);
CREATE INDEX IF NOT EXISTS idx_activity_bookings_user_uuid ON public.activity_bookings(user_uuid);
CREATE INDEX IF NOT EXISTS idx_activity_bookings_activity_id ON public.activity_bookings(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_bookings_booking_date ON public.activity_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_activity_bookings_status ON public.activity_bookings(status);
CREATE INDEX IF NOT EXISTS idx_activity_bookings_confirmation_code ON public.activity_bookings(confirmation_code);

-- Enable Row Level Security
ALTER TABLE public.activity_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own bookings
CREATE POLICY "Users can view their own activity bookings"
    ON public.activity_bookings
    FOR SELECT
    USING (
        user_uuid = auth.uid()
        OR external_user_ref = auth.uid()::text
    );

-- RLS Policy: Service role can do everything
CREATE POLICY "Service role has full access to activity bookings"
    ON public.activity_bookings
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_activity_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_activity_bookings_updated_at
    BEFORE UPDATE ON public.activity_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_activity_bookings_updated_at();

-- Comments
COMMENT ON TABLE public.activity_bookings IS 'Stores confirmed activity bookings after payment settlement';
COMMENT ON COLUMN public.activity_bookings.booking_id IS 'References the parent booking in the bookings table';
COMMENT ON COLUMN public.activity_bookings.user_uuid IS 'Internal user UUID, null for guest bookings';
COMMENT ON COLUMN public.activity_bookings.external_user_ref IS 'External user reference (e.g., Clerk ID)';
COMMENT ON COLUMN public.activity_bookings.confirmation_code IS 'Unique confirmation code for the activity booking';
COMMENT ON COLUMN public.activity_bookings.ticket_details IS 'JSON object containing ticket type and quantity details';
