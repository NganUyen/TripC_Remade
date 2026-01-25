-- Flight Service Seed Data
-- Created: 2026-01-25
-- Purpose: Sample data for local testing

-- =====================================================
-- Seed: flights
-- =====================================================
INSERT INTO flights (
  airline_code, airline_name, flight_number,
  origin, origin_name, destination, destination_name,
  departure_at, arrival_at, duration_minutes,
  aircraft, base_price, currency, status,
  seat_classes, amenities, baggage_allowance
) VALUES 
-- SGN to HAN flights
(
  'VN', 'Vietnam Airlines', 'VN210',
  'SGN', 'Tan Son Nhat International Airport', 
  'HAN', 'Noi Bai International Airport',
  '2026-02-20 06:00:00+07', '2026-02-20 08:15:00+07', 135,
  'Airbus A321', 89.99, 'USD', 'scheduled',
  '[
    {"class": "Economy", "seats": 150, "price": 89.99},
    {"class": "Business", "seats": 20, "price": 249.99}
  ]'::jsonb,
  '["WiFi", "Meals", "Entertainment"]'::jsonb,
  '{"checked": "23kg", "carryon": "7kg"}'::jsonb
),
(
  'VJ', 'VietJet Air', 'VJ320',
  'SGN', 'Tan Son Nhat International Airport',
  'HAN', 'Noi Bai International Airport',
  '2026-02-20 08:30:00+07', '2026-02-20 10:45:00+07', 135,
  'Airbus A320', 65.00, 'USD', 'scheduled',
  '[
    {"class": "Economy", "seats": 180, "price": 65.00},
    {"class": "SkyBoss", "seats": 12, "price": 150.00}
  ]'::jsonb,
  '["Snacks Available"]'::jsonb,
  '{"checked": "20kg", "carryon": "7kg"}'::jsonb
),
(
  'VN', 'Vietnam Airlines', 'VN216',
  'SGN', 'Tan Son Nhat International Airport',
  'HAN', 'Noi Bai International Airport',
  '2026-02-20 14:00:00+07', '2026-02-20 16:15:00+07', 135,
  'Boeing 787', 95.00, 'USD', 'scheduled',
  '[
    {"class": "Economy", "seats": 200, "price": 95.00},
    {"class": "Premium Economy", "seats": 24, "price": 180.00},
    {"class": "Business", "seats": 28, "price": 350.00}
  ]'::jsonb,
  '["WiFi", "Meals", "Entertainment", "USB Charging"]'::jsonb,
  '{"checked": "30kg", "carryon": "10kg"}'::jsonb
),

-- HAN to SGN flights
(
  'VN', 'Vietnam Airlines', 'VN211',
  'HAN', 'Noi Bai International Airport',
  'SGN', 'Tan Son Nhat International Airport',
  '2026-02-20 09:00:00+07', '2026-02-20 11:15:00+07', 135,
  'Airbus A321', 89.99, 'USD', 'scheduled',
  '[
    {"class": "Economy", "seats": 150, "price": 89.99},
    {"class": "Business", "seats": 20, "price": 249.99}
  ]'::jsonb,
  '["WiFi", "Meals", "Entertainment"]'::jsonb,
  '{"checked": "23kg", "carryon": "7kg"}'::jsonb
),
(
  'VJ', 'VietJet Air', 'VJ321',
  'HAN', 'Noi Bai International Airport',
  'SGN', 'Tan Son Nhat International Airport',
  '2026-02-20 11:30:00+07', '2026-02-20 13:45:00+07', 135,
  'Airbus A320', 62.00, 'USD', 'scheduled',
  '[
    {"class": "Economy", "seats": 180, "price": 62.00},
    {"class": "SkyBoss", "seats": 12, "price": 145.00}
  ]'::jsonb,
  '["Snacks Available"]'::jsonb,
  '{"checked": "20kg", "carryon": "7kg"}'::jsonb
),

-- SGN to DAD (Da Nang) flights
(
  'VN', 'Vietnam Airlines', 'VN130',
  'SGN', 'Tan Son Nhat International Airport',
  'DAD', 'Da Nang International Airport',
  '2026-02-20 07:00:00+07', '2026-02-20 08:15:00+07', 75,
  'Airbus A321', 55.00, 'USD', 'scheduled',
  '[
    {"class": "Economy", "seats": 150, "price": 55.00},
    {"class": "Business", "seats": 20, "price": 135.00}
  ]'::jsonb,
  '["Snacks", "Entertainment"]'::jsonb,
  '{"checked": "23kg", "carryon": "7kg"}'::jsonb
),
(
  'VJ', 'VietJet Air', 'VJ550',
  'SGN', 'Tan Son Nhat International Airport',
  'DAD', 'Da Nang International Airport',
  '2026-02-20 15:30:00+07', '2026-02-20 16:45:00+07', 75,
  'Airbus A320', 45.00, 'USD', 'scheduled',
  '[
    {"class": "Economy", "seats": 180, "price": 45.00}
  ]'::jsonb,
  '["Snacks Available"]'::jsonb,
  '{"checked": "20kg", "carryon": "7kg"}'::jsonb
),

-- International: SGN to BKK (Bangkok)
(
  'VN', 'Vietnam Airlines', 'VN601',
  'SGN', 'Tan Son Nhat International Airport',
  'BKK', 'Suvarnabhumi Airport',
  '2026-02-21 10:00:00+07', '2026-02-21 11:45:00+07', 105,
  'Airbus A350', 120.00, 'USD', 'scheduled',
  '[
    {"class": "Economy", "seats": 250, "price": 120.00},
    {"class": "Premium Economy", "seats": 30, "price": 220.00},
    {"class": "Business", "seats": 36, "price": 480.00}
  ]'::jsonb,
  '["WiFi", "Meals", "Entertainment", "USB Charging", "Power Outlets"]'::jsonb,
  '{"checked": "30kg", "carryon": "10kg"}'::jsonb
),
(
  'TG', 'Thai Airways', 'TG559',
  'SGN', 'Tan Son Nhat International Airport',
  'BKK', 'Suvarnabhumi Airport',
  '2026-02-21 14:30:00+07', '2026-02-21 16:15:00+07', 105,
  'Boeing 777', 135.00, 'USD', 'scheduled',
  '[
    {"class": "Economy", "seats": 280, "price": 135.00},
    {"class": "Premium Economy", "seats": 24, "price": 245.00},
    {"class": "Business", "seats": 42, "price": 520.00}
  ]'::jsonb,
  '["WiFi", "Meals", "Entertainment", "Premium Lounges"]'::jsonb,
  '{"checked": "30kg", "carryon": "10kg"}'::jsonb
),

-- SGN to SIN (Singapore)
(
  'VN', 'Vietnam Airlines', 'VN661',
  'SGN', 'Tan Son Nhat International Airport',
  'SIN', 'Singapore Changi Airport',
  '2026-02-22 08:00:00+07', '2026-02-22 10:15:00+07', 135,
  'Boeing 787', 150.00, 'USD', 'scheduled',
  '[
    {"class": "Economy", "seats": 200, "price": 150.00},
    {"class": "Premium Economy", "seats": 24, "price": 280.00},
    {"class": "Business", "seats": 28, "price": 580.00}
  ]'::jsonb,
  '["WiFi", "Meals", "Entertainment", "USB Charging"]'::jsonb,
  '{"checked": "30kg", "carryon": "10kg"}'::jsonb
);

-- =====================================================
-- Seed: flight_offers
-- Generate offers for each flight
-- =====================================================
WITH inserted_flights AS (
  SELECT id, origin, destination, departure_at, airline_code, flight_number, base_price, currency
  FROM flights
  WHERE created_at >= now() - interval '1 minute'
)
INSERT INTO flight_offers (
  offer_key, flight_id, total_price, currency, 
  seats_available, cabin_class, fare_type, provider, valid_until
)
SELECT 
  origin || '_' || destination || '_' || to_char(departure_at, 'YYYYMMDD') || '_' || airline_code || flight_number || '_ECO_STD' as offer_key,
  id as flight_id,
  base_price as total_price,
  currency,
  50 as seats_available, -- Simulated availability
  'Economy' as cabin_class,
  'Standard' as fare_type,
  'internal' as provider,
  departure_at - interval '2 hours' as valid_until
FROM inserted_flights
UNION ALL
SELECT 
  origin || '_' || destination || '_' || to_char(departure_at, 'YYYYMMDD') || '_' || airline_code || flight_number || '_ECO_FLEX' as offer_key,
  id as flight_id,
  base_price * 1.3 as total_price,
  currency,
  30 as seats_available,
  'Economy' as cabin_class,
  'Flexible' as fare_type,
  'internal' as provider,
  departure_at - interval '2 hours' as valid_until
FROM inserted_flights
UNION ALL
SELECT 
  origin || '_' || destination || '_' || to_char(departure_at, 'YYYYMMDD') || '_' || airline_code || flight_number || '_BIZ_STD' as offer_key,
  id as flight_id,
  base_price * 2.5 as total_price,
  currency,
  15 as seats_available,
  'Business' as cabin_class,
  'Standard' as fare_type,
  'internal' as provider,
  departure_at - interval '2 hours' as valid_until
FROM inserted_flights
WHERE base_price > 80; -- Only create business offers for flights with higher base prices

-- =====================================================
-- Verification queries (commented out)
-- =====================================================
-- SELECT COUNT(*) FROM flights;
-- SELECT COUNT(*) FROM flight_offers;
-- SELECT f.*, fo.* FROM flights f 
-- JOIN flight_offers fo ON f.id = fo.flight_id 
-- WHERE f.origin = 'SGN' AND f.destination = 'HAN' 
-- LIMIT 5;
