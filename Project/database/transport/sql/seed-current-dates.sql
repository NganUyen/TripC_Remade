-- Quick seed script for RECENT DATES (Today + Next 7 Days)
-- Run this AFTER running the main schema.sql

-- Clear existing route data (if re-seeding)
TRUNCATE transport_routes CASCADE;

-- Routes with CURRENT_DATE for testing
-- Hanoi -> Sapa (Today and Tomorrow)
INSERT INTO transport_routes (provider_id, type, vehicle_type, origin, destination, departure_time, arrival_time, price, seats_available, vehicle_details, images) VALUES
-- Today's departures
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'private_car', '4 seats', 'Hanoi', 'Sapa', CURRENT_DATE + INTERVAL '8 hours', CURRENT_DATE + INTERVAL '13 hours', 2500000, 3, '{"wifi": true, "ac": true}', ARRAY['https://images.unsplash.com/photo-1583932003668-aced705e6cf8?w=800']),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'private_car', '4 seats', 'Hanoi', 'Sapa', CURRENT_DATE + INTERVAL '9 hours 30 minutes', CURRENT_DATE + INTERVAL '14 hours 30 minutes', 2400000, 4, '{"wifi": true, "ac": true}', ARRAY['https://images.unsplash.com/photo-1552550049-db097c9480d1?w=800']),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'private_car', '7 seats', 'Hanoi', 'Sapa', CURRENT_DATE + INTERVAL '7 hours', CURRENT_DATE + INTERVAL '12 hours 30 minutes', 3200000, 6, '{"wifi": true, "ac": true}', ARRAY['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800']),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'limousine', 'limousine 9 seats', 'Hanoi', 'Sapa', CURRENT_DATE + INTERVAL '7 hours 30 minutes', CURRENT_DATE + INTERVAL '12 hours 30 minutes', 450000, 8, '{"wifi": true, "massage_chairs": true}', ARRAY['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800']),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'limousine', 'limousine 9 seats', 'Hanoi', 'Sapa', CURRENT_DATE + INTERVAL '14 hours', CURRENT_DATE + INTERVAL '19 hours', 480000, 7, '{"wifi": true, "usb": true}', ARRAY['https://images.unsplash.com/photo-1563720223185-11003d516935?w=800']),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'bus', '29 seats', 'Hanoi', 'Sapa', CURRENT_DATE + INTERVAL '21 hours', CURRENT_DATE + INTERVAL '1 day 2 hours', 280000, 20, '{"type": "sleeping_bus"}', ARRAY['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800']),

-- Tomorrow's departures
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'private_car', '4 seats', 'Hanoi', 'Sapa', CURRENT_DATE + INTERVAL '1 day 8 hours', CURRENT_DATE + INTERVAL '1 day 13 hours', 2500000, 3, '{"wifi": true, "ac": true}', ARRAY['https://images.unsplash.com/photo-1583932003668-aced705e6cf8?w=800']),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'limousine', 'limousine 9 seats', 'Hanoi', 'Sapa', CURRENT_DATE + INTERVAL '1 day 7 hours', CURRENT_DATE + INTERVAL '1 day 12 hours', 450000, 9, '{"wifi": true}', ARRAY['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800']);

-- Hanoi -> Ha Long (Today and Tomorrow - High volume)
INSERT INTO transport_routes (provider_id, type, vehicle_type, origin, destination, departure_time, arrival_time, price, seats_available, vehicle_details, images) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'limousine', 'limousine 9 seats', 'Hanoi', 'Ha Long', CURRENT_DATE + INTERVAL '7 hours', CURRENT_DATE + INTERVAL '10 hours', 300000, 9, '{"wifi": true}', ARRAY['https://images.unsplash.com/photo-1461695008884-244cb4543d74?w=800']),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'limousine', 'limousine 9 seats', 'Hanoi', 'Ha Long', CURRENT_DATE + INTERVAL '8 hours', CURRENT_DATE + INTERVAL '11 hours', 300000, 8, '{"wifi": true}', ARRAY['https://images.unsplash.com/photo-1461695008884-244cb4543d74?w=800']),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'limousine', 'limousine 9 seats', 'Hanoi', 'Ha Long', CURRENT_DATE + INTERVAL '9 hours', CURRENT_DATE + INTERVAL '12 hours', 300000, 9, '{"wifi": true}', ARRAY['https://images.unsplash.com/photo-1461695008884-244cb4543d74?w=800']),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'bus', '45 seats', 'Hanoi', 'Ha Long', CURRENT_DATE + INTERVAL '7 hours 30 minutes', CURRENT_DATE + INTERVAL '11 hours 30 minutes', 150000, 40, '{"wifi": false}', ARRAY['https://images.unsplash.com/photo-1526165182181-4669cf7ec8bd?w=800']),
-- Tomorrow
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'limousine', 'limousine 9 seats', 'Hanoi', 'Ha Long', CURRENT_DATE + INTERVAL '1 day 7 hours', CURRENT_DATE + INTERVAL '1 day 10 hours', 300000, 9, '{"wifi": true}', ARRAY['https://images.unsplash.com/photo-1461695008884-244cb4543d74?w=800']),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'bus', '45 seats', 'Hanoi', 'Ha Long', CURRENT_DATE + INTERVAL '1 day 8 hours', CURRENT_DATE + INTERVAL '1 day 12 hours', 150000, 40, '{"wifi": false}', ARRAY['https://images.unsplash.com/photo-1526165182181-4669cf7ec8bd?w=800']);

-- Ho Chi Minh -> Da Lat (Today)
INSERT INTO transport_routes (provider_id, type, vehicle_type, origin, destination, departure_time, arrival_time, price, seats_available, vehicle_details, images) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'limousine', 'limousine 9 seats', 'Ho Chi Minh', 'Da Lat', CURRENT_DATE + INTERVAL '8 hours', CURRENT_DATE + INTERVAL '14 hours', 350000, 5, '{"wifi": true}', ARRAY['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800']),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'private_car', '7 seats', 'Ho Chi Minh', 'Da Lat', CURRENT_DATE + INTERVAL '6 hours', CURRENT_DATE + INTERVAL '11 hours 30 minutes', 2200000, 7, '{"ac": true}', ARRAY['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800']),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'bus', '45 seats', 'Ho Chi Minh', 'Da Lat', CURRENT_DATE + INTERVAL '23 hours', CURRENT_DATE + INTERVAL '1 day 5 hours', 250000, 40, '{"wifi": true}', ARRAY['https://images.unsplash.com/photo-1526165182181-4669cf7ec8bd?w=800']),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'private_car', '4 seats', 'Ho Chi Minh', 'Da Lat', CURRENT_DATE + INTERVAL '9 hours', CURRENT_DATE + INTERVAL '14 hours', 1800000, 4, '{"ac": true}', ARRAY['https://images.unsplash.com/photo-1552550049-db097c9480d1?w=800']);

-- Da Nang -> Hue (Tomorrow)
INSERT INTO transport_routes (provider_id, type, vehicle_type, origin, destination, departure_time, arrival_time, price, seats_available, vehicle_details, images) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'private_car', '4 seats', 'Da Nang', 'Hue', CURRENT_DATE + INTERVAL '1 day 8 hours', CURRENT_DATE + INTERVAL '1 day 10 hours', 1200000, 4, '{"ac": true}', ARRAY['https://images.unsplash.com/photo-1552550049-db097c9480d1?w=800']),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'private_car', '7 seats', 'Da Nang', 'Hue', CURRENT_DATE + INTERVAL '1 day 10 hours', CURRENT_DATE + INTERVAL '1 day 12 hours', 1500000, 7, '{"ac": true}', ARRAY['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800']),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'bus', '16 seats', 'Da Nang', 'Hue', CURRENT_DATE + INTERVAL '1 day 14 hours', CURRENT_DATE + INTERVAL '1 day 16 hours 30 minutes', 150000, 10, '{"ac": true}', ARRAY['https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800']);

-- Hanoi -> Da Nang (Tomorrow - overnight)
INSERT INTO transport_routes (provider_id, type, vehicle_type, origin, destination, departure_time, arrival_time, price, seats_available, vehicle_details, images) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'bus', '45 seats', 'Hanoi', 'Da Nang', CURRENT_DATE + INTERVAL '1 day 18 hours', CURRENT_DATE + INTERVAL '2 days 8 hours', 500000, 30, '{"wifi": false}', ARRAY['https://images.unsplash.com/photo-1526165182181-4669cf7ec8bd?w=800']),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'bus', '29 seats', 'Hanoi', 'Da Nang', CURRENT_DATE + INTERVAL '1 day 19 hours', CURRENT_DATE + INTERVAL '2 days 9 hours', 550000, 15, '{"wifi": true}', ARRAY['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800']);
