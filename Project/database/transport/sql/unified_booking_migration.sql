-- ==========================================
-- UNIFIED BOOKING SYSTEM MIGRATION
-- ==========================================

-- 1. Backup existing data if any (Optional - here we restart the table for consistency)
-- DROP TABLE IF EXISTS payments;
-- DROP TABLE IF EXISTS email_logs;
-- DROP TABLE IF EXISTS partner_notifications;
-- DROP TABLE IF EXISTS reviews;
-- DROP TABLE IF EXISTS bookings;

-- 2. Create Unified Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,         -- Clerk ID
    category TEXT NOT NULL CHECK (category IN ('hotel', 'flight', 'restaurant', 'activity', 'event', 'wellness', 'beauty', 'transport')),
    
    -- Display Fields (Denormalized for performance)
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    location_summary TEXT,         -- e.g., "Hanoi -> Sapa" or "Luxury Hotel, HCM"
    
    -- Logic Fields
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Status & Financial
    status TEXT DEFAULT 'pending' CHECK (status IN ('held', 'confirmed', 'completed', 'cancelled', 'payment_failed', 'refunded')),
    total_amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'VND',
    booking_code TEXT UNIQUE,      -- TRIPC-XXXXXX
    
    -- Flexible Data
    guest_details JSONB,           -- { firstName, lastName, email, phone, etc. }
    metadata JSONB,                -- Category specific (route_id, room_id, seat_number, etc.)
    
    -- Lifecycle
    held_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Update related tables to reference the new bookings table structure
-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    method TEXT CHECK (method IN ('momo', 'vnpay', 'credit_card')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    transaction_id TEXT,
    payment_url TEXT,
    raw_response JSONB,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL,
    item_id UUID,                  -- Reference to the specific item (route_id, hotel_id, etc.)
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 5. Policies
CREATE POLICY "Users view own bookings" ON bookings FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users insert own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users update own bookings" ON bookings FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users see own payments" ON payments FOR SELECT USING (
    booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid()::text)
);

CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users create own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- 6. Reload cache
NOTIFY pgrst, 'reload schema';
