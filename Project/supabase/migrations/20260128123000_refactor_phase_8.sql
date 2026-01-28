-- Phase 8: Standardization & Cleanup

-- 1. Standardize User ID
-- A. booking_notifications
-- Ensure user_uuid is present (Phase 4 partially did this, filtering for nulls now)
UPDATE "booking_notifications" bn
SET "user_uuid" = b."user_id"
FROM "bookings" b
WHERE bn."booking_id" = b."id"
AND bn."user_uuid" IS NULL;

-- Rename old user_id -> external_user_ref
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'booking_notifications' AND column_name = 'user_id') THEN
    ALTER TABLE "booking_notifications" RENAME COLUMN "user_id" TO "external_user_ref";
    ALTER TABLE "booking_notifications" ALTER COLUMN "external_user_ref" DROP NOT NULL;
  END IF;
END $$;

-- Set user_uuid NOT NULL and add FK
ALTER TABLE "booking_notifications" ALTER COLUMN "user_uuid" SET NOT NULL;
ALTER TABLE "booking_notifications" DROP CONSTRAINT IF EXISTS "booking_notifications_user_uuid_fkey";
ALTER TABLE "booking_notifications" ADD CONSTRAINT "booking_notifications_user_uuid_fkey" 
  FOREIGN KEY ("user_uuid") REFERENCES "users"("id");


-- B. loyalty_transactions
-- Ensure user_uuid is present
UPDATE "loyalty_transactions" lt
SET "user_uuid" = b."user_id"
FROM "bookings" b
WHERE lt."booking_id" = b."id"
AND lt."user_uuid" IS NULL;

-- Rename old user_id -> external_user_ref
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'loyalty_transactions' AND column_name = 'user_id') THEN
    ALTER TABLE "loyalty_transactions" RENAME COLUMN "user_id" TO "external_user_ref";
    ALTER TABLE "loyalty_transactions" ALTER COLUMN "external_user_ref" DROP NOT NULL;
  END IF;
END $$;

-- Set user_uuid NOT NULL and add FK
ALTER TABLE "loyalty_transactions" ALTER COLUMN "user_uuid" SET NOT NULL;
ALTER TABLE "loyalty_transactions" DROP CONSTRAINT IF EXISTS "loyalty_transactions_user_uuid_fkey";
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_user_uuid_fkey" 
  FOREIGN KEY ("user_uuid") REFERENCES "users"("id");


-- 2. Reservation State Cleanup (Option A)
-- Drop duplicate columns from bookings
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "held_at";
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "expires_at";
