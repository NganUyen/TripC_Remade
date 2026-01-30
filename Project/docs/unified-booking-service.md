# Unified Booking Service Documentation

## 1. Overview
The Unified Booking Service is a robust, modular system designed to handle bookings for over 10 different service types (Hotel, Flight, Shop, Dining, etc.) through a single, consistent architecture.

### Key Architecture: **3-Phase Checkout Pattern**
1.  **Phase 1: Initialization** (`/api/checkout/initialize`)
    -   Validates generic and service-specific payload.
    -   Creates a "Draft" booking in the main `bookings` table.
    -   Calculates total price and metadata.
2.  **Phase 2: Payment** (`/api/payments/create`)
    -   Initiates payment with a third-party provider (Momo, PayPal).
    -   Creates a `payment_transactions` record for audit.
    -   Redirects user to payment gateway.
3.  **Phase 3: Finalization** (Webhook / Callback)
    -   Verifies payment signature (HMAC-SHA256).
    -   Updates booking status to `confirmed`.
    -   **Strategy Execution**: Creates the actual service record (e.g., adds row to `shop_orders` or `flight_bookings`).

---

## 2. Directory Structure

### Backend Logic (`lib/checkout/`)
| Path | Description |
| :--- | :--- |
| `lib/checkout/types.ts` | Unified type definitions (`ServiceType`, `CheckoutPayload`, `BookingStatus`). |
| `lib/checkout/services/` | **Core Services**: |
| ├── `checkout-orchestrator.service.ts` | Main controller. Management of the 3 phases. |
| ├── `booking-service.ts` | Database operations for `bookings` table. Handles ID resolution. |
| └── `transaction-service.ts` | Manages `payment_transactions` table. |
| `lib/checkout/strategies/` | **Strategy Pattern** for Service Specifics: |
| ├── `checkout-strategy.interface.ts` | Interface enforcing `validate`, `calculateTotal`, `createServiceRecord`. |
| ├── `strategy-factory.ts` | Returns the correct strategy based on `serviceType`. |
| ├── `shop-checkout.strategy.ts` | Logic for Shop orders (validation, order creation). |
| └── `hotel-checkout.strategy.ts` | Logic for Hotel bookings. |
| `lib/checkout/payments/` | **Payment Modules**: |
| ├── `payment-provider.interface.ts` | Interface for `createPayment`, `verifyWebhook`. |
| ├── `providers/momo-provider.ts` | Momo integration (HMAC signature, API calls). |
| └── `webhook-handler.ts` | Generic handler for verifying and processing IPNs. |

### API Routes (`app/api/`)
| Path | Method | Purpose |
| :--- | :--- | :--- |
| `/api/checkout/initialize` | `POST` | Phase 1: Create draft booking. |
| `/api/payments/create` | `POST` | Phase 2: Start payment flow. |
| `/api/bookings/user` | `GET` | Fetch user's history (resolves Clerk ID -> UUID). |
| `/api/payments/webhooks/[provider]` | `POST` | Phase 3: Webhook listener (e.g., Momo IPN). |

### Frontend Components (`components/bookings/`)
| Path | Description |
| :--- | :--- |
| `BookingTabs.tsx` | Category filters (Flight, Hotel, Shop, etc.). |
| `cards/UpcomingBookingCard.tsx` | Displays confirmed/active bookings with dynamic icons. |
| `cards/PendingBookingCard.tsx` | Displays unpaid/held bookings. |
| `cards/CancelledBookingCard.tsx` | Displays history of cancelled items. |

---

## 3. Database Schema (SQL)

### A. Main `bookings` Table
Central source of truth for all transaction types.
```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id), -- Standardized to UUID
    booking_type VARCHAR NOT NULL, -- 'shop', 'hotel', 'flight', etc.
    status VARCHAR NOT NULL, -- 'draft', 'pending_payment', 'confirmed', etc.
    
    -- Core Data
    title VARCHAR,
    description TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    price DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'VND',
    total_amount DECIMAL(12,2),
    
    metadata JSONB, -- Stores flexible data (items list, guest details)
    created_at TIMESTAMP DEFAULT NOW()
);
```

### B. `payment_transactions` Table
Audit trail for all payments.
```sql
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    provider VARCHAR NOT NULL, -- 'momo'
    provider_transaction_id VARCHAR, -- Momo Order ID
    status VARCHAR,
    amount DECIMAL(12,2),
    webhook_payload JSONB -- Full IPN Log
);
```

### C. Service Tables (Foreign Keys)
Specific tables linked back to the main booking.
```sql
-- Example: Shop Orders
ALTER TABLE shop_orders ADD COLUMN booking_id UUID REFERENCES bookings(id);

-- Example: Hotel Bookings
ALTER TABLE hotel_bookings ADD COLUMN booking_id UUID REFERENCES bookings(id);
```

---

## 4. Key Logic & Flows

### A. Creating a Shop Order
1.  **Frontend**: `UnifiedCheckoutContainer` sends cart items to `/api/checkout/initialize`.
2.  **Back-End**:
    -   `ShopCheckoutStrategy.validate()` checks stock.
    -   `CheckoutOrchestrator` creates `bookings` row (Status: `draft`).
    -   **Important**: No row is created in `shop_orders` yet.
3.  **Payment**:
    -   User pays via Momo.
    -   Momo redirects user to `/my-bookings`.
    -   Momo calls IPN Webhook in background.
4.  **Finalization (Webhook)**:
    -   Server validates signature.
    -   Server updates `bookings` status -> `confirmed`.
    -   `ShopCheckoutStrategy.createServiceRecord()` is called -> Inserts row into `shop_orders` linked to the booking.

### B. My Bookings Page Logic
1.  **Fetch**: Frontend calls `/api/bookings/user`.
2.  **Resolve ID**: API looks up `users` table to convert Clerk ID (`user_2p...`) to UUID (`550e84...`).
3.  **Filter**:
    -   **Tabs**: All, Pending, Hotel, Shop...
    -   **Logic**:
        -   `Pending`: Shows all held/unpaid bookings.
        -   `Category`: Shows `confirmed`/`paid` bookings of that specific type.
        -   `All`: Shows all active bookings.

---

## 5. Environment Variables
Ensure these are set in `.env`:
```env
# Momo
MOMO_PARTNER_CODE=...
MOMO_ACCESS_KEY=...
MOMO_SECRET_KEY=...
MOMO_CREATE_ENDPOINT=...
MOMO_IPN_URL=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
