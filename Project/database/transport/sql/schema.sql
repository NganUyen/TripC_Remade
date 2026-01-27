-- 1. Table: Transport Providers (Hãng xe/tàu/máy bay)
CREATE TABLE transport_providers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    rating NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table: Transport Routes (Tuyến đường & Chi tiết phương tiện)
CREATE TABLE transport_routes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID REFERENCES transport_providers(id),
    type TEXT CHECK (type IN ('bus', 'train', 'airplane', 'limousine', 'private_car')), -- Generic type
    vehicle_type TEXT CHECK (vehicle_type IN ('4 seats', '7 seats', '16 seats', '29 seats', '45 seats', 'limousine 9 seats')), -- Specific vehicle type
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    price NUMERIC NOT NULL,
    currency TEXT DEFAULT 'VND',
    seats_available INTEGER DEFAULT 0,
    vehicle_details JSONB,         -- Lưu chi tiết: tiện ích (wifi, air_conditioning...), biển số
    images TEXT[],                 -- Mảng ảnh của phương tiện
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table: Bookings (Quản lý trạng thái đặt vé)
CREATE TABLE bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,         -- Clerk ID
    route_id UUID REFERENCES transport_routes(id),
    status TEXT CHECK (status IN ('held', 'confirmed', 'completed', 'cancelled', 'payment_failed')),
    total_amount NUMERIC NOT NULL,
    passenger_info JSONB,
    booking_code TEXT UNIQUE,
    held_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table: Payments
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id),
    payment_method TEXT CHECK (payment_method IN ('momo', 'vnpay', 'credit_card')),
    transaction_id TEXT,
    amount NUMERIC NOT NULL,
    status TEXT CHECK (status IN ('pending', 'success', 'failed')),
    payment_url TEXT,
    raw_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table: Email Logs
CREATE TABLE email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id),
    recipient_email TEXT NOT NULL,
    type TEXT CHECK (type IN ('booking_confirmation', 'payment_reminder', 'cancellation')),
    status TEXT CHECK (status IN ('sent', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table: Partner Notifications
CREATE TABLE partner_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID REFERENCES transport_providers(id),
    booking_id UUID REFERENCES bookings(id),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table: Reviews
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id),
    user_id TEXT NOT NULL,
    route_id UUID REFERENCES transport_routes(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE transport_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read routes" ON transport_routes FOR SELECT USING (true);
CREATE POLICY "Public read providers" ON transport_providers FOR SELECT USING (true);
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);

-- User Policies
CREATE POLICY "User view own bookings" ON bookings FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "User insert own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "User update own bookings" ON bookings FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "User see own payments" ON payments FOR SELECT USING (
    booking_id IN (SELECT id FROM bookings WHERE user_id = auth.uid()::text)
);


-- ==========================================
-- SEED DATA (Dữ liệu mẫu)
-- ==========================================

-- 1. Insert Providers
INSERT INTO transport_providers (id, name, logo_url, rating) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Sao Viet Bus', 'https://static.vexere.com/production/images/1690448946777.jpeg', 4.5),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Green Travel', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz-M-Z986Jk82987179043743818318357', 4.8),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Sapa Express', 'https://sapaexpress.com/images/logo.png', 4.7),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Phuong Trang', 'https://futabus.vn/images/logo.png', 4.2),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Xanh SM Taxi', 'https://xanhsm.com/wp-content/uploads/2023/04/logo-xanh-sm.png', 4.9);

-- 2. Insert Routes (Generating for roughly next 7 days for testing)
-- Base Date for calculation: assume current requests will query future dates.
-- Using fixed dates for '2026-01-26' (tomorrow relative to user current time) and '2026-01-27'

-- Route set 1: Hanoi -> Sapa
INSERT INTO transport_routes (provider_id, type, vehicle_type, origin, destination, departure_time, arrival_time, price, seats_available, vehicle_details, images) VALUES
-- 4 Seats (Private Car)
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'private_car', '4 seats', 'Hanoi', 'Sapa', '2026-01-26 08:00:00+07', '2026-01-26 13:00:00+07', 2500000, 3, '{"wifi": true, "ac": true}', ARRAY['https://example.com/car-4-seat.jpg']),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'private_car', '4 seats', 'Hanoi', 'Sapa', '2026-01-26 09:30:00+07', '2026-01-26 14:30:00+07', 2400000, 4, '{"wifi": true, "ac": true}', ARRAY['https://example.com/car-4-seat-b.jpg']),
-- 7 Seats
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'private_car', '7 seats', 'Hanoi', 'Sapa', '2026-01-26 07:00:00+07', '2026-01-26 12:30:00+07', 3200000, 6, '{"wifi": true, "ac": true}', ARRAY['https://example.com/car-7-seat.jpg']),
-- Limousine 9
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'limousine', 'limousine 9 seats', 'Hanoi', 'Sapa', '2026-01-26 07:30:00+07', '2026-01-26 12:30:00+07', 450000, 8, '{"wifi": true, "massage_chairs": true}', ARRAY['https://example.com/limo-9.jpg']),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'limousine', 'limousine 9 seats', 'Hanoi', 'Sapa', '2026-01-26 14:00:00+07', '2026-01-26 19:00:00+07', 480000, 7, '{"wifi": true, "usb": true}', ARRAY['https://example.com/limo-9-b.jpg']),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'limousine', 'limousine 9 seats', 'Hanoi', 'Sapa', '2026-01-26 22:00:00+07', '2026-01-27 03:00:00+07', 400000, 9, '{"wifi": true}', ARRAY['https://example.com/limo-9-night.jpg']),
-- Bus (Sleeping)
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'bus', '29 seats', 'Hanoi', 'Sapa', '2026-01-26 21:00:00+07', '2026-01-27 02:00:00+07', 280000, 20, '{"type": "sleeping_bus"}', ARRAY['https://example.com/bus-sleeping.jpg']);

-- Route set 2: Hanoi -> Da Nang
INSERT INTO transport_routes (provider_id, type, vehicle_type, origin, destination, departure_time, arrival_time, price, seats_available, vehicle_details, images) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'bus', '45 seats', 'Hanoi', 'Da Nang', '2026-01-27 18:00:00+07', '2026-01-28 08:00:00+07', 500000, 30, '{"wifi": false}', ARRAY['https://example.com/bus-45.jpg']),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'bus', '29 seats', 'Hanoi', 'Da Nang', '2026-01-27 19:00:00+07', '2026-01-28 09:00:00+07', 550000, 15, '{"wifi": true}', ARRAY['https://example.com/bus-29.jpg']);

-- Route set 3: Ho Chi Minh -> Da Lat
INSERT INTO transport_routes (provider_id, type, vehicle_type, origin, destination, departure_time, arrival_time, price, seats_available, vehicle_details, images) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'limousine', 'limousine 9 seats', 'Ho Chi Minh', 'Da Lat', '2026-01-26 08:00:00+07', '2026-01-26 14:00:00+07', 350000, 5, '{"wifi": true}', ARRAY['https://example.com/limo-hcm-dalat.jpg']),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'private_car', '7 seats', 'Ho Chi Minh', 'Da Lat', '2026-01-26 06:00:00+07', '2026-01-26 11:30:00+07', 2200000, 7, '{"ac": true}', ARRAY['https://example.com/car-7-hcm.jpg']),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'bus', '45 seats', 'Ho Chi Minh', 'Da Lat', '2026-01-26 23:00:00+07', '2026-01-27 05:00:00+07', 250000, 40, '{"wifi": true}', ARRAY['https://example.com/bus-night.jpg']),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'private_car', '4 seats', 'Ho Chi Minh', 'Da Lat', '2026-01-26 09:00:00+07', '2026-01-26 14:00:00+07', 1800000, 4, '{"ac": true}', ARRAY['https://example.com/car-4-hcm.jpg']);

-- Route set 4: Da Nang -> Hue (Short trip, nice for 4/7/16 seats)
INSERT INTO transport_routes (provider_id, type, vehicle_type, origin, destination, departure_time, arrival_time, price, seats_available, vehicle_details, images) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'private_car', '4 seats', 'Da Nang', 'Hue', '2026-01-27 08:00:00+07', '2026-01-27 10:00:00+07', 1200000, 4, '{"ac": true}', ARRAY['https://example.com/car-4-hue.jpg']),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'private_car', '7 seats', 'Da Nang', 'Hue', '2026-01-27 10:00:00+07', '2026-01-27 12:00:00+07', 1500000, 7, '{"ac": true}', ARRAY['https://example.com/car-7-hue.jpg']),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'bus', '16 seats', 'Da Nang', 'Hue', '2026-01-27 14:00:00+07', '2026-01-27 16:30:00+07', 150000, 10, '{"ac": true}', ARRAY['https://example.com/van-16.jpg']);

-- Route set 5: Hanoi -> Ha Long (High volume)
INSERT INTO transport_routes (provider_id, type, vehicle_type, origin, destination, departure_time, arrival_time, price, seats_available, vehicle_details, images) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'limousine', 'limousine 9 seats', 'Hanoi', 'Ha Long', '2026-01-26 07:00:00+07', '2026-01-26 10:00:00+07', 300000, 9, '{"wifi": true}', ARRAY['https://example.com/limo-halong.jpg']),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'limousine', 'limousine 9 seats', 'Hanoi', 'Ha Long', '2026-01-26 08:00:00+07', '2026-01-26 11:00:00+07', 300000, 8, '{"wifi": true}', ARRAY['https://example.com/limo-halong-2.jpg']),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'limousine', 'limousine 9 seats', 'Hanoi', 'Ha Long', '2026-01-26 09:00:00+07', '2026-01-26 12:00:00+07', 300000, 9, '{"wifi": true}', ARRAY['https://example.com/limo-halong-3.jpg']),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'bus', '45 seats', 'Hanoi', 'Ha Long', '2026-01-26 07:30:00+07', '2026-01-26 11:30:00+07', 150000, 40, '{"wifi": false}', ARRAY['https://example.com/bus-halong.jpg']);
