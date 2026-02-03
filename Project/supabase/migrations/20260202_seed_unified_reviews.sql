-- ============================================================
-- Seed Unified Reviews (Adapted from Migration 014)
-- ============================================================

-- REVIEWS FOR BEAUTY VENUES (mapped from beauty_reviews)
-- Lumina Hair Studio
INSERT INTO public.reviews (
  id,
  user_id,
  entity_id,
  entity_type,
  rating,
  title,
  comment,
  is_verified,
  helpful_count,
  status,
  created_at
) VALUES
(
  'b1111111-1111-1111-1111-111111111111',
  'user_clerk_001',
  '11111111-1111-1111-1111-111111111111', -- Lumina Hair Studio ID
  'beauty_venue',
  5,
  'Amazing transformation!',
  'The stylist was incredibly talented and really listened to what I wanted. My balayage looks stunning and the whole experience was relaxing. The salon is pristine and modern. Highly recommend!',
  true,
  12,
  'published', -- mapped 'approved' -> 'published'
  NOW() - INTERVAL '10 days'
),
(
  'b1111111-1111-1111-1111-111111111112',
  'user_clerk_002',
  '11111111-1111-1111-1111-111111111111',
  'beauty_venue',
  4,
  'Great service, long wait',
  'The haircut and styling were excellent, but I had to wait 20 minutes past my appointment time. Staff was apologetic and the result was worth it.',
  true,
  5,
  'published',
  NOW() - INTERVAL '5 days'
),
(
  'b1111111-1111-1111-1111-111111111113',
  'user_clerk_003',
  '11111111-1111-1111-1111-111111111111',
  'beauty_venue',
  5,
  'Best salon in town',
  'Been going here for 2 years now. Consistent quality, friendly staff, and they always remember my preferences. Worth every penny!',
  true,
  8,
  'published',
  NOW() - INTERVAL '3 days'
),
-- Glow Nail Bar
(
  'b2222222-2222-2222-2222-222222222221',
  'user_clerk_004',
  '22222222-2222-2222-2222-222222222222', -- Glow Nail Bar ID
  'beauty_venue',
  5,
  'Perfect gel manicure!',
  'My nails look flawless! The attention to detail is incredible and the nail art is stunning. Clean salon, friendly staff, will definitely return.',
  true,
  7,
  'published',
  NOW() - INTERVAL '8 days'
),
(
  'b2222222-2222-2222-2222-222222222222',
  'user_clerk_005',
  '22222222-2222-2222-2222-222222222222',
  'beauty_venue',
  4,
  'Good quality, pricey',
  'The gel manicure lasted 3 weeks without chipping, which is impressive. Price is a bit high but quality matches.',
  false,
  3,
  'published',
  NOW() - INTERVAL '2 days'
),
-- Serenity Spa
(
  'b3333333-3333-3333-3333-333333333331',
  'user_clerk_006',
  '33333333-3333-3333-3333-333333333333', -- Serenity Spa ID
  'beauty_venue',
  5,
  'Ultimate relaxation',
  'The full body massage was heavenly. The therapist knew exactly how to work out all my tension. The ambiance is so peaceful and calming.',
  true,
  15,
  'published',
  NOW() - INTERVAL '12 days'
),
(
  'b3333333-3333-3333-3333-333333333332',
  'user_clerk_007',
  '33333333-3333-3333-3333-333333333333',
  'beauty_venue',
  5,
  'Best spa experience ever',
  'From the moment I walked in, I felt welcomed. The massage was incredible and I left feeling completely rejuvenated. The spa is immaculate.',
  true,
  9,
  'published',
  NOW() - INTERVAL '6 days'
),
-- Modern Barber
(
  'b4444444-4444-4444-4444-444444444441',
  'user_clerk_008',
  '44444444-4444-4444-4444-444444444444', -- Modern Barber ID
  'beauty_venue',
  5,
  'Classic barbering at its finest',
  'Got the premium haircut and shave. The barber was skilled and took his time to get everything perfect. Old-school service with modern style.',
  true,
  11,
  'published',
  NOW() - INTERVAL '7 days'
),
(
  'b4444444-4444-4444-4444-444444444442',
  'user_clerk_009',
  '44444444-4444-4444-4444-444444444444',
  'beauty_venue',
  4,
  'Great cut, friendly atmosphere',
  'Really enjoyed my visit. The barber was chatty and professional. Haircut turned out exactly how I wanted. Will be back.',
  false,
  4,
  'published',
  NOW() - INTERVAL '1 day'
)
ON CONFLICT (user_id, entity_id, entity_type) DO UPDATE SET
  rating = EXCLUDED.rating,
  title = EXCLUDED.title,
  comment = EXCLUDED.comment,
  helpful_count = EXCLUDED.helpful_count,
  updated_at = NOW();


-- REVIEWS FOR DINING VENUES (mapped from dining_reviews)
-- Using dynamic IDs from existing data if possible, or fallback logic.
-- Assuming standard seeds logic from User's prompt.

WITH dining_venues_lookup AS (
    SELECT id, name, ROW_NUMBER() OVER (ORDER BY created_at) as rn
    FROM public.dining_venues
)
INSERT INTO public.reviews (
  id,
  user_id,
  entity_id,
  entity_type,
  rating,
  title,
  comment,
  is_verified,
  helpful_count,
  status,
  created_at
)
SELECT
    doc.id,
    doc.user_id,
    v.id as entity_id,
    'dining_venue' as entity_type,
    doc.rating,
    doc.title,
    doc.comment,
    doc.is_verified,
    doc.helpful_count,
    'published' as status,
    NOW() - (doc.days_ago || ' days')::interval
FROM (
    VALUES
    -- Venue 1: Madame/Pho
    ('d1111111-1111-1111-1111-111111111111'::uuid, 'user_clerk_010', 1, 5, 'Authentic Vietnamese flavors!', 'The pho was absolutely delicious - rich broth, fresh herbs, and tender beef. Service was attentive and the atmosphere was cozy. Best Vietnamese food in Da Nang!', true, 18, 15),
    ('d1111111-1111-1111-1111-111111111112'::uuid, 'user_clerk_011', 1, 4, 'Great food, busy atmosphere', 'Food quality is excellent but it can get quite crowded during peak hours. The spring rolls were fresh and flavorful. Would recommend for lunch.', true, 9, 8),
    ('d1111111-1111-1111-1111-111111111113'::uuid, 'user_clerk_012', 1, 5, 'Must-visit restaurant', 'Every dish we tried was amazing. The banh mi was perfectly crispy and the coffee was strong and aromatic. Staff speaks good English too.', true, 14, 4),
    -- Venue 2
    ('d2222222-2222-2222-2222-222222222221'::uuid, 'user_clerk_013', 2, 5, 'Exceptional dining experience', 'From the appetizers to dessert, everything was perfectly executed. The presentation is beautiful and flavors are well-balanced. Great wine selection.', true, 21, 20),
    ('d2222222-2222-2222-2222-222222222222'::uuid, 'user_clerk_014', 2, 4, 'Lovely ambiance, good food', 'The restaurant has a romantic atmosphere perfect for date night. Food was very good but portions could be larger for the price.', false, 6, 11),
    ('d2222222-2222-2222-2222-222222222223'::uuid, 'user_clerk_015', 2, 5, 'Best seafood in town!', 'The grilled fish was incredibly fresh and cooked to perfection. Staff recommendations were spot-on. Will definitely come back.', true, 10, 2),
    -- Venue 3
    ('d3333333-3333-3333-3333-333333333331'::uuid, 'user_clerk_016', 3, 4, 'Good value for money', 'Solid meal at reasonable prices. The menu has good variety and the service is quick. Nothing fancy but consistently good.', false, 5, 9),
    ('d3333333-3333-3333-3333-333333333332'::uuid, 'user_clerk_017', 3, 5, 'Hidden gem!', 'Found this place by accident and so glad we did. Authentic local cuisine with a modern twist. The staff was incredibly friendly.', true, 13, 5)
) as doc(id, user_id, venue_idx, rating, title, comment, is_verified, helpful_count, days_ago)
JOIN dining_venues_lookup v ON v.rn = doc.venue_idx
ON CONFLICT (user_id, entity_id, entity_type) DO UPDATE SET
  rating = EXCLUDED.rating,
  title = EXCLUDED.title,
  comment = EXCLUDED.comment,
  helpful_count = EXCLUDED.helpful_count,
  updated_at = NOW();
