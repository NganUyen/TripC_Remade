-- ============================================================
-- MASTER FIX FOR PARTNER PORTAL SCHEMA
-- Run this script to ensure all columns required by the Partner Portal exist.
-- ============================================================

DO $$
BEGIN
    -- 1. Fix 'dining_tables'
    -- The code expects: capacity, area, status, current_guests, table_number
    
    -- capacity
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dining_tables' AND column_name = 'capacity') THEN
        ALTER TABLE dining_tables ADD COLUMN capacity INTEGER DEFAULT 4;
    END IF;

    -- area
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dining_tables' AND column_name = 'area') THEN
        ALTER TABLE dining_tables ADD COLUMN area TEXT DEFAULT 'Main';
    END IF;

    -- status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dining_tables' AND column_name = 'status') THEN
        ALTER TABLE dining_tables ADD COLUMN status TEXT DEFAULT 'available';
    END IF;

    -- current_guests
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dining_tables' AND column_name = 'current_guests') THEN
        ALTER TABLE dining_tables ADD COLUMN current_guests INTEGER DEFAULT 0;
    END IF;

    -- table_number (should exist, but ensuring)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dining_tables' AND column_name = 'table_number') THEN
        ALTER TABLE dining_tables ADD COLUMN table_number TEXT DEFAULT 'T-New';
    END IF;

    -- 2. Fix 'dining_menu_items'
    -- The code expects: name, description, price, currency, category, image_url, is_available
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dining_menu_items' AND column_name = 'currency') THEN
        ALTER TABLE dining_menu_items ADD COLUMN currency TEXT DEFAULT 'VND';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dining_menu_items' AND column_name = 'category') THEN
        ALTER TABLE dining_menu_items ADD COLUMN category TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dining_menu_items' AND column_name = 'image_url') THEN
        ALTER TABLE dining_menu_items ADD COLUMN image_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dining_menu_items' AND column_name = 'is_available') THEN
        ALTER TABLE dining_menu_items ADD COLUMN is_available BOOLEAN DEFAULT true;
    END IF;

    -- 3. Fix 'dining_venues'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dining_venues' AND column_name = 'owner_user_id') THEN
        ALTER TABLE dining_venues ADD COLUMN owner_user_id TEXT;
    END IF;

END $$;

-- 4. Ensure RLS doesn't block Service Role (used by API)
-- We re-apply policies to be safe
ALTER TABLE dining_tables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view tables" ON dining_tables;
CREATE POLICY "Public can view tables" ON dining_tables FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users can manage tables" ON dining_tables;
CREATE POLICY "Auth users can manage tables" ON dining_tables USING (auth.role() = 'authenticated');
