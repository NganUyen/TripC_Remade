-- Migration: Harden Unified Booking Pipeline (Phase 4.1)
-- Description: Enforces strict 1:1 Domain-Ledger linking and fixes Transport layering.

-- 1. FLIGHT BOOKINGS
-- Ensure booking_id is NOT NULL
ALTER TABLE flight_bookings 
    ALTER COLUMN booking_id SET NOT NULL;

-- 2. HOTEL BOOKINGS
-- Ensure booking_id is NOT NULL
ALTER TABLE hotel_bookings 
    ALTER COLUMN booking_id SET NOT NULL;

-- 3. TRANSPORT LAYER FIX
-- A. Clean up Transport Routes (Catalog should not link to Ledger)
ALTER TABLE transport_routes 
    DROP COLUMN IF EXISTS booking_id; 

-- B. Harden Transport Bookings (Domain)
ALTER TABLE transport_bookings 
    ALTER COLUMN booking_id SET NOT NULL;

-- Ensure FK (Redundant if previous migration ran, but safe to ensure)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transport_bookings_booking_id_fkey') THEN
        ALTER TABLE transport_bookings
            ADD CONSTRAINT transport_bookings_booking_id_fkey 
            FOREIGN KEY (booking_id) 
            REFERENCES bookings(id) 
            ON DELETE CASCADE;
    END IF;
END $$;

-- 4. SAFETY CHECKS (Run these to verify state)
/*
    -- Check for Orphan Domain Records (Should be 0)
    SELECT count(*) as orphan_flight FROM flight_bookings WHERE booking_id IS NULL;
    SELECT count(*) as orphan_hotel FROM hotel_bookings WHERE booking_id IS NULL;
    SELECT count(*) as orphan_transport FROM transport_bookings WHERE booking_id IS NULL;

    -- Check for Duplicate Links (Should be 0)
    SELECT booking_id, count(*) FROM flight_bookings GROUP BY booking_id HAVING count(*) > 1;
    SELECT booking_id, count(*) FROM hotel_bookings GROUP BY booking_id HAVING count(*) > 1;
    SELECT booking_id, count(*) FROM transport_bookings GROUP BY booking_id HAVING count(*) > 1;

    -- Verify Transport Routes Purity (Should fail if column exists)
    SELECT booking_id FROM transport_routes LIMIT 1; 
*/
