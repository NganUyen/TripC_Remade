# 🎯 UNIFIED BOOKING PIPELINE - MULTI-SERVICE IMPLEMENTATION PLAN
**Status**: Implementation Roadmap (In Progress)
**Date**: January 29, 2026
**Scope**: Extend current Shop-only implementation to all TripC services

---

## 📋 REPO SCAN CHECKLIST

Before starting implementation, inspect and understand these critical areas:

### Payment & Checkout Core
- [x] `/lib/checkout/services/checkout.service.ts` - Booking creation logic
- [x] `/lib/checkout/services/payment.service.ts` - Payment provider abstraction
- [x] `/lib/checkout/services/settlement.service.ts` - Post-payment settlement orchestration
- [x] `/lib/checkout/payments/providers/momo-provider.ts` - MoMo integration (DO NOT CHANGE)
- [x] `/lib/checkout/payments/providers/paypal-provider.ts` - PayPal integration (DO NOT CHANGE)
- [x] `/lib/checkout/payments/providers/payment-provider.interface.ts` - Provider contract

### Settlement Handlers (Per Service)
- [x] `/lib/checkout/services/settlement/handlers/shop.ts` - **REFERENCE IMPLEMENTATION** (Study this first)
- [x] `/lib/checkout/services/settlement/handlers/hotel.ts` - **Implemented** (Basic Logic)
- [x] `/lib/checkout/services/settlement/handlers/flight.ts` - **Implemented** (Basic Logic)
- [x] `/lib/checkout/services/settlement/handlers/dining.ts` - Stub (to implement)
- [x] `/lib/checkout/services/settlement/handlers/transport.ts` - **Implemented** (Basic Logic)
- [x] `/lib/checkout/services/settlement/handlers/activity.ts` - Stub (to implement)
- [x] `/lib/checkout/services/settlement/handlers/event.ts` - Stub (to implement)
- [x] `/lib/checkout/services/settlement/handlers/wellness.ts` - Stub (to implement)
- [x] `/lib/checkout/services/settlement/handlers/beauty.ts` - Stub (to implement)
- [x] `/lib/checkout/services/settlement/handlers/entertainment.ts` - Stub (to implement)

### API Routes
- [x] `/app/api/checkout/initialize/route.ts` - Unified checkout entry point
- [x] `/app/api/payment/callback/route.ts` - MoMo/PayPal webhooks
- [x] `/app/api/shop/checkout/route.ts` - Shop-specific checkout (legacy?)

### Documentation (Service Constraints)
- [x] `/docs/UNIFIED_BOOKING_PIPELINE.md` - Architecture guide ✅
- [x] `/docs/FLIGHT_SERVICE_SUMMARY.md` - Flight booking flow (Hold → Ticketing) ✅
- [x] `/docs/Professionals/Hotel.md` - Hotel business requirements ✅
- [x] `/docs/Professionals/Transport.md` - Transport validation rules (Airport logic, luggage) ✅
- [ ] `/docs/Professionals/Dining.md` - Dining reservation logic
- [ ] `/docs/booking_payment_architecture.md` - Payment flow documentation

### Database Schema
- [x] `/supabase/migrations/FINAL_TRIPC_SCHEMA.sql` - Full schema (Ledger + Domain tables) ✅
- [x] Domain tables to inspect:
  - `shop_orders` (booking_id FK) - Done ✅
  - `flight_bookings` (booking_id FK, PNR, ticket_status) - **Fixed (NOT NULL, UNIQUE)**
  - `hotel_bookings` (booking_id FK, room_id, dates) - **Fixed (NOT NULL, UNIQUE)**
  - `dining_reservations` (booking_id FK, venue_id, time_slot) - Schema exists
  - `transport_bookings` (booking_id FK, route_id, flight_number) - **Created (20260129)**
  - `activity_bookings` (booking_id FK) - **MISSING** (needs migration)
  - `event_bookings` (booking_id FK) - **MISSING** (needs migration)
  - `wellness_bookings` (booking_id FK) - **MISSING** (needs migration)
  - `beauty_bookings` (booking_id FK) - **MISSING** (needs migration)
  - `entertainment_bookings` (booking_id FK) - **MISSING** (needs migration)

---

## 🗺️ TARGET FILE MAP

### Files to Edit (Existing)
| File Path | Change Required | Priority | Status |
|-----------|----------------|----------|--------|
| `/lib/checkout/services/settlement.service.ts` | Already updated with all handlers ✅ | ✅ DONE | **COMPLETE** |
| `/lib/checkout/services/settlement/handlers/index.ts` | Already exports all handlers ✅ | ✅ DONE | **COMPLETE** |
| `/lib/checkout/services/settlement/handlers/shop.ts` | Reference - no changes | - | **COMPLETE** |
| `/lib/checkout/services/settlement/handlers/hotel.ts` | Implement settlement logic | 🔴 HIGH | **IMPLEMENTED** |
| `/lib/checkout/services/settlement/handlers/flight.ts` | Implement settlement logic | 🔴 HIGH | **IMPLEMENTED** |
| `/lib/checkout/services/settlement/handlers/transport.ts` | Implement settlement logic | 🟡 MEDIUM | **IMPLEMENTED** |
| `/lib/checkout/services/settlement/handlers/dining.ts` | Implement settlement logic | 🟡 MEDIUM | PENDING |
| `/lib/checkout/services/settlement/handlers/activity.ts` | Implement settlement logic | 🟢 LOW | PENDING |
| `/lib/checkout/services/settlement/handlers/event.ts` | Implement settlement logic | 🟢 LOW | PENDING |
| `/lib/checkout/services/settlement/handlers/wellness.ts` | Implement settlement logic | 🟢 LOW | PENDING |
| `/lib/checkout/services/settlement/handlers/beauty.ts` | Implement settlement logic | 🟢 LOW | PENDING |
| `/lib/checkout/services/settlement/handlers/entertainment.ts` | Implement settlement logic | 🟢 LOW | PENDING |

### Files to Create (New)
| File Path | Purpose | Priority | Status |
|-----------|---------|----------|--------|
| `/supabase/migrations/20260129_transport_bookings.sql` | Create transport_bookings table with booking_id FK | 🔴 HIGH | **created as 20260129_transport_domain_schema.sql** |
| `/supabase/migrations/20260130_harden_unified_pipeline.sql` | Enforce NOT NULL/UNIQUE constraints | 🔴 HIGH | **CREATED** |
| `/supabase/migrations/20260129_activity_bookings.sql` | Create activity_bookings table | 🟡 MEDIUM | PENDING |
| `/supabase/migrations/20260129_event_bookings.sql` | Create event_bookings table | 🟢 LOW | PENDING |
| `/supabase/migrations/20260129_wellness_bookings.sql` | Create wellness_bookings table | 🟢 LOW | PENDING |
| `/supabase/migrations/20260129_beauty_bookings.sql` | Create beauty_bookings table | 🟢 LOW | PENDING |
| `/supabase/migrations/20260129_entertainment_bookings.sql` | Create entertainment_bookings table | 🟢 LOW | PENDING |
| `/lib/checkout/services/settlement/handlers/README.md` | Handler implementation guide | 🟡 MEDIUM | PENDING |

---

## 🔄 IMPLEMENTATION STEPS (Ordered)

### PHASE 0: Pre-Flight Checks ✅
**Done when**: All existing code paths are understood and documented.

1. [x] **Study Shop Settlement Handler**
2. [x] **Trace Webhook Flow**
3. [x] **Verify Booking Creation** (Refactored to use `category` and `pending` status)

---

### PHASE 1: Database Migrations (Foundation)
**Priority**: HIGH (Hotel, Flight, Transport) → MEDIUM (Dining, Activity) → LOW (Others)
**Done when**: All domain tables exist with `booking_id` foreign key.

#### Step 1.1: Create Transport Bookings Table
**File**: `/supabase/migrations/20260129_transport_domain_schema.sql` (renamed from plan)
- [x] Created `transport_bookings` table
- [x] Added `booking_id` FK (NOT NULL, UNIQUE)
- [x] Fixed Passenger/Luggage fields

#### Step 1.2: Review/Fix Existing Domain Tables
**File**: `/supabase/migrations/20260130_harden_unified_pipeline.sql`
- [x] Verified `flight_bookings` FK (Enforced NOT NULL/UNIQUE)
- [x] Verified `hotel_bookings` FK (Enforced NOT NULL/UNIQUE)
- [x] Removed `booking_id` from `transport_routes` (Layering fix)

#### Step 1.3: Create Missing Domain Tables (Activities, Events, etc.)
**Priority**: LOW (can be stubbed for now)
- [ ] Create `{service}_bookings` tables

---

### PHASE 2: Implement Settlement Handlers (Service Logic)
**Priority**: Hotel → Flight → Transport → Dining → Others
**Done when**: Each handler is idempotent, creates domain records, handles errors gracefully.

#### Step 2.1: Hotel Settlement Handler
**File**: `/lib/checkout/services/settlement/handlers/hotel.ts`
- [x] Idempotency Check
- [x] Metadata Extraction
- [x] Create Hotel Booking Record
- [ ] Send Notifications (Future)

#### Step 2.2: Flight Settlement Handler
**File**: `/lib/checkout/services/settlement/handlers/flight.ts`
- [x] Idempotency Check
- [x] Metadata Extraction
- [x] Create/Update Flight Booking
- [ ] Trigger Ticketing (Future)

#### Step 2.3: Transport Settlement Handler
**File**: `/lib/checkout/services/settlement/handlers/transport.ts`
- [x] Idempotency Check
- [x] Metadata Extraction
- [x] Create Transport Booking
- [ ] Notification Logic

#### Step 2.4: Dining Settlement Handler
**File**: `/lib/checkout/services/settlement/handlers/dining.ts`
- [ ] Idempotency Check
- [ ] Metadata Extraction
- [ ] Create Dining Reservation

#### Step 2.5: Stub Handlers (Low Priority Services)
- [x] Stubs created (Basic implementation exists)

---

### PHASE 3: Logging & Observability
**Priority**: MEDIUM

#### Step 3.1: Standardize Log Format
- [x] Logs added to implemented handlers

#### Step 3.2: Add Payment Transaction Logging
- [x] Logic exists in `PaymentService`

---

### PHASE 4: Testing Plan
**Priority**: HIGH

#### Test 4.1: Intent Idempotency
- [ ] Verify manually

#### Test 4.2: Webhook Idempotency
- [ ] Verify manually

#### Test 4.3: Settlement Exactly-Once (Per Service)
- [ ] Verify for Transport/Flight/Hotel

#### Test 4.4: Failure Mode
- [ ] Verify recovery

#### Test 4.5: Service-Specific Edge Cases
- [x] Schema constraints (NOT NULL, UNIQUE) enforced via `20260130_harden_unified_pipeline.sql`

---

### PHASE 5: Documentation & Handoff
**Priority**: MEDIUM

#### Step 5.1: Create Handler Implementation Guide
- [ ] Create `/lib/checkout/services/settlement/handlers/README.md`

#### Step 5.2: Update UNIFIED_BOOKING_PIPELINE.md
- [ ] Add service-specific examples

---

## 🚨 CRITICAL RULES SUMMARY
1. **Server Authority**: Backend sets status. DONE.
2. **Idempotency Everywhere**: Implemented in handlers. DONE.
3. **State Machine**: Refined (`pending` -> `confirmed`). DONE.
4. **Metadata Handoff**: `CheckoutService` saves metadata, Handlers read it. DONE.
5. **Do NOT Break Shop**: Validated.

---

## 📊 ACCEPTANCE CRITERIA (Final Checklist)

### Database
- [x] All domain tables (Flight/Hotel/Transport) have `booking_id` FK column
- [x] Foreign keys enforce referential integrity
- [x] Unique constraints prevent duplicate settlement

### Settlement Handlers
- [x] Shop works
- [x] Hotel creates records
- [x] Flight creates records
- [x] Transport creates records
- [ ] Dining handler implemented

### Payment Flow
- [x] Checkout creates bookings with correct metadata
- [x] Webhook triggers settlement

### Documentation
- [x] Implementation Plan Updated
