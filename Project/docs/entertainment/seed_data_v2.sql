-- =====================================================================
-- ENTERTAINMENT SERVICE - SEED DATA v2.0
-- =====================================================================
-- Purpose: Sample data for testing the full booking platform
-- Run this AFTER migrations_v2_comprehensive.sql
-- Date: January 30, 2026
-- =====================================================================

-- =====================================================================
-- 1. CATEGORIES
-- =====================================================================

INSERT INTO public.entertainment_categories (id, name, slug, description, icon_url, display_order, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Tours & Sightseeing', 'tours-sightseeing', 'Guided tours and sightseeing experiences', 'https://example.com/icons/tour.svg', 1, true),
  ('22222222-2222-2222-2222-222222222222', 'Shows & Performances', 'shows-performances', 'Theater shows, concerts, and live performances', 'https://example.com/icons/show.svg', 2, true),
  ('33333333-3333-3333-3333-333333333333', 'Activities & Adventures', 'activities-adventures', 'Interactive experiences and adventures', 'https://example.com/icons/activity.svg', 3, true),
  ('44444444-4444-4444-4444-444444444444', 'Attractions & Museums', 'attractions-museums', 'Theme parks, museums, and landmarks', 'https://example.com/icons/attraction.svg', 4, true),
  ('55555555-5555-5555-5555-555555555555', 'Concerts & Music', 'concerts-music', 'Music concerts and festivals', 'https://example.com/icons/concert.svg', 5, true);

-- Subcategories
INSERT INTO public.entertainment_categories (id, name, slug, description, parent_id, display_order, is_active) VALUES
  ('11111111-1111-1111-1111-111111111112', 'Walking Tours', 'walking-tours', 'Guided walking tours', '11111111-1111-1111-1111-111111111111', 1, true),
  ('11111111-1111-1111-1111-111111111113', 'Bus Tours', 'bus-tours', 'Bus sightseeing tours', '11111111-1111-1111-1111-111111111111', 2, true),
  ('11111111-1111-1111-1111-111111111114', 'Boat Tours', 'boat-tours', 'Water-based tours', '11111111-1111-1111-1111-111111111111', 3, true),
  ('22222222-2222-2222-2222-222222222223', 'Theater Shows', 'theater-shows', 'Broadway and theater productions', '22222222-2222-2222-2222-222222222222', 1, true),
  ('22222222-2222-2222-2222-222222222224', 'Comedy Shows', 'comedy-shows', 'Stand-up comedy performances', '22222222-2222-2222-2222-222222222222', 2, true);

-- =====================================================================
-- 2. ORGANIZERS
-- =====================================================================

INSERT INTO public.entertainment_organizers (id, name, slug, description, logo_url, email, phone, website, rating_average, is_verified) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Paris Tours Inc', 'paris-tours-inc', 'Premier tour operator in Paris since 1995', 'https://example.com/logos/paris-tours.png', 'info@paristours.com', '+33-1-234-5678', 'https://paristours.com', 4.8, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Broadway Productions', 'broadway-productions', 'Official Broadway show producer', 'https://example.com/logos/broadway.png', 'tickets@broadway.com', '+1-212-555-0100', 'https://broadway.com', 4.9, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Tokyo Entertainment Co', 'tokyo-entertainment', 'Leading entertainment provider in Tokyo', 'https://example.com/logos/tokyo-ent.png', 'hello@tokyoent.jp', '+81-3-1234-5678', 'https://tokyoent.jp', 4.7, true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Canyon Tours LLC', 'canyon-tours', 'Adventure tours specialist', 'https://example.com/logos/canyon.png', 'bookings@canyontours.com', '+1-702-555-0200', 'https://canyontours.com', 5.0, true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'China Heritage Tours', 'china-heritage-tours', 'Cultural heritage tour experts', 'https://example.com/logos/china-heritage.png', 'info@chinaheritage.cn', '+86-10-1234-5678', 'https://chinaheritage.cn', 4.9, true);

-- =====================================================================
-- 3. ENTERTAINMENT ITEMS
-- =====================================================================

INSERT INTO public.entertainment_items (
  id, title, subtitle, description, type, slug, 
  category_id, organizer_id, 
  min_price, max_price, currency,
  status, is_featured, is_trending, available,
  location, images, 
  base_capacity, total_bookings, total_views, total_wishlist,
  rating_average, rating_count,
  urgency_threshold, low_stock_threshold,
  metadata,
  published_at, start_date, end_date
) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  'Paris Night Bus Tour',
  'Experience the City of Lights at night',
  'A magical 2-hour bus tour through illuminated Paris, visiting iconic landmarks including the Eiffel Tower, Arc de Triomphe, and Notre-Dame Cathedral. Includes audio guide in 12 languages and complimentary refreshments.',
  'tour',
  'paris-night-bus-tour',
  '11111111-1111-1111-1111-111111111113', -- Bus Tours
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- Paris Tours Inc
  35.00, 65.00, 'EUR',
  'published', true, true, true,
  '{"city": "Paris", "country": "France", "lat": 48.8566, "lng": 2.3522, "address": "Place de la Concorde", "venue": "Paris Tours Depot"}'::jsonb,
  '["https://example.com/paris-night-1.jpg", "https://example.com/paris-night-2.jpg", "https://example.com/paris-night-3.jpg"]'::jsonb,
  50, 342, 5420, 89,
  4.8, 156,
  10, 5,
  '{"duration": "2 hours", "tags": ["night tour", "sightseeing", "landmarks", "best seller"], "difficulty": "easy", "languages": ["English", "French", "Spanish", "German", "Italian", "Japanese", "Chinese", "Korean", "Portuguese", "Russian", "Arabic", "Hindi"], "includes": ["Audio guide", "Refreshments", "WiFi on bus"], "meeting_point": "Place de la Concorde, near the fountain"}'::jsonb,
  now(), now(), now() + interval '365 days'
),
(
  '10000000-0000-0000-0000-000000000002',
  'Hamilton on Broadway',
  'An American Musical',
  'The revolutionary story of Alexander Hamilton, one of America''s founding fathers, told through hip-hop, jazz, and R&B music. Winner of 11 Tony Awards including Best Musical. This is a once-in-a-lifetime theatrical experience that you will never forget.',
  'show',
  'hamilton-broadway',
  '22222222-2222-2222-2222-222222222223', -- Theater Shows
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', -- Broadway Productions
  89.00, 299.00, 'USD',
  'published', true, true, true,
  '{"city": "New York", "country": "USA", "lat": 40.7580, "lng": -73.9855, "address": "Richard Rodgers Theatre, 226 W 46th St", "venue": "Richard Rodgers Theatre"}'::jsonb,
  '["https://example.com/hamilton-1.jpg", "https://example.com/hamilton-2.jpg", "https://example.com/hamilton-poster.jpg"]'::jsonb,
  1319, 892, 12450, 234,
  4.9, 567,
  50, 20,
  '{"duration": "2 hours 45 minutes", "tags": ["broadway", "musical", "theater", "tony award winner"], "age_restriction": "Recommended for ages 10+", "includes": ["Reserved seating", "Playbill"], "dress_code": "Smart casual recommended"}'::jsonb,
  now(), now(), now() + interval '180 days'
),
(
  '10000000-0000-0000-0000-000000000003',
  'Tokyo Robot Restaurant Experience',
  'Futuristic dinner show',
  'A spectacular robot cabaret show featuring neon lights, giant robots, dancers, and a unique dining experience in the heart of Shinjuku. This is Tokyo''s most famous entertainment spectacle with robots, lasers, and traditional Japanese taiko drums.',
  'show',
  'tokyo-robot-restaurant',
  '22222222-2222-2222-2222-222222222222', -- Shows & Performances
  'cccccccc-cccc-cccc-cccc-cccccccccccc', -- Tokyo Entertainment
  60.00, 100.00, 'USD',
  'published', true, false, true,
  '{"city": "Tokyo", "country": "Japan", "lat": 35.6938, "lng": 139.7034, "address": "1-7-7 Kabukicho, Shinjuku", "venue": "Robot Restaurant"}'::jsonb,
  '["https://example.com/robot-show-1.jpg", "https://example.com/robot-show-2.jpg"]'::jsonb,
  150, 201, 3890, 67,
  4.5, 89,
  15, 5,
  '{"duration": "90 minutes", "tags": ["unique", "entertainment", "dinner show", "robots"], "includes": ["Show admission", "Dinner box", "Souvenir"], "languages": ["English", "Japanese"]}'::jsonb,
  now(), now(), now() + interval '365 days'
),
(
  '10000000-0000-0000-0000-000000000004',
  'Grand Canyon Helicopter Tour',
  'Aerial adventure over natural wonder',
  'Soar above the majestic Grand Canyon on a thrilling helicopter ride with stunning aerial views of one of the world''s natural wonders. This premium tour includes hotel pickup from Las Vegas and champagne toast at the canyon floor.',
  'activity',
  'grand-canyon-helicopter-tour',
  '33333333-3333-3333-3333-333333333333', -- Activities & Adventures
  'dddddddd-dddd-dddd-dddd-dddddddddddd', -- Canyon Tours
  249.00, 399.00, 'USD',
  'published', true, true, true,
  '{"city": "Las Vegas", "country": "USA", "lat": 36.1069, "lng": -112.1129, "address": "Grand Canyon West", "venue": "Grand Canyon West Airport"}'::jsonb,
  '["https://example.com/canyon-heli-1.jpg", "https://example.com/canyon-heli-2.jpg", "https://example.com/canyon-view.jpg"]'::jsonb,
  6, 145, 2340, 56,
  5.0, 78,
  2, 1,
  '{"duration": "70 minutes (total: 4 hours with pickup)", "tags": ["adventure", "aerial", "nature", "luxury"], "min_age": 2, "max_group_size": 6, "includes": ["Hotel pickup", "Helicopter tour", "Canyon landing", "Champagne toast", "Snacks"], "excludes": ["Gratuities"], "requirements": ["Valid ID required", "Weight limit: 275 lbs per person"]}'::jsonb,
  now(), now(), now() + interval '365 days'
),
(
  '10000000-0000-0000-0000-000000000005',
  'Great Wall of China Private Tour',
  'Explore ancient history',
  'A private guided tour of the Mutianyu section of the Great Wall with hotel pickup, authentic Chinese lunch, and expert commentary on Chinese history. This section is less crowded and offers spectacular views.',
  'tour',
  'great-wall-china-tour',
  '11111111-1111-1111-1111-111111111111', -- Tours & Sightseeing
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', -- China Heritage Tours
  120.00, 200.00, 'USD',
  'published', false, false, true,
  '{"city": "Beijing", "country": "China", "lat": 40.4319, "lng": 116.5704, "address": "Mutianyu, Huairou District", "venue": "Mutianyu Great Wall"}'::jsonb,
  '["https://example.com/great-wall-1.jpg", "https://example.com/great-wall-2.jpg"]'::jsonb,
  10, 67, 1230, 34,
  4.9, 45,
  3, 2,
  '{"duration": "8 hours", "tags": ["historical", "unesco", "guided tour", "private"], "max_group_size": 10, "includes": ["Hotel pickup", "Private guide", "Entrance fees", "Lunch", "Cable car tickets"], "languages": ["English", "Mandarin"]}'::jsonb,
  now(), now(), now() + interval '365 days'
);

-- =====================================================================
-- 4. SESSIONS (Multiple sessions for each event)
-- =====================================================================

-- Paris Night Bus Tour - Daily at 7:30 PM and 9:00 PM for next 30 days
INSERT INTO public.entertainment_sessions (item_id, session_date, start_time, end_time, duration_minutes, capacity, booked_count, status, is_active)
SELECT 
  '10000000-0000-0000-0000-000000000001',
  date::date,
  '19:30:00'::time,
  '21:30:00'::time,
  120,
  50,
  FLOOR(RANDOM() * 45 + 5)::integer, -- Random bookings between 5-50
  CASE WHEN RANDOM() < 0.95 THEN 'available' ELSE 'sold_out' END,
  true
FROM generate_series(
  CURRENT_DATE,
  CURRENT_DATE + interval '30 days',
  interval '1 day'
) AS date;

INSERT INTO public.entertainment_sessions (item_id, session_date, start_time, end_time, duration_minutes, capacity, booked_count, status, is_active)
SELECT 
  '10000000-0000-0000-0000-000000000001',
  date::date,
  '21:00:00'::time,
  '23:00:00'::time,
  120,
  50,
  FLOOR(RANDOM() * 40 + 3)::integer,
  'available',
  true
FROM generate_series(
  CURRENT_DATE,
  CURRENT_DATE + interval '30 days',
  interval '1 day'
) AS date;

-- Hamilton - 8 shows per week (Wed-Sun evenings, Sat-Sun matinees)
INSERT INTO public.entertainment_sessions (item_id, session_date, start_time, end_time, duration_minutes, capacity, booked_count, status, is_active)
SELECT 
  '10000000-0000-0000-0000-000000000002',
  date::date,
  '19:00:00'::time,
  '21:45:00'::time,
  165,
  1319,
  FLOOR(RANDOM() * 200 + 1100)::integer, -- Mostly sold out
  CASE WHEN RANDOM() < 0.3 THEN 'available' WHEN RANDOM() < 0.7 THEN 'sold_out' ELSE 'available' END,
  true
FROM generate_series(
  CURRENT_DATE,
  CURRENT_DATE + interval '90 days',
  interval '1 day'
) AS date
WHERE EXTRACT(DOW FROM date) IN (3, 4, 5, 6, 0); -- Wed-Sun

-- Tokyo Robot Restaurant - 4 shows daily
INSERT INTO public.entertainment_sessions (item_id, session_date, start_time, end_time, duration_minutes, capacity, booked_count, status, is_active)
SELECT 
  '10000000-0000-0000-0000-000000000003',
  date::date,
  time::time,
  (time::time + interval '90 minutes')::time,
  90,
  150,
  FLOOR(RANDOM() * 130 + 10)::integer,
  'available',
  true
FROM generate_series(
  CURRENT_DATE,
  CURRENT_DATE + interval '60 days',
  interval '1 day'
) AS date
CROSS JOIN (VALUES ('17:00:00'), ('18:30:00'), ('20:00:00'), ('21:30:00')) AS times(time);

-- Grand Canyon Helicopter - 6 flights daily
INSERT INTO public.entertainment_sessions (item_id, session_date, start_time, end_time, duration_minutes, capacity, booked_count, status, is_active)
SELECT 
  '10000000-0000-0000-0000-000000000004',
  date::date,
  time::time,
  (time::time + interval '70 minutes')::time,
  70,
  6,
  FLOOR(RANDOM() * 5)::integer,
  CASE WHEN RANDOM() < 0.85 THEN 'available' ELSE 'sold_out' END,
  true
FROM generate_series(
  CURRENT_DATE,
  CURRENT_DATE + interval '30 days',
  interval '1 day'
) AS date
CROSS JOIN (VALUES ('07:00:00'), ('09:00:00'), ('11:00:00'), ('13:00:00'), ('15:00:00'), ('17:00:00')) AS times(time);

-- Great Wall Tour - Daily morning tour
INSERT INTO public.entertainment_sessions (item_id, session_date, start_time, end_time, duration_minutes, capacity, booked_count, status, is_active)
SELECT 
  '10000000-0000-0000-0000-000000000005',
  date::date,
  '08:00:00'::time,
  '16:00:00'::time,
  480,
  10,
  FLOOR(RANDOM() * 8)::integer,
  'available',
  true
FROM generate_series(
  CURRENT_DATE,
  CURRENT_DATE + interval '60 days',
  interval '1 day'
) AS date;

-- =====================================================================
-- 5. TICKET TYPES
-- =====================================================================

-- Paris Night Bus Tour ticket types
INSERT INTO public.entertainment_ticket_types (item_id, name, description, price, original_price, display_order, max_quantity_per_order, total_available, is_active, benefits) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Standard', 'Standard seat on the bus', 35.00, NULL, 1, 10, 1000, true, '["Reserved seat", "Audio guide", "Refreshments"]'::jsonb),
  ('10000000-0000-0000-0000-000000000001', 'Premium', 'Upper deck with best views', 50.00, NULL, 2, 8, 500, true, '["Upper deck seat", "Audio guide", "Premium refreshments", "Souvenir photo"]'::jsonb),
  ('10000000-0000-0000-0000-000000000001', 'VIP', 'Front row seats with champagne', 65.00, NULL, 3, 6, 200, true, '["Front row seat", "Audio guide", "Champagne", "Gourmet snacks", "Souvenir photo", "Priority boarding"]'::jsonb);

-- Hamilton ticket types
INSERT INTO public.entertainment_ticket_types (item_id, name, description, price, original_price, display_order, max_quantity_per_order, total_available, is_active, benefits) VALUES
  ('10000000-0000-0000-0000-000000000002', 'Rear Mezzanine', 'Upper level rear seats', 89.00, NULL, 1, 8, 5000, true, '["Reserved seat", "Playbill"]'::jsonb),
  ('10000000-0000-0000-0000-000000000002', 'Orchestra', 'Main floor seating', 199.00, NULL, 2, 6, 3000, true, '["Premium seat", "Playbill", "Priority entry"]'::jsonb),
  ('10000000-0000-0000-0000-000000000002', 'Premium Orchestra', 'Front orchestra seats', 299.00, 350.00, 3, 4, 1000, true, '["Best seats", "Playbill", "VIP entry", "Meet & greet pass"]'::jsonb);

-- Tokyo Robot Restaurant ticket types
INSERT INTO public.entertainment_ticket_types (item_id, name, description, price, original_price, display_order, max_quantity_per_order, total_available, is_active, benefits) VALUES
  ('10000000-0000-0000-0000-000000000003', 'Standard + Bento', 'Show with bento box dinner', 60.00, NULL, 1, 10, 2000, true, '["Show admission", "Bento box", "Souvenir"]'::jsonb),
  ('10000000-0000-0000-0000-000000000003', 'VIP + Premium Meal', 'Front row with premium dinner', 100.00, NULL, 2, 6, 500, true, '["Front row seat", "Premium dinner", "Drink included", "Exclusive souvenir", "Photo with robots"]'::jsonb);

-- Grand Canyon Helicopter ticket types
INSERT INTO public.entertainment_ticket_types (item_id, name, description, price, original_price, display_order, max_quantity_per_order, total_available, is_active, benefits) VALUES
  ('10000000-0000-0000-0000-000000000004', 'Standard Flight', 'Standard helicopter tour', 249.00, NULL, 1, 6, 500, true, '["Helicopter flight", "Canyon landing", "Champagne", "Snacks"]'::jsonb),
  ('10000000-0000-0000-0000-000000000004', 'Extended Tour', 'Extended tour with multiple landings', 349.00, NULL, 2, 6, 300, true, '["Extended flight", "Multiple landings", "Gourmet picnic", "Champagne", "Professional photos"]'::jsonb),
  ('10000000-0000-0000-0000-000000000004', 'Private Charter', 'Private helicopter for your group', 399.00, NULL, 3, 6, 100, true, '["Private helicopter", "Custom route", "Extended time", "Luxury picnic", "Champagne", "Professional photographer"]'::jsonb);

-- Great Wall Tour ticket types
INSERT INTO public.entertainment_ticket_types (item_id, name, description, price, original_price, display_order, max_quantity_per_order, total_available, is_active, benefits) VALUES
  ('10000000-0000-0000-0000-000000000005', 'Group Tour', 'Small group tour (6-10 people)', 120.00, NULL, 1, 4, 300, true, '["Hotel pickup", "Guide", "Lunch", "Cable car", "Entrance fees"]'::jsonb),
  ('10000000-0000-0000-0000-000000000005', 'Private Tour', 'Private tour for your group', 200.00, 250.00, 2, 8, 100, true, '["Private guide", "Flexible schedule", "Hotel pickup", "Premium lunch", "Cable car", "Entrance fees", "Souvenir"]'::jsonb);

-- =====================================================================
-- 6. SAMPLE REVIEWS
-- =====================================================================

INSERT INTO public.entertainment_reviews (item_id, user_id, rating, title, comment, is_verified_purchase, is_approved, helpful_count, created_at) VALUES
  ('10000000-0000-0000-0000-000000000001', 'user_sample_1', 5, 'Absolutely magical!', 'The Paris night tour was beyond our expectations. The city looks stunning at night and our guide was fantastic!', true, true, 23, now() - interval '15 days'),
  ('10000000-0000-0000-0000-000000000001', 'user_sample_2', 4, 'Great experience', 'Really enjoyed the tour. Only downside was the bus was a bit crowded but overall worth it!', true, true, 12, now() - interval '10 days'),
  ('10000000-0000-0000-0000-000000000002', 'user_sample_3', 5, 'Best show ever!', 'Hamilton exceeded all expectations. The cast was incredible and the energy was electric. A must-see!', true, true, 89, now() - interval '20 days'),
  ('10000000-0000-0000-0000-000000000002', 'user_sample_4', 5, 'Worth every penny', 'Expensive but absolutely worth it. The staging, music, and performances were flawless.', true, true, 67, now() - interval '8 days'),
  ('10000000-0000-0000-0000-000000000003', 'user_sample_5', 4, 'Unique and fun!', 'Super unique experience. A bit over the top but that''s the point! Kids loved it.', true, true, 15, now() - interval '12 days'),
  ('10000000-0000-0000-0000-000000000004', 'user_sample_6', 5, 'Once in a lifetime!', 'The helicopter tour was breathtaking. Our pilot was great and the views were unforgettable.', true, true, 34, now() - interval '5 days'),
  ('10000000-0000-0000-0000-000000000005', 'user_sample_7', 5, 'Excellent private tour', 'Our private guide was knowledgeable and accommodating. The Great Wall is truly magnificent.', true, true, 28, now() - interval '18 days');

-- =====================================================================
-- 7. URGENCY SIGNALS (Auto-calculated but we can seed some)
-- =====================================================================

-- Find sessions that are almost sold out and create urgency signals
INSERT INTO public.entertainment_urgency_signals (item_id, session_id, signal_type, remaining_quantity, badge_text, badge_color, priority, is_active)
SELECT 
  s.item_id,
  s.id,
  CASE 
    WHEN s.available_count <= 5 THEN 'only_x_left'
    WHEN s.available_count <= 15 THEN 'selling_fast'
    ELSE 'popular'
  END,
  s.available_count,
  CASE 
    WHEN s.available_count <= 5 THEN 'Only ' || s.available_count || ' left!'
    WHEN s.available_count <= 15 THEN 'Selling Fast!'
    ELSE 'Popular'
  END,
  CASE 
    WHEN s.available_count <= 5 THEN 'red'
    WHEN s.available_count <= 15 THEN 'orange'
    ELSE 'blue'
  END,
  CASE 
    WHEN s.available_count <= 5 THEN 3
    WHEN s.available_count <= 15 THEN 2
    ELSE 1
  END,
  true
FROM public.entertainment_sessions s
WHERE s.available_count <= 20 AND s.status = 'available'
LIMIT 50;

-- =====================================================================
-- END OF SEED DATA
-- =====================================================================

-- Refresh trending cache (would normally be done by a background job)
INSERT INTO public.entertainment_trending_cache (item_id, trending_score, views_24h, bookings_24h, trending_rank)
SELECT 
  id,
  (total_views * 0.3 + total_bookings * 0.5 + total_wishlist * 0.2) as score,
  FLOOR(total_views * 0.1)::integer,
  FLOOR(total_bookings * 0.1)::integer,
  ROW_NUMBER() OVER (ORDER BY (total_views * 0.3 + total_bookings * 0.5 + total_wishlist * 0.2) DESC)
FROM public.entertainment_items
WHERE status = 'published' AND is_trending = true;
