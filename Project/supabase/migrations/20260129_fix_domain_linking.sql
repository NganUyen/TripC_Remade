-- Migration: Fix Domain Linking (Phase 1)
-- Description: Enforce 1:1 relationship between Ledger (bookings) and Domain tables (flight_bookings, hotel_bookings).

-- 1. FLIGHT BOOKINGS
-- Ensure booking_id is UNIQUE
ALTER TABLE flight_bookings
    ADD CONSTRAINT flight_bookings_booking_id_unique UNIQUE (booking_id);

-- Update FK to ensure ON DELETE CASCADE (Drop old, add new)
ALTER TABLE flight_bookings
    DROP CONSTRAINT IF EXISTS flight_bookings_booking_id_fkey;

ALTER TABLE flight_bookings
    ADD CONSTRAINT flight_bookings_booking_id_fkey 
    FOREIGN KEY (booking_id) 
    REFERENCES bookings(id) 
    ON DELETE CASCADE;


-- 2. HOTEL BOOKINGS
-- Ensure booking_id is UNIQUE
ALTER TABLE hotel_bookings
    ADD CONSTRAINT hotel_bookings_booking_id_unique UNIQUE (booking_id);

-- Update FK to ensure ON DELETE CASCADE
ALTER TABLE hotel_bookings
    DROP CONSTRAINT IF EXISTS hotel_bookings_booking_id_fkey;

ALTER TABLE hotel_bookings
    ADD CONSTRAINT hotel_bookings_booking_id_fkey 
    FOREIGN KEY (booking_id) 
    REFERENCES bookings(id) 
    ON DELETE CASCADE;

--
