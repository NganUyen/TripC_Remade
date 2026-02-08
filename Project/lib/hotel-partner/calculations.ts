/**
 * Business Logic Calculations for Hotel Partner Portal
 * Handles pricing, commissions, refunds, and other financial calculations
 */

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface Rate {
  price_cents: number;
  breakfast_included?: boolean;
  date: string;
}

export interface Discounts {
  has_working_pass?: boolean;
  tcent_to_use?: number;
  voucher_discount_cents?: number;
}

export interface Partner {
  commission_rate: number;
  id: string;
  name: string;
}

export interface BookingPrice {
  base_price_cents: number;
  tax_cents: number;
  fees_cents: number;
  discount_cents: number;
  working_pass_discount_cents: number;
  tcent_discount_cents: number;
  voucher_discount_cents: number;
  total_cents: number;
  commission_cents: number;
  partner_payout_cents: number;
  tcent_earned: number;
}

export interface Booking {
  total_cents: number;
  cancellation_policy: 'flexible' | 'moderate' | 'strict' | 'non_refundable';
  check_in_date: Date | string;
  status: string;
  tcent_used: number;
}

export interface RefundCalculation {
  refund_amount_cents: number;
  cancellation_fee_cents: number;
  refund_percentage: number;
  policy_applied: string;
  tcent_refund: number;
  cash_refund_cents: number;
}

// =====================================================
// CONSTANTS
// =====================================================

export const TAX_RATE = 0.10; // 10% tax
export const SERVICE_FEE_RATE = 0.02; // 2% service fee
export const WORKING_PASS_DISCOUNT_RATE = 0.10; // 10% discount for Working Pass holders
export const MAX_TCENT_USAGE_RATE = 0.30; // Maximum 30% of total can be paid with TCent
export const TCENT_EARNING_RATE = 0.05; // Earn 5% of base price as TCent
export const DEFAULT_COMMISSION_RATE = 0.15; // 15% default commission

// =====================================================
// DATE UTILITIES
// =====================================================

/**
 * Get the number of hours between two dates
 */
export function getHoursBetween(date1: Date, date2: Date): number {
  return Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60);
}

/**
 * Get the number of days between two dates
 */
export function getDaysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get array of dates between start and end (inclusive)
 */
export function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const currentDate = new Date(start);
  while (currentDate <= end) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

/**
 * Check if a date is within a given range
 */
export function isDateInRange(date: string, startDate: string, endDate: string): boolean {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return d >= start && d <= end;
}

// =====================================================
// PRICING CALCULATIONS
// =====================================================

/**
 * Calculate booking price with all applicable discounts and fees
 */
export function calculateBookingPrice(
  rates: Rate[],
  discounts: Discounts = {},
  partner: Partner
): BookingPrice {
  // Calculate base price (sum of daily rates)
  const basePriceCents = rates.reduce((sum, rate) => sum + rate.price_cents, 0);

  // Calculate tax (10% of base price)
  const taxCents = Math.round(basePriceCents * TAX_RATE);

  // Calculate service fees (2% of base price)
  const feesCents = Math.round(basePriceCents * SERVICE_FEE_RATE);

  // Subtotal before discounts
  const subtotalCents = basePriceCents + taxCents + feesCents;

  // Calculate Working Pass discount (10% of base price)
  const workingPassDiscountCents = discounts.has_working_pass
    ? Math.round(basePriceCents * WORKING_PASS_DISCOUNT_RATE)
    : 0;

  // Calculate TCent discount (max 30% of subtotal)
  const maxTcentUsage = Math.round(subtotalCents * MAX_TCENT_USAGE_RATE);
  const tcentDiscountCents = Math.min(discounts.tcent_to_use || 0, maxTcentUsage);

  // Voucher discount
  const voucherDiscountCents = discounts.voucher_discount_cents || 0;

  // Total discount
  const totalDiscountCents = workingPassDiscountCents + tcentDiscountCents + voucherDiscountCents;

  // Final total
  const totalCents = Math.max(0, subtotalCents - totalDiscountCents);

  // Calculate partner commission (based on base price before discounts)
  const commissionCents = Math.round(basePriceCents * partner.commission_rate);

  // Partner payout (base price minus commission)
  const partnerPayoutCents = basePriceCents - commissionCents;

  // Calculate TCent earned (5% of base price)
  const tcentEarned = Math.round(basePriceCents * TCENT_EARNING_RATE);

  return {
    base_price_cents: basePriceCents,
    tax_cents: taxCents,
    fees_cents: feesCents,
    discount_cents: totalDiscountCents,
    working_pass_discount_cents: workingPassDiscountCents,
    tcent_discount_cents: tcentDiscountCents,
    voucher_discount_cents: voucherDiscountCents,
    total_cents: totalCents,
    commission_cents: commissionCents,
    partner_payout_cents: partnerPayoutCents,
    tcent_earned: tcentEarned,
  };
}

/**
 * Calculate best available price for a room across date range
 */
export function calculateBestPrice(rates: Rate[]): {
  lowest_nightly_rate_cents: number;
  average_nightly_rate_cents: number;
  total_price_cents: number;
} {
  if (rates.length === 0) {
    return {
      lowest_nightly_rate_cents: 0,
      average_nightly_rate_cents: 0,
      total_price_cents: 0,
    };
  }

  const prices = rates.map(r => r.price_cents);
  const lowestNightlyRateCents = Math.min(...prices);
  const totalPriceCents = prices.reduce((sum, price) => sum + price, 0);
  const averageNightlyRateCents = Math.round(totalPriceCents / rates.length);

  return {
    lowest_nightly_rate_cents: lowestNightlyRateCents,
    average_nightly_rate_cents: averageNightlyRateCents,
    total_price_cents: totalPriceCents,
  };
}

// =====================================================
// REFUND CALCULATIONS
// =====================================================

/**
 * Calculate refund amount based on cancellation policy and timing
 */
export function calculateRefund(
  booking: Booking,
  cancellationDate: Date = new Date()
): RefundCalculation {
  const checkInDate = typeof booking.check_in_date === 'string' 
    ? new Date(booking.check_in_date) 
    : booking.check_in_date;
  
  const hoursUntilCheckIn = getHoursBetween(cancellationDate, checkInDate);
  const daysUntilCheckIn = hoursUntilCheckIn / 24;

  let refundPercentage = 0;

  switch (booking.cancellation_policy) {
    case 'flexible':
      // Full refund if cancelled 24+ hours before check-in
      refundPercentage = hoursUntilCheckIn >= 24 ? 100 : 0;
      break;

    case 'moderate':
      // Full refund if cancelled 7+ days before
      // 50% refund if cancelled 3-7 days before
      // No refund if less than 3 days
      if (daysUntilCheckIn >= 7) {
        refundPercentage = 100;
      } else if (daysUntilCheckIn >= 3) {
        refundPercentage = 50;
      } else {
        refundPercentage = 0;
      }
      break;

    case 'strict':
      // Full refund if cancelled 14+ days before
      // 50% refund if cancelled 7-14 days before
      // No refund if less than 7 days
      if (daysUntilCheckIn >= 14) {
        refundPercentage = 100;
      } else if (daysUntilCheckIn >= 7) {
        refundPercentage = 50;
      } else {
        refundPercentage = 0;
      }
      break;

    case 'non_refundable':
      refundPercentage = 0;
      break;
  }

  const refundAmountCents = Math.round(booking.total_cents * (refundPercentage / 100));
  const cancellationFeeCents = booking.total_cents - refundAmountCents;

  // Calculate TCent refund (TCent used is refunded separately)
  const tcentRefund = refundPercentage === 100 ? booking.tcent_used : 0;

  // Cash refund (after deducting TCent that will be refunded)
  const cashRefundCents = refundAmountCents;

  return {
    refund_amount_cents: refundAmountCents,
    cancellation_fee_cents: cancellationFeeCents,
    refund_percentage: refundPercentage,
    policy_applied: booking.cancellation_policy,
    tcent_refund: tcentRefund,
    cash_refund_cents: cashRefundCents,
  };
}

// =====================================================
// COMMISSION CALCULATIONS
// =====================================================

/**
 * Calculate commission tiers based on booking volume
 */
export function getCommissionRate(totalBookings: number): number {
  // Volume-based commission tiers
  if (totalBookings >= 1000) return 0.10; // 10% for 1000+ bookings
  if (totalBookings >= 500) return 0.12;  // 12% for 500+ bookings
  if (totalBookings >= 100) return 0.14;  // 14% for 100+ bookings
  return DEFAULT_COMMISSION_RATE;         // 15% default
}

/**
 * Calculate partner payout for a period
 */
export function calculatePartnerPayout(bookings: {
  base_price_cents: number;
  commission_cents: number;
  status: string;
}[]): {
  gross_amount_cents: number;
  commission_cents: number;
  net_amount_cents: number;
  eligible_bookings: number;
} {
  // Only include completed bookings (checked_out status)
  const eligibleBookings = bookings.filter(b => b.status === 'checked_out');

  const grossAmountCents = eligibleBookings.reduce(
    (sum, b) => sum + b.base_price_cents,
    0
  );

  const commissionCents = eligibleBookings.reduce(
    (sum, b) => sum + b.commission_cents,
    0
  );

  const netAmountCents = grossAmountCents - commissionCents;

  return {
    gross_amount_cents: grossAmountCents,
    commission_cents: commissionCents,
    net_amount_cents: netAmountCents,
    eligible_bookings: eligibleBookings.length,
  };
}

// =====================================================
// OCCUPANCY CALCULATIONS
// =====================================================

/**
 * Calculate occupancy rate for a hotel
 */
export function calculateOccupancyRate(
  totalRooms: number,
  bookedRooms: number
): number {
  if (totalRooms === 0) return 0;
  return Math.round((bookedRooms / totalRooms) * 10000) / 100; // Round to 2 decimals
}

/**
 * Calculate average daily rate (ADR)
 */
export function calculateADR(
  totalRevenueCents: number,
  roomsSold: number
): number {
  if (roomsSold === 0) return 0;
  return Math.round(totalRevenueCents / roomsSold);
}

/**
 * Calculate revenue per available room (RevPAR)
 */
export function calculateRevPAR(
  totalRevenueCents: number,
  totalRoomsAvailable: number
): number {
  if (totalRoomsAvailable === 0) return 0;
  return Math.round(totalRevenueCents / totalRoomsAvailable);
}

// =====================================================
// INVENTORY CALCULATIONS
// =====================================================

/**
 * Check if enough rooms are available for booking
 */
export function checkRoomAvailability(
  requestedRooms: number,
  availableRooms: number,
  existingBookings: number = 0
): {
  available: boolean;
  remaining: number;
} {
  const actualAvailable = availableRooms - existingBookings;
  return {
    available: actualAvailable >= requestedRooms,
    remaining: Math.max(0, actualAvailable - requestedRooms),
  };
}

/**
 * Calculate total nights for a booking
 */
export function calculateTotalNights(checkInDate: string, checkOutDate: string): number {
  return getDaysBetween(checkInDate, checkOutDate);
}

// =====================================================
// RATING CALCULATIONS
// =====================================================

/**
 * Calculate new average rating when adding a new review
 */
export function calculateNewAverageRating(
  currentAverage: number,
  currentCount: number,
  newRating: number
): number {
  const total = currentAverage * currentCount + newRating;
  const newCount = currentCount + 1;
  return Math.round((total / newCount) * 100) / 100; // Round to 2 decimals
}

// =====================================================
// CURRENCY FORMATTING
// =====================================================

/**
 * Format cents to currency string
 */
export function formatCurrency(cents: number, currency: string = 'USD'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Convert dollars to cents
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Convert cents to dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

// =====================================================
// VALIDATION HELPERS
// =====================================================

/**
 * Validate minimum and maximum nights constraints
 */
export function validateNightsConstraint(
  totalNights: number,
  minNights?: number,
  maxNights?: number
): {
  valid: boolean;
  reason?: string;
} {
  if (minNights && totalNights < minNights) {
    return {
      valid: false,
      reason: `Minimum stay of ${minNights} night(s) required`,
    };
  }

  if (maxNights && totalNights > maxNights) {
    return {
      valid: false,
      reason: `Maximum stay of ${maxNights} night(s) allowed`,
    };
  }

  return { valid: true };
}

/**
 * Validate booking dates
 */
export function validateBookingDates(
  checkInDate: string,
  checkOutDate: string
): {
  valid: boolean;
  reason?: string;
} {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkIn < today) {
    return {
      valid: false,
      reason: 'Check-in date cannot be in the past',
    };
  }

  if (checkOut <= checkIn) {
    return {
      valid: false,
      reason: 'Check-out date must be after check-in date',
    };
  }

  return { valid: true };
}
