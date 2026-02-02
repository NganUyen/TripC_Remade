# Unified Booking Pipeline & Architecture Guide

## Overview
TripC uses a **Ledger + Domain** architecture for handling bookings across multiple disparate services (Shop, Hotel, Flight, Dining, etc.).

- **The Ledger (`bookings` table)**: Acts as the central financial and state-of-record ledger. It handles payments, high-level status, and financial reporting. All services *must* write to this table.
- **The Domain Tables (`shop_orders`, `flight_bookings`, etc.)**: Store service-specific details (e.g., shipping addresses for Shop, passenger manifests for Flights).

This separation allows for a unified checkout and payment experience while maintaining the flexibility needed for different inventory types.

---

## 1. Base Ledger Schema (`bookings`)
The `bookings` table is the source of truth for "who paid what and when".

### Core Fields
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key. The central reference ID used for payments. |
| `booking_type` | VARCHAR | Service identifier (e.g., `'shop'`, `'flight'`, `'hotel'`). |
| `user_id` | UUID | Reference to the `users` table. |
| `total_amount` | NUMERIC | The final transactional amount to be charged. |
| `currency` | VARCHAR | 3-letter currency code (e.g., `'USD'`, `'VND'`). |
| `payment_status` | VARCHAR | `'unpaid'`, `'pending'`, `'paid'`, `'failed'`, `'refunded'`. |
| `status` | VARCHAR | High-level state: `'pending_payment'`, `'confirmed'`, `'completed'`, `'cancelled'`. |
| `metadata` | JSONB | Lightweight snapshot of critical info (e.g., `cart_id` for shop). |
| `breakdown` | JSONB | Financial breakdown (taxes, fees, subtotal) for display. |

### SQL Definition
```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL, -- e.g. "Shop Order #123"
    total_amount NUMERIC NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending_payment',
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 2. Service Domain Integrations

### Example A: Shop Service (Cart Model)
**Flow**: User builds a Cart -> Checkout initializes Booking -> Settlement creates Order.

#### Schema: `shop_orders`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key. |
| `booking_id` | UUID | **Foreign Key** to `bookings(id)`. 1:1 Relationship. |
| `order_number` | VARCHAR | Human-readable ID (e.g., `TC-SHOP-8821`). |
| `cart_id` | UUID | Reference to the source cart. |
| `shipping_address`| JSONB | Snapshot of shipping info. |
| `items` | TABLE | Related `order_items` table. |

**Key Difference**: Shop orders are "Inventory Decrement" models. Stocks are locked/decremented upon settlement.

### Example B: Flight Service (Ticket Model)
**Flow**: Search -> Select Offer -> Hold Booking -> Payment -> Ticketing.

#### Schema: `flight_bookings`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key. |
| `booking_id` | UUID | **Foreign Key** to `bookings(id)`. |
| `pnr` | VARCHAR | Airline PNR code (e.g., `ABC123`). |
| `passengers` | JSONB | Array of passenger details (Passport, Name). |
| `ticket_status` | VARCHAR | `'PENDING'`, `'ISSUED'`. |
| `flight_id` | UUID | Reference to `flights` table. |

**Key Difference**: Flights typically require a "Hold" phase (reservation) before payment, and a "Ticketing" phase after payment.

---

## 3. Integration Template: How to Add a New Service
Follow this guide to add a new service (e.g., **"Tours"**) to the unified pipeline.

### Step 1: Design Domain Schema
Create your service-specific table. It **MUST** have a `booking_id` foreign key.

```sql
-- migration.sql
CREATE TABLE tour_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id), -- Link to Ledger
    tour_id UUID REFERENCES tours(id),
    tour_date DATE NOT NULL,
    participants INTEGER DEFAULT 1,
    pickup_location TEXT,
    special_requests TEXT
);
```

### Step 2: Create Settlement Handler
Implement the `ISettlementHandler` interface in the backend (`lib/checkout/services/settlement/handlers/tour.ts`). This logic runs *after* payment succeeds.

```typescript
import { ISettlementHandler } from '../types';

export class TourSettlementHandler implements ISettlementHandler {
    constructor(private supabase: SupabaseClient) {}

    async settle(booking: Booking): Promise<void> {
        // 1. Idempotency Check
        const { data: existing } = await this.supabase
            .from('tour_bookings')
            .select('id')
            .eq('booking_id', booking.id)
            .single();
        
        if (existing) return;

        // 2. Extract Metadata (passed during checkout init)
        const { tourId, date, guests } = booking.metadata;

        // 3. Create Domain Record
        await this.supabase.from('tour_bookings').insert({
            booking_id: booking.id,
            tour_id: tourId,
            tour_date: date,
            participants: guests
        });

        // 4. Send Confirmation Email (Optional)
    }
}
```

### Step 3: Register Handler
Add your handler to the factory in `lib/checkout/services/settlement/settlement.service.ts`.

```typescript
// ... imports
case 'tour':
    return new TourSettlementHandler(this.supabase);
```

### Step 4: Frontend Checkout Form
Create a form component that collects necessary details (e.g., Date, Guests) and calls `initializeCheckout`.

```typescript
// components/checkout/forms/tour-checkout-form.tsx
const payload = {
    serviceType: 'tour',
    userId: user.id,
    currency: 'USD',
    metadata: {
        tourId: selectedTour.id,
        date: selectedDate,
        guests: guestCount
    },
    // The total amount will be calculated by the backend or passed here
    items: [{ price: 50, quantity: guestCount }] 
};

// Call hook
initializeCheckout(payload);
```

---

## 4. Critical Rules & Best Practices
1.  **Idempotency**: Settlement handlers is called via Webhook. It usually retry on failure. Ensure your `settle` function checks if the work is already done (by querying your domain table for `booking_id`).
2.  **Currency**: Respect the `booking.currency`. If your domain requires a specific currency, convert or reject at the `initializeCheckout` stage.
3.  **Metadata**: Use the `metadata` JSONB field in `bookings` to pass temporary state from Checkout to Settlement (e.g., `cartId` for Shop, `searchId` for Flights).
4.  **Error Handling**: If settlement fails, the user has already paid! You must log Critical Errors and potentially alert support for manual intervention.
