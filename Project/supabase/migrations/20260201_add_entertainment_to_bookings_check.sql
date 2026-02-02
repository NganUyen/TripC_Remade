-- Add 'entertainment' to bookings check constraint
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_booking_type_check;
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_category_check; -- Cleanup potential default named constraint

ALTER TABLE public.bookings ADD CONSTRAINT bookings_booking_type_check
  CHECK (category IN ('hotel', 'flight', 'restaurant', 'activity', 'event', 'wellness', 'beauty', 'transport', 'shop', 'entertainment'));
