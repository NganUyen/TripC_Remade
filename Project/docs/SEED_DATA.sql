-- =============================================
-- SEED DATA FOR TRIPC REWARDS SYSTEM
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. SEED VOUCHERS
-- Updated to include validity dates (Immediate start, 1 yr expiry)

INSERT INTO vouchers (code, voucher_type, discount_value, min_spend, tcent_price, total_usage_limit, is_purchasable, is_active, starts_at, expires_at)
VALUES 
  ('HOTEL20', 'Hotel Credit', 20.00, 0, 2000, 1000, true, true, NOW(), NOW() + INTERVAL '1 year'),
  ('LOUNGE_VIP', 'Transport', 0.00, 0, 3500, 500, true, true, NOW(), NOW() + INTERVAL '6 months'),
  ('SPA_RETREAT', 'Wellness', 50.00, 100, 5000, 200, true, true, NOW(), NOW() + INTERVAL '1 year'),
  ('CONCERT_PASS', 'Entertainment', 0.00, 0, 8000, 50, true, true, NOW() + INTERVAL '1 week', NOW() + INTERVAL '3 months'),
  ('FLIGHT_DEAL', 'Transport', 30.00, 500, 4500, 300, true, true, NOW(), NOW() + INTERVAL '1 year');

-- 2. SEED QUESTS

INSERT INTO quests (title, description, quest_type, reward_amount, is_active, starts_at, expires_at)
VALUES 
  ('Welcome to TripC', 'Complete your profile setup to get started.', 'onboarding', 500, true, NOW(), NULL),
  ('First Booking', 'Book your first hotel or flight with us.', 'transaction', 1000, true, NOW(), NOW() + INTERVAL '1 month'),
  ('Social Sharer', 'Share your referral code with a friend.', 'social', 250, true, NOW(), NULL);

-- =============================================
-- FIX SCRIPT (If you already inserted without dates)
-- =============================================
/*
UPDATE vouchers
SET 
  starts_at = NOW(),
  expires_at = NOW() + INTERVAL '1 year'
WHERE starts_at IS NULL;
*/
