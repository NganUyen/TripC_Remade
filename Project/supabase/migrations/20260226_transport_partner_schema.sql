-- 0. Fix transport_providers table (ensure all columns exist)
ALTER TABLE public.transport_providers ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.transport_providers ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.transport_providers ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.transport_providers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.transport_providers ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.transport_providers ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.transport_providers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 1. Create Transport Vehicles Table
CREATE TABLE IF NOT EXISTS public.transport_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.transport_providers(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- bus, limousine, private_car, train, airplane
    plate_number TEXT NOT NULL,
    model TEXT,
    capacity INTEGER DEFAULT 1,
    amenities JSONB DEFAULT '{}'::jsonb,
    images TEXT[] DEFAULT '{}'::text[],
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Transport Drivers Table
CREATE TABLE IF NOT EXISTS public.transport_drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.transport_providers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    license_number TEXT,
    license_expiry DATE,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'on_trip', 'off_duty')),
    rating NUMERIC DEFAULT 5.0,
    total_trips INTEGER DEFAULT 0,
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.transport_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_drivers ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Basic policies for visibility, management via API)
-- Policy: Service role can do everything (default)
-- Policy: Authenticated users can see their own providers' assets (if using direct client)
DROP POLICY IF EXISTS "Public can view active vehicles" ON public.transport_vehicles;
CREATE POLICY "Public can view active vehicles" ON public.transport_vehicles FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Public can view active drivers" ON public.transport_drivers;
CREATE POLICY "Public can view active drivers" ON public.transport_drivers FOR SELECT USING (status = 'available');

-- 5. Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_transport_vehicles_updated_at ON public.transport_vehicles;
CREATE TRIGGER update_transport_vehicles_updated_at BEFORE UPDATE ON public.transport_vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transport_drivers_updated_at ON public.transport_drivers;
CREATE TRIGGER update_transport_drivers_updated_at BEFORE UPDATE ON public.transport_drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Transport Reviews table
CREATE TABLE IF NOT EXISTS public.transport_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    response TEXT,
    user_id UUID REFERENCES auth.users(id),
    route_id UUID REFERENCES public.transport_routes(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Transport Notifications table
CREATE TABLE IF NOT EXISTS public.transport_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES public.transport_providers(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    action_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies for Reviews
ALTER TABLE public.transport_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view reviews" ON public.transport_reviews FOR SELECT USING (true);

-- RLS Policies for Notifications
ALTER TABLE public.transport_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Providers can view their own notifications" ON public.transport_notifications 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.transport_providers 
            WHERE id = transport_notifications.provider_id 
            AND owner_id = (SELECT auth.uid())
        )
    );

-- Trigger for Reviews updated_at
CREATE TRIGGER update_transport_reviews_updated_at 
    BEFORE UPDATE ON public.transport_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
