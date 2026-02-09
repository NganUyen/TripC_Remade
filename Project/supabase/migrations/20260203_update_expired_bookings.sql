-- Migration: Update expired bookings to cancelled status
-- Created: 2026-02-03
-- Purpose: Set all bookings with expires_at in the past to cancelled status

-- Update general bookings table
UPDATE bookings
SET status = 'cancelled'
WHERE status IN ('held', 'pending', 'confirmed')
  AND expires_at IS NOT NULL
  AND expires_at < NOW();

-- Update hotel bookings table
UPDATE hotel_bookings
SET status = 'cancelled'
WHERE status IN ('held', 'pending', 'confirmed')
  AND expires_at IS NOT NULL
  AND expires_at < NOW();

-- Update event bookings table
UPDATE event_bookings
SET status = 'cancelled'
WHERE status IN ('held', 'pending', 'confirmed')
  AND expires_at IS NOT NULL
  AND expires_at < NOW();

-- Update entertainment bookings table
UPDATE entertainment_bookings
SET booking_status = 'cancelled'
WHERE booking_status IN ('held', 'pending', 'confirmed')
  AND expires_at IS NOT NULL
  AND expires_at < NOW();

-- Update dining appointments table
UPDATE dining_appointment
SET status = 'cancelled'
WHERE status IN ('held', 'pending', 'confirmed')
  AND expires_at IS NOT NULL
  AND expires_at < NOW();

-- Display summary of updated records
SELECT 
  'bookings' as table_name,
  COUNT(*) as updated_count
FROM bookings
WHERE status = 'cancelled'
  AND expires_at IS NOT NULL
  AND expires_at < NOW()

UNION ALL

SELECT 
  'hotel_bookings' as table_name,
  COUNT(*) as updated_count
FROM hotel_bookings
WHERE status = 'cancelled'
  AND expires_at IS NOT NULL
  AND expires_at < NOW()

UNION ALL

SELECT 
  'event_bookings' as table_name,
  COUNT(*) as updated_count
FROM event_bookings
WHERE status = 'cancelled'
  AND expires_at IS NOT NULL
  AND expires_at < NOW()

UNION ALL

SELECT 
  'entertainment_bookings' as table_name,
  COUNT(*) as updated_count
FROM entertainment_bookings
WHERE booking_status = 'cancelled'
  AND expires_at IS NOT NULL
  AND expires_at < NOW()

UNION ALL

SELECT 
  'dining_appointment' as table_name,
  COUNT(*) as updated_count
FROM dining_appointment
WHERE status = 'cancelled'
  AND expires_at IS NOT NULL
  AND expires_at < NOW();
