# Unified Booking & Payment Architecture

> [!NOTE]
> This document details the architectural standards for the TripC Booking System following the "Unified Platform" refactor.

## 1. Core Philosophy (Mental Model)

- **Bookings (`bookings`)**: The central entity representing a user's intent to purchase. It holds the lifecycle state (`pending`, `confirmed`, `completed`) but *not* the domain details.
- **Service Tables (`flight_bookings`, `hotel_bookings`, `shop_orders`)**: Domain-specific details linked 1:1 to the `bookings` table. These tables handle the "WHAT" (e.g., flight number, room type, product items).
- **Payment Transactions (`payment_transactions`)**: The **Single Source of Truth** for money movement. No more dispersed payment tables.
- **Booking Reservations (`booking_reservations`)**: Handles temporary state (inventory holds, expiration timers). It contains NO business logic.
- **Webhooks**: Treated as event inputs. Idempotency is enforced at the database level.

---

## 2. Refactored Schema Structure

### A. Unified Tables (Platform Layer)
These tables act across ALL categories (Flight, Hotel, Shop).

| Table | Purpose | Key Relations |
| :--- | :--- | :--- |
| **`bookings`** | Central Registry | `id` (PK), `user_id` (UUID), `booking_type` (Enum) |
| **`payment_transactions`** | Money Ledger | `booking_id` -> `bookings(id)` |
| **`booking_notifications`** | User Alerts | `booking_id` -> `bookings(id)` |
| **`loyalty_transactions`** | Points/Rewards | `booking_id` -> `bookings(id)` |
| **`booking_reservations`** | Expiry/Holds | `booking_id` -> `bookings(id)` |
| **`booking_events`** | Idempotency Log | `booking_id` -> `bookings(id)` |

### B. Domain Tables (Service Layer)
Check-ins, tickets, and modifications are strictly domain concerns.

- **Flight**: `flight_bookings`, `flight_checkins`, `flight_tickets`, `flight_booking_modifications`
- **Shop**: `shop_orders` (Order items, shipping)
- **Hotel**: `hotel_bookings` (Guests, rooms)

---

## 3. Critical Constraints & Safety

### Payment Resilience
- **Duplicate Prevention**: `UNIQUE(provider, provider_transaction_id)`
  - *Why?* Prevents double-charging if a webhook retries or a provider glitches.
- **Lookup Performance**: `INDEX(booking_id, status, created_at)`
  - *Why?* Fast retrieval of payment status for specific bookings.

### Idempotency Guard
- **Table**: `booking_events`
- **Constraint**: `UNIQUE(booking_id, event_type)`
- **Event Types**:
  - `PAYMENT_CONFIRMED`: Ensures we only process payment success once.
  - `FINALIZED`: Ensures we only issue tickets/emails once.
  - `LOYALTY_EARNED`: Ensures points are meant to be awarded only once.

### Foreign Key Integrity
- **Unified Tables** (`notifications`, `loyalty`, `hotel_reviews`) point directly to `bookings(id)`.
- **Domain Tables** (`flight_bookings`, `hotel_bookings`) point to `bookings(id)` via `booking_id`.
- **Flight Sub-tables** (`flight_checkins`, `flight_tickets`) use `flight_booking_id` to refer to `flight_bookings(id)`.

---

## 4. Implementation Guidelines

### Writing a New Service (e.g., Car Rental)
1. **Create Domain Table**: `car_bookings` with `booking_id` FK to `bookings` (Unified ID).
2. **Domain Details**: If creating sub-tables (e.g., `car_insurances`), use `car_booking_id` to refer to the domain table, NOT `booking_id`.
3. **Use Unified Payment**: Do NOT create `car_payments`. Use `payment_transactions`.
4. **Use Unified Notifications**: Insert into `booking_notifications`.

### Handling Webhooks
1. **Receive Event**: Extract `provider_transaction_id`.
2. **Upsert Payment**: Insert into `payment_transactions`. If collision -> Ignore/Update status.
3. **Finalize**: 
   - Check `booking_events` for `FINALIZED`.
   - If not exists -> Execute logic (Email, Ticket) -> Insert `FINALIZED`.
   - If exists -> Return 200 OK (Idempotent).

---

## 5. Migration History
- **Phase 1**: Removed legacy `payment_intents` and `booking_payments`.
- **Phase 2**: Renamed flight-specific tables from `booking_checkins` to `flight_checkins`.
- **Phase 3**: Backfilled and repointed FKs for `notifications` and `loyalty` to strict `bookings(id)`.
- **Phase 4**: Added `user_uuid` for future standardized user handling.
- **Phase 5**: Cleaned up `booking_reservations`.
- **Phase 6**: Added `booking_events` for idempotency.
- **Phase 7**: Repointed `hotel_reviews` to Unified `bookings` and renamed flight domain keys.
- **Phase 8**: Standardized `user_id` to UUID FK and removed duplicate reservation state from `bookings`.
