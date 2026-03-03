-- Migration: Add status / rejection_reason to hotel_partners and flight_partners
-- Aligns both portals with the shop partner approval flow.
-- Date: 2026-02-27

-- ─────────────────────────────────────────────────────────────
-- HOTEL PARTNERS
-- ─────────────────────────────────────────────────────────────

ALTER TABLE hotel_partners
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'suspended', 'banned')),
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Existing rows (registered via old register API) are treated as approved
UPDATE hotel_partners SET status = 'approved' WHERE status = 'pending';

-- ─────────────────────────────────────────────────────────────
-- FLIGHT PARTNERS
-- ─────────────────────────────────────────────────────────────

ALTER TABLE flight_partners
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'suspended', 'banned')),
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Existing rows (seeded airlines) are treated as approved
UPDATE flight_partners SET status = 'approved' WHERE status = 'pending';

-- ─────────────────────────────────────────────────────────────
-- helper: expose status to partner_users join
-- ─────────────────────────────────────────────────────────────
-- (no extra columns needed — partner_users already has role)
