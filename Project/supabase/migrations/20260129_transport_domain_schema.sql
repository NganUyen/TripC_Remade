-- Migration: Create Transport Bookings Domain Table
-- Description: Links the unified Bookings ledger to Transport Routes.

CREATE TABLE IF NOT EXISTS transport_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    route_id UUID REFERENCES transport_routes(id),
    
    passenger_info JSONB,
    vehicle_snapshot JSONB, -- Snapshot of vehicle details at time of booking
    
    status TEXT DEFAULT 'confirmed',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(booking_id) -- One transport booking per ledger entry (usually)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_transport_bookings_booking_id ON transport_bookings(booking_id);
CREATE INDEX IF NOT EXISTS idx_transport_bookings_route_id ON transport_bookings(route_id);

-- RLS
ALTER TABLE transport_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own transport bookings" ON transport_bookings
    FOR SELECT
    USING (
        booking_id IN (
            SELECT id FROM bookings 
            WHERE user_id IN (SELECT id::text FROM users WHERE clerk_id = auth.uid()::text)
        )
    );
