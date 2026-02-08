# Hotel Partner Portal - Implementation Guide

## 🚀 Quick Implementation Reference

This guide provides practical implementation guidance for developers building the Hotel Partner Portal.

## 🎯 Implementation Checklist

### Phase 1: Foundation (Week 1-2)

#### Database Setup

- [ ] Run migration scripts for new partner tables
- [ ] Create indexes for performance optimization
- [ ] Set up Row Level Security policies
- [ ] Create database functions and triggers
- [ ] Seed initial data (partner types, default settings)

#### Authentication System

- [ ] Implement partner JWT authentication (separate from Clerk)
- [ ] Create login/logout endpoints
- [ ] Build password reset flow
- [ ] Implement session management
- [ ] Add role-based access control middleware

#### Basic API Structure

- [ ] Set up API route structure (`/api/partner/hotel`)
- [ ] Create authentication middleware
- [ ] Implement error handling
- [ ] Add request validation with Zod
- [ ] Set up API logging

### Phase 2: Core Features (Week 3-6)

#### Hotel Management

- [ ] Create hotel CRUD endpoints
- [ ] Implement photo upload to Supabase Storage
- [ ] Build hotel validation logic
- [ ] Add hotel status management
- [ ] Create hotel listing API

#### Room Management

- [ ] Create room CRUD endpoints
- [ ] Implement room photo uploads
- [ ] Build room validation
- [ ] Add room inventory tracking
- [ ] Create room listing API

#### Rate Management

- [ ] Create rate CRUD endpoints
- [ ] Implement bulk rate updates
- [ ] Build rate validation logic
- [ ] Add date range operations
- [ ] Implement best price calculation
- [ ] Create rate calendar API

#### Booking Management

- [ ] Implement booking listing API
- [ ] Create booking details endpoint
- [ ] Build status update logic
- [ ] Add check-in/check-out endpoints
- [ ] Implement cancellation logic
- [ ] Create booking notifications

### Phase 3: Advanced Features (Week 7-10)

#### Analytics

- [ ] Build daily metrics calculation job
- [ ] Create dashboard metrics API
- [ ] Implement occupancy reports
- [ ] Add revenue reports
- [ ] Build custom report generator

#### Review Management

- [ ] Create review listing API
- [ ] Implement review response endpoint
- [ ] Build review moderation logic
- [ ] Add review notifications

#### Channel Management

- [ ] Implement rate parity logic
- [ ] Build inventory sync system
- [ ] Create webhook endpoints
- [ ] Add OTA integration framework

#### Payouts

- [ ] Build monthly payout calculation
- [ ] Create payout statement generation
- [ ] Implement dispute handling
- [ ] Add payment processing integration

### Phase 4: UI Development (Week 11-16)

#### Authentication UI

- [ ] Login page
- [ ] Password reset flow
- [ ] Profile management

#### Dashboard

- [ ] Overview metrics cards
- [ ] Recent bookings widget
- [ ] Quick actions panel
- [ ] Notifications center

#### Property Management

- [ ] Property list view
- [ ] Property creation wizard
- [ ] Property edit form
- [ ] Photo upload interface

#### Room Management

- [ ] Room list view
- [ ] Room creation form
- [ ] Room edit interface
- [ ] Inventory management

#### Rate Management

- [ ] Rate calendar view
- [ ] Bulk rate update interface
- [ ] Seasonal pricing setup
- [ ] Rate history view

#### Booking Management

- [ ] Booking list with filters
- [ ] Booking details view
- [ ] Status update interface
- [ ] Check-in/out forms

#### Analytics

- [ ] Dashboard charts
- [ ] Date range selectors
- [ ] Export functionality
- [ ] Custom report builder

## 💻 Code Structure

### Recommended Directory Structure

```
Project/
├── app/
│   ├── api/
│   │   └── partner/
│   │       └── hotel/
│   │           ├── auth/
│   │           │   ├── login/route.ts
│   │           │   ├── logout/route.ts
│   │           │   └── refresh/route.ts
│   │           ├── hotels/
│   │           │   ├── route.ts
│   │           │   ├── [id]/
│   │           │   │   ├── route.ts
│   │           │   │   ├── photos/route.ts
│   │           │   │   └── rooms/
│   │           │   │       ├── route.ts
│   │           │   │       └── [roomId]/
│   │           │   │           ├── route.ts
│   │           │   │           └── rates/route.ts
│   │           ├── bookings/
│   │           │   ├── route.ts
│   │           │   └── [id]/
│   │           │       ├── route.ts
│   │           │       ├── status/route.ts
│   │           │       └── cancel/route.ts
│   │           ├── analytics/
│   │           │   ├── dashboard/route.ts
│   │           │   ├── occupancy/route.ts
│   │           │   └── revenue/route.ts
│   │           ├── reviews/
│   │           │   ├── route.ts
│   │           │   └── [id]/respond/route.ts
│   │           └── payouts/
│   │               ├── route.ts
│   │               └── [id]/route.ts
│   └── partner/
│       └── hotel/
│           ├── page.tsx                    # Dashboard
│           ├── layout.tsx                  # Partner portal layout
│           ├── hotels/
│           │   ├── page.tsx                # Hotel list
│           │   ├── new/page.tsx            # Create hotel
│           │   └── [id]/
│           │       ├── page.tsx            # Hotel details
│           │       └── edit/page.tsx       # Edit hotel
│           ├── rooms/
│           │   └── [hotelId]/
│           │       ├── page.tsx            # Room list
│           │       └── new/page.tsx        # Create room
│           ├── rates/
│           │   └── [hotelId]/page.tsx      # Rate calendar
│           ├── bookings/
│           │   ├── page.tsx                # Booking list
│           │   └── [id]/page.tsx           # Booking details
│           ├── analytics/page.tsx          # Analytics
│           └── reviews/page.tsx            # Reviews
│
├── lib/
│   ├── partner/
│   │   ├── auth.ts                         # Partner auth utilities
│   │   ├── middleware.ts                   # Auth middleware
│   │   ├── permissions.ts                  # Permission checks
│   │   └── supabase.ts                     # Partner Supabase client
│   ├── hotel-partner/
│   │   ├── validation.ts                   # Validation schemas
│   │   ├── calculations.ts                 # Price calculations
│   │   ├── booking-logic.ts                # Booking business logic
│   │   ├── rate-logic.ts                   # Rate management logic
│   │   └── analytics.ts                    # Analytics calculations
│   └── utils/
│       ├── dates.ts                        # Date utilities
│       ├── currency.ts                     # Currency formatting
│       └── notifications.ts                # Notification sending
│
├── components/
│   └── partner/
│       └── hotel/
│           ├── HotelPortal.tsx             # Main container
│           ├── HotelPortalLayout.tsx       # Layout wrapper
│           ├── HotelDashboard.tsx          # Dashboard view
│           ├── hotels/
│           │   ├── HotelList.tsx
│           │   ├── HotelForm.tsx
│           │   └── HotelPhotoUpload.tsx
│           ├── rooms/
│           │   ├── RoomList.tsx
│           │   ├── RoomForm.tsx
│           │   └── RoomInventory.tsx
│           ├── rates/
│           │   ├── RateCalendar.tsx
│           │   ├── RateBulkUpdate.tsx
│           │   └── RateHistory.tsx
│           ├── bookings/
│           │   ├── BookingList.tsx
│           │   ├── BookingDetails.tsx
│           │   └── BookingActions.tsx
│           ├── analytics/
│           │   ├── MetricsCard.tsx
│           │   ├── OccupancyChart.tsx
│           │   └── RevenueChart.tsx
│           └── shared/
│               ├── DateRangePicker.tsx
│               └── StatusBadge.tsx
│
└── types/
    └── partner/
        ├── hotel.ts                        # Hotel types
        ├── room.ts                         # Room types
        ├── rate.ts                         # Rate types
        ├── booking.ts                      # Booking types
        └── analytics.ts                    # Analytics types
```

## 🔧 Key Implementation Patterns

### 1. Authentication Middleware

```typescript
// lib/partner/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerToken } from "./auth";

export async function withPartnerAuth(
  handler: Function,
  options?: { requiredPermissions?: string[] },
) {
  return async (req: NextRequest, context?: any) => {
    try {
      // Extract token from header
      const token = req.headers.get("authorization")?.replace("Bearer ", "");

      if (!token) {
        return NextResponse.json(
          { error: "Unauthorized", message: "No token provided" },
          { status: 401 },
        );
      }

      // Verify token and get partner user
      const partnerUser = await verifyPartnerToken(token);

      if (!partnerUser) {
        return NextResponse.json(
          { error: "Unauthorized", message: "Invalid token" },
          { status: 401 },
        );
      }

      // Check permissions if required
      if (options?.requiredPermissions) {
        const hasPermission = await checkPermissions(
          partnerUser.id,
          options.requiredPermissions,
        );

        if (!hasPermission) {
          return NextResponse.json(
            { error: "Forbidden", message: "Insufficient permissions" },
            { status: 403 },
          );
        }
      }

      // Add partner user to request
      (req as any).partnerUser = partnerUser;

      // Call the actual handler
      return handler(req, context);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  };
}

// Usage in API route
export const GET = withPartnerAuth(
  async (req: NextRequest) => {
    const partnerUser = (req as any).partnerUser;
    // ... handler logic
  },
  { requiredPermissions: ["hotels:read"] },
);
```

### 2. Validation with Zod

```typescript
// lib/hotel-partner/validation.ts
import { z } from "zod";

export const hotelSchema = z.object({
  name: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().min(50).max(2000).optional(),
  address: z.object({
    line1: z.string().min(3),
    city: z.string().min(2),
    country: z.string().length(2),
    postal_code: z.string().optional(),
  }),
  star_rating: z.number().int().min(1).max(5).nullable(),
  amenities: z.array(z.string()),
  policies: z.object({
    check_in_time: z.string().regex(/^\d{2}:\d{2}$/),
    check_out_time: z.string().regex(/^\d{2}:\d{2}$/),
    cancellation_policy: z.enum([
      "flexible",
      "moderate",
      "strict",
      "non_refundable",
    ]),
  }),
  contact: z.object({
    phone: z.string(),
    email: z.string().email(),
  }),
});

export const roomSchema = z
  .object({
    code: z.string().min(1).max(20),
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(1000).optional(),
    capacity: z.number().int().min(1).max(10),
    max_adults: z.number().int().min(1).max(8),
    max_children: z.number().int().min(0).max(4),
    bed_type: z.string(),
    bed_count: z.number().int().min(1).max(10),
    size_sqm: z.number().min(10).max(500).optional(),
  })
  .refine((data) => data.capacity === data.max_adults + data.max_children, {
    message: "Capacity must equal max_adults + max_children",
  });

export const rateSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    price_cents: z.number().int().min(1000).max(1000000),
    available_rooms: z.number().int().min(0).max(100),
    min_nights: z.number().int().min(1).optional(),
    max_nights: z.number().int().min(1).optional(),
    cancellation_policy: z.enum([
      "flexible",
      "moderate",
      "strict",
      "non_refundable",
    ]),
    refundable: z.boolean(),
    breakfast_included: z.boolean(),
  })
  .refine(
    (data) =>
      !data.max_nights ||
      !data.min_nights ||
      data.max_nights >= data.min_nights,
    { message: "max_nights must be >= min_nights" },
  );

// Usage in API route
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validate input
  const validation = hotelSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Validation error",
        details: validation.error.errors,
      },
      { status: 422 },
    );
  }

  const data = validation.data;
  // ... proceed with valid data
}
```

### 3. Database Operations

```typescript
// lib/hotel-partner/database.ts
import { supabaseServerClient } from "@/lib/supabaseServerClient";

export async function getPartnerHotels(partnerId: string) {
  const { data, error } = await supabaseServerClient
    .from("hotel_partner_listings")
    .select(
      `
      hotel:hotels (
        id,
        slug,
        name,
        address,
        star_rating,
        status,
        images,
        created_at
      )
    `,
    )
    .eq("partner_id", partnerId)
    .eq("is_active", true);

  if (error) throw error;
  return data;
}

export async function createHotel(partnerId: string, hotelData: any) {
  // Start a transaction
  const { data: hotel, error: hotelError } = await supabaseServerClient
    .from("hotels")
    .insert({
      ...hotelData,
      status: "draft",
      metadata: {
        partner_id: partnerId,
        created_by: "partner_portal",
      },
    })
    .select()
    .single();

  if (hotelError) throw hotelError;

  // Create partner listing
  const { error: listingError } = await supabaseServerClient
    .from("hotel_partner_listings")
    .insert({
      hotel_id: hotel.id,
      partner_id: partnerId,
      partner_hotel_id: hotel.slug,
      is_active: true,
    });

  if (listingError) throw listingError;

  return hotel;
}

export async function updateRates(
  roomId: string,
  startDate: string,
  endDate: string,
  rateData: any,
) {
  const dates = getDateRange(startDate, endDate);

  const ratesToInsert = dates.map((date) => ({
    room_id: roomId,
    partner_id: rateData.partner_id,
    date,
    price_cents: rateData.price_cents,
    available_rooms: rateData.available_rooms,
    min_nights: rateData.min_nights,
    cancellation_policy: rateData.cancellation_policy,
    refundable: rateData.refundable,
    breakfast_included: rateData.breakfast_included,
  }));

  // Upsert rates (insert or update if exists)
  const { error } = await supabaseServerClient
    .from("hotel_rates")
    .upsert(ratesToInsert, {
      onConflict: "room_id,date,partner_id",
    });

  if (error) throw error;
}
```

### 4. Business Logic Functions

```typescript
// lib/hotel-partner/calculations.ts

export function calculateBookingPrice(
  rates: Rate[],
  discounts: Discounts,
  partner: Partner,
): BookingPrice {
  // Calculate base price
  const basePriceCents = rates.reduce((sum, rate) => sum + rate.price_cents, 0);

  // Calculate tax (10%)
  const taxCents = Math.round(basePriceCents * 0.1);

  // Calculate fees (2%)
  const feesCents = Math.round(basePriceCents * 0.02);

  // Subtotal
  const subtotalCents = basePriceCents + taxCents + feesCents;

  // Working Pass discount
  const workingPassDiscountCents = discounts.has_working_pass
    ? Math.round(basePriceCents * 0.1)
    : 0;

  // TCent discount (max 30%)
  const tcentDiscountCents = Math.min(
    discounts.tcent_to_use,
    Math.round(subtotalCents * 0.3),
  );

  // Total discount
  const totalDiscountCents =
    workingPassDiscountCents +
    tcentDiscountCents +
    (discounts.voucher_discount_cents || 0);

  // Final total
  const totalCents = Math.max(0, subtotalCents - totalDiscountCents);

  // Commission
  const commissionCents = Math.round(basePriceCents * partner.commission_rate);

  return {
    base_price_cents: basePriceCents,
    tax_cents: taxCents,
    fees_cents: feesCents,
    discount_cents: totalDiscountCents,
    working_pass_discount_cents: workingPassDiscountCents,
    tcent_discount_cents: tcentDiscountCents,
    total_cents: totalCents,
    commission_cents: commissionCents,
  };
}

export function calculateRefund(
  booking: Booking,
  cancellationDate: Date,
): RefundCalculation {
  const hoursUntilCheckIn = getHoursBetween(
    cancellationDate,
    booking.check_in_date,
  );

  let refundPercentage = 0;

  switch (booking.cancellation_policy) {
    case "flexible":
      refundPercentage = hoursUntilCheckIn >= 24 ? 100 : 0;
      break;
    case "moderate":
      const days = hoursUntilCheckIn / 24;
      if (days >= 7) refundPercentage = 100;
      else if (days >= 3) refundPercentage = 50;
      else refundPercentage = 0;
      break;
    case "strict":
      const daysStrict = hoursUntilCheckIn / 24;
      if (daysStrict >= 14) refundPercentage = 100;
      else if (daysStrict >= 7) refundPercentage = 50;
      else refundPercentage = 0;
      break;
    case "non_refundable":
      refundPercentage = 0;
      break;
  }

  const refundAmountCents = Math.round(
    booking.total_cents * (refundPercentage / 100),
  );

  return {
    refund_amount_cents: refundAmountCents,
    cancellation_fee_cents: booking.total_cents - refundAmountCents,
    refund_percentage: refundPercentage,
    policy_applied: booking.cancellation_policy,
  };
}
```

### 5. Error Handling

```typescript
// lib/utils/api-error.ts

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
    public details?: any,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export function handleAPIError(error: any) {
  console.error("API Error:", error);

  if (error instanceof APIError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode },
    );
  }

  // Database errors
  if (error.code === "23505") {
    // Unique constraint violation
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DUPLICATE_ENTRY",
          message: "A record with this value already exists",
        },
      },
      { status: 409 },
    );
  }

  // Generic error
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    },
    { status: 500 },
  );
}

// Usage
export async function POST(req: NextRequest) {
  try {
    // ... API logic

    if (!hotel) {
      throw new APIError("Hotel not found", 404, "HOTEL_NOT_FOUND");
    }

    // ... more logic
  } catch (error) {
    return handleAPIError(error);
  }
}
```

## 🧪 Testing Examples

### Unit Test Example

```typescript
// __tests__/lib/calculations.test.ts
import { calculateBookingPrice } from "@/lib/hotel-partner/calculations";

describe("calculateBookingPrice", () => {
  it("should calculate correct price with no discounts", () => {
    const rates = [
      { price_cents: 10000 },
      { price_cents: 10000 },
      { price_cents: 10000 },
    ];

    const result = calculateBookingPrice(
      rates,
      {},
      {
        commission_rate: 0.1,
      },
    );

    expect(result.base_price_cents).toBe(30000);
    expect(result.tax_cents).toBe(3000);
    expect(result.fees_cents).toBe(600);
    expect(result.total_cents).toBe(33600);
    expect(result.commission_cents).toBe(3000);
  });

  it("should apply Working Pass discount correctly", () => {
    const rates = [{ price_cents: 10000 }];

    const result = calculateBookingPrice(
      rates,
      { has_working_pass: true },
      { commission_rate: 0.1 },
    );

    expect(result.working_pass_discount_cents).toBe(1000);
  });
});
```

### API Test Example

```typescript
// __tests__/api/hotels/route.test.ts
import { POST } from "@/app/api/partner/hotel/hotels/route";

describe("POST /api/partner/hotel/hotels", () => {
  it("should create hotel with valid data", async () => {
    const mockRequest = new Request(
      "http://localhost:3000/api/partner/hotel/hotels",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-token",
        },
        body: JSON.stringify({
          name: "Test Hotel",
          slug: "test-hotel",
          address: {
            line1: "123 Main St",
            city: "Hanoi",
            country: "VN",
          },
          star_rating: 4,
        }),
      },
    );

    const response = await POST(mockRequest as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe("Test Hotel");
  });

  it("should reject invalid data", async () => {
    const mockRequest = new Request(
      "http://localhost:3000/api/partner/hotel/hotels",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer valid-token",
        },
        body: JSON.stringify({
          name: "AB", // Too short
        }),
      },
    );

    const response = await POST(mockRequest as any);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.success).toBe(false);
  });
});
```

## 📝 Environment Variables

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Partner Auth (JWT)
PARTNER_JWT_SECRET=your_jwt_secret
PARTNER_JWT_EXPIRES_IN=3600

# File Storage
SUPABASE_STORAGE_BUCKET=hotel-photos
MAX_FILE_SIZE=10485760

# Email
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@tripc.com

# SMS
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# Payment
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# OTA Integrations
BOOKING_COM_API_KEY=your_booking_key
AGODA_API_KEY=your_agoda_key
EXPEDIA_API_KEY=your_expedia_key
```

## 🚀 Deployment Checklist

- [ ] Run all database migrations
- [ ] Set up environment variables
- [ ] Configure Supabase RLS policies
- [ ] Set up file storage buckets
- [ ] Test API endpoints
- [ ] Deploy frontend
- [ ] Configure CDN for images
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Test payment integration
- [ ] Verify email/SMS sending
- [ ] Run performance tests
- [ ] Set up error tracking (Sentry)
- [ ] Configure rate limiting
- [ ] Set up SSL certificates
- [ ] Test on staging environment

---

**Document Version**: 1.0  
**Last Updated**: February 8, 2026  
**Maintained By**: TripC Development Team
