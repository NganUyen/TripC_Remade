-- Migration: Events Seed Data
-- Description: Sample events for development and testing
-- Date: 2026-01-31

-- =============================================================================
-- SEED DATA: Events
-- =============================================================================

-- Event 1: Music Concert
INSERT INTO events (
  id, title, slug, description, short_description,
  venue_name, address, city, district, latitude, longitude, location_summary,
  category, tags, cover_image_url, images,
  average_rating, review_count,
  organizer_name, organizer_logo_url,
  highlights, inclusions, exclusions, important_info, age_restriction,
  is_featured, is_active
) VALUES (
  'e1000000-0000-0000-0000-000000000001',
  'Summer Beats Festival 2026',
  'summer-beats-festival-2026',
  'Join us for the biggest music festival of the summer! Featuring top international DJs and artists, incredible light shows, and an unforgettable atmosphere. Three stages, endless music, one amazing weekend.',
  'The biggest outdoor music festival featuring top DJs and artists',
  'Phu Tho Stadium',
  '1 Le Dai Hanh, Ward 15, District 11',
  'Ho Chi Minh City',
  'District 11',
  10.7625,
  106.6575,
  'Phu Tho Stadium, District 11, HCMC',
  'festival',
  ARRAY['music', 'outdoor', 'festival', 'edm', 'summer'],
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200',
  ARRAY['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'],
  4.8, 245,
  'TripC Entertainment',
  'https://example.com/tripc-logo.png',
  ARRAY['3 stages of non-stop music', 'World-class sound system', 'Spectacular light show', 'Food & drink village', 'VIP lounge access available'],
  ARRAY['Entry to all stages', 'Festival wristband', 'Access to food court area', 'Free parking'],
  ARRAY['Food and beverages', 'VIP upgrades (available separately)', 'Transportation'],
  'This is an outdoor event. Bring sunscreen and stay hydrated. No professional cameras or drones allowed.',
  '18+',
  true, true
);

-- Event 2: Tech Conference
INSERT INTO events (
  id, title, slug, description, short_description,
  venue_name, address, city, district, latitude, longitude, location_summary,
  category, tags, cover_image_url, images,
  average_rating, review_count,
  organizer_name,
  highlights, inclusions, exclusions, important_info, dress_code,
  is_featured, is_active
) VALUES (
  'e1000000-0000-0000-0000-000000000002',
  'Vietnam Tech Summit 2026',
  'vietnam-tech-summit-2026',
  'The premier technology conference in Southeast Asia. Connect with industry leaders, discover cutting-edge innovations, and gain insights from expert speakers. Featuring AI, blockchain, fintech, and more.',
  'Southeast Asia''s premier technology conference',
  'GEM Center',
  '8 Nguyen Binh Khiem, Da Kao, District 1',
  'Ho Chi Minh City',
  'District 1',
  10.7875,
  106.7050,
  'GEM Center, District 1, HCMC',
  'conference',
  ARRAY['technology', 'startup', 'AI', 'blockchain', 'networking'],
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
  ARRAY['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800'],
  4.6, 128,
  'Vietnam Tech Association',
  ARRAY['50+ Expert speakers', 'Networking sessions', 'Startup pitch competition', 'Hands-on workshops', 'Exhibition hall'],
  ARRAY['Conference pass', 'Lunch and refreshments', 'Conference materials', 'Certificate of attendance', 'Wi-Fi access'],
  ARRAY['Accommodation', 'Dinner', 'Workshop materials for premium sessions'],
  'Please bring a valid ID for registration. Laptops welcome for workshop sessions.',
  'Business casual',
  true, true
);

-- Event 3: Comedy Night
INSERT INTO events (
  id, title, slug, description, short_description,
  venue_name, address, city, district, latitude, longitude, location_summary,
  category, tags, cover_image_url, images,
  average_rating, review_count,
  organizer_name,
  highlights, inclusions, exclusions, important_info, age_restriction,
  is_featured, is_active
) VALUES (
  'e1000000-0000-0000-0000-000000000003',
  'Saigon Stand-Up Comedy Night',
  'saigon-standup-comedy-night',
  'Get ready to laugh until your sides hurt! Join us for an evening of hilarious stand-up comedy featuring the best local and international comedians. A perfect night out with friends.',
  'An evening of hilarious stand-up comedy',
  'The Deck Saigon',
  '38 Nguyen U Di, Thao Dien, Thu Duc',
  'Ho Chi Minh City',
  'Thu Duc',
  10.8025,
  106.7350,
  'The Deck Saigon, Thao Dien',
  'theater',
  ARRAY['comedy', 'standup', 'entertainment', 'nightlife'],
  'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200',
  ARRAY['https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800'],
  4.5, 89,
  'Saigon Comedy Club',
  ARRAY['4 talented comedians', 'Intimate venue setting', 'Great riverside views', 'Full bar service'],
  ARRAY['Show entry', 'Welcome drink', 'Reserved seating'],
  ARRAY['Additional food and drinks', 'Transportation'],
  'Show contains adult humor. Latecomers may not be admitted until a suitable break.',
  '18+',
  false, true
);

-- =============================================================================
-- SEED DATA: Event Sessions
-- =============================================================================

-- Summer Beats Festival - 2 day event
INSERT INTO event_sessions (id, event_id, session_date, start_time, end_time, name, doors_open_time, status, total_capacity) VALUES
  ('s1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', '2026-08-15', '16:00', '23:00', 'Day 1 - Opening Night', '15:00', 'on_sale', 5000),
  ('s1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', '2026-08-16', '14:00', '23:30', 'Day 2 - Grand Finale', '13:00', 'on_sale', 5000);

-- Tech Summit - Single day with morning/afternoon sessions
INSERT INTO event_sessions (id, event_id, session_date, start_time, end_time, name, doors_open_time, status, total_capacity) VALUES
  ('s1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000002', '2026-09-20', '08:30', '17:30', 'Full Day Conference', '08:00', 'on_sale', 800);

-- Comedy Night - Multiple show times
INSERT INTO event_sessions (id, event_id, session_date, start_time, end_time, name, doors_open_time, status, total_capacity) VALUES
  ('s1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000003', '2026-07-25', '19:00', '21:00', 'Early Show', '18:30', 'on_sale', 120),
  ('s1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000003', '2026-07-25', '21:30', '23:30', 'Late Show', '21:00', 'on_sale', 120),
  ('s1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000003', '2026-07-26', '19:00', '21:00', 'Saturday Show', '18:30', 'on_sale', 120);

-- =============================================================================
-- SEED DATA: Event Ticket Types
-- =============================================================================

-- Summer Beats Festival - Day 1
INSERT INTO event_ticket_types (id, event_id, session_id, name, description, price, original_price, currency, total_capacity, sold_count, min_per_order, max_per_order, perks, is_active, display_order, badge) VALUES
  ('t1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'General Admission', 'Access to all general areas and stages', 890000, 1200000, 'VND', 4000, 1250, 1, 6, ARRAY['Access to all stages', 'Festival wristband', 'Food court access'], true, 1, 'Best Value'),
  ('t1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'VIP Pass', 'Premium experience with exclusive perks', 2500000, NULL, 'VND', 800, 340, 1, 4, ARRAY['All GA benefits', 'VIP lounge access', 'Priority entry', 'Complimentary drinks', 'Premium viewing area'], true, 2, NULL),
  ('t1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000001', 'Backstage Experience', 'The ultimate festival experience', 5000000, NULL, 'VND', 200, 45, 1, 2, ARRAY['All VIP benefits', 'Backstage tour', 'Artist meet & greet', 'Exclusive merchandise', 'Dedicated host'], true, 3, 'Exclusive');

-- Summer Beats Festival - Day 2
INSERT INTO event_ticket_types (id, event_id, session_id, name, description, price, original_price, currency, total_capacity, sold_count, min_per_order, max_per_order, perks, is_active, display_order, badge) VALUES
  ('t1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000002', 'General Admission', 'Access to all general areas and stages', 990000, 1200000, 'VND', 4000, 2100, 1, 6, ARRAY['Access to all stages', 'Festival wristband', 'Food court access'], true, 1, 'Selling Fast'),
  ('t1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000002', 'VIP Pass', 'Premium experience with exclusive perks', 2800000, NULL, 'VND', 800, 520, 1, 4, ARRAY['All GA benefits', 'VIP lounge access', 'Priority entry', 'Complimentary drinks', 'Premium viewing area'], true, 2, NULL),
  ('t1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000002', 'Backstage Experience', 'The ultimate festival experience', 5500000, NULL, 'VND', 200, 180, 1, 2, ARRAY['All VIP benefits', 'Backstage tour', 'Artist meet & greet', 'Exclusive merchandise', 'Dedicated host'], true, 3, 'Almost Gone');

-- Tech Summit
INSERT INTO event_ticket_types (id, event_id, session_id, name, description, price, original_price, currency, total_capacity, sold_count, min_per_order, max_per_order, perks, is_active, display_order, badge) VALUES
  ('t1000000-0000-0000-0000-000000000007', 'e1000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000003', 'Standard Pass', 'Full conference access', 1500000, 2000000, 'VND', 500, 180, 1, 5, ARRAY['All keynote sessions', 'Lunch included', 'Networking sessions', 'Conference materials'], true, 1, 'Early Bird'),
  ('t1000000-0000-0000-0000-000000000008', 'e1000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000003', 'Premium Pass', 'Conference + workshops', 2500000, NULL, 'VND', 200, 85, 1, 3, ARRAY['All Standard benefits', 'Workshop access', 'Premium seating', 'Speaker dinner invite'], true, 2, NULL),
  ('t1000000-0000-0000-0000-000000000009', 'e1000000-0000-0000-0000-000000000002', 's1000000-0000-0000-0000-000000000003', 'VIP Executive', 'The complete executive experience', 5000000, NULL, 'VND', 100, 22, 1, 2, ARRAY['All Premium benefits', 'Executive lounge', '1-on-1 speaker sessions', 'Private networking', 'VIP dinner'], true, 3, 'Limited');

-- Comedy Night - Early Show
INSERT INTO event_ticket_types (id, event_id, session_id, name, description, price, original_price, currency, total_capacity, sold_count, min_per_order, max_per_order, perks, is_active, display_order, badge) VALUES
  ('t1000000-0000-0000-0000-000000000010', 'e1000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000004', 'Standard Seating', 'Regular show seating', 350000, NULL, 'VND', 80, 45, 1, 8, ARRAY['Show entry', 'Welcome drink'], true, 1, NULL),
  ('t1000000-0000-0000-0000-000000000011', 'e1000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000004', 'Front Row VIP', 'Best seats in the house', 600000, NULL, 'VND', 40, 28, 1, 4, ARRAY['Front row seating', 'Welcome drink', 'Meet the comedians', 'Signed poster'], true, 2, 'Best View');

-- Comedy Night - Late Show
INSERT INTO event_ticket_types (id, event_id, session_id, name, description, price, original_price, currency, total_capacity, sold_count, min_per_order, max_per_order, perks, is_active, display_order, badge) VALUES
  ('t1000000-0000-0000-0000-000000000012', 'e1000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000005', 'Standard Seating', 'Regular show seating', 350000, NULL, 'VND', 80, 62, 1, 8, ARRAY['Show entry', 'Welcome drink'], true, 1, 'Selling Fast'),
  ('t1000000-0000-0000-0000-000000000013', 'e1000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000005', 'Front Row VIP', 'Best seats in the house', 600000, NULL, 'VND', 40, 38, 1, 4, ARRAY['Front row seating', 'Welcome drink', 'Meet the comedians', 'Signed poster'], true, 2, 'Almost Gone');

-- Comedy Night - Saturday Show
INSERT INTO event_ticket_types (id, event_id, session_id, name, description, price, original_price, currency, total_capacity, sold_count, min_per_order, max_per_order, perks, is_active, display_order, badge) VALUES
  ('t1000000-0000-0000-0000-000000000014', 'e1000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000006', 'Standard Seating', 'Regular show seating', 400000, NULL, 'VND', 80, 15, 1, 8, ARRAY['Show entry', 'Welcome drink'], true, 1, NULL),
  ('t1000000-0000-0000-0000-000000000015', 'e1000000-0000-0000-0000-000000000003', 's1000000-0000-0000-0000-000000000006', 'Front Row VIP', 'Best seats in the house', 700000, NULL, 'VND', 40, 8, 1, 4, ARRAY['Front row seating', 'Welcome drink', 'Meet the comedians', 'Signed poster'], true, 2, 'Best View');
