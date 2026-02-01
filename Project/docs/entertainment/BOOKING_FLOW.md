# Entertainment Booking Flow Documentation

## Overview

The entertainment booking system now matches the hotel booking pattern with direct database integration and email confirmation.

## Architecture

### Flow Diagram

```
User → TicketBookingWidget → POST /api/entertainment/bookings → Database + Email
```

### Key Features

- ✅ Direct booking (no cart required)
- ✅ Database persistence to `entertainment_bookings` table
- ✅ Automatic email confirmation with tickets and QR codes
- ✅ Unique confirmation code generation (format: ENT-ABC123)
- ✅ Real-time availability checking
- ✅ Ticket generation with QR codes
- ✅ Service fee calculation (7.5%)
- ✅ Guest booking support (optional authentication)

## API Endpoint

### POST /api/entertainment/bookings

**Request Body:**

```typescript
{
  item_id: string              // Entertainment item ID
  session_id?: string          // Optional session ID
  ticket_type_id: string       // Ticket type ID
  quantity: number             // Number of tickets
  customer: {
    name: string               // Customer full name
    email: string              // Customer email
    phone?: string             // Optional phone
  }
  add_ons?: string[]           // Optional add-on IDs
  special_requests?: string    // Optional notes
}
```

**Success Response (200):**

```typescript
{
  success: true,
  data: {
    booking_id: string         // Database booking ID
    confirmation_code: string  // ENT-ABC123
    status: "confirmed"
    ticket_count: number
    tickets: [
      {
        ticket_number: string  // ENT-ABC123-T01
        qr_code: string        // QR code data
      }
    ]
    total_amount: number
    currency: "USD"
    breakdown: {
      tickets: number          // Ticket subtotal
      add_ons: number          // Add-ons total
      service_fee: number      // 7.5% fee
    }
  }
}
```

**Error Responses:**

- `400 INVALID_REQUEST` - Missing required fields
- `400 INVALID_CUSTOMER` - Invalid customer data
- `404 ITEM_NOT_FOUND` - Entertainment item not found
- `404 TICKET_TYPE_NOT_FOUND` - Ticket type not found
- `404 SESSION_NOT_FOUND` - Session not found
- `404 USER_NOT_FOUND` - User not in database (auth required)
- `409 INSUFFICIENT_AVAILABILITY` - Not enough spots available
- `500 BOOKING_FAILED` - Generic booking failure

## Database Schema

### entertainment_bookings Table

```sql
CREATE TABLE entertainment_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference VARCHAR(20) UNIQUE NOT NULL,  -- ENT-ABC123
  external_user_ref VARCHAR(255),                 -- Clerk user ID
  user_uuid UUID REFERENCES users(id),            -- Internal user UUID
  item_id UUID REFERENCES entertainment_items(id),
  session_id UUID REFERENCES entertainment_sessions(id),
  organizer_id UUID REFERENCES entertainment_organizers(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  total_quantity INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  ticket_price DECIMAL(10,2),
  service_fee DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  booking_status VARCHAR(50) DEFAULT 'confirmed',
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### entertainment_tickets Table

```sql
CREATE TABLE entertainment_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number VARCHAR(50) UNIQUE NOT NULL,      -- ENT-ABC123-T01
  booking_id UUID REFERENCES entertainment_bookings(id),
  ticket_type_id UUID REFERENCES entertainment_ticket_types(id),
  qr_code_data TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'valid',             -- valid, used, cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Email Integration

### Email Service

Uses `UnifiedEmailService` from `@/lib/email/unified-email-service.ts`

### Email Parameters

```typescript
unifiedEmailService.sendBookingEmail({
  category: "entertainment",
  guest_name: string,
  guest_email: string,
  booking_code: string,          // ENT-ABC123
  title: string,                 // Item title
  description: string,           // "2x VIP Ticket"
  start_date: string,            // ISO date
  total_amount: number,
  currency: "USD",
  metadata: {
    item_id: string,
    ticket_type: string,
    quantity: number,
    location: string,
    tickets: string[]            // Ticket numbers
  }
})
```

### Email Content

- Booking confirmation message
- Confirmation code: **ENT-ABC123**
- Event details (title, date, location)
- Ticket information (type, quantity)
- Individual ticket numbers with QR codes
- Total amount and breakdown
- Cancellation/modification instructions

## Frontend Integration

### TicketBookingWidget Component

Located at: `components/entertainment/TicketBookingWidget.tsx`

**Key Features:**

- Ticket type selection
- Quantity controls (1 to max_per_booking)
- Add-ons selection
- Real-time price calculation
- Customer information collection (name, email)
- Direct API integration
- Success/error handling
- Confirmation display

**Booking Flow:**

1. User selects ticket type and quantity
2. User adds optional add-ons
3. User clicks "Book Now"
4. Widget prompts for customer name and email
5. Widget calls POST /api/entertainment/bookings
6. Success: Shows confirmation code and email notification
7. Error: Shows user-friendly error message

**Example Usage:**

```tsx
import { TicketBookingWidget } from "@/components/entertainment/TicketBookingWidget";

<TicketBookingWidget item={entertainmentItem} />;
```

## Pricing Calculation

### Formula

```
Ticket Price = (ticket_type.price × quantity)
Add-ons Total = sum(selected add-on prices)
Subtotal = Ticket Price + Add-ons Total
Service Fee = Subtotal × 0.075 (7.5%)
Total Amount = Subtotal + Service Fee
```

### Example

```
2x VIP Tickets @ $50 = $100
Add-on: Backstage Pass @ $25 = $25
Subtotal = $125
Service Fee (7.5%) = $9.38
Total = $134.38
```

## Availability Management

### Session-Based Events

- Checks `entertainment_sessions.total_spots` vs `booked_count`
- Updates `booked_count` after successful booking
- Returns error if `available_count < quantity`

### General Events (No Session)

- Skips availability check
- Updates `entertainment_items.total_bookings`

## Confirmation Code Generation

### Format

`ENT-ABC123`

- Prefix: `ENT-`
- 3 random uppercase letters (A-Z)
- 3 random numbers (0-9)

### Uniqueness

- Checks database for existing codes
- Retries up to 10 times
- Throws error if unique code cannot be generated

## Ticket Generation

### Ticket Numbers

Format: `{confirmation_code}-T{number}`
Example: `ENT-ABC123-T01`, `ENT-ABC123-T02`

### QR Code Data

Format: `{ticket_number}:{booking_id}:{item_id}`
Example: `ENT-ABC123-T01:uuid-1234:uuid-5678`

### Status

- `valid` - Active ticket (default)
- `used` - Ticket has been scanned/used
- `cancelled` - Booking cancelled

## Error Handling

### Frontend Errors

- Invalid customer data → Prompt user to retry
- Network error → Show retry button
- Availability error → Show available spots

### Backend Errors

- Database errors → Log and return 500
- Email errors → Log but don't block booking
- Validation errors → Return 400 with details

## Testing Checklist

- [ ] Book single ticket → Database entry created
- [ ] Book multiple tickets → All tickets generated
- [ ] Receive confirmation email
- [ ] Verify QR codes in email
- [ ] Check confirmation code format (ENT-ABC123)
- [ ] Verify pricing calculation (tickets + add-ons + fee)
- [ ] Test availability checking
- [ ] Test with/without authentication
- [ ] Test error scenarios (invalid data, no availability)
- [ ] Verify GET endpoint returns user's bookings

## Comparison with Hotel Booking

### Similarities ✅

- Direct booking without cart
- Confirmation code generation
- Database persistence
- Email confirmation
- Guest booking support
- Price calculation with fees
- Availability checking

### Differences

- Entertainment generates multiple tickets with QR codes
- Hotel booking tracks room nights
- Entertainment uses sessions (optional)
- Hotel booking uses date ranges

## Future Enhancements

- [ ] Add booking modification/cancellation
- [ ] Implement refund workflow
- [ ] Add ticket transfer functionality
- [ ] Create booking detail page with QR codes
- [ ] Add calendar integration (iCal/Google Calendar)
- [ ] Implement waiting list for sold-out events
- [ ] Add group booking discounts
- [ ] Integrate payment gateway (Stripe/PayPal)
- [ ] Add booking reminders (48 hours before event)
- [ ] Implement TCent rewards system

## Related Documentation

- [Hotel Booking Flow](../docs/hotel-booking-flow.md)
- [Unified Email Service](../docs/email-service.md)
- [Entertainment API](./ENTERTAINMENT_API.md)
- [Database Schema](../docs/DATABASE_SCHEMA_ERD.md)
