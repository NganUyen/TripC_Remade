# Hotel Partner Business Logic

## 🎯 Core Business Rules

This document outlines the business logic, validation rules, calculations, and operational procedures for the Hotel Partner Portal.

## 1. Partner Registration & Onboarding

### 1.1 Partner Registration Flow

**Business Rules**:

- Each partner must have a unique `code` (e.g., 'BOOKING_COM', 'AGODA', 'DIRECT')
- Email must be unique across all partner users
- Default commission rate: 10% (can be negotiated)
- New partners start with `is_active = false` until approved

**Validation Rules**:

```typescript
interface PartnerRegistration {
  code: string; // Uppercase, alphanumeric only, 3-20 chars
  name: string; // 3-100 chars
  email: string; // Valid email format
  phone: string; // International format
  commission_rate: number; // 0-0.5 (0-50%)
  business_license?: string; // Required for verification
}

function validatePartnerRegistration(
  data: PartnerRegistration,
): ValidationResult {
  const errors: string[] = [];

  // Code validation
  if (!/^[A-Z0-9_]{3,20}$/.test(data.code)) {
    errors.push("Code must be 3-20 uppercase alphanumeric characters");
  }

  // Commission validation
  if (data.commission_rate < 0 || data.commission_rate > 0.5) {
    errors.push("Commission rate must be between 0% and 50%");
  }

  // Email validation
  if (!isValidEmail(data.email)) {
    errors.push("Invalid email format");
  }

  return { valid: errors.length === 0, errors };
}
```

### 1.2 Partner Approval Process

**States**: `pending` → `approved` → `active`

**Approval Criteria**:

- Valid business license
- Verified contact information
- Completed profile information
- Accepted terms and conditions
- Passed background check (for direct partners)

**Auto-approval Conditions**:

- Known OTA partners (pre-approved list)
- Hotel chains with 5+ properties
- Partners with existing TripC relationships

---

## 2. Hotel Property Management

### 2.1 Property Listing

**Business Rules**:

- Each hotel must have a unique `slug`
- Minimum 3 photos required to go live
- Must have at least 1 active room type
- Must have rates for next 30 days
- `star_rating` must be 1-5 or null

**Validation Rules**:

```typescript
interface HotelListing {
  name: string;
  address: Address;
  star_rating?: number;
  amenities: string[];
  images: Image[];
  policies?: Policies;
}

function validateHotelListing(hotel: HotelListing): ValidationResult {
  const errors: string[] = [];

  // Name validation
  if (hotel.name.length < 3 || hotel.name.length > 200) {
    errors.push("Hotel name must be 3-200 characters");
  }

  // Image validation
  if (hotel.images.length < 3) {
    errors.push("Minimum 3 images required");
  }

  if (hotel.images.length > 50) {
    errors.push("Maximum 50 images allowed");
  }

  // Star rating validation
  if (
    hotel.star_rating !== null &&
    (hotel.star_rating < 1 || hotel.star_rating > 5)
  ) {
    errors.push("Star rating must be 1-5");
  }

  // Address validation
  if (!hotel.address.city || !hotel.address.country) {
    errors.push("City and country are required");
  }

  return { valid: errors.length === 0, errors };
}
```

### 2.2 Property Status Lifecycle

```
draft → submitted → under_review → approved → active
                                    ↓
                                 rejected → draft
```

**Status Rules**:

- `draft`: Partner can edit freely
- `submitted`: Under admin review, limited edits
- `under_review`: Admin reviewing, no edits
- `approved`: Ready to go live
- `active`: Live on platform
- `rejected`: Admin rejected, can resubmit

**Auto-activation Conditions**:

- All required fields completed
- Minimum 3 photos uploaded
- At least 1 room type with rates
- Policies configured
- Contact information verified

---

## 3. Room Management

### 3.1 Room Configuration

**Business Rules**:

- Each room must have unique `code` within hotel
- `capacity` must match `max_adults + max_children`
- Bed count must be realistic (1-10)
- Room size should be reasonable (10-500 sqm)

**Validation Rules**:

```typescript
interface RoomType {
  code: string;
  title: string;
  capacity: number;
  max_adults: number;
  max_children: number;
  bed_count: number;
  bed_type: string;
  size_sqm?: number;
}

function validateRoom(room: RoomType): ValidationResult {
  const errors: string[] = [];

  // Capacity validation
  if (room.capacity !== room.max_adults + room.max_children) {
    errors.push("Capacity must equal max_adults + max_children");
  }

  // Bed count validation
  if (room.bed_count < 1 || room.bed_count > 10) {
    errors.push("Bed count must be 1-10");
  }

  // Size validation
  if (room.size_sqm && (room.size_sqm < 10 || room.size_sqm > 500)) {
    errors.push("Room size must be 10-500 sqm");
  }

  // Adults validation
  if (room.max_adults < 1) {
    errors.push("At least 1 adult must be allowed");
  }

  return { valid: errors.length === 0, errors };
}
```

### 3.2 Room Capacity Rules

**Standard Capacity Guidelines**:

- **Single Room**: 1 adult, 0-1 child
- **Double/Twin Room**: 2 adults, 0-1 child
- **Triple Room**: 3 adults, 0-2 children
- **Quad Room**: 4 adults, 0-2 children
- **Suite**: 4-6 adults, 0-3 children
- **Family Room**: 2-4 adults, 1-4 children

**Enforcement**:

```typescript
function validateGuestCount(
  room: RoomType,
  adults: number,
  children: number,
): boolean {
  return (
    adults <= room.max_adults &&
    children <= room.max_children &&
    adults + children <= room.capacity
  );
}
```

---

## 4. Rate & Pricing Management

### 4.1 Base Rate Rules

**Business Rules**:

- Minimum rate: $10 USD (or equivalent)
- Maximum rate: $10,000 USD per night
- Rates must be set for at least 30 days ahead
- Maximum 365 days ahead
- Currency must be consistent per hotel

**Validation Rules**:

```typescript
interface RateInput {
  room_id: string;
  date: Date;
  price_cents: number;
  available_rooms: number;
  min_nights?: number;
  max_nights?: number;
  cancellation_policy?: string;
}

function validateRate(rate: RateInput): ValidationResult {
  const errors: string[] = [];

  // Price validation (minimum $10, maximum $10,000)
  if (rate.price_cents < 1000 || rate.price_cents > 1000000) {
    errors.push("Rate must be between $10 and $10,000 per night");
  }

  // Date validation
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 365);

  if (rate.date < today) {
    errors.push("Cannot set rates for past dates");
  }

  if (rate.date > maxDate) {
    errors.push("Cannot set rates more than 365 days ahead");
  }

  // Availability validation
  if (rate.available_rooms < 0 || rate.available_rooms > 100) {
    errors.push("Available rooms must be 0-100");
  }

  // Min/max nights validation
  if (rate.min_nights && rate.min_nights < 1) {
    errors.push("Minimum nights must be at least 1");
  }

  if (rate.max_nights && rate.min_nights && rate.max_nights < rate.min_nights) {
    errors.push("Maximum nights must be >= minimum nights");
  }

  return { valid: errors.length === 0, errors };
}
```

### 4.2 Dynamic Pricing Rules

**Price Adjustment Factors**:

1. **Demand-Based Pricing**
   - High demand (>80% occupancy): +10% to +30%
   - Medium demand (50-80%): No adjustment
   - Low demand (<50%): -10% to -30%

2. **Last-Minute Deals**
   - 7-14 days: -5%
   - 3-7 days: -10%
   - 1-3 days: -15%
   - Same day: -20%

3. **Seasonal Pricing**
   - Peak season: +20% to +50%
   - Shoulder season: No adjustment
   - Off-season: -10% to -30%

4. **Length of Stay Discounts**
   - 3-6 nights: -5%
   - 7-13 nights: -10%
   - 14-29 nights: -15%
   - 30+ nights: -20%

**Implementation**:

```typescript
function calculateDynamicPrice(
  basePrice: number,
  factors: PricingFactors,
): number {
  let adjustedPrice = basePrice;

  // Apply demand adjustment
  if (factors.occupancyRate > 0.8) {
    adjustedPrice *= 1.2; // +20%
  } else if (factors.occupancyRate < 0.5) {
    adjustedPrice *= 0.85; // -15%
  }

  // Apply last-minute discount
  if (factors.daysUntilArrival <= 3) {
    adjustedPrice *= 0.85; // -15%
  } else if (factors.daysUntilArrival <= 7) {
    adjustedPrice *= 0.9; // -10%
  }

  // Apply length of stay discount
  if (factors.lengthOfStay >= 7) {
    adjustedPrice *= 0.9; // -10%
  } else if (factors.lengthOfStay >= 3) {
    adjustedPrice *= 0.95; // -5%
  }

  // Ensure price stays within acceptable range
  const minPrice = basePrice * 0.5; // No more than 50% discount
  const maxPrice = basePrice * 1.5; // No more than 50% increase

  return Math.max(minPrice, Math.min(maxPrice, adjustedPrice));
}
```

### 4.3 Best Price Logic

**Criteria for "Best Price"**:

```typescript
function determineBestPrice(rates: Rate[]): Rate {
  const activeRates = rates.filter((r) => r.available_rooms > 0 && r.is_active);

  if (activeRates.length === 0) return null;

  // Sort by price, then by additional benefits
  activeRates.sort((a, b) => {
    if (a.price_cents !== b.price_cents) {
      return a.price_cents - b.price_cents;
    }

    // If same price, prefer:
    // 1. Free cancellation
    // 2. Breakfast included
    // 3. Higher partner priority

    if (a.refundable !== b.refundable) {
      return a.refundable ? -1 : 1;
    }

    if (a.breakfast_included !== b.breakfast_included) {
      return a.breakfast_included ? -1 : 1;
    }

    return (b.partner_priority || 0) - (a.partner_priority || 0);
  });

  return activeRates[0];
}
```

---

## 5. Booking Management

### 5.1 Booking Creation

**Business Rules**:

- Minimum 1 night booking
- Maximum 30 nights per booking
- Check-in must be future date
- Guest email must be valid
- Guest count must match room capacity

**Validation Rules**:

```typescript
interface BookingRequest {
  hotel_id: string;
  room_id: string;
  partner_id: string;
  check_in_date: Date;
  check_out_date: Date;
  guest_info: GuestInfo;
  adults: number;
  children: number;
  special_requests?: string;
}

function validateBooking(booking: BookingRequest): ValidationResult {
  const errors: string[] = [];

  // Date validation
  const nights = calculateNights(booking.check_in_date, booking.check_out_date);

  if (nights < 1) {
    errors.push("Minimum 1 night required");
  }

  if (nights > 30) {
    errors.push("Maximum 30 nights per booking");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (booking.check_in_date < today) {
    errors.push("Check-in date must be in the future");
  }

  // Guest info validation
  if (!booking.guest_info.first_name || !booking.guest_info.last_name) {
    errors.push("Guest name is required");
  }

  if (!isValidEmail(booking.guest_info.email)) {
    errors.push("Valid email is required");
  }

  // Guest count validation
  if (booking.adults < 1) {
    errors.push("At least 1 adult required");
  }

  if (booking.adults + booking.children > room.capacity) {
    errors.push("Guest count exceeds room capacity");
  }

  return { valid: errors.length === 0, errors };
}
```

### 5.2 Booking Pricing Calculation

**Price Components**:

```typescript
interface BookingPrice {
  base_price_cents: number; // Sum of nightly rates
  tax_cents: number; // 10% VAT
  fees_cents: number; // Service fees
  discount_cents: number; // Vouchers, coupons
  working_pass_discount_cents: number; // Working Pass discount
  tcent_discount_cents: number; // TCent redemption
  total_cents: number; // Final amount
  commission_cents: number; // Partner commission
}

function calculateBookingPrice(
  rates: Rate[],
  discounts: Discounts,
  partner: Partner,
): BookingPrice {
  // 1. Calculate base price (sum of nightly rates)
  const basePriceCents = rates.reduce((sum, rate) => sum + rate.price_cents, 0);

  // 2. Calculate tax (10% VAT in Vietnam)
  const taxCents = Math.round(basePriceCents * 0.1);

  // 3. Calculate service fees (2%)
  const feesCents = Math.round(basePriceCents * 0.02);

  // 4. Calculate subtotal
  let subtotalCents = basePriceCents + taxCents + feesCents;

  // 5. Apply Working Pass discount (10% on base price)
  let workingPassDiscountCents = 0;
  if (discounts.has_working_pass) {
    workingPassDiscountCents = Math.round(basePriceCents * 0.1);
  }

  // 6. Apply TCent discount (1 TCent = $0.01)
  const tcentDiscountCents = Math.min(
    discounts.tcent_to_use,
    Math.round(subtotalCents * 0.3), // Max 30% of total
  );

  // 7. Calculate total discount
  const totalDiscountCents =
    workingPassDiscountCents +
    tcentDiscountCents +
    (discounts.voucher_discount_cents || 0);

  // 8. Calculate final total
  const totalCents = Math.max(0, subtotalCents - totalDiscountCents);

  // 9. Calculate commission
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
```

### 5.3 TCent Earning Calculation

**Earning Rules**:

- Base rate: 5% of base price
- Tiered multipliers based on user tier
- Partner-specific earn rates

```typescript
interface TcentEarning {
  base_amount: number; // Base price for calculation
  earn_rate: number; // Earning rate (0.05 = 5%)
  multiplier: number; // Tier multiplier
  tcent_earned: number; // Final TCent amount
}

function calculateTcentEarning(
  basePriceCents: number,
  userTier: UserTier,
  partner: Partner,
): TcentEarning {
  // Get partner-specific earn rate (default 5%)
  const baseEarnRate = partner.tcent_earn_rate || 0.05;

  // Get tier multiplier
  const tierMultipliers = {
    standard: 1.0, // 100%
    silver: 1.2, // 120%
    gold: 1.5, // 150%
    platinum: 2.0, // 200%
  };

  const multiplier = tierMultipliers[userTier] || 1.0;

  // Calculate TCent earned
  // 1 TCent = $0.01, so divide by 100 to get TCent
  const baseAmount = basePriceCents / 100;
  const tcentEarned = Math.floor(baseAmount * baseEarnRate * multiplier);

  return {
    base_amount: baseAmount,
    earn_rate: baseEarnRate,
    multiplier,
    tcent_earned: tcentEarned,
  };
}
```

### 5.4 Booking Status Transitions

**Valid State Transitions**:

```typescript
const validTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["checked_in", "cancelled", "modified", "no_show"],
  checked_in: ["checked_out"],
  checked_out: [], // Terminal state
  cancelled: [], // Terminal state
  no_show: [], // Terminal state
  modified: ["confirmed", "cancelled"],
};

function canTransition(
  currentStatus: BookingStatus,
  newStatus: BookingStatus,
): boolean {
  return validTransitions[currentStatus]?.includes(newStatus) || false;
}
```

**Automatic Transitions**:

- `pending` → `confirmed`: When payment successful
- `confirmed` → `checked_in`: At check-in date + manual confirmation
- `checked_in` → `checked_out`: At check-out date + manual confirmation
- `confirmed` → `no_show`: 24 hours after check-in time without check-in

---

## 6. Booking Modifications

### 6.1 Modification Rules

**Allowed Modifications**:

- Date changes (check-in/check-out)
- Room type changes
- Guest count adjustments (within capacity)
- Guest information updates

**Restrictions**:

- Cannot modify within 24 hours of check-in
- Can only modify confirmed bookings
- Maximum 3 modifications per booking
- Price difference must be settled

**Business Logic**:

```typescript
interface ModificationRequest {
  booking_id: string;
  type: "date_change" | "room_change" | "guest_change";
  new_values: any;
  reason?: string;
}

function validateModification(
  booking: Booking,
  modification: ModificationRequest,
): ValidationResult {
  const errors: string[] = [];

  // Check booking status
  if (booking.status !== "confirmed") {
    errors.push("Only confirmed bookings can be modified");
  }

  // Check modification count
  if (booking.modification_count >= 3) {
    errors.push("Maximum 3 modifications allowed per booking");
  }

  // Check timing
  const hoursUntilCheckIn = getHoursUntil(booking.check_in_date);
  if (hoursUntilCheckIn < 24) {
    errors.push("Cannot modify within 24 hours of check-in");
  }

  // Type-specific validation
  if (modification.type === "date_change") {
    const newCheckIn = modification.new_values.check_in_date;
    const newCheckOut = modification.new_values.check_out_date;

    if (newCheckOut <= newCheckIn) {
      errors.push("Check-out must be after check-in");
    }
  }

  if (modification.type === "room_change") {
    // Validate new room availability
    const available = checkRoomAvailability(
      modification.new_values.room_id,
      booking.check_in_date,
      booking.check_out_date,
    );

    if (!available) {
      errors.push("Requested room not available for these dates");
    }
  }

  return { valid: errors.length === 0, errors };
}
```

### 6.2 Price Recalculation

```typescript
function calculateModificationPrice(
  original: Booking,
  modified: ModificationRequest,
): PriceDifference {
  // Calculate original price
  const originalPrice = original.total_cents;

  // Calculate new price based on modification
  let newPrice = originalPrice;

  if (modified.type === "date_change") {
    // Fetch new rates for new dates
    const newRates = fetchRatesForDates(
      original.room_id,
      modified.new_values.check_in_date,
      modified.new_values.check_out_date,
    );
    newPrice = calculateTotalFromRates(newRates);
  }

  if (modified.type === "room_change") {
    // Fetch rates for new room
    const newRates = fetchRatesForDates(
      modified.new_values.room_id,
      original.check_in_date,
      original.check_out_date,
    );
    newPrice = calculateTotalFromRates(newRates);
  }

  const difference = newPrice - originalPrice;

  return {
    original_price_cents: originalPrice,
    new_price_cents: newPrice,
    difference_cents: difference,
    is_upgrade: difference > 0,
    payment_required: difference > 0,
    refund_amount: difference < 0 ? Math.abs(difference) : 0,
  };
}
```

---

## 7. Cancellation Logic

### 7.1 Cancellation Policies

**Free Cancellation**:

- Cancel up to 24 hours before check-in: Full refund
- Cancel 24-48 hours before: 50% refund
- Cancel <24 hours before: No refund

**Non-Refundable**:

- No refund regardless of cancellation time
- 20% cheaper than flexible rates

**Moderate**:

- Cancel 7+ days before: Full refund
- Cancel 3-7 days before: 50% refund
- Cancel <3 days before: No refund

**Strict**:

- Cancel 14+ days before: Full refund
- Cancel 7-14 days before: 50% refund
- Cancel <7 days before: No refund

### 7.2 Refund Calculation

```typescript
interface CancellationResult {
  cancellation_fee_cents: number;
  refund_amount_cents: number;
  refund_percentage: number;
  policy_applied: string;
}

function calculateRefund(
  booking: Booking,
  cancellationDate: Date,
): CancellationResult {
  const hoursUntilCheckIn = getHoursBetween(
    cancellationDate,
    booking.check_in_date,
  );

  let refundPercentage = 0;

  switch (booking.cancellation_policy) {
    case "flexible":
      if (hoursUntilCheckIn >= 24) {
        refundPercentage = 100;
      } else if (hoursUntilCheckIn >= 24) {
        refundPercentage = 50;
      } else {
        refundPercentage = 0;
      }
      break;

    case "non_refundable":
      refundPercentage = 0;
      break;

    case "moderate":
      const daysUntilCheckIn = hoursUntilCheckIn / 24;
      if (daysUntilCheckIn >= 7) {
        refundPercentage = 100;
      } else if (daysUntilCheckIn >= 3) {
        refundPercentage = 50;
      } else {
        refundPercentage = 0;
      }
      break;

    case "strict":
      const daysUntil = hoursUntilCheckIn / 24;
      if (daysUntil >= 14) {
        refundPercentage = 100;
      } else if (daysUntil >= 7) {
        refundPercentage = 50;
      } else {
        refundPercentage = 0;
      }
      break;
  }

  const refundAmountCents = Math.round(
    booking.total_cents * (refundPercentage / 100),
  );

  const cancellationFeeCents = booking.total_cents - refundAmountCents;

  return {
    cancellation_fee_cents: cancellationFeeCents,
    refund_amount_cents: refundAmountCents,
    refund_percentage: refundPercentage,
    policy_applied: booking.cancellation_policy,
  };
}
```

---

## 8. Inventory Management

### 8.1 Room Availability

**Real-time Availability Check**:

```typescript
function checkAvailability(
  roomId: string,
  checkInDate: Date,
  checkOutDate: Date,
  roomsNeeded: number = 1,
): boolean {
  // Get all rates for date range
  const rates = getRatesForDateRange(roomId, checkInDate, checkOutDate);

  // Check if all nights have availability
  const allNightsAvailable = rates.every(
    (rate) => rate.available_rooms >= roomsNeeded,
  );

  return allNightsAvailable;
}
```

**Inventory Deduction**:

```typescript
function reserveInventory(booking: Booking): void {
  const dates = getDateRange(booking.check_in_date, booking.check_out_date);

  // Deduct 1 room from each night
  dates.forEach((date) => {
    updateRateAvailability(booking.room_id, date, -1);
  });
}
```

**Inventory Release** (on cancellation):

```typescript
function releaseInventory(booking: Booking): void {
  // Only release if booking was confirmed
  if (booking.status !== "confirmed") return;

  const dates = getDateRange(booking.check_in_date, booking.check_out_date);

  // Add 1 room back to each night
  dates.forEach((date) => {
    updateRateAvailability(booking.room_id, date, +1);
  });
}
```

---

## 9. Channel Management

### 9.1 Rate Parity Enforcement

**Purpose**: Ensure consistent pricing across all channels

```typescript
function enforceRateParity(
  hotelId: string,
  roomId: string,
  date: Date,
  basePriceCents: number,
): void {
  // Get all partner listings for this hotel
  const partners = getPartnerListings(hotelId);

  partners.forEach((partner) => {
    // Calculate partner-specific price
    // Direct booking gets lower commission, so can be slightly cheaper
    let partnerPrice = basePriceCents;

    if (partner.code === "DIRECT") {
      partnerPrice = Math.round(basePriceCents * 0.95); // 5% lower
    }

    // Update or create rate for this partner
    upsertRate({
      room_id: roomId,
      partner_id: partner.id,
      date: date,
      price_cents: partnerPrice,
      // ... other fields
    });
  });
}
```

### 9.2 Inventory Sync

**Purpose**: Keep inventory in sync across all channels

```typescript
function syncInventoryAcrossChannels(
  roomId: string,
  date: Date,
  availableRooms: number,
): void {
  // Update all partner rates for this date
  const updates = updateRatesByRoomAndDate(roomId, date, {
    available_rooms: availableRooms,
  });

  // Notify external channels via webhooks
  const externalPartners = getExternalPartners(roomId);

  externalPartners.forEach((partner) => {
    if (partner.api_config?.webhook_url) {
      notifyInventoryChange(partner, {
        room_id: roomId,
        date: date,
        available_rooms: availableRooms,
      });
    }
  });
}
```

---

## 10. Analytics & Reporting

### 10.1 Key Performance Metrics

**Occupancy Rate**:

```typescript
function calculateOccupancyRate(
  hotelId: string,
  startDate: Date,
  endDate: Date,
): number {
  // Get total available room-nights
  const totalRoomNights = getTotalAvailableRoomNights(
    hotelId,
    startDate,
    endDate,
  );

  // Get booked room-nights
  const bookedNights = getBookedRoomNights(hotelId, startDate, endDate);

  if (totalRoomNights === 0) return 0;

  return (bookedNights / totalRoomNights) * 100;
}
```

**Average Daily Rate (ADR)**:

```typescript
function calculateADR(hotelId: string, startDate: Date, endDate: Date): number {
  // Get all bookings in date range
  const bookings = getBookingsForPeriod(hotelId, startDate, endDate);

  const totalRevenueCents = bookings.reduce((sum, b) => sum + b.total_cents, 0);

  const totalRoomNights = bookings.reduce((sum, b) => sum + b.nights_count, 0);

  if (totalRoomNights === 0) return 0;

  return totalRevenueCents / totalRoomNights;
}
```

**Revenue Per Available Room (RevPAR)**:

```typescript
function calculateRevPAR(
  hotelId: string,
  startDate: Date,
  endDate: Date,
): number {
  const occupancyRate = calculateOccupancyRate(hotelId, startDate, endDate);

  const adr = calculateADR(hotelId, startDate, endDate);

  return (occupancyRate / 100) * adr;
}
```

---

## 11. Review Management

### 11.1 Review Collection

**Eligibility Rules**:

- Only completed stays can be reviewed
- Reviews must be submitted within 30 days of checkout
- One review per booking
- User must be authenticated

**Auto-prompts**:

- Email sent 24 hours after checkout
- In-app notification 3 days after checkout
- SMS reminder 7 days after checkout

### 11.2 Review Moderation

**Auto-approval Criteria**:

- Rating 3-5 stars
- Length 50-500 characters
- No profanity detected
- No contact information shared

**Manual Review Required**:

- Rating 1-2 stars
- Very short (<50 chars) or very long (>500 chars)
- Profanity detected
- Multiple negative keywords

**Auto-rejection Criteria**:

- Spam detected
- Promotional content
- Hate speech or threats
- Privacy violations

```typescript
function moderateReview(review: Review): ModerationResult {
  let status = "approved";
  const flags: string[] = [];

  // Check length
  if (review.comment.length < 50) {
    flags.push("too_short");
    status = "pending";
  }

  if (review.comment.length > 500) {
    flags.push("too_long");
    status = "pending";
  }

  // Check rating
  if (review.overall_rating <= 2) {
    flags.push("low_rating");
    status = "pending"; // Manual review for low ratings
  }

  // Check for profanity
  if (containsProfanity(review.comment)) {
    flags.push("profanity");
    status = "rejected";
  }

  // Check for contact info
  if (containsContactInfo(review.comment)) {
    flags.push("contact_info");
    status = "rejected";
  }

  // Check for spam patterns
  if (isSpam(review.comment)) {
    flags.push("spam");
    status = "rejected";
  }

  return {
    status,
    flags,
    requires_manual_review: status === "pending",
  };
}
```

---

## 12. Notification Rules

### 12.1 Booking Notifications

**To Customer**:

- Booking confirmation (immediate)
- Payment receipt (immediate)
- Pre-arrival reminder (24 hours before)
- Check-in instructions (2 hours before)
- Review request (24 hours after checkout)

**To Partner**:

- New booking notification (immediate)
- Cancellation notification (immediate)
- Modification request (immediate)
- Payment confirmation (immediate)
- Review posted (immediate)

**To Admin**:

- Failed booking (immediate)
- High-value booking (immediate)
- Dispute filed (immediate)
- Payment issue (immediate)

---

**Document Version**: 1.0  
**Last Updated**: February 8, 2026  
**Maintained By**: TripC Development Team
