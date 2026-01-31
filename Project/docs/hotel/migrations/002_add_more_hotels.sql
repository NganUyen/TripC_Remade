-- ============================================================================
-- Hotel Service - Additional Hotel Seed Data
-- Add 20+ hotels across major Vietnamese cities
-- ============================================================================
-- Purpose: Expand hotel inventory for realistic testing and demonstration
-- Run this AFTER 001_create_hotel_schema.sql
-- ============================================================================

-- Insert additional hotels across Vietnam
INSERT INTO hotels (slug, name, description, address, star_rating, images, amenities, policies) VALUES

-- HANOI HOTELS (5 hotels)
(
  'sofitel-legend-metropole-hanoi',
  'Sofitel Legend Metropole Hanoi',
  'Historic luxury hotel in the heart of Hanoi with French colonial architecture and modern amenities',
  '{"line1": "15 Ngo Quyen Street", "line2": "Hoan Kiem District", "city": "Hanoi", "country": "Vietnam", "postal_code": "100000", "lat": 21.0245, "lng": 105.8527}'::jsonb,
  5,
  '["https://images.unsplash.com/photo-1566073771259-6a8506099945", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa"]'::jsonb,
  '["wifi", "pool", "gym", "spa", "restaurant", "bar", "concierge", "room_service", "parking", "business_center"]'::jsonb,
  '{"check_in": "15:00", "check_out": "12:00", "cancellation": "flexible", "pets": false, "smoking": false}'::jsonb
),
(
  'lotte-hotel-hanoi',
  'Lotte Hotel Hanoi',
  'Modern 5-star hotel offering panoramic city views from the highest building in Hanoi',
  '{"line1": "54 Lieu Giai Street", "line2": "Ba Dinh District", "city": "Hanoi", "country": "Vietnam", "postal_code": "100000", "lat": 21.0278, "lng": 105.8342}'::jsonb,
  5,
  '["https://images.unsplash.com/photo-1618773928121-c32242e63f39", "https://images.unsplash.com/photo-1584132967334-10e028bd69f7", "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f"]'::jsonb,
  '["wifi", "pool", "gym", "spa", "restaurant", "bar", "sky_lounge", "executive_lounge", "parking"]'::jsonb,
  '{"check_in": "14:00", "check_out": "12:00", "cancellation": "moderate", "pets": false, "smoking": false}'::jsonb
),
(
  'hanoi-la-siesta-central-hotel',
  'Hanoi La Siesta Central Hotel & Spa',
  'Boutique hotel in the Old Quarter with rooftop bar and excellent breakfast',
  '{"line1": "94 Hang Trong Street", "line2": "Hoan Kiem District", "city": "Hanoi", "country": "Vietnam", "postal_code": "100000", "lat": 21.0300, "lng": 105.8520}'::jsonb,
  4,
  '["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4", "https://images.unsplash.com/photo-1571896349842-33c89424de2d", "https://images.unsplash.com/photo-1578683010236-d716f9a3f461"]'::jsonb,
  '["wifi", "spa", "restaurant", "bar", "rooftop_bar", "airport_shuttle", "tour_desk"]'::jsonb,
  '{"check_in": "14:00", "check_out": "12:00", "cancellation": "flexible", "pets": false, "smoking": false}'::jsonb
),
(
  'hotel-de-loperahanoi-mgallery',
  'Hotel de l''Opera Hanoi - MGallery',
  'Elegant French colonial style hotel near the Opera House',
  '{"line1": "29 Trang Tien Street", "line2": "Hoan Kiem District", "city": "Hanoi", "country": "Vietnam", "postal_code": "100000", "lat": 21.0240, "lng": 105.8560}'::jsonb,
  5,
  '["https://images.unsplash.com/photo-1455587734955-081b22074882", "https://images.unsplash.com/photo-1564501049412-61c2a3083791", "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6"]'::jsonb,
  '["wifi", "pool", "gym", "spa", "restaurant", "bar", "concierge", "butler_service"]'::jsonb,
  '{"check_in": "15:00", "check_out": "12:00", "cancellation": "strict", "pets": false, "smoking": false}'::jsonb
),
(
  'hanoi-royal-palace-hotel',
  'Hanoi Royal Palace Hotel 2',
  'Modern hotel in Old Quarter with excellent service and comfortable rooms',
  '{"line1": "45-47 Hang Giay Street", "line2": "Hoan Kiem District", "city": "Hanoi", "country": "Vietnam", "postal_code": "100000", "lat": 21.0320, "lng": 105.8515}'::jsonb,
  3,
  '["https://images.unsplash.com/photo-1561501900-3701fa6a0864", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267", "https://images.unsplash.com/photo-1590490360182-c33d57733427"]'::jsonb,
  '["wifi", "restaurant", "airport_shuttle", "tour_desk", "laundry"]'::jsonb,
  '{"check_in": "14:00", "check_out": "12:00", "cancellation": "flexible", "pets": false, "smoking": false}'::jsonb
),

-- HO CHI MINH CITY HOTELS (5 hotels)
(
  'park-hyatt-saigon',
  'Park Hyatt Saigon',
  'Luxury hotel in the heart of District 1 with colonial charm and modern elegance',
  '{"line1": "2 Lam Son Square", "line2": "District 1", "city": "Ho Chi Minh City", "country": "Vietnam", "postal_code": "700000", "lat": 10.7769, "lng": 106.7009}'::jsonb,
  5,
  '["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb", "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9", "https://images.unsplash.com/photo-1584132967334-10e028bd69f7"]'::jsonb,
  '["wifi", "pool", "gym", "spa", "restaurant", "bar", "concierge", "room_service", "parking", "executive_lounge"]'::jsonb,
  '{"check_in": "15:00", "check_out": "12:00", "cancellation": "moderate", "pets": false, "smoking": false}'::jsonb
),
(
  'reverie-saigon',
  'The Reverie Saigon',
  'Opulent Italian-style luxury hotel with lavish interiors and Michelin-star dining',
  '{"line1": "22-36 Nguyen Hue Boulevard", "line2": "District 1", "city": "Ho Chi Minh City", "country": "Vietnam", "postal_code": "700000", "lat": 10.7743, "lng": 106.7041}'::jsonb,
  5,
  '["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", "https://images.unsplash.com/photo-1590381105924-c32242e63f3f"]'::jsonb,
  '["wifi", "pool", "gym", "spa", "restaurant", "bar", "michelin_star", "helipad", "concierge", "butler_service"]'::jsonb,
  '{"check_in": "15:00", "check_out": "12:00", "cancellation": "strict", "pets": false, "smoking": false}'::jsonb
),
(
  'intercontinental-saigon',
  'InterContinental Saigon',
  'Riverside luxury hotel with stunning Saigon River views',
  '{"line1": "Corner of Hai Ba Trung & Le Duan", "line2": "District 1", "city": "Ho Chi Minh City", "country": "Vietnam", "postal_code": "700000", "lat": 10.7878, "lng": 106.7047}'::jsonb,
  5,
  '["https://images.unsplash.com/photo-1566073771259-6a8506099945", "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6", "https://images.unsplash.com/photo-1578683010236-d716f9a3f461"]'::jsonb,
  '["wifi", "pool", "gym", "spa", "restaurant", "bar", "riverside_view", "parking", "business_center"]'::jsonb,
  '{"check_in": "14:00", "check_out": "12:00", "cancellation": "flexible", "pets": false, "smoking": false}'::jsonb
),
(
  'liberty-central-saigon-riverside',
  'Liberty Central Saigon Riverside Hotel',
  'Contemporary hotel on the riverfront with rooftop pool and city views',
  '{"line1": "17 Ton Duc Thang Street", "line2": "District 1", "city": "Ho Chi Minh City", "country": "Vietnam", "postal_code": "700000", "lat": 10.7739, "lng": 106.7068}'::jsonb,
  4,
  '["https://images.unsplash.com/photo-1455587734955-081b22074882", "https://images.unsplash.com/photo-1564501049412-61c2a3083791", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"]'::jsonb,
  '["wifi", "rooftop_pool", "gym", "restaurant", "bar", "riverside_view", "parking"]'::jsonb,
  '{"check_in": "14:00", "check_out": "12:00", "cancellation": "flexible", "pets": false, "smoking": false}'::jsonb
),
(
  'alagon-saigon-hotel',
  'Alagon Saigon Hotel & Spa',
  'Boutique hotel in District 1 with spa facilities and warm hospitality',
  '{"line1": "204-206 Le Thanh Ton Street", "line2": "District 1", "city": "Ho Chi Minh City", "country": "Vietnam", "postal_code": "700000", "lat": 10.7802, "lng": 106.6989}'::jsonb,
  4,
  '["https://images.unsplash.com/photo-1561501900-3701fa6a0864", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267", "https://images.unsplash.com/photo-1590490360182-c33d57733427"]'::jsonb,
  '["wifi", "spa", "gym", "restaurant", "bar", "airport_shuttle"]'::jsonb,
  '{"check_in": "14:00", "check_out": "12:00", "cancellation": "flexible", "pets": false, "smoking": false}'::jsonb
),

-- DA NANG HOTELS (4 hotels)
(
  'intercontinental-danang-sun-peninsula',
  'InterContinental Danang Sun Peninsula Resort',
  'Award-winning clifftop resort designed by Bill Bensley with private beach',
  '{"line1": "Bai Bac", "line2": "Son Tra Peninsula", "city": "Da Nang", "country": "Vietnam", "postal_code": "550000", "lat": 16.1067, "lng": 108.2644}'::jsonb,
  5,
  '["https://images.unsplash.com/photo-1571896349842-33c89424de2d", "https://images.unsplash.com/photo-1618773928121-c32242e63f39", "https://images.unsplash.com/photo-1584132967334-10e028bd69f7"]'::jsonb,
  '["wifi", "private_beach", "pool", "gym", "spa", "restaurant", "bar", "water_sports", "kids_club"]'::jsonb,
  '{"check_in": "15:00", "check_out": "12:00", "cancellation": "moderate", "pets": false, "smoking": false}'::jsonb
),
(
  'hyatt-regency-danang',
  'Hyatt Regency Danang Resort and Spa',
  'Beachfront luxury resort with lagoon-style pools and award-winning spa',
  '{"line1": "5 Truong Sa Street", "line2": "Hoa Hai", "city": "Da Nang", "country": "Vietnam", "postal_code": "550000", "lat": 16.0019, "lng": 108.2514}'::jsonb,
  5,
  '["https://images.unsplash.com/photo-1590381105924-c32242e63f3f", "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"]'::jsonb,
  '["wifi", "beach_access", "pool", "gym", "spa", "restaurant", "bar", "water_sports", "kids_club"]'::jsonb,
  '{"check_in": "15:00", "check_out": "12:00", "cancellation": "flexible", "pets": false, "smoking": false}'::jsonb
),
(
  'four-points-by-sheraton-danang',
  'Four Points by Sheraton Danang',
  'Modern beachfront hotel with direct beach access and family-friendly facilities',
  '{"line1": "118-120 Vo Nguyen Giap Street", "line2": "Phuoc My", "city": "Da Nang", "country": "Vietnam", "postal_code": "550000", "lat": 16.0401, "lng": 108.2508}'::jsonb,
  5,
  '["https://images.unsplash.com/photo-1596394516093-501ba68a0ba6", "https://images.unsplash.com/photo-1578683010236-d716f9a3f461", "https://images.unsplash.com/photo-1455587734955-081b22074882"]'::jsonb,
  '["wifi", "beach_access", "pool", "gym", "restaurant", "bar", "kids_club", "parking"]'::jsonb,
  '{"check_in": "14:00", "check_out": "12:00", "cancellation": "flexible", "pets": false, "smoking": false}'::jsonb
),
(
  'novotel-danang-premier-han-river',
  'Novotel Danang Premier Han River',
  'Contemporary hotel along the Han River with rooftop bar and infinity pool',
  '{"line1": "36 Bach Dang Street", "line2": "Hai Chau", "city": "Da Nang", "country": "Vietnam", "postal_code": "550000", "lat": 16.0679, "lng": 108.2226}'::jsonb,
  4,
  '["https://images.unsplash.com/photo-1564501049412-61c2a3083791", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4", "https://images.unsplash.com/photo-1561501900-3701fa6a0864"]'::jsonb,
  '["wifi", "rooftop_pool", "gym", "restaurant", "bar", "river_view", "parking"]'::jsonb,
  '{"check_in": "14:00", "check_out": "12:00", "cancellation": "flexible", "pets": false, "smoking": false}'::jsonb
),

-- NHA TRANG HOTELS (3 hotels)
(
  'vinpearl-resort-nha-trang',
  'Vinpearl Resort Nha Trang',
  'Island resort accessible by cable car with theme park and water park access',
  '{"line1": "Hon Tre Island", "city": "Nha Trang", "country": "Vietnam", "postal_code": "650000", "lat": 12.2163, "lng": 109.2132}'::jsonb,
  5,
  '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267", "https://images.unsplash.com/photo-1590490360182-c33d57733427", "https://images.unsplash.com/photo-1571896349842-33c89424de2d"]'::jsonb,
  '["wifi", "beach_access", "pool", "gym", "spa", "restaurant", "bar", "water_park", "theme_park", "cable_car"]'::jsonb,
  '{"check_in": "14:00", "check_out": "12:00", "cancellation": "moderate", "pets": false, "smoking": false}'::jsonb
),
(
  'six-senses-ninh-van-bay',
  'Six Senses Ninh Van Bay',
  'Exclusive beach resort accessible only by boat, offering luxury villas',
  '{"line1": "Ninh Van Bay", "city": "Nha Trang", "country": "Vietnam", "postal_code": "650000", "lat": 12.3847, "lng": 109.2339}'::jsonb,
  5,
  '["https://images.unsplash.com/photo-1618773928121-c32242e63f39", "https://images.unsplash.com/photo-1584132967334-10e028bd69f7", "https://images.unsplash.com/photo-1590381105924-c32242e63f3f"]'::jsonb,
  '["wifi", "private_beach", "pool", "spa", "restaurant", "bar", "water_sports", "yoga", "boat_transfer"]'::jsonb,
  '{"check_in": "15:00", "check_out": "12:00", "cancellation": "strict", "pets": false, "smoking": false}'::jsonb
),
(
  'sheraton-nha-trang-hotel',
  'Sheraton Nha Trang Hotel & Spa',
  'Beachfront hotel with stunning ocean views and rooftop infinity pool',
  '{"line1": "26-28 Tran Phu Street", "city": "Nha Trang", "country": "Vietnam", "postal_code": "650000", "lat": 12.2441, "lng": 109.1932}'::jsonb,
  5,
  '["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6"]'::jsonb,
  '["wifi", "beach_access", "rooftop_pool", "gym", "spa", "restaurant", "bar", "parking"]'::jsonb,
  '{"check_in": "15:00", "check_out": "12:00", "cancellation": "flexible", "pets": false, "smoking": false}'::jsonb
),

-- HOI AN HOTELS (2 hotels)
(
  'anantara-hoi-an-resort',
  'Anantara Hoi An Resort',
  'Riverside resort blending traditional Vietnamese architecture with luxury amenities',
  '{"line1": "1 Pham Hong Thai Street", "city": "Hoi An", "country": "Vietnam", "postal_code": "560000", "lat": 15.8801, "lng": 108.3380}'::jsonb,
  5,
  '["https://images.unsplash.com/photo-1578683010236-d716f9a3f461", "https://images.unsplash.com/photo-1455587734955-081b22074882", "https://images.unsplash.com/photo-1564501049412-61c2a3083791"]'::jsonb,
  '["wifi", "pool", "gym", "spa", "restaurant", "bar", "riverside_view", "cooking_class", "bicycle"]'::jsonb,
  '{"check_in": "15:00", "check_out": "12:00", "cancellation": "moderate", "pets": false, "smoking": false}'::jsonb
),
(
  'four-seasons-resort-the-nam-hai',
  'Four Seasons Resort The Nam Hai, Hoi An',
  'Beachfront luxury resort with private villas and world-class spa',
  '{"line1": "Hamlet 1, Dien Duong Village", "line2": "Dien Ban", "city": "Hoi An", "country": "Vietnam", "postal_code": "560000", "lat": 15.9389, "lng": 108.2683}'::jsonb,
  5,
  '["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4", "https://images.unsplash.com/photo-1561501900-3701fa6a0864", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"]'::jsonb,
  '["wifi", "beach_access", "pool", "gym", "spa", "restaurant", "bar", "water_sports", "cooking_class", "yoga"]'::jsonb,
  '{"check_in": "15:00", "check_out": "12:00", "cancellation": "strict", "pets": false, "smoking": false}'::jsonb
),

-- PHU QUOC HOTELS (2 hotels)
(
  'jw-marriott-phu-quoc',
  'JW Marriott Phu Quoc Emerald Bay Resort & Spa',
  'Award-winning beachfront resort designed by Bill Bensley with vintage French university theme',
  '{"line1": "Khem Beach", "line2": "An Thoi", "city": "Phu Quoc", "country": "Vietnam", "postal_code": "920000", "lat": 10.1411, "lng": 103.9628}'::jsonb,
  5,
  '["https://images.unsplash.com/photo-1590490360182-c33d57733427", "https://images.unsplash.com/photo-1571896349842-33c89424de2d", "https://images.unsplash.com/photo-1618773928121-c32242e63f39"]'::jsonb,
  '["wifi", "beach_access", "pool", "gym", "spa", "restaurant", "bar", "water_sports", "kids_club"]'::jsonb,
  '{"check_in": "15:00", "check_out": "12:00", "cancellation": "moderate", "pets": false, "smoking": false}'::jsonb
),
(
  'intercontinental-phu-quoc-long-beach',
  'InterContinental Phu Quoc Long Beach Resort',
  'Beachfront luxury resort with long stretch of pristine beach and sunset views',
  '{"line1": "Bai Truong", "line2": "Duong To", "city": "Phu Quoc", "country": "Vietnam", "postal_code": "920000", "lat": 10.2269, "lng": 103.9652}'::jsonb,
  5,
  '["https://images.unsplash.com/photo-1584132967334-10e028bd69f7", "https://images.unsplash.com/photo-1590381105924-c32242e63f3f", "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa"]'::jsonb,
  '["wifi", "beach_access", "pool", "gym", "spa", "restaurant", "bar", "water_sports", "kids_club"]'::jsonb,
  '{"check_in": "14:00", "check_out": "12:00", "cancellation": "flexible", "pets": false, "smoking": false}'::jsonb
),

-- DA LAT HOTELS (2 hotels)
(
  'dalat-palace-heritage-hotel',
  'Dalat Palace Heritage Hotel',
  'Historic 1922 hotel with colonial charm and lakeside setting',
  '{"line1": "2 Tran Phu Street", "city": "Da Lat", "country": "Vietnam", "postal_code": "670000", "lat": 11.9344, "lng": 108.4419}'::jsonb,
  5,
  '["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6", "https://images.unsplash.com/photo-1578683010236-d716f9a3f461"]'::jsonb,
  '["wifi", "golf_course", "spa", "restaurant", "bar", "lake_view", "fireplace", "heritage"]'::jsonb,
  '{"check_in": "14:00", "check_out": "12:00", "cancellation": "flexible", "pets": false, "smoking": false}'::jsonb
),
(
  'terracotta-hotel-resort-dalat',
  'Terracotta Hotel & Resort Dalat',
  'Mediterranean-style resort with pine forest views and valley setting',
  '{"line1": "Zone 1, Tuyen Lam Lake Tourism Area", "city": "Da Lat", "country": "Vietnam", "postal_code": "670000", "lat": 11.9019, "lng": 108.4072}'::jsonb,
  4,
  '["https://images.unsplash.com/photo-1455587734955-081b22074882", "https://images.unsplash.com/photo-1564501049412-61c2a3083791", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"]'::jsonb,
  '["wifi", "pool", "spa", "restaurant", "bar", "valley_view", "garden", "fireplace"]'::jsonb,
  '{"check_in": "14:00", "check_out": "12:00", "cancellation": "flexible", "pets": false, "smoking": false}'::jsonb
)

ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Add rooms for new hotels
-- ============================================================================

WITH hotel_ids AS (
  SELECT id, slug FROM hotels WHERE slug NOT IN ('grand-saigon-hotel', 'hanoi-pearl-hotel', 'danang-beach-resort')
)
INSERT INTO hotel_rooms (hotel_id, code, title, description, capacity, bed_type, bed_count, size_sqm, amenities, max_adults, max_children, is_accessible)
SELECT 
  h.id,
  room_data.code,
  room_data.title,
  room_data.description,
  room_data.capacity,
  room_data.bed_type,
  room_data.bed_count,
  room_data.size_sqm,
  room_data.amenities,
  room_data.max_adults,
  room_data.max_children,
  room_data.is_accessible
FROM hotel_ids h
CROSS JOIN LATERAL (
  VALUES
    ('STANDARD', 'Standard Room', 'Comfortable room with essential amenities and city views', 2, 'queen', 1, 25.0, '["wifi", "tv", "safe", "minibar", "coffee_maker"]'::jsonb, 2, 1, false),
    ('DELUXE', 'Deluxe Room', 'Spacious room with premium amenities and enhanced comfort', 2, 'king', 1, 35.0, '["wifi", "tv", "safe", "minibar", "coffee_maker", "bathtub", "balcony"]'::jsonb, 2, 1, false),
    ('SUITE', 'Executive Suite', 'Luxurious suite with separate living area and premium services', 4, 'king', 1, 55.0, '["wifi", "tv", "safe", "minibar", "coffee_maker", "bathtub", "balcony", "living_room", "dining_area"]'::jsonb, 3, 2, true),
    ('FAMILY', 'Family Room', 'Spacious room perfect for families with multiple beds', 4, 'twin', 2, 45.0, '["wifi", "tv", "safe", "minibar", "coffee_maker", "extra_bed"]'::jsonb, 2, 2, false)
) AS room_data(code, title, description, capacity, bed_type, bed_count, size_sqm, amenities, max_adults, max_children, is_accessible);

-- ============================================================================
-- Link new hotels to partners
-- ============================================================================

WITH hotel_ids AS (
  SELECT id, slug FROM hotels WHERE slug NOT IN ('grand-saigon-hotel', 'hanoi-pearl-hotel', 'danang-beach-resort')
),
partner_ids AS (
  SELECT id, code FROM hotel_partners
)
INSERT INTO hotel_partner_listings (hotel_id, partner_id, partner_hotel_id, is_active)
SELECT 
  h.id,
  p.id,
  CONCAT(p.code, '_', h.slug),
  true
FROM hotel_ids h
CROSS JOIN partner_ids p
ON CONFLICT (hotel_id, partner_id) DO NOTHING;

-- ============================================================================
-- Add rates for new hotels (next 60 days)
-- ============================================================================

WITH room_ids AS (
  SELECT r.id as room_id, r.hotel_id, r.code as room_code, h.slug as hotel_slug
  FROM hotel_rooms r
  JOIN hotels h ON h.id = r.hotel_id
  WHERE h.slug NOT IN ('grand-saigon-hotel', 'hanoi-pearl-hotel', 'danang-beach-resort')
),
partner_ids AS (
  SELECT id, code, commission_rate FROM hotel_partners
)
INSERT INTO hotel_rates (
  room_id, 
  partner_id, 
  date, 
  price_cents, 
  original_price_cents,
  discount_percentage,
  currency, 
  available_rooms, 
  refundable, 
  breakfast_included,
  is_best_price,
  tcent_earn_rate,
  tcent_eligible
)
SELECT 
  r.room_id,
  p.id,
  CURRENT_DATE + i,
  -- Base price varies by room type, day, and partner
  CASE 
    -- Weekend pricing (higher)
    WHEN i % 7 IN (5, 6) THEN
      CASE r.room_code
        WHEN 'STANDARD' THEN 12000 + (p.commission_rate * 12000)::integer
        WHEN 'DELUXE' THEN 18000 + (p.commission_rate * 18000)::integer
        WHEN 'SUITE' THEN 30000 + (p.commission_rate * 30000)::integer
        WHEN 'FAMILY' THEN 22000 + (p.commission_rate * 22000)::integer
      END
    -- Weekday pricing
    ELSE
      CASE r.room_code
        WHEN 'STANDARD' THEN 9000 + (p.commission_rate * 9000)::integer
        WHEN 'DELUXE' THEN 13500 + (p.commission_rate * 13500)::integer
        WHEN 'SUITE' THEN 24000 + (p.commission_rate * 24000)::integer
        WHEN 'FAMILY' THEN 17000 + (p.commission_rate * 17000)::integer
      END
  END,
  -- Original price (before discount)
  CASE 
    WHEN i % 7 IN (5, 6) THEN
      CASE r.room_code
        WHEN 'STANDARD' THEN 15000
        WHEN 'DELUXE' THEN 22000
        WHEN 'SUITE' THEN 38000
        WHEN 'FAMILY' THEN 28000
      END
    ELSE
      CASE r.room_code
        WHEN 'STANDARD' THEN 11000
        WHEN 'DELUXE' THEN 17000
        WHEN 'SUITE' THEN 30000
        WHEN 'FAMILY' THEN 21000
      END
  END,
  -- Discount percentage (varies by partner)
  CASE p.code
    WHEN 'DIRECT' THEN 0.00
    WHEN 'AGODA' THEN 12.00
    WHEN 'BOOKING_COM' THEN 18.00
    WHEN 'EXPEDIA' THEN 15.00
    WHEN 'HOTELS_COM' THEN 10.00
  END,
  'USD',
  CASE 
    WHEN i % 7 IN (5, 6) THEN 3  -- Less availability on weekends
    WHEN i < 7 THEN 8  -- Good availability next week
    ELSE 6  -- Normal availability
  END,
  true,  -- refundable
  CASE p.code
    WHEN 'DIRECT' THEN true  -- Direct bookings include breakfast
    ELSE false
  END,
  false,  -- is_best_price (will be calculated)
  CASE p.code
    WHEN 'DIRECT' THEN 0.10  -- 10% TCent for direct bookings
    ELSE 0.05  -- 5% TCent for partner bookings
  END,
  true  -- tcent_eligible
FROM room_ids r
CROSS JOIN partner_ids p
CROSS JOIN generate_series(0, 59) AS i;

-- ============================================================================
-- Update is_best_price flag for each room/date combination
-- ============================================================================

WITH best_prices AS (
  SELECT 
    room_id,
    date,
    MIN(price_cents) as min_price
  FROM hotel_rates
  WHERE date >= CURRENT_DATE
  GROUP BY room_id, date
)
UPDATE hotel_rates hr
SET is_best_price = true
FROM best_prices bp
WHERE hr.room_id = bp.room_id
  AND hr.date = bp.date
  AND hr.price_cents = bp.min_price
  AND hr.date >= CURRENT_DATE;

-- ============================================================================
-- DEPLOYMENT NOTES
-- ============================================================================
-- 1. Run this in Supabase SQL Editor AFTER running 001_create_hotel_schema.sql
-- 2. This adds 22 hotels across 7 major Vietnamese cities:
--    - Hanoi: 5 hotels
--    - Ho Chi Minh City: 5 hotels
--    - Da Nang: 4 hotels
--    - Nha Trang: 3 hotels
--    - Hoi An: 2 hotels
--    - Phu Quoc: 2 hotels
--    - Da Lat: 2 hotels
-- 3. Each hotel has 4 room types with rates for next 60 days
-- 4. Total new records:
--    - 22 hotels
--    - 88 rooms (22 hotels × 4 room types)
--    - 110 partner listings (22 hotels × 5 partners)
--    - 26,400 rate records (88 rooms × 5 partners × 60 days)
-- ============================================================================
