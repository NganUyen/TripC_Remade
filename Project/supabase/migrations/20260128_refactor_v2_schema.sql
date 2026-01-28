-- Migration: Refactor V2 Schema (Ledger vs Domain)
-- Description: Create Reservation/Discount tables, Thin out Service tables, Enrich Bookings ledger.

-- 1. Create booking_reservations table
CREATE TABLE IF NOT EXISTS booking_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL,
    reservation_ref VARCHAR(255), -- PNR, Hold ID
    status VARCHAR(50) NOT NULL CHECK (status IN ('held', 'confirmed', 'released', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(booking_id)
);

-- 2. Create booking_discounts table
CREATE TABLE IF NOT EXISTS booking_discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    promotion_type VARCHAR(50) CHECK (promotion_type IN ('voucher', 'coupon', 'tcent')),
    reference_id VARCHAR(255),
    amount_applied DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    rule_snapshot JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enrich Bookings Ledger
ALTER TABLE bookings 
    ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'refunded', 'failed')),
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255) UNIQUE,
    ADD COLUMN IF NOT EXISTS breakdown JSONB;

-- 4. Data Migration (Best Effort Sync before Drop)
-- Sync Shop Orders total -> Bookings total
UPDATE bookings b
SET total_amount = so.grand_total,
    currency = so.currency,
    payment_status = COALESCE(so.payment_status, 'unpaid') -- Map existing status
FROM shop_orders so
WHERE b.id = so.booking_id AND b.total_amount IS NULL;

-- 5. Cleanup Shop Orders (Drop Redundant)
ALTER TABLE shop_orders
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS payment_status,
    DROP COLUMN IF EXISTS grand_total,
    DROP COLUMN IF EXISTS currency; -- Currency lives in Ledger now

-- 6. Cleanup Flight Bookings (Drop Redundant)
ALTER TABLE flight_bookings
    DROP COLUMN IF EXISTS booking_status,
    DROP COLUMN IF EXISTS price_paid;
