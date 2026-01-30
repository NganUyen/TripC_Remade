# Unified Booking & Payment Pipeline Status

## 1. API Architecture: "Payment" vs "Payments"

You noticed two API folders:
1.  **`/api/payment` (Legacy/Deprecated)**
    *   **Status:** ⚠️ **DEPRECATED**
    *   **Contains:** `/create-url`, `/callback` logic that connects to the old `payments` table.
    *   **Problem:** Does not respect the new "Ledger" architecture (`payment_transactions`) and lacks support for advanced providers like PayPal via `PaymentService`.
    *   **Action:** Should be deleted.

2.  **`/api/payments` (Standard/Unified)**
    *   **Status:** ✅ **ACTIVE**
    *   **Contains:** `/create`, `/webhooks`, `/sync`.
    *   **Logic:** Uses `PaymentService` to interact with the strictly typed `payment_transactions` table.
    *   **Features:** Supports Idempotency, PayPal/MoMo/VNPay adapters, and automated settlement.

**Conclusion:** The existence of `/api/payment` is technical debt. We have already updated the Transport flow to use `/api/payments`. We should delete the legacy folder to prevent confusion.

---

## 2. UI Patterns: Shop vs. Transport

Currently, there are two distinct UI patterns for checkout.

### Pattern A: Connected Stream (Used by Shop)
*   **Component:** `UnifiedCheckoutContainer`
*   **Flow:**
    1.  User enters `UnifiedCheckoutContainer`.
    2.  Container renders `CheckoutFormFactory` (Specific Service Forms).
    3.  User submits details -> `initializeCheckout` hook.
    4.  Container switches to "Payment" step **inline** (same page).
    5.  User selects payment -> `useUnifiedCheckout` hook calls `/api/payments/create`.
*   **Pros:** Seamless, Single Page Application (SPA) feel.
*   **Cons:** Requires current Transport Page logic to be extracted into a component (`TransportCheckoutForm`).

### Pattern B: Redirect Flow (Used by Transport)
*   **Component:** `app/transport/checkout/page.tsx`
*   **Flow:**
    1.  User enters Transport Checkout Page.
    2.  User fills extensive details (Pickup points, Seats) -> Custom Logic.
    3.  User submits -> Redirects to `/payment?bookingId=...`.
    4.  **`/payment` Page:**
        *   Fetches booking.
        *   Renders `PaymentSection` -> Calls `/api/payments/create`.
*   **Pros:** Decoupled. The `/payment` page acts as a "Central Cashier" for any service.
*   **Cons:** Page reload/redirect feels less "App-like" than the Shop flow.

---

## 3. Refactoring Plan: "Clean Code" Convergence

To achieve the "Clean Code" consistency you requested, we should align on **Pattern A (The Container)** while keeping **Pattern B (The Central Page)** as a fallback or for deep links.

### The Plan
1.  **Cleanup Backend:**
    *   Delete `/api/payment` (Legacy).
    *   Ensure all new flows rely solely on `/api/payments` and `PaymentService`.

2.  **Refactor Transport UI:**
    *   **Goal:** Make Transport use `UnifiedCheckoutContainer`.
    *   **Step 1:** Extract the form logic from `transport/checkout/page.tsx` into a new component `components/checkout/forms/TransportCheckoutForm.tsx`.
    *   **Step 2:** Register this new form in `CheckoutFormFactory`.
    *   **Step 3:** Replace `transport/checkout/page.tsx` content with `<UnifiedCheckoutContainer serviceType="transport" />`.


## 4. Cleanup Checklist (Immediate Actions)

To remove ambiguity and duplications, delete the following files:

### Backend (Legacy API)
- [ ] **`d:\react\TripC_Remade\Project\app\api\payment\`** (Entire Directory)
    - *Reason:* Deprecated legacy endpoint. We use `/api/payments` now.

### Frontend (Redundant)
- [ ] **`d:\react\TripC_Remade\Project\components\transport\checkout\PaymentSection.tsx`**
    - *Reason:* Duplicate. We unified this logic into `components/payment/PaymentSection.tsx`.

---

## 5. Flight & Hotel Implementation Guide

To implement Flight and Hotel checkouts efficiently, follow **Pattern A (Unified Container)**. Do not create separate checkout pages like Transport.

### Steps:
1.  **Create Form Component:**
    *   Create `components/checkout/forms/FlightCheckoutForm.tsx`
    *   Create `components/checkout/forms/HotelCheckoutForm.tsx`
    *   *Requirement:* These must accept `onSubmit` prop and pass the generic `CheckoutPayload`.

2.  **Register in Factory:**
    *   Update `components/checkout/checkout-form-factory.tsx`.
    *   Add cases for `'flight'` and `'hotel'` to render your new forms.

3.  **Create Page Wrapper:**
    *   Create `app/flight/checkout/page.tsx` -> renders `<UnifiedCheckoutContainer serviceType="flight" />`
    *   Create `app/hotel/checkout/page.tsx` -> renders `<UnifiedCheckoutContainer serviceType="hotel" />`

**Why this is better:**
*   You get the **Payment Step**, **Currency Guard Modal**, and **Loading Skeletons** for free.
*   No need to wire up API calls manually; `useUnifiedCheckout` handles it.

---

## 6. Common Gotchas & Fixes

### 🔴 "Booking Not Found" / 403 Forbidden / Not Acceptable (PGRST116)
*   **Cause:**
    1.  API comparing Clerk ID (String) vs Booking User ID (UUID).
    2.  Frontend Client trying to `supabase.from('bookings').select()` directly. **This fails RLS** because `auth.uid()` is a Clerk ID, but `bookings.user_id` is a UUID.
*   **Fix:**
    *   **NEVER** use direct Supabase calls to fetch recent bookings in the client.
    *   **ALWAYS** use `fetch('/api/bookings/' + bookingId)`. The API route runs on the server and handles the ID translation securely. (Patched in Transport Checkout).

### 🔴 PayPal Currency Error (VND vs USD)
*   **Cause:** PayPal API rejects VND.
*   **Fix:**
    *   **Backend:** `PayPalProvider` now automatically divides VND by 25,450.
    *   **Frontend:** `CurrencyGuardModal` warns user before redirecting.

### 🔴 Variable Naming Collisions (Syntax Error)
*   **Cause:** When manually patching pages (like Transport) to add API fetches, it's common to copy-paste `const res = await fetch(...)` into a block where `res` already exists.
*   **Fix:** Always use specific variable names for API responses (e.g., `bookingRes`, `paymentRes`) instead of generic `res`.

### 🔴 "PaymentSection" Duplicate
*   **Cause:** `transport/checkout` had its own old copy.
*   **Fix:** Always import from `@/components/payment/PaymentSection`.

---

