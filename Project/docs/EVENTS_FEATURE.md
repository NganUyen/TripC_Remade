# Events Feature Implementation Documentation

> **Last Updated:** 2024-01-31
> **Feature Status:** ✅ Complete (Ready for Testing)
> **Integrated with:** Unified Payment System

---

## Overview

The Events feature allows users to browse, select, and purchase tickets for concerts, festivals, sports events, conferences, and other live experiences. It is fully integrated with the TripC Unified Payment System.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EVENTS FEATURE STACK                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  DATABASE LAYER (Supabase)                                                  │
│  ├── events                    Main event listing                           │
│  ├── event_sessions            Date/time slots (multi-day support)          │
│  ├── event_ticket_types        Ticket tiers (GA, VIP) with inventory        │
│  └── event_bookings            Domain bookings (linked to `bookings`)       │
│                                                                             │
│  API LAYER                                                                  │
│  ├── GET  /api/events          List with filters                            │
│  ├── GET  /api/events/[id]     Single event by ID or slug                   │
│  └── GET  /api/events/[id]/availability  Real-time ticket counts            │
│                                                                             │
│  LIBRARY LAYER                                                              │
│  ├── lib/events/types.ts       TypeScript interfaces                        │
│  ├── lib/events/data-access.ts Supabase queries                             │
│  ├── lib/events/validation.ts  Zod schemas                                  │
│  └── lib/events/api.ts         Client-side utilities                        │
│                                                                             │
│  HOOKS LAYER                                                                │
│  ├── useEvents()               List with filters                            │
│  ├── useEvent(id)              Single event                                 │
│  └── useTicketAvailability()   Real-time availability                       │
│                                                                             │
│  COMPONENT LAYER                                                            │
│  ├── EventHero                 Search banner                                │
│  ├── EventFilters              Category/city/date filters                   │
│  ├── EventResults              Event cards grid                             │
│  ├── EventHeaderPanel          Event detail header                          │
│  ├── EventContent              Highlights/inclusions                        │
│  ├── EventDetails              Venue/sessions/T&C                           │
│  ├── EventBookingSidebar       Ticket selection + checkout                  │
│  └── EventMobileBookingBar     Mobile CTA                                   │
│                                                                             │
│  CHECKOUT INTEGRATION                                                       │
│  ├── EventCheckoutForm         Booking details form                         │
│  ├── CheckoutService           Price calc + ticket hold                     │
│  └── EventSettlementHandler    QR codes + inventory confirm                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### 1. `events` Table

Main event listing with all display information.

```sql
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  description text,
  short_description text,
  
  -- Location
  venue_name text,
  address text,
  city text,
  district text,
  latitude numeric,
  longitude numeric,
  location_summary text,
  
  -- Categorization
  category text CHECK (category IN ('concert', 'festival', 'sports', 
    'theater', 'exhibition', 'conference', 'workshop', 'other')),
  tags text[] DEFAULT '{}',
  
  -- Media
  cover_image_url text,
  images text[] DEFAULT '{}',
  
  -- Ratings
  average_rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  
  -- Organizer
  organizer_name text,
  organizer_logo_url text,
  organizer_contact text,
  
  -- Event Details
  highlights text[] DEFAULT '{}',
  inclusions text[] DEFAULT '{}',
  exclusions text[] DEFAULT '{}',
  terms_and_conditions text,
  important_info text,
  age_restriction text,
  dress_code text,
  
  -- Display
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 2. `event_sessions` Table

Individual date/time slots for events.

```sql
CREATE TABLE event_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  session_date date NOT NULL,
  start_time time NOT NULL,
  end_time time,
  timezone text DEFAULT 'Asia/Ho_Chi_Minh',
  
  name text,                    -- e.g., "Day 1", "Evening Show"
  description text,
  doors_open_time time,
  
  status text DEFAULT 'scheduled' 
    CHECK (status IN ('scheduled', 'on_sale', 'sold_out', 'cancelled', 'completed')),
  
  total_capacity integer,
  venue_override text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 3. `event_ticket_types` Table

Ticket tiers with inventory tracking.

```sql
CREATE TABLE event_ticket_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES event_sessions(id) ON DELETE CASCADE,
  
  name text NOT NULL,           -- "General Admission", "VIP"
  description text,
  
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  original_price numeric(12,2), -- For showing discounts
  currency text DEFAULT 'VND',
  
  -- Inventory Management
  total_capacity integer NOT NULL CHECK (total_capacity >= 0),
  sold_count integer DEFAULT 0 CHECK (sold_count >= 0),
  held_count integer DEFAULT 0 CHECK (held_count >= 0),
  
  -- Order Constraints
  min_per_order integer DEFAULT 1,
  max_per_order integer DEFAULT 10,
  
  perks text[] DEFAULT '{}',    -- ["Priority entry", "Free drink"]
  
  sale_start_at timestamptz,
  sale_end_at timestamptz,
  
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  badge text,                   -- "Best Value", "Selling Fast"
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT capacity_check CHECK (sold_count + held_count <= total_capacity)
);
```

### 4. `event_bookings` Table

Domain booking records linked 1:1 to `bookings` table.

```sql
CREATE TABLE event_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid UNIQUE REFERENCES bookings(id),
  user_uuid uuid REFERENCES users(id),
  external_user_ref text,       -- Clerk user ID
  
  event_id uuid NOT NULL REFERENCES events(id),
  session_id uuid NOT NULL REFERENCES event_sessions(id),
  ticket_type_id uuid NOT NULL REFERENCES event_ticket_types(id),
  
  confirmation_code text NOT NULL UNIQUE,
  
  adult_count integer DEFAULT 0,
  child_count integer DEFAULT 0,
  total_tickets integer GENERATED ALWAYS AS (adult_count + child_count) STORED,
  
  unit_price numeric(12,2) NOT NULL,
  total_amount numeric(12,2) NOT NULL,
  currency text DEFAULT 'VND',
  
  discount_amount numeric(12,2) DEFAULT 0,
  tcent_used integer DEFAULT 0,
  tcent_earned integer DEFAULT 0,
  
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text,
  
  attendees jsonb DEFAULT '[]',  -- [{name, email, phone, dob}]
  qr_codes jsonb DEFAULT '[]',   -- [{code, ticket_number, attendee_name}]
  
  special_requests text,
  
  status text DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'checked_in', 
      'completed', 'cancelled', 'refunded', 'no_show')),
  payment_status text DEFAULT 'pending',
  
  confirmed_at timestamptz,
  checked_in_at timestamptz,
  cancelled_at timestamptz,
  
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 5. Helper Functions (RPCs)

```sql
-- Hold tickets during checkout
CREATE FUNCTION hold_event_tickets(p_ticket_type_id uuid, p_quantity integer)
RETURNS boolean AS $$
  -- Atomically increments held_count if capacity available
  -- Returns true on success, false if insufficient capacity
$$;

-- Convert held to sold on payment success
CREATE FUNCTION confirm_event_tickets(p_ticket_type_id uuid, p_quantity integer)
RETURNS boolean AS $$
  -- Decrements held_count, increments sold_count
  -- Returns true on success
$$;

-- Release held tickets on timeout/cancel
CREATE FUNCTION release_event_tickets(p_ticket_type_id uuid, p_quantity integer)
RETURNS boolean AS $$
  -- Decrements held_count
  -- Returns true on success
$$;
```

---

## API Endpoints

### GET /api/events

List events with filters and pagination.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| city | string | Filter by city name |
| category | string | concert, festival, sports, etc. |
| date_from | string | Start date (YYYY-MM-DD) |
| date_to | string | End date (YYYY-MM-DD) |
| search | string | Text search in title |
| is_featured | boolean | Featured events only |
| limit | number | Results per page (default: 20) |
| offset | number | Pagination offset |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Summer Beats Festival",
      "slug": "summer-beats-festival",
      "cover_image_url": "https://...",
      "venue_name": "Nguyen Hue Walking Street",
      "city": "Ho Chi Minh City",
      "category": "festival",
      "average_rating": 4.5,
      "sessions": [
        {
          "id": "uuid",
          "session_date": "2024-08-12",
          "start_time": "18:00:00",
          "status": "on_sale",
          "ticket_types": [...]
        }
      ]
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 20,
    "offset": 0
  }
}
```

### GET /api/events/[id]

Get single event by ID or slug.

**Response:** Same structure as list item, with full sessions and ticket types.

### GET /api/events/[id]/availability

Real-time ticket availability for a session.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| session_id | string | Required - session UUID |

**Response:**
```json
{
  "data": {
    "session_id": "uuid",
    "ticket_types": [
      {
        "id": "uuid",
        "name": "General Admission",
        "price": 500000,
        "currency": "VND",
        "total_capacity": 1000,
        "sold_count": 450,
        "held_count": 25,
        "available_count": 525,
        "is_available": true
      }
    ]
  }
}
```

---

## React Hooks

### useEvents(params)

```typescript
const { events, total, loading, error, refetch } = useEvents({
  city: 'Ho Chi Minh City',
  category: 'concert',
  limit: 20
});
```

### useEvent(idOrSlug)

```typescript
const { event, loading, error } = useEvent('summer-beats-festival');
// or
const { event, loading, error } = useEvent('uuid-here');
```

### useTicketAvailability(eventId, sessionId)

```typescript
const { ticketTypes, loading, error, refetch } = useTicketAvailability(
  eventId,
  selectedSessionId
);

// ticketTypes includes available_count and is_available
```

---

## Components

### EventBookingSidebar

The main booking interface in the event detail page.

**Props:**
```typescript
interface EventBookingSidebarProps {
  event: EventWithSessions;
}
```

**Features:**
- Session dropdown (filters by `status === 'on_sale'`)
- Ticket type selector (horizontal scroll pills)
- Adult/child quantity controls with validation
- Real-time availability badges
- Dynamic price calculation
- Validation warnings (children require adult, max per order)
- "Get Tickets" button → redirects to checkout

**State:**
```typescript
const [selectedSessionId, setSelectedSessionId] = useState('');
const [selectedTicketTypeId, setSelectedTicketTypeId] = useState('');
const [adults, setAdults] = useState(1);
const [children, setChildren] = useState(0);
```

**Checkout Redirect:**
```typescript
const query = new URLSearchParams({
  eventId: event.id,
  sessionId: selectedSessionId,
  ticketTypeId: selectedTicketTypeId,
  adults: adults.toString(),
  children: children.toString(),
});
router.push(`/events/checkout?${query.toString()}`);
```

### EventMobileBookingBar

Mobile-only fixed bottom bar.

**Props:**
```typescript
interface EventMobileBookingBarProps {
  event: EventWithSessions;
}
```

**Features:**
- Shows lowest ticket price
- First available session date
- Quick "Get Tickets" button

---

## Checkout Integration

### EventCheckoutForm

**File:** `components/checkout/forms/event-checkout-form.tsx`

**Props:**
```typescript
interface Props {
  initialData: {
    eventId: string;
    sessionId: string;
    ticketTypeId: string;
    adults: number;
    children: number;
  };
  onSubmit: (data: any) => void;
}
```

**Displays:**
- Event image and title
- Venue name
- Session date and time
- Ticket type with perks
- Price breakdown
- Contact form (pre-filled from Clerk)
- Special requests field

**Submits:**
```typescript
{
  eventId: string,
  sessionId: string,
  ticketTypeId: string,
  adultCount: number,
  childCount: number,
  guestDetails: { name, email, phone },
  specialRequests?: string
}
```

### CheckoutService Event Handling

**File:** `lib/checkout/services/checkout.service.ts`

When `serviceType === 'event'`:

1. Validates event, session, ticket type exist
2. Checks ticket availability
3. **Holds tickets** via `hold_event_tickets()` RPC
4. Calculates `totalAmount = price × (adults + children)`
5. Creates booking record with metadata

```typescript
// Event-specific logic in createBooking()
if (payload.serviceType === 'event') {
  // Validate
  const { data: ticketType } = await supabase
    .from('event_ticket_types')
    .select('price, currency, total_capacity, sold_count, held_count')
    .eq('id', ticketTypeId)
    .single();

  // Check availability
  const availableCapacity = ticketType.total_capacity - 
    ticketType.sold_count - ticketType.held_count;
  if (availableCapacity < totalTickets) {
    throw new Error(`Only ${availableCapacity} tickets available`);
  }

  // Hold tickets
  await supabase.rpc('hold_event_tickets', {
    p_ticket_type_id: ticketTypeId,
    p_quantity: totalTickets,
  });

  // Calculate price
  totalAmount = ticketType.price * totalTickets;
}
```

### EventSettlementHandler

**File:** `lib/checkout/services/settlement/handlers/event.ts`

Post-payment processing:

1. **Idempotency check** - Skip if `event_bookings` record exists
2. **Extract metadata** from booking
3. **Confirm tickets** via `confirm_event_tickets()` RPC
4. **Generate QR codes** for each ticket
5. **Create event_bookings record**
6. **Update session status** to `sold_out` if no capacity left
7. **Rollback on failure** via `release_event_tickets()`

**QR Code Format:**
```
{confirmation}-{ticket#}-{timestamp}-{random}
Example: EV-ABC123-001-m3x7y9-K4P2
```

**QR Codes Structure:**
```typescript
interface EventQRCode {
  code: string;
  ticket_number: number;
  attendee_name: string;
  scanned_at?: string;
}
```

---

## User Flow

```
1. /events
   ├── EventHero (search)
   ├── EventFilters (category, city, date)
   └── EventResults (event cards)
         │
         ▼ Click event
2. /events/[id]
   ├── EventHeaderPanel (title, venue, rating)
   ├── Tabs: Overview | Details | Reviews
   ├── EventContent/EventDetails
   └── EventBookingSidebar
         │
         ├── Select session
         ├── Select ticket type
         ├── Set quantities
         └── Click "Get Tickets"
               │
               ▼
3. /events/checkout?eventId=...&sessionId=...&...
   ├── EventCheckoutForm
   │   ├── Event summary
   │   ├── Contact form
   │   └── "Proceed to Payment"
   │         │
   │         ▼
   └── Payment Step
       ├── Accept Terms
       ├── Select MoMo/PayPal
       └── Redirect to provider
             │
             ▼
4. Payment Complete
   ├── Webhook triggers settlement
   ├── EventSettlementHandler creates event_booking
   ├── QR codes generated
   └── User redirected to /my-bookings
```

---

## Files Reference

### Database
- `supabase/migrations/20260131_events_schema.sql` - Full schema
- `supabase/migrations/20260131_events_seed.sql` - Sample data

### Library
- `lib/events/types.ts` - TypeScript interfaces
- `lib/events/data-access.ts` - Supabase queries
- `lib/events/validation.ts` - Zod schemas
- `lib/events/api.ts` - Client utilities
- `lib/events/index.ts` - Barrel export

### API Routes
- `app/api/events/route.ts` - GET list
- `app/api/events/[id]/route.ts` - GET single
- `app/api/events/[id]/availability/route.ts` - GET availability

### Hooks
- `hooks/use-events.ts` - All event hooks + formatters

### Pages
- `app/events/page.tsx` - Events list page
- `app/events/[id]/page.tsx` - Event detail page
- `app/events/checkout/page.tsx` - Event checkout page

### Components
- `components/events/EventHero.tsx`
- `components/events/EventFilters.tsx`
- `components/events/EventResults.tsx`
- `components/events/EventHeaderPanel.tsx`
- `components/events/EventContent.tsx`
- `components/events/EventDetails.tsx`
- `components/events/EventBookingSidebar.tsx`

### Checkout Integration
- `components/checkout/forms/event-checkout-form.tsx`
- `components/checkout/checkout-form-factory.tsx` (updated)
- `lib/checkout/services/checkout.service.ts` (event handling)
- `lib/checkout/services/settlement/handlers/event.ts`

---

## Testing

### Manual Test Flow

1. **Seed database** with events, sessions, ticket types
2. **Navigate** to `/events`
3. **Apply filters** - verify results update
4. **Click event** - verify detail page loads
5. **In sidebar**:
   - Change session - verify ticket types update
   - Change ticket type - verify price updates
   - Increase quantity - verify total updates
   - Try exceeding max - verify validation
6. **Click "Get Tickets"** - verify redirect to checkout
7. **On checkout**:
   - Verify event details displayed
   - Fill contact info
   - Click "Proceed to Payment"
8. **On payment step**:
   - Accept terms
   - Select MoMo (test mode)
   - Complete payment
9. **Verify**:
   - `bookings` record: status='confirmed'
   - `event_bookings` record exists
   - QR codes generated
   - `sold_count` incremented in `event_ticket_types`

### SQL Verification

```sql
-- Check event booking was created
SELECT 
  eb.*,
  e.title as event_title,
  es.session_date,
  ett.name as ticket_type
FROM event_bookings eb
JOIN events e ON eb.event_id = e.id
JOIN event_sessions es ON eb.session_id = es.id
JOIN event_ticket_types ett ON eb.ticket_type_id = ett.id
WHERE eb.booking_id = 'your-booking-id';

-- Check inventory updated
SELECT 
  name, 
  total_capacity, 
  sold_count, 
  held_count,
  (total_capacity - sold_count - held_count) as available
FROM event_ticket_types
WHERE session_id = 'your-session-id';
```

---

## Known Issues

1. **Held tickets not released on timeout**
   - Need background job to release after X minutes
   - Currently relies on manual cleanup

2. **No ticket PDF generation**
   - QR codes stored in JSON
   - No visual ticket rendering yet

3. **No email confirmation**
   - Settlement succeeds but no notification sent

---

## Future Enhancements

- [ ] Ticket PDF generation with QR code
- [ ] Email confirmation with tickets attached
- [ ] Check-in scanner app/page
- [ ] Waitlist for sold-out events
- [ ] Early access for premium users
- [ ] Dynamic pricing based on demand
- [ ] Seat selection for seated events
- [ ] Group booking discounts
- [ ] Referral codes

---

*End of Events Documentation*
