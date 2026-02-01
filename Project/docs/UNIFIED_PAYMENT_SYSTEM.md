# TripC Unified Payment System Documentation

> **Last Updated:** 2024-01-31
> **Status:** Production-Ready (with noted gaps)
> **Author:** Development Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Complete Flow Diagram](#complete-flow-diagram)
4. [Database Schema](#database-schema)
5. [Service Types & Implementation Status](#service-types--implementation-status)
6. [API Endpoints](#api-endpoints)
7. [Payment Providers](#payment-providers)
8. [Settlement Handlers](#settlement-handlers)
9. [Frontend Components](#frontend-components)
10. [What Has Been Done](#what-has-been-done)
11. [What Still Needs to Be Done](#what-still-needs-to-be-done)
12. [What Has Not Been Done Yet](#what-has-not-been-done-yet)
13. [Testing Checklist](#testing-checklist)
14. [Debugging Guide](#debugging-guide)

---

## Executive Summary

The TripC platform implements a **unified checkout and payment system** designed to handle multiple service types (hotels, flights, events, transport, shop, etc.) through a single, consistent flow.

### Key Design Principles

1. **Ledger Pattern**: The `bookings` table acts as a central financial ledger
2. **Server Authority**: Backend calculates all prices (frontend values are display-only)
3. **Idempotency**: Every critical operation has duplicate-prevention guards
4. **Separation of Concerns**:
   - `bookings` = financial/status ledger
   - `{service}_bookings` = domain-specific details
   - `payment_transactions` = money movement audit trail

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           COMPONENT LAYERS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FRONTEND LAYER                                                             │
│  ├── app/{service}/checkout/page.tsx     (Entry point per service)         │
│  ├── UnifiedCheckoutContainer             (Orchestrator component)          │
│  ├── CheckoutFormFactory                  (Renders service-specific form)   │
│  ├── {Service}CheckoutForm                (Collects booking details)        │
│  ├── PaymentMethodSelector                (MoMo/PayPal selection)           │
│  └── useUnifiedCheckout                   (Hook for API calls)              │
│                                                                             │
│  API LAYER                                                                  │
│  ├── /api/checkout/initialize             (Creates booking record)          │
│  ├── /api/payments/create                 (Creates payment intent)          │
│  ├── /api/payments/webhooks/{provider}    (Receives payment callbacks)      │
│  └── /api/payments/sync                   (Manual capture fallback)         │
│                                                                             │
│  SERVICE LAYER                                                              │
│  ├── CheckoutService                      (Booking creation + validation)   │
│  ├── PaymentService                       (Payment intent + webhook)        │
│  └── SettlementService                    (Post-payment domain logic)       │
│                                                                             │
│  PROVIDER LAYER                                                             │
│  ├── MomoPaymentProvider                  (VND payments)                    │
│  └── PaypalPaymentProvider                (USD payments)                    │
│                                                                             │
│  SETTLEMENT HANDLERS                                                        │
│  ├── ShopSettlementHandler                (Orders + inventory)              │
│  ├── HotelSettlementHandler               (Hotel bookings)                  │
│  ├── FlightSettlementHandler              (PNR generation)                  │
│  ├── EventSettlementHandler               (Tickets + QR codes)              │
│  ├── TransportSettlementHandler           (Transport bookings)              │
│  └── {Others}SettlementHandler            (Stubs - not implemented)         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CHECKOUT FLOW (4 PHASES)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║ PHASE 1: INITIALIZATION                                               ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                             │
│  User selects service → {Service}CheckoutForm collects details              │
│       ↓                                                                     │
│  UnifiedCheckoutContainer.handleDetailsSubmit()                             │
│       ↓                                                                     │
│  useUnifiedCheckout.initializeCheckout()                                    │
│       ↓                                                                     │
│  POST /api/checkout/initialize                                              │
│       ↓                                                                     │
│  CheckoutService.createBooking()                                            │
│       • Resolves Clerk ID → UUID (if user_abc format)                       │
│       • Validates service-specific data                                     │
│       • Calculates price SERVER-SIDE (authoritative)                        │
│       • Creates `bookings` record (status: 'pending')                       │
│       • Creates 'BOOKING_CREATED' event                                     │
│       • [Events only] Holds tickets via hold_event_tickets()                │
│       ↓                                                                     │
│  Returns: { bookingId, totalAmount, currency, status }                      │
│                                                                             │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║ PHASE 2: PAYMENT INITIATION                                           ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                             │
│  User accepts terms → Selects payment method (MoMo/PayPal)                  │
│       ↓                                                                     │
│  UnifiedCheckoutContainer.handlePaymentSelect()                             │
│       • Validates terms acceptance                                          │
│       • Currency guard check (USD↔VND conversion warning)                   │
│       • MoMo limit check (10,000,000 VND max)                               │
│       ↓                                                                     │
│  useUnifiedCheckout.initiatePayment()                                       │
│       ↓                                                                     │
│  POST /api/payments/create                                                  │
│       ↓                                                                     │
│  PaymentService.createPaymentIntent()                                       │
│       • Fetches booking details                                             │
│       • Checks for existing pending transaction (idempotency)               │
│       • Calls Provider.createPaymentIntent()                                │
│       • Creates `payment_transactions` record (status: 'pending')           │
│       ↓                                                                     │
│  Returns: { paymentUrl, providerTxnId }                                     │
│       ↓                                                                     │
│  Browser redirects to payment gateway (MoMo app / PayPal)                   │
│                                                                             │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║ PHASE 3: PAYMENT CONFIRMATION                                         ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                             │
│  Path A: Webhook (Production - Preferred)                                   │
│  ─────────────────────────────────────────                                  │
│  Provider sends IPN → POST /api/payments/webhooks/{provider}                │
│       ↓                                                                     │
│  PaymentService.handleWebhook()                                             │
│       • Verifies signature (HMAC-SHA256 for MoMo)                           │
│       • Parses webhook payload                                              │
│       • Finds matching `payment_transactions` by provider_txn_id            │
│       • Updates transaction status                                          │
│       • If success → triggers SettlementService.settleBooking()             │
│                                                                             │
│  Path B: Manual Sync (Development/Fallback)                                 │
│  ──────────────────────────────────────────                                 │
│  POST /api/payments/sync (PayPal capture)                                   │
│  POST /api/payments/momo/verify-redirect (MoMo redirect params)             │
│       ↓                                                                     │
│  Captures payment directly via provider API                                 │
│       ↓                                                                     │
│  Triggers settlement if successful                                          │
│                                                                             │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║ PHASE 4: SETTLEMENT                                                   ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                             │
│  SettlementService.settleBooking(bookingId)                                 │
│       ↓                                                                     │
│  1. Fetches booking from DB                                                 │
│  2. Checks global idempotency (SETTLEMENT_COMPLETED event exists?)          │
│       ↓                                                                     │
│  3. Delegates to ServiceSettlementHandler.settle()                          │
│       • Handler checks domain-level idempotency                             │
│       • Creates domain record (e.g., event_bookings)                        │
│       • Updates inventory (e.g., confirm tickets, decrement stock)          │
│       • Generates confirmation codes/QR codes                               │
│       ↓                                                                     │
│  4. Updates booking: status='confirmed', payment_status='paid'              │
│       ↓                                                                     │
│  5. Records SETTLEMENT_COMPLETED event (idempotency key)                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Central Ledger: `bookings` Table

```sql
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,           -- 'hotel', 'flight', 'shop', 'event', etc.
  user_id text,                     -- Clerk user ID or UUID
  title text NOT NULL,
  description text,
  image_url text,
  location_summary text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  status text DEFAULT 'pending',    -- pending, confirmed, completed, cancelled
  payment_status varchar DEFAULT 'unpaid', -- unpaid, pending, paid, refunded, failed
  total_amount numeric NOT NULL,
  currency text DEFAULT 'VND',
  booking_code text UNIQUE,
  guest_details jsonb,
  metadata jsonb,                   -- CRITICAL: Full checkout payload for settlement
  idempotency_key varchar UNIQUE,
  breakdown jsonb,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Payment Transactions Table

```sql
CREATE TABLE public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id),
  provider varchar NOT NULL,        -- 'momo', 'paypal'
  provider_transaction_id varchar,  -- Provider's order/transaction ID
  idempotency_key varchar UNIQUE,
  status varchar NOT NULL,          -- pending, processing, success, failed, refunded
  amount numeric NOT NULL,
  currency varchar DEFAULT 'USD',
  webhook_payload jsonb,            -- Raw webhook data for audit
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(provider, provider_transaction_id)
);
```

### Booking Events Table (Idempotency Guard)

```sql
CREATE TABLE public.booking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id),
  event_type text NOT NULL,         -- BOOKING_CREATED, SETTLEMENT_COMPLETED, etc.
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(booking_id, event_type)    -- Prevents duplicate events
);
```

### Domain Tables (1:1 with bookings)

| Table | Primary Use | Key Fields |
|-------|-------------|------------|
| `hotel_bookings` | Hotel reservations | hotel_id, room_id, check_in_date, check_out_date, confirmation_code |
| `flight_bookings` | Flight tickets | offer_id, flight_id, pnr, passengers[], status |
| `shop_orders` | E-commerce orders | order_number, cart_id, shipping_address_snapshot |
| `event_bookings` | Event tickets | event_id, session_id, ticket_type_id, qr_codes[], confirmation_code |
| `transport_bookings` | Transport | route_id, passenger_info, vehicle_snapshot |

---

## Service Types & Implementation Status

| Service Type | CheckoutForm | Settlement Handler | API Support | Status |
|-------------|--------------|-------------------|-------------|--------|
| `hotel` | ✅ HotelCheckoutForm | ✅ HotelSettlementHandler | ✅ | **Production** |
| `shop` | ✅ ShopCheckoutForm | ✅ ShopSettlementHandler | ✅ | **Production** |
| `event` | ✅ EventCheckoutForm | ✅ EventSettlementHandler | ✅ | **Production** |
| `transport` | ✅ TransportCheckoutForm | ✅ TransportSettlementHandler | ✅ | **Production** |
| `flight` | ❌ Placeholder | ✅ FlightSettlementHandler | ⚠️ Partial | **In Progress** |
| `dining` | ❌ Not implemented | ❌ Throws error | ❌ | **Not Started** |
| `wellness` | ❌ Not implemented | ❌ Throws error | ❌ | **Not Started** |
| `activity` | ❌ Not implemented | ❌ Throws error | ❌ | **Not Started** |
| `beauty` | ❌ Not implemented | ❌ Throws error | ❌ | **Not Started** |
| `entertainment` | ❌ Not implemented | ❌ Throws error | ❌ | **Not Started** |

---

## API Endpoints

### Checkout Endpoints

| Endpoint | Method | Purpose | Request Body |
|----------|--------|---------|--------------|
| `/api/checkout/initialize` | POST | Creates booking record | `CheckoutPayload` |

### Payment Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/payments/create` | POST | Creates payment intent, returns paymentUrl |
| `/api/payments/sync` | POST | Manual PayPal capture (dev/fallback) |
| `/api/payments/momo/verify-redirect` | POST | MoMo redirect verification |
| `/api/payments/webhooks/momo` | POST | MoMo IPN webhook receiver |
| `/api/payments/webhooks/paypal` | POST | PayPal webhook receiver |

### Request/Response Examples

**Initialize Checkout (Event):**
```typescript
// Request
POST /api/checkout/initialize
{
  serviceType: 'event',
  userId: 'user_abc123',        // Clerk ID
  currency: 'VND',
  eventId: 'uuid',
  sessionId: 'uuid',
  ticketTypeId: 'uuid',
  adultCount: 2,
  childCount: 1,
  guestDetails: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+84123456789'
  }
}

// Response
{
  ok: true,
  data: {
    bookingId: 'uuid',
    totalAmount: 1500000,
    currency: 'VND',
    status: 'pending'
  }
}
```

**Create Payment:**
```typescript
// Request
POST /api/payments/create
{
  bookingId: 'uuid',
  provider: 'momo',
  returnUrl: 'https://tripc.vn/my-bookings'
}

// Response
{
  ok: true,
  data: {
    paymentUrl: 'https://test-payment.momo.vn/v2/gateway/pay?...',
    providerTxnId: 'MOMO1706123456789'
  }
}
```

---

## Payment Providers

### MoMo Provider

**File:** `lib/checkout/payments/providers/momo-provider.ts`

| Property | Value |
|----------|-------|
| Status | ✅ **Fully Implemented** |
| Currency | VND only (auto-converts USD → VND) |
| Environment | Test: `test-payment.momo.vn`, Prod: `payment.momo.vn` |
| Signature | HMAC-SHA256 |
| Payment Type | `captureWallet` |
| Limit | 10,000,000 VND per transaction |

**Flow:**
1. Creates signed request with `partnerCode`, `accessKey`, `orderId`
2. POST to MoMo API → returns `payUrl` and `qrCodeUrl`
3. User completes payment in MoMo app/web
4. MoMo sends IPN to `/api/payments/webhooks/momo`
5. Webhook handler verifies signature, triggers settlement

### PayPal Provider

**File:** `lib/checkout/payments/providers/paypal-provider.ts`

| Property | Value |
|----------|-------|
| Status | ⚠️ **Implemented (signature verification TODO)** |
| Currency | USD (auto-converts VND → USD) |
| Environment | Sandbox: `api-m.sandbox.paypal.com`, Live: `api-m.paypal.com` |
| Auth | OAuth2 access token |
| Order Intent | `CAPTURE` |

**Known Issue:** `verifyWebhookSignature()` always returns `true` - security risk in production.

### VNPAY Provider

**Status:** ❌ **NOT IMPLEMENTED**

Type signature exists but no provider class:
```typescript
// In use-unified-checkout.ts
provider: 'momo' | 'vnpay' | 'paypal'  // vnpay has no implementation!
```

---

## Settlement Handlers

### Base Interface

```typescript
// lib/checkout/services/settlement/types.ts
interface ISettlementHandler {
  settle(booking: any): Promise<void>;
}
```

### Common Pattern

All handlers follow this pattern:

```typescript
async settle(booking: any): Promise<void> {
  // 1. IDEMPOTENCY CHECK
  const { data: existing } = await supabase
    .from('domain_table')
    .select('id')
    .eq('booking_id', booking.id)
    .single();
  
  if (existing) return; // Already processed

  // 2. EXTRACT METADATA
  const details = booking.metadata;

  // 3. VALIDATE
  if (!details.requiredField) throw new Error('Missing data');

  // 4. BUSINESS LOGIC
  // - Create domain record
  // - Update inventory
  // - Generate codes

  // 5. INSERT DOMAIN RECORD
  await supabase.from('domain_table').insert({...});
}
```

### Handler-Specific Logic

| Handler | Domain Table | Special Logic |
|---------|-------------|---------------|
| `ShopSettlementHandler` | `shop_orders` + `order_items` | Creates order, line items, decrements stock, clears cart |
| `HotelSettlementHandler` | `hotel_bookings` | Resolves user UUID, calculates rate in cents, generates confirmation |
| `FlightSettlementHandler` | `flight_bookings` | Generates PNR, stores passengers, sets status=TICKETED |
| `EventSettlementHandler` | `event_bookings` | Confirms tickets (`confirm_event_tickets`), generates QR codes, updates session status |
| `TransportSettlementHandler` | `transport_bookings` | Stores route_id, passenger_info, vehicle_snapshot |

---

## Frontend Components

### File Structure

```
components/checkout/
├── unified-checkout-container.tsx    # Main orchestrator
├── checkout-form-factory.tsx         # Renders correct form per service
├── checkout-steps.tsx                # Progress indicator
├── payment-method-selector.tsx       # MoMo/PayPal buttons
├── terms-and-conditions.tsx          # T&C with scroll + checkbox
├── currency-guard-modal.tsx          # USD↔VND conversion warning
├── CurrencyConversionInfo.tsx        # Exchange rate display
└── forms/
    ├── shop-checkout-form.tsx
    ├── hotel-checkout-form.tsx
    ├── event-checkout-form.tsx
    ├── transport-checkout-form.tsx
    └── shop-checkout-skeleton.tsx
```

### UnifiedCheckoutContainer Flow

```typescript
// components/checkout/unified-checkout-container.tsx

1. step='details' → Renders CheckoutFormFactory
2. User submits → handleDetailsSubmit() → initializeCheckout()
3. On success → step='payment'
4. User accepts terms → PaymentMethodSelector enabled
5. User selects method → handlePaymentSelect()
6. Currency guard check → CurrencyGuardModal (if needed)
7. initiatePayment() → Redirect to payment gateway
```

---

## What Has Been Done

### ✅ Core Infrastructure

- [x] `bookings` table as unified ledger
- [x] `payment_transactions` table for audit trail
- [x] `booking_events` table for idempotency
- [x] CheckoutService with server-side price calculation
- [x] PaymentService with provider abstraction
- [x] SettlementService with handler delegation

### ✅ Payment Providers

- [x] MoMo provider (full implementation)
- [x] PayPal provider (implementation, signature TODO)
- [x] Webhook endpoints for both providers
- [x] Manual sync/verify endpoints (dev fallback)

### ✅ Service Implementations

**Shop:**
- [x] ShopCheckoutForm
- [x] ShopSettlementHandler (orders, items, inventory)
- [x] Cart integration

**Hotel:**
- [x] HotelCheckoutForm
- [x] HotelSettlementHandler
- [x] Rate calculation (best_price / 100)

**Events:**
- [x] Events database schema (4 tables)
- [x] Event API routes (list, detail, availability)
- [x] EventBookingSidebar with real-time availability
- [x] EventMobileBookingBar
- [x] EventCheckoutForm
- [x] EventSettlementHandler with QR code generation
- [x] Ticket inventory functions (hold, confirm, release)
- [x] Events checkout page (`/events/checkout`)

**Transport:**
- [x] TransportCheckoutForm
- [x] TransportSettlementHandler
- [x] Route/vehicle integration

**Flight:**
- [x] FlightSettlementHandler (PNR generation)
- [x] Basic integration with Amadeus API

### ✅ Frontend Components

- [x] UnifiedCheckoutContainer
- [x] CheckoutFormFactory
- [x] PaymentMethodSelector
- [x] TermsAndConditions (scroll + accept)
- [x] CurrencyGuardModal
- [x] CurrencyConversionInfo
- [x] CheckoutSteps

### ✅ Recent Work (Events Feature)

- [x] Fixed `/events/[id]/page.tsx` - Changed from `use(params)` to `useParams()`
- [x] Rewrote EventBookingSidebar with:
  - Session selection dropdown
  - Ticket type selector
  - Real-time availability via `useTicketAvailability`
  - Quantity controls with validation
  - Dynamic pricing
  - Checkout integration
- [x] Created EventMobileBookingBar
- [x] Created EventCheckoutForm
- [x] Updated CheckoutFormFactory for events
- [x] Created `/events/checkout/page.tsx`
- [x] Updated CheckoutService to handle events (hold tickets, calculate price)
- [x] EventSettlementHandler with inventory confirmation and QR codes

---

## What Still Needs to Be Done

### 🔴 Critical (Security/Functionality)

1. **PayPal Signature Verification**
   - File: `lib/checkout/payments/providers/paypal-provider.ts:127`
   - Current: `verifyWebhookSignature()` returns `true` always
   - Risk: Spoofed webhooks could trigger settlement
   - Fix: Implement proper PayPal webhook signature verification

2. **VNPAY Provider Implementation**
   - Type exists but no provider class
   - Vietnam market requires this
   - Files needed:
     - `lib/checkout/payments/providers/vnpay-provider.ts`
     - `/api/payments/webhooks/vnpay/route.ts`

3. **Stock Decrement RPC**
   - ShopSettlementHandler references `decrement_stock` RPC
   - Fallback exists but warns
   - Need to create Supabase function

### 🟡 Medium Priority

4. **Flight Checkout Form**
   - File: `components/checkout/checkout-form-factory.tsx:27`
   - Current: Returns placeholder `<div>`
   - Need: Full FlightCheckoutForm with passenger details

5. **Booking Expiration Worker**
   - Held event tickets need to be released on timeout
   - Pending bookings need cleanup
   - Consider: Supabase Edge Function or cron job

6. **Error Recovery**
   - Webhook retry mechanism
   - Failed settlement recovery
   - Manual admin tools for stuck bookings

### 🟢 Low Priority (Future Services)

7. **Dining Settlement Handler** - throws "not implemented"
8. **Wellness Settlement Handler** - throws "not implemented"
9. **Activity Settlement Handler** - throws "not implemented"
10. **Beauty Settlement Handler** - throws "not implemented"
11. **Entertainment Settlement Handler** - throws "not implemented"

---

## What Has Not Been Done Yet

### Not Started - Services

| Service | CheckoutForm | Settlement | Schema | Notes |
|---------|-------------|------------|--------|-------|
| Dining | ❌ | ❌ | ⚠️ Partial | Has cart API but no checkout |
| Wellness | ❌ | ❌ | ❌ | Spa/massage bookings |
| Activity | ❌ | ❌ | ❌ | Tours, experiences |
| Beauty | ❌ | ❌ | ❌ | Salon appointments |
| Entertainment | ❌ | ❌ | ❌ | Movies, parks |

### Not Started - Features

- [ ] Refund flow (payment_status='refunded' exists but no UI/API)
- [ ] Partial refund handling
- [ ] Booking modification flow
- [ ] Email notifications (confirmation, reminder)
- [ ] SMS notifications
- [ ] Admin dashboard for bookings
- [ ] Customer support ticket integration
- [ ] Multi-currency display (show both VND and USD)
- [ ] Saved payment methods
- [ ] Recurring bookings

### Not Started - Infrastructure

- [ ] Webhook event replay system
- [ ] Dead letter queue for failed webhooks
- [ ] Rate limiting on payment endpoints
- [ ] Fraud detection rules
- [ ] PCI compliance audit
- [ ] Load testing for high-volume events

---

## Testing Checklist

### Event Checkout Flow

```bash
# 1. Navigate to events list
/events

# 2. Click an event to view details
/events/{id}

# 3. In sidebar:
- [ ] Select session from dropdown
- [ ] Select ticket type
- [ ] Adjust adult/child counts
- [ ] Verify price calculation
- [ ] Click "Get Tickets"

# 4. On checkout page (/events/checkout?...)
- [ ] Verify event details displayed
- [ ] Fill contact info
- [ ] Click "Proceed to Payment"

# 5. Payment step
- [ ] Accept terms (scroll to bottom)
- [ ] Select MoMo or PayPal
- [ ] Complete payment on provider

# 6. Verify settlement
- [ ] Check `bookings` table: status='confirmed'
- [ ] Check `event_bookings` table: record exists with QR codes
- [ ] Check `event_ticket_types`: sold_count incremented
```

### Database Verification Queries

```sql
-- Check booking status
SELECT id, category, status, payment_status, total_amount, currency 
FROM bookings 
WHERE id = 'your-booking-id';

-- Check event booking
SELECT * FROM event_bookings 
WHERE booking_id = 'your-booking-id';

-- Check ticket inventory
SELECT name, total_capacity, sold_count, held_count 
FROM event_ticket_types 
WHERE session_id = 'your-session-id';

-- Check booking events
SELECT * FROM booking_events 
WHERE booking_id = 'your-booking-id' 
ORDER BY created_at;

-- Check payment transaction
SELECT * FROM payment_transactions 
WHERE booking_id = 'your-booking-id';
```

---

## Debugging Guide

### Common Issues

**1. "Booking not found" on payment create**
- Check: Is bookingId UUID valid?
- Check: Does booking exist in `bookings` table?
- Check: Is booking.payment_status already 'paid'?

**2. Webhook not triggering settlement**
- Check: Webhook URL configured in provider dashboard
- Check: Signature verification passing
- Check: `payment_transactions` has matching `provider_transaction_id`
- Check: Console logs for `[WEBHOOK_*]` entries

**3. Settlement fails silently**
- Check: `booking_events` for SETTLEMENT_COMPLETED (already processed)
- Check: Domain table for existing record (idempotency)
- Check: `metadata` field has required data

**4. Events tickets not being held**
- Check: `hold_event_tickets` RPC exists in Supabase
- Check: Ticket type has available capacity
- Check: Console for `[CheckoutService]` logs

**5. Price mismatch**
- Remember: Server calculates price, not frontend
- Check: `total_amount` in bookings matches expected
- Check: CheckoutService calculation logic for that service type

### Log Patterns to Search

```
[CheckoutService]     - Booking creation
[PaymentService]      - Payment intent creation
[WEBHOOK_*]           - Webhook processing
[SETTLEMENT_*]        - Settlement flow
[EVENT_SETTLEMENT]    - Event-specific settlement
```

---

## File Reference

### Core Files

| File | Purpose |
|------|---------|
| `lib/checkout/types.ts` | Type definitions for all payloads |
| `lib/checkout/services/checkout.service.ts` | Booking creation |
| `lib/checkout/services/payment.service.ts` | Payment flow |
| `lib/checkout/services/settlement.service.ts` | Settlement orchestration |
| `lib/checkout/payments/providers/*.ts` | Payment provider implementations |
| `lib/checkout/services/settlement/handlers/*.ts` | Domain settlement handlers |

### API Routes

| File | Endpoint |
|------|----------|
| `app/api/checkout/initialize/route.ts` | POST /api/checkout/initialize |
| `app/api/payments/create/route.ts` | POST /api/payments/create |
| `app/api/payments/webhooks/momo/route.ts` | POST /api/payments/webhooks/momo |
| `app/api/payments/webhooks/paypal/route.ts` | POST /api/payments/webhooks/paypal |

### Frontend

| File | Purpose |
|------|---------|
| `components/checkout/unified-checkout-container.tsx` | Main checkout UI |
| `components/checkout/checkout-form-factory.tsx` | Form router |
| `hooks/checkout/use-unified-checkout.ts` | API hooks |
| `app/{service}/checkout/page.tsx` | Entry pages |

---

## Appendix: Environment Variables

```env
# MoMo
MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_ENVIRONMENT=sandbox  # or 'live'

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Currency
EXCHANGE_RATE_USD_VND=24000  # Adjust as needed
```

---

*End of Documentation*
