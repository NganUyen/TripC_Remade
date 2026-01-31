-- Migration: Allow guest bookings by making user columns nullable
-- Date: 2026-01-31
-- Categories: flight, hotels, voucher, events, dining, activities, wellness, beauty, entertainment, shop, transport

-- 1. Flight Bookings
ALTER TABLE public.flight_bookings ALTER COLUMN user_uuid DROP NOT NULL;

-- 2. Hotel Bookings
ALTER TABLE public.hotel_bookings ALTER COLUMN user_uuid DROP NOT NULL;

-- 3. Dining Reservations
ALTER TABLE public.dining_reservations ALTER COLUMN user_uuid DROP NOT NULL;

-- 4. Shop Orders
ALTER TABLE public.shop_orders ALTER COLUMN user_id DROP NOT NULL;

-- 5. User Vouchers (Support for shop/voucher categories)
ALTER TABLE public.user_vouchers ALTER COLUMN user_id DROP NOT NULL;

-- 6. Shop User Vouchers
ALTER TABLE public.shop_user_vouchers ALTER COLUMN user_id DROP NOT NULL;

-- 7. Booking Notifications (Generic)
ALTER TABLE public.booking_notifications ALTER COLUMN user_uuid DROP NOT NULL;

-- 8. Wishlist (Generic Support)
ALTER TABLE public.wishlist ALTER COLUMN user_uuid DROP NOT NULL;

-- 9. User Search History (Generic Support)
ALTER TABLE public.user_search_history ALTER COLUMN user_id DROP NOT NULL;

-- Note: transport_bookings already has nullable/no user columns as verified in the schema.
