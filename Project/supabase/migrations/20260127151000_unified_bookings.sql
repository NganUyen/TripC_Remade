-- Migration: Standardize bookings table (FIXED v2)
-- Description: Rename category->booking_type, Convert user_id to UUID, Update Constraints

-- 0. Drop dependent RLS policies (Required to alter column)
DROP POLICY IF EXISTS "Users view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users create bookings" ON bookings;
DROP POLICY IF EXISTS "Users insert own bookings" ON bookings;
DROP POLICY IF EXISTS "Users update own bookings" ON bookings;

-- 1. Rename 'category' to 'booking_type' (Unify naming)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='category') THEN
        ALTER TABLE bookings RENAME COLUMN category TO booking_type;
    END IF;
END $$;

-- 2. Standardize User ID (Text -> UUID)
-- Add temporary column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_uuid UUID;

-- Backfill UUIDs from users table matching clerk_id
UPDATE bookings b
SET user_uuid = u.id
FROM users u
WHERE b.user_id = u.clerk_id;

-- Delete orphans (bookings with no matching user in users table)
DELETE FROM bookings WHERE user_uuid IS NULL;

-- Drop old column and rename new one
ALTER TABLE bookings DROP COLUMN user_id CASCADE; 
ALTER TABLE bookings RENAME COLUMN user_uuid TO user_id;

-- Add Foreign Key Constraint
ALTER TABLE bookings 
  ADD CONSTRAINT bookings_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 3. Update Status Constraint for 3-Phase Flow
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE bookings 
  ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('draft', 'pending_payment', 'payment_processing', 'confirmed', 'completed', 'failed', 'cancelled', 'refunded', 'no_show'));

-- 4. Update Booking Type Constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_booking_type_check;

ALTER TABLE bookings 
  ADD CONSTRAINT bookings_booking_type_check 
  CHECK (booking_type IN ('hotel', 'flight', 'restaurant', 'activity', 'event', 'wellness', 'beauty', 'transport', 'shop'));

-- 5. Ensure metadata column exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bookings' AND column_name='metadata') THEN
        ALTER TABLE bookings ADD COLUMN metadata JSONB;
    END IF;
END $$;

-- 6. Recreate RLS Policies
CREATE POLICY "Users view own bookings" ON bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users create bookings" ON bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());
  
CREATE POLICY "Users update own bookings" ON bookings
  FOR UPDATE USING (user_id = auth.uid());
