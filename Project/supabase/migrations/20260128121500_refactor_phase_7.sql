-- Phase 7: Final Polish

-- 1. Fix hotel_reviews FK (if exists)
DO $$
BEGIN
  -- Check if hotel_reviews exists
  IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'hotel_reviews') THEN
    
    -- Rename booking_id to hotel_booking_id if it's currently pointing to hotel_bookings
    -- Or if we want to point to Unified Bookings as requested.
    -- Strategy: The user said "hotel_reviews.booking_id không nên FK về hotel_bookings".
    -- Option A: Point to bookings(id).
    
    -- First, check if column exists
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'hotel_reviews' AND column_name = 'booking_id') THEN
      
      -- We'll assume the data currently matches hotel_bookings IDs.
      -- If we want to move to unified bookings, we need a backfill similar to before.
      
      -- Step 1: Add new column
      ALTER TABLE "hotel_reviews" ADD COLUMN "unified_booking_id" UUID;
      
      -- Step 2: Backfill -> Map via hotel_bookings
      -- hotel_reviews.booking_id -> hotel_bookings.id -> hotel_bookings.booking_id (unified)
      -- Assuming hotel_bookings has a booking_id column (it should if it's a domain table)
      
      -- Dynamic execution to avoid errors if hotel_bookings doesn't exist yet
      EXECUTE 'UPDATE "hotel_reviews" hr SET "unified_booking_id" = hb."booking_id" FROM "hotel_bookings" hb WHERE hr."booking_id" = hb."id"';
      
      -- Step 3: Swap
      ALTER TABLE "hotel_reviews" DROP CONSTRAINT IF EXISTS "hotel_reviews_booking_id_fkey";
      ALTER TABLE "hotel_reviews" DROP COLUMN "booking_id";
      ALTER TABLE "hotel_reviews" RENAME COLUMN "unified_booking_id" TO "booking_id";
      ALTER TABLE "hotel_reviews" ALTER COLUMN "booking_id" SET NOT NULL;
      ALTER TABLE "hotel_reviews" ADD CONSTRAINT "hotel_reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id");
      
    END IF;
  END IF;
END $$;

-- 2. Rename Flight-Only keys to flight_booking_id
-- A. flight_checkins
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'flight_checkins' AND column_name = 'booking_id') THEN
    ALTER TABLE "flight_checkins" RENAME COLUMN "booking_id" TO "flight_booking_id";
  END IF;
END $$;

-- B. flight_tickets
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'flight_tickets' AND column_name = 'booking_id') THEN
    ALTER TABLE "flight_tickets" RENAME COLUMN "booking_id" TO "flight_booking_id";
  END IF;
END $$;

-- C. flight_booking_modifications
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'flight_booking_modifications' AND column_name = 'booking_id') THEN
    ALTER TABLE "flight_booking_modifications" RENAME COLUMN "booking_id" TO "flight_booking_id";
  END IF;
END $$;
