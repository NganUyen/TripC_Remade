# Architecture V2 Map: Ledger + Domain

This document explains the structure of the refactored Booking System V2. Although there are several files, they follow a strict "Separation of Concerns" pattern (Traveloka/Uber style) to ensure scalability.

## 1. The Core Philosophy
*   **Ledger (Sổ Cái):** The `bookings` table is the **single source of truth** for Money, Status, and Transactions.
*   **Domain (Nghiệp vụ):** Each service (`shop`, `hotel`, `flight`) has its own table (`shop_orders`) just for specific details (items, room numbers).
    *   **Linking:** The `booking_type` column in `bookings` (e.g., 'shop') tells the system which table to look in.
    *   **Foreign Key:** The domain tables (`shop_orders`) point BACK to the ledger via `booking_id`.
    *   `shop_orders.booking_id` ---> `bookings.id`

## 2. Directory Structure Explained (`lib/checkout`)

The `lib/checkout` folder is the heart of the engine. It is split into 3 logical parts:

### A. Services (`/services`) -> " The Managers"
These coordinate the entire process.
*   `booking-service.ts`: Manages the Ledger (`bookings` table). Creates drafts, updates status.
*   `checkout-orchestrator.service.ts`: The **Conductor**. It receives a request, calls the right Strategy, reserves inventory, and creates the booking. Use this for EVERYTHING.
*   `promotion.service.ts`: Handles Vouchers & Discounts. Snapshots rules to `booking_discounts`.
*   `transaction-service.ts`: Records raw payment logs (Momo, Stripe).

### B. Strategies (`/strategies`) -> "The Specialists"
Each service type has different rules. Strategies handle these differences so the Managers don't get messy.
*   `checkout-strategy.interface.ts`: The contract every service must follow.
*   `shop-checkout.strategy.ts`: Knows how to save Shop items (variants, shipping).
*   `shop-reservation.strategy.ts`: Knows how to check Shop stock and hold it.
*   **Why?** When you add "Hotels", you just add `hotel-checkout.strategy.ts` without touching the core Orchestrator.

### C. Payments (`/payments`) -> "The Bankers"
*   `webhook-handler.ts`: Securely processes payment callbacks (idempotency, signature verified).
*   `providers/momo-provider.ts`: Specific logic for Momo API.

## 3. The New Flow (Data Path)

1.  **Frontend**: Calls `POST /api/checkout/initialize`
2.  **Orchestrator**:
    *   Calls `BookingService` -> Creates Draft in `bookings` (Ledger).
    *   Calls `ShopReservation` -> Checks Stock -> "Holds" Item.
    *   Returns `bookingId`.
3.  **Frontend**: Calls `POST /api/payments/create` -> Redirects to Momo.
4.  **Momo Webhook**:
    *   Calls `WebhookHandler` -> Verifies Signature -> Checks Idempotency.
    *   Updates `payment_transactions`.
    *   Calls `BookingService` -> Updates Ledger to `paid`.
5.  **Frontend (Polling)**:
    *   `MyBookingsPage` detects `pending` -> Polls API -> Shows Success automatically.

## 4. Verification Results
*   **Schema**: `bookings` table now holds `total_amount`, `payment_status`. `shop_orders` no longer stores conflicting money data.
*   **Cleanup**: Legacy `createOrder` logic and old API routes have been removed.

**Status:** The system is Refactored, Clean, and Ready for Scale.
