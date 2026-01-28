-- Phase 1: Payment Cleanup
DROP TABLE IF EXISTS "payment_intents";

-- Harden payment_transactions
ALTER TABLE "payment_transactions"
  DROP CONSTRAINT IF EXISTS payment_transactions_provider_tx_key; -- drop if exists to be safe

ALTER TABLE "payment_transactions" 
  ADD CONSTRAINT "payment_transactions_provider_tx_key" UNIQUE ("provider", "provider_transaction_id");

CREATE INDEX IF NOT EXISTS "payment_transactions_booking_lookup_idx" 
  ON "payment_transactions" ("booking_id", "status", "created_at");

ALTER TABLE "payment_transactions" 
  ALTER COLUMN "booking_id" SET NOT NULL;

-- Phase 2: Rename Domain Tables
-- Check if table exists before renaming to avoid errors if re-run
DO $$
BEGIN
  IF EXISTS(SELECT * FROM information_schema.tables WHERE table_name = 'booking_checkins') THEN
    ALTER TABLE "booking_checkins" RENAME TO "flight_checkins";
  END IF;
  
  IF EXISTS(SELECT * FROM information_schema.tables WHERE table_name = 'booking_tickets') THEN
    ALTER TABLE "booking_tickets" RENAME TO "flight_tickets";
  END IF;

  IF EXISTS(SELECT * FROM information_schema.tables WHERE table_name = 'booking_modifications') THEN
    ALTER TABLE "booking_modifications" RENAME TO "flight_booking_modifications";
  END IF;
END $$;
