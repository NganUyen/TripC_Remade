/**
 * Business calculations for Flight Partner Portal
 * Handles pricing, revenue, capacity calculations
 */

// =====================================================
// PRICING CALCULATIONS
// =====================================================

/**
 * Calculate dynamic price based on rules
 */
export function calculateDynamicPrice(
  basePrice: number,
  pricingRules: any[],
  context: {
    daysBeforeDeparture: number;
    seatsAvailable: number;
    totalSeats: number;
    dayOfWeek: number;
    date: Date;
  }
): number {
  let finalPrice = basePrice;

  // Sort rules by priority (higher priority first)
  const sortedRules = pricingRules
    .filter((rule) => rule.is_active)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  for (const rule of sortedRules) {
    // Check if rule conditions are met
    if (!isRuleApplicable(rule, context)) {
      continue;
    }

    // Apply adjustment
    if (rule.adjustment_type === 'percentage') {
      finalPrice = finalPrice * (1 + rule.adjustment_value / 100);
    } else if (rule.adjustment_type === 'fixed_amount') {
      finalPrice = finalPrice + rule.adjustment_value;
    }
  }

  // Ensure price doesn't go below minimum threshold (20% of base)
  const minPrice = basePrice * 0.2;
  return Math.max(Math.round(finalPrice), minPrice);
}

/**
 * Check if pricing rule is applicable
 */
function isRuleApplicable(rule: any, context: any): boolean {
  const conditions = rule.conditions || {};

  // Check date range
  if (conditions.start_date && context.date < new Date(conditions.start_date)) {
    return false;
  }
  if (conditions.end_date && context.date > new Date(conditions.end_date)) {
    return false;
  }

  // Check days before departure
  if (
    conditions.days_before_departure_min !== undefined &&
    context.daysBeforeDeparture < conditions.days_before_departure_min
  ) {
    return false;
  }
  if (
    conditions.days_before_departure_max !== undefined &&
    context.daysBeforeDeparture > conditions.days_before_departure_max
  ) {
    return false;
  }

  // Check day of week
  if (
    conditions.days_of_week &&
    !conditions.days_of_week.includes(context.dayOfWeek)
  ) {
    return false;
  }

  // Check seats availability
  if (
    conditions.min_seats_available !== undefined &&
    context.seatsAvailable < conditions.min_seats_available
  ) {
    return false;
  }
  if (
    conditions.max_seats_available !== undefined &&
    context.seatsAvailable > conditions.max_seats_available
  ) {
    return false;
  }

  return true;
}

/**
 * Calculate load factor percentage
 */
export function calculateLoadFactor(
  seatsBooked: number,
  totalSeats: number
): number {
  if (totalSeats === 0) return 0;
  return Math.round((seatsBooked / totalSeats) * 10000) / 100; // Two decimal places
}

/**
 * Calculate yield per seat
 */
export function calculateYieldPerSeat(
  revenue: number,
  seatsBooked: number
): number {
  if (seatsBooked === 0) return 0;
  return Math.round(revenue / seatsBooked);
}

/**
 * Calculate revenue per available seat kilometer (RASK)
 */
export function calculateRASK(
  revenue: number,
  availableSeats: number,
  distanceKm: number
): number {
  const availableSeatKm = availableSeats * distanceKm;
  if (availableSeatKm === 0) return 0;
  return revenue / availableSeatKm;
}

// =====================================================
// REFUND CALCULATIONS
// =====================================================

interface RefundPolicy {
  hours_before_departure: number;
  refund_percentage: number;
}

const defaultRefundPolicies: RefundPolicy[] = [
  { hours_before_departure: 168, refund_percentage: 100 }, // 7 days - full refund
  { hours_before_departure: 48, refund_percentage: 75 }, // 2 days - 75% refund
  { hours_before_departure: 24, refund_percentage: 50 }, // 1 day - 50% refund
  { hours_before_departure: 0, refund_percentage: 0 }, // Less than 24h - no refund
];

/**
 * Calculate refund amount based on cancellation time
 */
export function calculateRefundAmount(
  totalAmount: number,
  departureTime: Date,
  cancellationTime: Date = new Date(),
  customPolicies?: RefundPolicy[]
): {
  refundAmount: number;
  refundPercentage: number;
  hoursBefore: number;
} {
  const hoursBefore =
    (departureTime.getTime() - cancellationTime.getTime()) / (1000 * 60 * 60);

  const policies = customPolicies || defaultRefundPolicies;

  // Find applicable policy
  const applicablePolicy = policies
    .sort((a, b) => b.hours_before_departure - a.hours_before_departure)
    .find((policy) => hoursBefore >= policy.hours_before_departure) || {
    refund_percentage: 0,
  };

  const refundAmount = Math.round(
    (totalAmount * applicablePolicy.refund_percentage) / 100
  );

  return {
    refundAmount,
    refundPercentage: applicablePolicy.refund_percentage,
    hoursBefore: Math.round(hoursBefore * 10) / 10,
  };
}

// =====================================================
// ANALYTICS CALCULATIONS
// =====================================================

interface BookingData {
  id: string;
  total_price: number;
  passenger_count: number;
  created_at: string;
  departure_at: string;
  status: string;
}

/**
 * Calculate comprehensive analytics from booking data
 */
export function calculateFlightAnalytics(bookings: BookingData[]) {
  const now = new Date();

  // Filter valid bookings
  const validBookings = bookings.filter(
    (b) => b.status !== 'cancelled' && b.status !== 'no_show'
  );

  // Total metrics
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + b.total_price, 0);
  const totalPassengers = bookings.reduce(
    (sum, b) => sum + (b.passenger_count || 1),
    0
  );

  // Status breakdown
  const confirmedBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'boarded' || b.status === 'completed'
  ).length;
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled')
    .length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;

  // Revenue breakdown
  const confirmedRevenue = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'boarded' || b.status === 'completed')
    .reduce((sum, b) => sum + b.total_price, 0);

  const cancelledRevenue = bookings
    .filter((b) => b.status === 'cancelled')
    .reduce((sum, b) => sum + b.total_price, 0);

  // Average metrics
  const avgBookingValue =
    validBookings.length > 0
      ? Math.round(totalRevenue / validBookings.length)
      : 0;

  const avgPassengersPerBooking =
    validBookings.length > 0
      ? Math.round((totalPassengers / validBookings.length) * 100) / 100
      : 0;

  // Lead time calculation
  const leadTimes = validBookings
    .map((b) => {
      const bookingDate = new Date(b.created_at);
      const departureDate = new Date(b.departure_at);
      return (
        (departureDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24)
      );
    })
    .filter((days) => days >= 0);

  const avgLeadTime =
    leadTimes.length > 0
      ? Math.round(
          leadTimes.reduce((sum, days) => sum + days, 0) / leadTimes.length
        )
      : 0;

  return {
    total: {
      bookings: totalBookings,
      revenue: totalRevenue,
      passengers: totalPassengers,
    },
    status: {
      confirmed: confirmedBookings,
      cancelled: cancelledBookings,
      pending: pendingBookings,
    },
    revenue: {
      confirmed: confirmedRevenue,
      cancelled: cancelledRevenue,
      net: confirmedRevenue,
    },
    averages: {
      bookingValue: avgBookingValue,
      passengersPerBooking: avgPassengersPerBooking,
      leadTimeDays: avgLeadTime,
    },
    rates: {
      cancellationRate:
        totalBookings > 0
          ? Math.round((cancelledBookings / totalBookings) * 10000) / 100
          : 0,
      confirmationRate:
        totalBookings > 0
          ? Math.round((confirmedBookings / totalBookings) * 10000) / 100
          : 0,
    },
  };
}

/**
 * Calculate period-over-period growth
 */
export function calculateGrowth(
  currentValue: number,
  previousValue: number
): {
  absolute: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
} {
  const absolute = currentValue - previousValue;
  const percentage =
    previousValue !== 0
      ? Math.round((absolute / previousValue) * 10000) / 100
      : currentValue > 0
      ? 100
      : 0;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (absolute > 0) trend = 'up';
  else if (absolute < 0) trend = 'down';

  return {
    absolute,
    percentage,
    trend,
  };
}

// =====================================================
// DATE UTILITIES
// =====================================================

/**
 * Get date range for common periods
 */
export function getDateRange(period: string): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'yesterday':
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;

    case 'last_7_days':
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;

    case 'last_30_days':
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      break;

    case 'this_month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;

    case 'last_month':
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setDate(0); // Last day of previous month
      end.setHours(23, 59, 59, 999);
      break;

    default:
      // Default to last 30 days
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
  }

  return { start, end };
}

/**
 * Format currency (cents to display)
 */
export function formatCurrency(cents: number, currency: string = 'USD'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
