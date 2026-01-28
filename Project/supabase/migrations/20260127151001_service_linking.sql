-- Migration: Link Service Tables to Bookings (FIXED)
-- Description: Add booking_id FK to all service tables IF they exist

-- 1. Shop Orders
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shop_orders') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shop_orders' AND column_name='booking_id') THEN
            ALTER TABLE shop_orders ADD COLUMN booking_id UUID REFERENCES bookings(id);
            CREATE INDEX IF NOT EXISTS idx_shop_orders_booking ON shop_orders(booking_id);
        END IF;
    END IF;
END $$;

-- 2. Hotel Bookings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hotel_bookings') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hotel_bookings' AND column_name='booking_id') THEN
            ALTER TABLE hotel_bookings ADD COLUMN booking_id UUID REFERENCES bookings(id);
            CREATE INDEX IF NOT EXISTS idx_hotel_bookings_booking ON hotel_bookings(booking_id);
        END IF;
    END IF;
END $$;

-- 3. Flight Bookings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'flight_bookings') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='flight_bookings' AND column_name='booking_id') THEN
            ALTER TABLE flight_bookings ADD COLUMN booking_id UUID REFERENCES bookings(id);
            CREATE INDEX IF NOT EXISTS idx_flight_bookings_booking ON flight_bookings(booking_id);
        END IF;
    END IF;
END $$;

-- 4. Dining Bookings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dining_bookings') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dining_bookings' AND column_name='booking_id') THEN
            ALTER TABLE dining_bookings ADD COLUMN booking_id UUID REFERENCES bookings(id);
            CREATE INDEX IF NOT EXISTS idx_dining_bookings_booking ON dining_bookings(booking_id);
        END IF;
    END IF;
END $$;

-- 5. Transport Bookings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transport_bookings') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transport_bookings' AND column_name='booking_id') THEN
            ALTER TABLE transport_bookings ADD COLUMN booking_id UUID REFERENCES bookings(id);
            CREATE INDEX IF NOT EXISTS idx_transport_bookings_booking ON transport_bookings(booking_id);
        END IF;
    END IF;
END $$;

-- 6. Wellness & Beauty Bookings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wb_bookings') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wb_bookings' AND column_name='booking_id') THEN
            ALTER TABLE wb_bookings ADD COLUMN booking_id UUID REFERENCES bookings(id);
            CREATE INDEX IF NOT EXISTS idx_wb_bookings_booking ON wb_bookings(booking_id);
        END IF;
    END IF;
END $$;
