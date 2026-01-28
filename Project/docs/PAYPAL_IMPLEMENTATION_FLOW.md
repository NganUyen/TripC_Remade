# PayPal Payment Integration Flow

This document explains the "Standard" flow implemented for PayPal integration in TripC, specifically addressing the "Sync on Return" mechanism used for localhost and robust production fallback.

## Overview

The integration uses a **Server-Side Express Checkout** flow with **Immediate Capture**.

### 1. Payment Initiation (Frontend -> API)
- **User Action**: Selects PayPal and clicks "Pay".
- **API Call**: `POST /api/payments/create`
- **Backend Logic**:
    - Converts amount to USD (PayPal requirement).
    - Calls PayPal `/v2/checkout/orders` to create an Order.
    - Returns an `approve` URL to the frontend.
- **Frontend**: Redirects user to PayPal.

### 2. User Approval (PayPal)
- User logs in to PayPal and approves the payment.
- PayPal redirects user back to `returnUrl` (e.g., `/my-bookings`).
- **URL Parameters**: The return URL includes `token` (Order ID) and `PayerID`.

### 3. Payment Capture & Verification (The "Sync" Step)

This is the critical step where the transaction is finalized.

#### Why "Sync on Return"?
In a production environment with a public domain, PayPal sends a **Webhook** (`PAYMENT.CAPTURE.COMPLETED`) to your server. However:
1.  **Localhost**: Webhooks cannot reach `localhost` without a tunnel (ngrok).
2.  **Reliability**: Webhooks can be delayed.
3.  **UX**: We want the user to see "Paid" immediately upon return.

Therefore, we implement a **Synchronous Capture** on the return page.

#### The Logic Flow:
1.  **Frontend (`my-bookings/page.tsx`)**:
    - Detects `token` and `PayerID` in URL.
    - **UX**: Shows "Verifying PayPal Transaction..." (Blocking UI).
    - **API Call**: `POST /api/payments/sync`.

2.  **Backend (`api/payments/sync`)**:
    - Receives the Order ID (`token`).
    - Calls PayPal API: `/v2/checkout/orders/{id}/capture`.
    - **Idempotency**: If PayPal says `ORDER_ALREADY_CAPTURED`, we treat it as Success (webhook might have raced it).
    - **Settlement**: If Capture is `COMPLETED`, the backend triggers `SettlementService`.
        - Updates `payment_transactions` status to `success`.
        - Updates `bookings` status to `paid` and `confirmed`.
        - Creates Shop Order (if applicable).

3.  **Completion**:
    - Frontend receives `success` from Sync API.
    - Redirects to `/my-bookings?success=true` (removes params).
    - Refetches bookings.
    - **Result**: User sees "Paid" status.

## Is this "Standard"?
**Yes.** This matches the "Server-Side Capture" pattern recommended for robust integrations.
- Relying *only* on webhooks results in "Pending" status for users until the webhook arrives (seconds to minutes).
- Relying *only* on client-side capture is insecure.
- **Our Approach (Sync + Webhook)**: Best of both worlds. We force a sync when the user returns so they see the result immediately, while webhooks serve as a backup for consistency.

## Debugging

- **Logs**: grep for `[PAYPAL_SYNC_START]`, `[API_SYNC_CAPTURING]`, `[SETTLEMENT_COMPLETED]`.
- **Common Issues**:
    - `ORDER_ALREADY_CAPTURED`: Harmless. Means I clicked twice or webhook fired first. handled gracefully.
    - `Body has already been read`: Code bug (Fixed).
