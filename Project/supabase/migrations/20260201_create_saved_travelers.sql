-- Migration: Create saved_travelers table
-- Date: 2026-02-01

CREATE TABLE IF NOT EXISTS public.saved_travelers (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    phone_number text,
    date_of_birth date,
    gender text CHECK (gender IN ('male', 'female', 'other')),
    nationality text,
    passport_number text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT saved_travelers_pkey PRIMARY KEY (id),
    CONSTRAINT saved_travelers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    -- Unique constraint to prevent duplicate traveler profiles for the same user
    CONSTRAINT saved_travelers_user_unique_profile UNIQUE (user_id, first_name, last_name, passport_number)
);

-- Enable RLS
ALTER TABLE public.saved_travelers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own saved travelers"
    ON public.saved_travelers
    FOR SELECT
    USING (auth.uid()::text = (SELECT clerk_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can insert their own saved travelers"
    ON public.saved_travelers
    FOR INSERT
    WITH CHECK (auth.uid()::text = (SELECT clerk_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can update their own saved travelers"
    ON public.saved_travelers
    FOR UPDATE
    USING (auth.uid()::text = (SELECT clerk_id FROM public.users WHERE id = user_id))
    WITH CHECK (auth.uid()::text = (SELECT clerk_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can delete their own saved travelers"
    ON public.saved_travelers
    FOR DELETE
    USING (auth.uid()::text = (SELECT clerk_id FROM public.users WHERE id = user_id));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_saved_travelers_updated_at
    BEFORE UPDATE ON public.saved_travelers
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
