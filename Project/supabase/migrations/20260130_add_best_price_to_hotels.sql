-- Migration: Add best_price column to hotels table
-- Date: 2026-01-30
-- Purpose: Enable price filtering in hotel search

-- Add best_price column (stores price in cents)
ALTER TABLE hotels 
ADD COLUMN IF NOT EXISTS best_price integer;

-- Add index for price filtering performance
CREATE INDEX IF NOT EXISTS idx_hotels_best_price ON hotels(best_price);

-- Update best_price with calculated values based on star rating
-- This provides temporary prices until real pricing from hotel_rates is implemented
UPDATE hotels
SET best_price = CASE 
  WHEN star_rating = 5 THEN 
    CASE 
      WHEN address->>'city' ILIKE '%ho chi minh%' OR address->>'city' ILIKE '%saigon%' THEN 48500  -- $485
      WHEN address->>'city' ILIKE '%hanoi%' THEN 42000  -- $420
      WHEN address->>'city' ILIKE '%da nang%' THEN 38500  -- $385
      WHEN address->>'city' ILIKE '%hoi an%' THEN 35000  -- $350
      WHEN address->>'city' ILIKE '%nha trang%' THEN 32000  -- $320
      WHEN address->>'city' ILIKE '%hue%' THEN 29500  -- $295
      ELSE 40000  -- $400 default for 5-star
    END
  WHEN star_rating = 4 THEN 
    CASE 
      WHEN address->>'city' ILIKE '%ho chi minh%' OR address->>'city' ILIKE '%saigon%' THEN 24500  -- $245
      WHEN address->>'city' ILIKE '%hanoi%' THEN 22000  -- $220
      WHEN address->>'city' ILIKE '%da nang%' THEN 20500  -- $205
      WHEN address->>'city' ILIKE '%hoi an%' THEN 19000  -- $190
      WHEN address->>'city' ILIKE '%nha trang%' THEN 18000  -- $180
      WHEN address->>'city' ILIKE '%hue%' THEN 17000  -- $170
      ELSE 20000  -- $200 default for 4-star
    END
  WHEN star_rating = 3 THEN 
    CASE 
      WHEN address->>'city' ILIKE '%ho chi minh%' OR address->>'city' ILIKE '%saigon%' THEN 14500  -- $145
      WHEN address->>'city' ILIKE '%hanoi%' THEN 13000  -- $130
      WHEN address->>'city' ILIKE '%da nang%' THEN 12500  -- $125
      WHEN address->>'city' ILIKE '%hoi an%' THEN 11500  -- $115
      WHEN address->>'city' ILIKE '%nha trang%' THEN 11000  -- $110
      WHEN address->>'city' ILIKE '%hue%' THEN 10500  -- $105
      ELSE 12000  -- $120 default for 3-star
    END
  ELSE 15000  -- $150 default
END
WHERE best_price IS NULL;

-- Add comment explaining the column
COMMENT ON COLUMN hotels.best_price IS 'Cached lowest nightly rate in cents. Updated from hotel_rates or calculated based on star_rating and city.';

-- Optional: Create a function to update best_price from hotel_rates
-- This can be called when hotel_rates are inserted/updated
CREATE OR REPLACE FUNCTION update_hotel_best_price()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the hotel's best_price with the minimum price from hotel_rates
  UPDATE hotels
  SET best_price = (
    SELECT MIN(hr.price_cents)
    FROM hotel_rates hr
    JOIN hotel_rooms hroom ON hr.room_id = hroom.id
    WHERE hroom.hotel_id = (
      SELECT hotel_id 
      FROM hotel_rooms 
      WHERE id = NEW.room_id
    )
    AND hr.available_rooms > 0
    AND hr.date >= CURRENT_DATE
  )
  WHERE id = (
    SELECT hotel_id 
    FROM hotel_rooms 
    WHERE id = NEW.room_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update best_price when rates change
DROP TRIGGER IF EXISTS trigger_update_hotel_best_price ON hotel_rates;
CREATE TRIGGER trigger_update_hotel_best_price
AFTER INSERT OR UPDATE OF price_cents, available_rooms ON hotel_rates
FOR EACH ROW
EXECUTE FUNCTION update_hotel_best_price();

-- Verify the migration
DO $$
DECLARE
  col_exists boolean;
  idx_exists boolean;
BEGIN
  -- Check if column exists
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'hotels' 
    AND column_name = 'best_price'
  ) INTO col_exists;
  
  -- Check if index exists
  SELECT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE tablename = 'hotels' 
    AND indexname = 'idx_hotels_best_price'
  ) INTO idx_exists;
  
  -- Output results
  IF col_exists AND idx_exists THEN
    RAISE NOTICE '✓ Migration successful: best_price column and index added to hotels table';
  ELSE
    RAISE WARNING '⚠ Migration incomplete: column_exists=%, index_exists=%', col_exists, idx_exists;
  END IF;
END $$;
