
-- SQL to fix the bookings table schema

-- 1. Ensure the column exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bookings' AND column_name='booking_code') THEN
        ALTER TABLE bookings ADD COLUMN booking_code TEXT UNIQUE;
    END IF;
END $$;

-- 2. Ensure expires_at exists (another common missing column)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bookings' AND column_name='expires_at') THEN
        ALTER TABLE bookings ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 3. Ensure held_at exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='bookings' AND column_name='held_at') THEN
        ALTER TABLE bookings ADD COLUMN held_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
