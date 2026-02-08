-- Fix missing area column in dining_tables if it wasn't created correctly
-- This script is idempotent

DO $$
BEGIN
    -- Check and add 'area' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dining_tables' AND column_name = 'area') THEN
        ALTER TABLE dining_tables ADD COLUMN area TEXT DEFAULT 'Main';
    END IF;

    -- Check and add 'status' column just in case
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dining_tables' AND column_name = 'status') THEN
        ALTER TABLE dining_tables ADD COLUMN status TEXT DEFAULT 'available';
    END IF;

    -- Check and add 'current_guests' column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dining_tables' AND column_name = 'current_guests') THEN
        ALTER TABLE dining_tables ADD COLUMN current_guests INTEGER DEFAULT 0;
    END IF;
END $$;
