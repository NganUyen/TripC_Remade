-- ============================================================================
-- Hotel Database Test & Verification Script
-- Run this to test all hotel functionality
-- ============================================================================

-- 1. CHECK HOTEL COUNTS BY CITY
SELECT 
  address->>'city' as city,
  COUNT(*) as hotel_count,
  AVG(star_rating) as avg_rating
FROM hotels
WHERE status = 'active'
GROUP BY address->>'city'
ORDER BY hotel_count DESC;

-- 2. CHECK TOTAL DATABASE STATS
SELECT 
  (SELECT COUNT(*) FROM hotels WHERE status = 'active') as active_hotels,
  (SELECT COUNT(*) FROM hotel_rooms WHERE status = 'active') as active_rooms,
  (SELECT COUNT(*) FROM hotel_partners WHERE is_active = true) as active_partners,
  (SELECT COUNT(*) FROM hotel_partner_listings WHERE is_active = true) as partner_listings,
  (SELECT COUNT(*) FROM hotel_rates WHERE date >= CURRENT_DATE AND available_rooms > 0) as available_rates;

-- 3. TEST SEARCH BY CITY (Hanoi)
SELECT 
  h.slug,
  h.name,
  h.address->>'city' as city,
  h.star_rating,
  array_length(h.amenities, 1) as amenity_count,
  (SELECT COUNT(*) FROM hotel_rooms WHERE hotel_id = h.id AND status = 'active') as room_count
FROM hotels h
WHERE h.address->>'city' ILIKE '%Hanoi%'
  AND h.status = 'active'
ORDER BY h.star_rating DESC, h.name;

-- 4. TEST SEARCH BY CITY (Ho Chi Minh City)
SELECT 
  h.slug,
  h.name,
  h.address->>'city' as city,
  h.star_rating,
  (SELECT COUNT(*) FROM hotel_rooms WHERE hotel_id = h.id AND status = 'active') as room_count
FROM hotels h
WHERE h.address->>'city' ILIKE '%Ho Chi Minh%'
  AND h.status = 'active'
ORDER BY h.star_rating DESC, h.name;

-- 5. TEST RATE AVAILABILITY FOR A HOTEL
SELECT 
  h.name as hotel_name,
  r.title as room_type,
  hr.date,
  p.name as partner,
  hr.price_cents / 100.0 as price_usd,
  hr.available_rooms,
  hr.is_best_price,
  hr.breakfast_included
FROM hotel_rates hr
JOIN hotel_rooms r ON r.id = hr.room_id
JOIN hotels h ON h.id = r.hotel_id
JOIN hotel_partners p ON p.id = hr.partner_id
WHERE h.slug = 'sofitel-legend-metropole-hanoi'
  AND hr.date >= CURRENT_DATE
  AND hr.date < CURRENT_DATE + 7
  AND hr.available_rooms > 0
ORDER BY hr.date, r.code, hr.price_cents;

-- 6. TEST BEST PRICE CALCULATION
SELECT 
  h.name as hotel_name,
  r.code as room_code,
  hr.date,
  COUNT(*) as partner_count,
  MIN(hr.price_cents / 100.0) as best_price_usd,
  MAX(hr.price_cents / 100.0) as highest_price_usd,
  (MAX(hr.price_cents) - MIN(hr.price_cents)) / 100.0 as savings_usd
FROM hotel_rates hr
JOIN hotel_rooms r ON r.id = hr.room_id
JOIN hotels h ON h.id = r.hotel_id
WHERE h.address->>'city' = 'Hanoi'
  AND hr.date = CURRENT_DATE + 3
  AND hr.available_rooms > 0
GROUP BY h.name, r.code, hr.date
HAVING COUNT(*) > 1
ORDER BY savings_usd DESC
LIMIT 10;

-- 7. CHECK PARTNER INTEGRATION
SELECT 
  p.name as partner,
  COUNT(DISTINCT hpl.hotel_id) as hotel_count,
  p.commission_rate * 100 as commission_percent,
  p.priority
FROM hotel_partners p
LEFT JOIN hotel_partner_listings hpl ON hpl.partner_id = p.id AND hpl.is_active = true
WHERE p.is_active = true
GROUP BY p.id, p.name, p.commission_rate, p.priority
ORDER BY p.priority DESC;

-- 8. SAMPLE HOTEL WITH FULL DETAILS
SELECT 
  h.slug,
  h.name,
  h.description,
  h.address,
  h.star_rating,
  h.amenities,
  h.images,
  h.policies,
  (SELECT json_agg(json_build_object(
    'code', r.code,
    'title', r.title,
    'capacity', r.capacity,
    'bed_type', r.bed_type
  )) FROM hotel_rooms r WHERE r.hotel_id = h.id AND r.status = 'active') as rooms
FROM hotels h
WHERE h.slug = 'park-hyatt-saigon'
LIMIT 1;

-- 9. CHECK FOR MISSING DATA ISSUES
SELECT 
  'Missing images' as issue,
  COUNT(*) as count
FROM hotels 
WHERE images IS NULL OR jsonb_array_length(images) = 0
UNION ALL
SELECT 
  'Missing amenities',
  COUNT(*)
FROM hotels 
WHERE amenities IS NULL OR jsonb_array_length(amenities) = 0
UNION ALL
SELECT 
  'Missing address city',
  COUNT(*)
FROM hotels 
WHERE address->>'city' IS NULL OR address->>'city' = ''
UNION ALL
SELECT 
  'Hotels without rooms',
  COUNT(*)
FROM hotels h
WHERE NOT EXISTS (SELECT 1 FROM hotel_rooms r WHERE r.hotel_id = h.id)
UNION ALL
SELECT 
  'Rooms without rates',
  COUNT(*)
FROM hotel_rooms r
WHERE NOT EXISTS (SELECT 1 FROM hotel_rates hr WHERE hr.room_id = r.id AND hr.date >= CURRENT_DATE);

-- 10. TEST FUZZY SEARCH (for API search functionality)
SELECT 
  h.slug,
  h.name,
  h.address->>'city' as city,
  h.star_rating,
  similarity(h.name, 'Hyatt') as name_similarity
FROM hotels h
WHERE h.name ILIKE '%Hyatt%'
   OR h.address->>'city' ILIKE '%Hyatt%'
ORDER BY name_similarity DESC
LIMIT 10;

-- ============================================================================
-- EXPECTED RESULTS SUMMARY
-- ============================================================================
-- After running 001 and 002 migrations, you should see:
-- 
-- Query 1 (City Counts): 
--   - Hanoi: 6 hotels
--   - Ho Chi Minh City: 6 hotels
--   - Da Nang: 5 hotels
--   - Others: 2-3 each
--
-- Query 2 (Total Stats):
--   - Active hotels: 25
--   - Active rooms: 97
--   - Active partners: 5
--   - Partner listings: 125
--   - Available rates: ~29,100
--
-- Query 9 (Data Issues):
--   - All counts should be 0 (no missing data)
--
-- If any query returns unexpected results, check the migration logs
-- ============================================================================
