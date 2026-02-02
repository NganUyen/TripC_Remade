# Migration Fixes Changelog

**Date:** 2026-02-01 22:24
**Migration File:** `supabase/migrations/20260201_entertainment_unified_payment.sql`

## Overview

Applied 7 critical production-grade fixes to migration SQL based on technical review. All fixes ensure production safety, prevent inventory corruption, and align with existing patterns in the codebase.

---

## Fix #1: FK DELETE Behavior - CASCADE → SET NULL ✅

**Issue:** `booking_id` was using `ON DELETE CASCADE`, which would delete domain records if bookings ledger is cleaned up.

**Risk:** Loss of entertainment booking history if ledger entries are removed.

**Fix:**
```sql
-- BEFORE
ADD COLUMN IF NOT EXISTS booking_id uuid UNIQUE 
  REFERENCES public.bookings(id) ON DELETE CASCADE;

-- AFTER  
ADD COLUMN IF NOT EXISTS booking_id uuid UNIQUE 
  REFERENCES public.bookings(id) ON DELETE SET NULL;
```

**Rationale:** Bookings ledger is financial record. Domain tables (`entertainment_bookings`) contain business-specific data that should persist even if ledger entry is removed. Pattern matches `event_bookings`.

---

## Fix #2: updated_at Column Safety ⚠️

**Issue:** RPC functions were setting `updated_at = now()`, but column may not exist in older entertainment schemas.

**Risk:** Migration fails with "column updated_at does not exist" error.

**Fix:**
```sql
-- BEFORE
UPDATE entertainment_ticket_types
SET held_count = ...,
    updated_at = now()
WHERE ...

-- AFTER
UPDATE entertainment_ticket_types
SET held_count = ...
    -- Note: updated_at omitted for migration safety
WHERE ...
```

**Rationale:** Makes migration backward-compatible with any entertainment schema version. Trigger-based updated_at (if present) will still fire automatically.

---

## Fix #3: confirm_entertainment_tickets Inventory Logic 🚨 CRITICAL

**Issue:** Original logic had "WARNING but continue" approach - would confirm tickets even if `held_count` was insufficient, leading to inventory corruption.

**Risk:** `total_sold` could exceed `total_available`, causing overselling.

**Fix:**
```sql
-- BEFORE (DANGEROUS)
IF v_held_count < p_quantity THEN
  RAISE WARNING 'Mismatch...';
  -- Continue anyway ❌
END IF;
UPDATE ... total_sold = total_sold + p_quantity ...

-- AFTER (SAFE)
UPDATE entertainment_ticket_types
SET 
  held_count = GREATEST(0, held_count - p_quantity),
  total_sold = total_sold + p_quantity
WHERE id = p_ticket_type_id
  AND COALESCE(held_count, 0) >= p_quantity; -- ✅ Atomic check

RETURN FOUND; -- Settlement knows if it failed
```

**Rationale:** 
- Atomic UPDATE with WHERE condition ensures inventory integrity
- Returns FALSE if insufficient `held_count` → Settlement handler can retry/alert
- Prevents "total_sold exceeds capacity" data corruption
- Matches Event settlement pattern

---

## Fix #4: release_entertainment_tickets Row Locking 🔒

**Issue:** `release` function had no row lock, creating race condition with concurrent `confirm` calls (e.g., webhook retry + user cancel).

**Risk:** Lost updates in high-concurrency scenarios.

**Fix:**
```sql
-- BEFORE
UPDATE entertainment_ticket_types
SET held_count = ...
WHERE id = p_ticket_type_id;

-- AFTER  
UPDATE entertainment_ticket_types
SET held_count = ...
WHERE id = (
  SELECT id 
  FROM entertainment_ticket_types 
  WHERE id = p_ticket_type_id 
  FOR UPDATE
);
```

**Rationale:** `FOR UPDATE` lock prevents simultaneous confirm/release from corrupting `held_count`. Minor performance cost but essential for correctness.

---

## Fix #5: RLS Policy Clerk JWT Pattern 🔑 CRITICAL

**Issue:** RLS policy was using `auth.uid()` which is Supabase Auth UUID, not Clerk ID. Project uses Clerk for authentication.

**Risk:** Users cannot view their own bookings (auth.uid() ≠ Clerk ID).

**Fix:**
```sql
-- BEFORE (BROKEN)
USING (
  auth.uid()::text = user_id 
  OR auth.uid()::text = external_user_ref
  OR auth.uid() = user_uuid
)

-- AFTER (CORRECT)
USING (
  -- Match Clerk ID from JWT (same pattern as event_bookings)
  external_user_ref = auth.jwt()->>'sub'
  OR user_uuid IN (
    SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
  )
)
```

**Rationale:**
- `auth.jwt()->>'sub'` extracts Clerk user ID from JWT
- Pattern copied exactly from `event_bookings` RLS (proven working)
- Allows users to view bookings via either Clerk ID or mapped UUID

---

## Fix #6: View payment_method Column ❌ ERROR

**Issue:** View was joining `b.payment_method AS ledger_payment_method`, but `bookings` table doesn't have `payment_method` column.

**Error:** `ERROR: 42703: column b.payment_method does not exist`

**Fix:**
```sql
-- BEFORE (FAILS)
SELECT 
  eb.*,
  b.payment_method AS ledger_payment_method, -- ❌ Column doesn't exist
  ...

-- AFTER (WORKS)
SELECT 
  eb.*,
  b.payment_status AS ledger_payment_status,
  b.total_amount AS ledger_total_amount,
  -- Payment provider from latest transaction
  (
    SELECT pt.provider 
    FROM payment_transactions pt 
    WHERE pt.booking_id = b.id 
      AND pt.status = 'success'
    ORDER BY pt.created_at DESC 
    LIMIT 1
  ) AS ledger_payment_provider,
  ...
```

**Rationale:**
- `bookings` only has `payment_status`, not `payment_method`
- Payment provider stored in `payment_transactions.provider`
- Subquery fetches latest successful transaction's provider
- Maintains useful information without breaking migration

---

## Fix #7: confirmation_code Clarification 📝

**Issue:** Schema has both `booking_reference` (legacy) and new `confirmation_code` - unclear which to use.

**Risk:** Inconsistent UI display / duplicate codes.

**Fix:**
```sql
COMMENT ON COLUMN entertainment_bookings.confirmation_code IS 
  'Unified pipeline confirmation code (booking_reference is legacy)';
```

**Rationale:**
- `confirmation_code` is unified pipeline standard (matches Events)
- `booking_reference` kept for backward compatibility but marked legacy
- Settlement handler should populate `confirmation_code`
- UI (my-bookings) should display `confirmation_code` preferentially

---

## Migration Safety Checklist ✅

After fixes:
- [x] No CASCADE deletes that could lose domain data
- [x] No references to potentially missing columns (updated_at)
- [x] Inventory logic atomically prevents overselling
- [x] Proper row locking for concurrency safety
- [x] RLS uses correct auth pattern for Clerk
- [x] View doesn't reference nonexistent columns
- [x] Clear documentation on legacy vs. new fields

---

## Testing Verification

**Before deploying, verify:**

1. **Schema exists:**
   ```sql
   -- Check if entertainment tables exist
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'entertainment_%';
   ```

2. **Bookings ledger exists:**
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'bookings';
   ```

3. **Users table has clerk_id:**
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'users' 
   AND column_name = 'clerk_id';
   ```

4. **After migration, test RPC:**
   ```sql
   -- Should return true
   SELECT hold_entertainment_tickets('{ticket-type-uuid}', 2);
   
   -- Should return false if held_count < 2
   SELECT confirm_entertainment_tickets('{ticket-type-uuid}', 2);
   ```

---

## Deployment Status

**Version:** v2 (with production fixes)
**Status:** ✅ Ready for deployment
**Method:** Supabase Dashboard SQL Editor (recommended) or CLI

**Next Step:** Apply migration to database, verify with test queries above.

---

## References

- **Pattern Source:** `event_bookings` table + `EventSettlementHandler`
- **RLS Pattern:** `app/supabase/migrations/*event*.sql`
- **Inventory Pattern:** `hold_event_tickets` / `confirm_event_tickets` RPCs
- **Review Feedback:** Technical review 2026-02-01 22:23
