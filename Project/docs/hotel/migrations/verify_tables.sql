-- Verification Query: Check if Hotel tables exist
-- Run this in Supabase SQL Editor to verify migration success

SELECT 
  tablename,
  schemaname
FROM pg_tables
WHERE tablename LIKE 'hotel%'
ORDER BY tablename;

-- Count records in each table
SELECT 
  'hotels' as table_name, 
  COUNT(*) as record_count 
FROM hotels
UNION ALL
SELECT 'hotel_rooms', COUNT(*) FROM hotel_rooms
UNION ALL
SELECT 'hotel_partners', COUNT(*) FROM hotel_partners
UNION ALL
SELECT 'hotel_partner_listings', COUNT(*) FROM hotel_partner_listings
UNION ALL
SELECT 'hotel_rates', COUNT(*) FROM hotel_rates
UNION ALL
SELECT 'hotel_bookings', COUNT(*) FROM hotel_bookings
UNION ALL
SELECT 'hotel_reviews', COUNT(*) FROM hotel_reviews
UNION ALL
SELECT 'hotel_booking_modifications', COUNT(*) FROM hotel_booking_modifications;
