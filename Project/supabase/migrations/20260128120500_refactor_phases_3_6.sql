-- Phase 3: Fix FKs for Unified Tables

-- A. booking_notifications
ALTER TABLE "booking_notifications" ADD COLUMN "booking_uuid" UUID;

-- Backfill Step 1: Direct match (Booking -> Booking)
UPDATE "booking_notifications" bn 
SET "booking_uuid" = bn."booking_id"
FROM "bookings" b 
WHERE bn."booking_id" = b."id";

-- Backfill Step 2: Map via Flight Bookings (Flight -> Booking)
UPDATE "booking_notifications" bn 
SET "booking_uuid" = fb."booking_id"
FROM "flight_bookings" fb 
WHERE bn."booking_id" = fb."id" 
  AND bn."booking_uuid" IS NULL;

-- Audit Orphans
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM "booking_notifications" WHERE "booking_uuid" IS NULL AND "booking_id" IS NOT NULL) THEN
    -- In strict mode we raise exception. 
    -- For now, if there are orphans, they might be deleted or valid? 
    -- User instructions: "check record 'mồ côi'".
    -- I will assume if orphan, I should block to warn user.
    RAISE EXCEPTION 'Orphaned booking_notifications found (no matching booking). Rollback.';
  END IF;
END $$;

-- Swap Columns
ALTER TABLE "booking_notifications" DROP CONSTRAINT IF EXISTS "booking_notifications_booking_id_fkey";
-- We keep 'user_id' text for now as requested (Phase 4 later drop)
ALTER TABLE "booking_notifications" DROP COLUMN "booking_id";
ALTER TABLE "booking_notifications" RENAME COLUMN "booking_uuid" TO "booking_id";
ALTER TABLE "booking_notifications" ALTER COLUMN "booking_id" SET NOT NULL;
ALTER TABLE "booking_notifications" ADD CONSTRAINT "booking_notifications_booking_id_fkey" 
  FOREIGN KEY ("booking_id") REFERENCES "bookings"("id");


-- B. loyalty_transactions
ALTER TABLE "loyalty_transactions" ADD COLUMN "booking_uuid" UUID;

UPDATE "loyalty_transactions" lt 
SET "booking_uuid" = lt."booking_id"
FROM "bookings" b 
WHERE lt."booking_id" = b."id";

UPDATE "loyalty_transactions" lt 
SET "booking_uuid" = fb."booking_id"
FROM "flight_bookings" fb 
WHERE lt."booking_id" = fb."id" 
  AND lt."booking_uuid" IS NULL;

DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM "loyalty_transactions" WHERE "booking_uuid" IS NULL AND "booking_id" IS NOT NULL) THEN
    RAISE EXCEPTION 'Orphaned loyalty_transactions found. Rollback.';
  END IF;
END $$;

ALTER TABLE "loyalty_transactions" DROP CONSTRAINT IF EXISTS "loyalty_transactions_booking_id_fkey";
ALTER TABLE "loyalty_transactions" DROP COLUMN "booking_id";
ALTER TABLE "loyalty_transactions" RENAME COLUMN "booking_uuid" TO "booking_id";
ALTER TABLE "loyalty_transactions" ALTER COLUMN "booking_id" SET NOT NULL;
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_booking_id_fkey" 
  FOREIGN KEY ("booking_id") REFERENCES "bookings"("id");


-- Phase 4: Standardize User ID (Add user_uuid, keep old for now)
-- booking_notifications
ALTER TABLE "booking_notifications" ADD COLUMN "user_uuid" UUID;
UPDATE "booking_notifications" bn 
SET "user_uuid" = b."user_id"
FROM "bookings" b 
WHERE bn."booking_id" = b."id";

-- loyalty_transactions
ALTER TABLE "loyalty_transactions" ADD COLUMN "user_uuid" UUID;
UPDATE "loyalty_transactions" lt 
SET "user_uuid" = b."user_id"
FROM "bookings" b 
WHERE lt."booking_id" = b."id";


-- Phase 5: Booking Reservation Cleanup
ALTER TABLE "booking_reservations" DROP COLUMN IF EXISTS "service_type";

-- Ensure 1-1 with bookings
ALTER TABLE "booking_reservations" DROP CONSTRAINT IF EXISTS "booking_reservations_booking_id_key";
ALTER TABLE "booking_reservations" ADD CONSTRAINT "booking_reservations_booking_id_key" UNIQUE ("booking_id");


-- Phase 6: Booking Events (Idempotency Guard)
CREATE TABLE IF NOT EXISTS "booking_events" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "booking_id" UUID NOT NULL REFERENCES "bookings"("id") ON DELETE CASCADE,
  "event_type" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT "booking_events_idempotency_key" UNIQUE ("booking_id", "event_type")
);
