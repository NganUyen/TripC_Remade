# Entertainment Pipeline Integration - Architecture Analysis

> **Date:** 2026-02-01  
> **Purpose:** Document findings from unified payment system scan and identify Entertainment integration requirements

## Executive Summary

The TripC platform has a robust **Unified Payment Pipeline** handling multiple service types (shop, hotel, event, transport, flight) through a single consistent flow. Entertainment domain currently has schema tables but **NO checkout/payment integration**. This document analyzes the existing architecture and identifies exactly what needs to be built.

---

## 1. Unified Payment System Architecture (What Exists)

### 1.1 Core Flow Pattern (4 Phases)

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: INITIALIZATION                                     │
├─────────────────────────────────────────────────────────────┤
│ 1. User submits {Service}CheckoutForm                       │
│ 2. POST /api/checkout/initialize                            │
│ 3. CheckoutService.createBooking() validates + calculates   │
│ 4. Creates bookings ledger row (status='pending')           │
│ 5. Creates BOOKING_CREATED event (idempotency)              │
│ 6. Returns {bookingId, totalAmount, currency}               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: PAYMENT INITIATION                                 │
├─────────────────────────────────────────────────────────────┤
│ 1. User selects payment provider (MoMo/PayPal)              │
│ 2. POST /api/payments/create {bookingId, provider}          │
│ 3. PaymentService.createPaymentIntent()                     │
│ 4. Creates payment_transactions row (status='pending')     │
│ 5. Returns {paymentUrl, providerTxnId}                      │
│ 6. Redirects to payment gateway                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: PAYMENT CONFIRMATION (Webhook)                     │
├─────────────────────────────────────────────────────────────┤
│ 1. Provider sends IPN to /api/payments/webhooks/{provider}  │
│ 2. PaymentService.handleWebhook() verifies signature        │
│ 3. Updates payment_transactions status                      │
│ 4. Triggers SettlementService.settleBooking() if success    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: SETTLEMENT                                          │
├─────────────────────────────────────────────────────────────┤
│ 1. Check global idempotency (SETTLEMENT_COMPLETED event)    │
│ 2. Delegate to {Service}SettlementHandler.settle()          │
│ 3. Handler checks domain idempotency (booking_id exists)    │
│ 4. Creates domain record (e.g., event_bookings)             │
│ 5. Updates inventory (tickets, stock, seats)                │
│ 6. Updates bookings: status='confirmed', payment='paid'      │
│ 7. Records SETTLEMENT_COMPLETED event                        │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Key Ledger Tables

#### `bookings` (Central Ledger)
```sql
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY,
  category text NOT NULL,              -- 'hotel', 'shop', 'event', 'entertainment'
  user_id text,                        -- Clerk ID (text) or UUID
  title text NOT NULL,
  total_amount numeric NOT NULL,       -- Server-calculated authoritative price
  currency text DEFAULT 'VND',
  status text DEFAULT 'pending',       -- pending, confirmed, completed, cancelled
  payment_status varchar DEFAULT 'unpaid', -- unpaid, pending, paid, refunded, failed
  booking_code text UNIQUE,
  guest_details jsonb,                 -- Contact info for guest users
  metadata jsonb,                      -- CRITICAL: Full checkout payload for settlement
  created_at timestamptz DEFAULT now(),
  ...
);
```

**Key Insight:** `metadata` JSONB field stores the entire checkout payload for settlement handlers to use.

#### `payment_transactions` (Payment Audit Trail)
```sql
CREATE TABLE public.payment_transactions (
  id uuid PRIMARY KEY,
  booking_id uuid NOT NULL REFERENCES bookings(id),
  provider varchar NOT NULL,           -- 'momo', 'paypal'
  provider_transaction_id varchar,     -- Provider's order ID
  status varchar NOT NULL,             -- pending, processing, success, failed
  amount numeric NOT NULL,
  currency varchar DEFAULT 'USD',
  webhook_payload jsonb,               -- Raw webhook data for audit
  ...
);
```

#### `booking_events` (Idempotency Guard)
```sql
CREATE TABLE public.booking_events (
  id uuid PRIMARY KEY,
  booking_id uuid NOT NULL REFERENCES bookings(id),
  event_type text NOT NULL,            -- BOOKING_CREATED, SETTLEMENT_COMPLETED
  created_at timestamptz DEFAULT now(),
  UNIQUE(booking_id, event_type)       -- Prevents duplicate events
);
```

**Key Insight:** Settlement services check for `SETTLEMENT_COMPLETED` event before processing to prevent double-execution.

---

## 2. CheckoutService.createBooking() Contract

### 2.1 Request Payload (from `/api/checkout/initialize`)

```typescript
// Generic structure
{
  serviceType: 'shop' | 'hotel' | 'event' | 'transport' | 'entertainment',
  userId: string,                      // Clerk ID (text) or internal UUID
  currency: 'VND' | 'USD',
  
  // Service-specific fields...
  // Event example:
  eventId?: string,
  sessionId?: string,
  ticketTypeId?: string,
  adultCount?: number,
  childCount?: number,
  
  guestDetails?: {
    name: string,
    email: string,
    phone?: string
  }
}
```

### 2.2 Server-Side Price Calculation Pattern

**CRITICAL RULE:** Backend calculates all prices. Frontend values are display-only.

```typescript
// Example from checkout.service.ts (event branch)
if (payload.serviceType === 'event') {
  // 1. Fetch ticket type from DB
  const { data: ticketType } = await supabase
    .from('event_ticket_types')
    .select('price, currency, total_capacity, sold_count, held_count')
    .eq('id', ticketTypeId)
    .single();
  
  // 2. Server calculates price
  totalAmount = ticketType.price * totalTickets;
  
  // 3. Hold inventory during checkout init
  await supabase.rpc('hold_event_tickets', {
    p_ticket_type_id: ticketTypeId,
    p_quantity: totalTickets
  });
}
```

### 2.3 Response Contract

```typescript
{
  ok: true,
  data: {
    bookingId: string,           // UUID for payment step
    totalAmount: number,         // Server-calculated total
    currency: string,
    status: 'pending'
  }
}
```

---

## 3. Settlement Handler Pattern Analysis

### 3.1 Common Pattern Across All Handlers

```typescript
// From event.ts, hotel.ts, shop.ts
async settle(booking: any): Promise<void> {
  // 1. Idempotency Check (Domain-Level)
  const { data: existing } = await supabase
    .from('domain_table')          // e.g., event_bookings
    .select('id')
    .eq('booking_id', booking.id)
    .single();
  
  if (existing) return;            // Already processed
  
  // 2. Extract Metadata
  const metadata = booking.metadata;
  const { requiredField1, requiredField2 } = metadata;
  
  // 3. Validate
  if (!requiredField1) throw new Error('Missing data');
  
  // 4. Resolve User IDs
  let userUuid = booking.user_id;            // May be UUID or Clerk ID
  let clerkId = null;
  
  // Optionally resolve...
  if (userUuid && !userUuid.startsWith('user_')) {
    const { data: userData } = await supabase
      .from('users')
      .select('clerk_id')
      .eq('id', userUuid)
      .single();
    clerkId = userData?.clerk_id;
  }
  
  // 5. Business Logic (inventory, codes, etc.)
  // ...
  
  // 6. Create Domain Record
  await supabase.from('domain_table').insert({
    booking_id: booking.id,
    user_uuid: userUuid,
    external_user_ref: clerkId || userUuid,  // Clerk ID or fallback
    // ... domain-specific fields
  });
}
```

### 3.2 Handler-Specific Examples

#### Event Settlement Handler
- **Idempotency:** Checks `event_bookings.booking_id`
- **Inventory:** Calls `confirm_event_tickets` RPC (converts held → sold)
- **Generated Assets:** QR codes for each ticket
- **Domain Fields:** `confirmation_code`, `qr_codes JSONB array`, `attendees`

#### Hotel Settlement Handler
- **Idempotency:** Checks `hotel_bookings.booking_id`
- **Inventory:** No inventory management (hotels handle separately)
- **Generated Assets:** `confirmation_code` (format: `HT-{booking_code}`)
- **Domain Fields:** `hotel_id`, `room_id`, `check_in_date`, `check_out_date`, `nightly_rate_cents`

#### Shop Settlement Handler
- **Idempotency:** Checks `shop_orders.booking_id`
- **Inventory:** Calls `decrement_stock` RPC for each variant
- **Generated Assets:** `order_number`, `order_items` table entries
- **Domain Fields:** `cart_id`, `order_items` (separate table), `shipping_address_snapshot`

---

## 4. Entertainment Domain (What Currently Exists)

### 4.1 Existing Schema Tables

From `docs/entertainment/migrations_v2_comprehensive.sql`:

```sql
-- Main tables
entertainment_items           -- Movies, shows, experiences
entertainment_sessions        -- Showtimes, dates
entertainment_ticket_types    -- Pricing tiers (VIP, Standard, etc.)
entertainment_cart
entertainment_cart_items
entertainment_bookings        -- DOMAIN TABLE (not linked to bookings ledger)
entertainment_tickets         -- Individual tickets with QR codes
```

### 4.2 Current `entertainment_bookings` Schema

```sql
CREATE TABLE public.entertainment_bookings (
  id uuid PRIMARY KEY,
  user_id text,                      -- Clerk ID (text)
  item_id uuid NOT NULL REFERENCES entertainment_items(id),
  session_id uuid REFERENCES entertainment_sessions(id),
  organizer_id uuid REFERENCES entertainment_organizers(id),
  
  -- Guest info
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text,
  
  -- Booking details
  ticket_quantity integer NOT NULL,
  ticket_type_name text,
  total_amount numeric NOT NULL,
  currency text DEFAULT 'VND',
  
  -- Status fields (LEGACY - DO NOT USE AS SOURCE OF TRUTH)
  booking_status text DEFAULT 'pending',
  payment_status text DEFAULT 'pending',
  payment_method text,               -- ⚠️ NOT SOURCE OF TRUTH
  payment_reference text,            -- ⚠️ NOT SOURCE OF TRUTH
  payment_date timestamptz,          -- ⚠️ NOT SOURCE OF TRUTH
  
  -- Metadata
  confirmation_code text,
  verification_code text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  ...
);
```

**CRITICAL GAP:** No `booking_id` foreign key to `bookings` ledger. No integration with unified payment system.

---

## 5. Entertainment Integration Requirements

### 5.1 What's Missing

| Component | Status | Required Work |
|-----------|--------|---------------|
| **Schema** | ❌ Not aligned | Add `booking_id` FK, `external_user_ref`, `user_uuid` to `entertainment_bookings` |
| **Checkout Form** | ❌ Not implemented | Create `EntertainmentCheckoutForm` component |
| **Checkout Service Branch** | ❌ Not implemented | Add `serviceType === 'entertainment'` handling in `checkout.service.ts` |
| **Settlement Handler** | ❌ Stub only | Implement `EntertainmentSettlementHandler` with idempotency + inventory |
| **Payment Flow** | ❌ Not integrated | Inherits from unified pipeline (no changes needed) |

### 5.2 Metadata Structure for Settlement

Based on event/hotel patterns, Entertainment metadata should include:

```typescript
{
  serviceType: 'entertainment',
  userId: string,                 // Clerk ID
  currency: 'VND' | 'USD',
  
  // Domain-specific
  itemId: string,                 // entertainment_items.id
  sessionId: string,              // entertainment_sessions.id
  ticketTypeId: string,           // entertainment_ticket_types.id
  quantity: number,               // Total tickets
  
  // Guest details  guestDetails: {
    name: string,
    email: string,
    phone?: string
  },
  
  // Pricing (server-calculated)
  unitPrice: number,              // From entertainment_ticket_types
  totalAmount: number,
  
  // Optional
  specialRequests?: string,
  attendees?: { name: string }[], // If collecting attendee names
}
```

### 5.3 Idempotency Pattern for Entertainment

**Global Level (in SettlementService):**
- Check `booking_events` for `SETTLEMENT_COMPLETED` ✅ (already exists)

**Domain Level (in EntertainmentSettlementHandler):**
- Check if `entertainment_bookings.booking_id` already exists
- If yes, return early (already settled)

**Inventory Management:**
- Create RPC functions similar to events:
  - `hold_entertainment_tickets(p_ticket_type_id, p_quantity)` - during checkout init
  - `confirm_entertainment_tickets(p_ticket_type_id, p_quantity)` - during settlement
  - `release_entertainment_tickets(p_ticket_type_id, p_quantity)` - on timeout/failure

---

## 6. Clerk ID Mapping Strategy

### 6.1 Current System Behavior

The existing system uses **Clerk ID as text** in `bookings.user_id`:

```typescript
// From checkout.service.ts
let userId = payload.userId;

if (userId.startsWith("user_")) {
  // Optional: Resolve to internal UUID
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();
  
  if (user) {
    userId = user.id;  // Use internal UUID
  }
}
```

**Pattern Used:**
- `bookings.user_id` stores internal UUID (if resolvable) or Clerk ID (if not found)
- Domain tables store:
  - `user_uuid` (optional, internal UUID)
  - `external_user_ref` (Clerk ID for API traceability)

### 6.2 Entertainment Alignment

For `entertainment_bookings`, we must add:
```sql
ALTER TABLE entertainment_bookings
  ADD COLUMN booking_id uuid UNIQUE REFERENCES public.bookings(id),
  ADD COLUMN user_uuid uuid REFERENCES public.users(id),
  ADD COLUMN external_user_ref text;  -- Clerk ID
```

---

## 7. Provider Selection Logic

**Currency-Based Routing (No Changes Needed):**
- VND → MoMo provider
- USD → PayPal provider

**Limits:**
- MoMo: 10,000,000 VND max per transaction
- PayPal: No limit enforced

Entertainment inherits this behavior automatically via `/api/payments/create`.

---

## 8. Common Failure Scenarios (Debugging Guide)

| Scenario | Root Cause | Solution |
|----------|------------|----------|
| "Booking not found" during payment | `bookingId` invalid or expired | Check `bookings` table for record existence |
| Webhook not triggering settlement | Signature verification failed | Check webhook signature validation in provider |
| Settlement fails silently | `SETTLEMENT_COMPLETED` event already exists | Check `booking_events` table (idempotency) |
| Price mismatch | Frontend sends price instead of server calculating | Always use server-side price from ticket_types table |
| Inventory not updating | RPC function missing or failing | Check if `confirm_entertainment_tickets` RPC exists |

---

## 9. Next Steps (Implementation Order)

1. **Schema Migration** (Phase B)
   - Update `entertainment_bookings` schema via MCP Supabase
   - Add `booking_id`, `user_uuid`, `external_user_ref`
   - Create inventory RPC functions

2. **Checkout Form** (Phase C)
   - Create `EntertainmentCheckoutForm` component
   - Register in `checkout-form-factory.tsx`
   - Create `/entertainment/checkout` page

3. **CheckoutService Branch** (Phase D)
   - Add `serviceType === 'entertainment'` handling
   - Fetch item/session/ticket_type and validate
   - Calculate price server-side
   - Hold tickets via RPC

4. **Settlement Handler** (Phase E)
   - Implement `EntertainmentSettlementHandler.settle()`
   - Idempotency checks (booking_id + events)
   - Confirm tickets (convert held → sold)
   - Generate entertainment_tickets records with QR codes

5. **Verification** (Phase F)
   - Test full flow: checkout → payment → settlement
   - Verify inventory updates correctly
   - Test idempotency (retry settlement multiple times)

---

## 10. File Reference Map

### Core Files to Modify

| File | Purpose | Changes Needed |
|------|---------|----------------|
| `lib/checkout/services/checkout.service.ts` | Booking creation | Add `serviceType === 'entertainment'` branch |
| `lib/checkout/services/settlement/handlers/entertainment.ts` | Settlement logic | Replace stub with full implementation |
| `components/checkout/checkout-form-factory.tsx` | Form router | Add entertainment case |
| `components/checkout/forms/entertainment-checkout-form.tsx` | **NEW FILE** | Create form component |
| `app/entertainment/checkout/page.tsx` | **NEW FILE** | Create checkout entry page |

### Files That Work Without Changes

| File | Purpose | Why No Changes Needed |
|------|---------|----------------------|
| `/api/checkout/initialize/route.ts` | Delegates to CheckoutService | Generic handler, works for all services |
| `/api/payments/create/route.ts` | Payment intent creation | Works for all booking types |
| `/api/payments/webhooks/momo/route.ts` | MoMo webhook | Provider-agnostic |
| `/api/payments/webhooks/paypal/route.ts` | PayPal webhook | Provider-agnostic |
| `lib/checkout/services/payment.service.ts` | Payment orchestration | Works with bookings ledger |
| `lib/checkout/services/settlement.service.ts` | Settlement delegation | Already registers entertainment handler |

---

## Appendix: Code Snippets from Existing Implementations

### A. Event Checkout Metadata Example

```typescript
// From EventCheckoutForm submission
const payload = {
  serviceType: 'event',
  userId: user?.id || 'GUEST',
  currency: 'VND',
  
  eventId: event.id,
  sessionId: selectedSession,
  ticketTypeId: selectedTicketType,
  adultCount: adultTickets,
  childCount: childTickets,
  
  guestDetails: {
    name: formState.name,
    email: formState.email,
    phone: formState.phone
  },
  
  attendees: [...],  // Optional attendee list
  specialRequests: formState.notes
};
```

### B. Hotel Price Calculation Example

```typescript
// From checkout.service.ts
const { data: hotel } = await supabase
  .from("hotels")
  .select("best_price, metadata")
  .eq("id", payload.hotelId)
  .single();

let nightlyRate = 840;  // Default fallback
if (hotel.best_price) {
  nightlyRate = Math.floor(hotel.best_price / 100);  // Convert cents
}

const roomTotal = nightlyRate * nights;
const tax = Math.round(roomTotal * 0.1 * 100) / 100;
const serviceFee = Math.round(roomTotal * 0.05 * 100) / 100;

totalAmount = roomTotal + tax + serviceFee;
```

### C. Shop Settlement Idempotency Check

```typescript
// From shop.ts
const { data: existingOrder } = await supabase
  .from('shop_orders')
  .select('id, order_number')
  .eq('booking_id', booking.id)
  .maybeSingle();

if (existingOrder) {
  console.log('[SHOP_SETTLEMENT] Idempotent: Order already exists');
  return;
}
```

---

## Summary

The unified payment pipeline is **production-ready** for shop, hotel, event, and transport. Entertainment needs:

1. ✅ **Schema alignment** (booking_id FK + user fields)
2. ✅ **Checkout form** (collect item/session/ticket_type + guest details)
3. ✅ **Service branch** (validate + calculate price + hold tickets)
4. ✅ **Settlement handler** (idempotency + confirm tickets + generate QR codes)

Everything else (payment providers, webhooks, ledger updates) works automatically once these 4 pieces are in place.
