/**
 * Working Pass Validator
 *
 * Validates Working Pass eligibility and benefits for hotel bookings.
 * Per flowchart: Working Pass is a premium subscription for business travelers.
 *
 * Working Pass Benefits:
 * - 10% discount on hotel bookings (minimum 3 nights)
 * - 50% bonus TCent earning
 * - Priority booking access
 * - Free cancellation up to 24h before check-in
 * - Flexible check-in/check-out times
 */

export interface WorkingPassStatus {
  has_working_pass: boolean;
  is_active: boolean;
  expiry_date?: string;
  subscription_tier?: "monthly" | "annual";
}

export interface WorkingPassEligibility {
  is_eligible: boolean;
  benefits: string[];
  restrictions?: string[];
  discount_percentage: number;
  tcent_bonus_percentage: number;
}

export interface WorkingPassBookingBenefits {
  discount_applicable: boolean;
  discount_cents: number;
  discount_percentage: number;
  tcent_bonus_applicable: boolean;
  tcent_bonus_percentage: number;
  free_cancellation: boolean;
  flexible_checkin: boolean;
  priority_support: boolean;
  total_value_cents: number; // Estimated total value of benefits
}

/**
 * Check if user has active Working Pass subscription
 * This would typically query Supabase user_subscriptions table
 */
export async function checkWorkingPassStatus(
  user_id: string,
): Promise<WorkingPassStatus> {
  // TODO: Implement actual Supabase query
  // For now, return placeholder
  // In real implementation:
  // const { data } = await supabase
  //   .from('user_subscriptions')
  //   .select('*')
  //   .eq('user_id', user_id)
  //   .eq('subscription_type', 'working_pass')
  //   .eq('status', 'active')
  //   .single();

  return {
    has_working_pass: false,
    is_active: false,
  };
}

/**
 * Validate Working Pass eligibility for a booking
 */
export function validateWorkingPassEligibility(
  booking_params: {
    check_in_date: string;
    check_out_date: string;
    room_count: number;
    guest_count: number;
  },
  working_pass_status: WorkingPassStatus,
): WorkingPassEligibility {
  const benefits: string[] = [];
  const restrictions: string[] = [];
  let discount_percentage = 0;
  let tcent_bonus_percentage = 0;

  // Check if Working Pass is active
  if (!working_pass_status.has_working_pass || !working_pass_status.is_active) {
    return {
      is_eligible: false,
      benefits: ["Not a Working Pass member"],
      restrictions: ["Subscribe to Working Pass to unlock benefits"],
      discount_percentage: 0,
      tcent_bonus_percentage: 0,
    };
  }

  // Calculate number of nights
  const checkIn = new Date(booking_params.check_in_date);
  const checkOut = new Date(booking_params.check_out_date);
  const nights = Math.floor(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Check minimum nights requirement for discount
  const MIN_NIGHTS_FOR_DISCOUNT = 3;

  if (nights >= MIN_NIGHTS_FOR_DISCOUNT) {
    discount_percentage = 0.1; // 10% discount
    benefits.push(`10% discount on ${nights} night stay`);
    benefits.push("Free cancellation up to 24h before check-in");
  } else {
    restrictions.push(
      `Minimum ${MIN_NIGHTS_FOR_DISCOUNT} nights required for discount`,
    );
  }

  // TCent bonus is always applicable for Working Pass members
  tcent_bonus_percentage = 0.5; // 50% bonus
  benefits.push("50% bonus TCent on all bookings");

  // Other benefits
  benefits.push("Flexible check-in/check-out times");
  benefits.push("Priority customer support");
  benefits.push("Early access to exclusive deals");

  // Check for restrictions
  if (booking_params.room_count > 3) {
    restrictions.push(
      "Working Pass discount limited to maximum 3 rooms per booking",
    );
  }

  return {
    is_eligible: true,
    benefits,
    restrictions: restrictions.length > 0 ? restrictions : undefined,
    discount_percentage,
    tcent_bonus_percentage,
  };
}

/**
 * Calculate all Working Pass benefits for a booking
 */
export function calculateWorkingPassBenefits(
  booking_amount_cents: number,
  booking_params: {
    check_in_date: string;
    check_out_date: string;
    room_count: number;
    guest_count: number;
  },
  eligibility: WorkingPassEligibility,
): WorkingPassBookingBenefits {
  // Calculate discount
  const discount_applicable =
    eligibility.is_eligible && eligibility.discount_percentage > 0;
  const discount_cents = discount_applicable
    ? Math.floor(booking_amount_cents * eligibility.discount_percentage)
    : 0;

  // TCent bonus calculation (applied during TCent earning)
  const tcent_bonus_applicable =
    eligibility.is_eligible && eligibility.tcent_bonus_percentage > 0;

  // Free cancellation (24h before check-in)
  const free_cancellation = eligibility.is_eligible;

  // Flexible check-in/check-out
  const flexible_checkin = eligibility.is_eligible;

  // Priority support
  const priority_support = eligibility.is_eligible;

  // Estimate total value of benefits
  // Free cancellation value: ~$20 SGD
  // Flexible check-in value: ~$15 SGD
  // Priority support: ~$10 SGD
  const service_benefits_value_cents = eligibility.is_eligible ? 4500 : 0; // $45 SGD
  const total_value_cents = discount_cents + service_benefits_value_cents;

  return {
    discount_applicable,
    discount_cents,
    discount_percentage: eligibility.discount_percentage,
    tcent_bonus_applicable,
    tcent_bonus_percentage: eligibility.tcent_bonus_percentage,
    free_cancellation,
    flexible_checkin,
    priority_support,
    total_value_cents,
  };
}

/**
 * Check if booking qualifies for free cancellation via Working Pass
 */
export function canCancelFreeWithWorkingPass(booking: {
  has_working_pass: boolean;
  check_in_date: string;
  booking_date: string;
}): { can_cancel_free: boolean; reason: string } {
  if (!booking.has_working_pass) {
    return {
      can_cancel_free: false,
      reason: "Free cancellation requires Working Pass subscription",
    };
  }

  const checkIn = new Date(booking.check_in_date);
  const now = new Date();
  const hoursUntilCheckIn =
    (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Free cancellation if more than 24 hours before check-in
  if (hoursUntilCheckIn > 24) {
    return {
      can_cancel_free: true,
      reason: `Free cancellation available (${Math.floor(hoursUntilCheckIn)} hours before check-in)`,
    };
  }

  return {
    can_cancel_free: false,
    reason: "Free cancellation window has passed (requires 24h notice)",
  };
}

/**
 * Get Working Pass subscription pricing
 */
export function getWorkingPassPricing(): {
  monthly: { price_cents: number; savings_per_booking_cents: number };
  annual: {
    price_cents: number;
    savings_per_booking_cents: number;
    annual_discount: number;
  };
} {
  return {
    monthly: {
      price_cents: 4900, // $49 SGD/month
      savings_per_booking_cents: 5000, // Average $50 SGD saved per booking
    },
    annual: {
      price_cents: 49900, // $499 SGD/year (instead of $588)
      savings_per_booking_cents: 5000,
      annual_discount: 0.15, // 15% discount vs monthly
    },
  };
}

/**
 * Calculate ROI for Working Pass subscription
 */
export function calculateWorkingPassROI(
  expected_bookings_per_year: number,
  average_booking_amount_cents: number,
): {
  monthly_cost_cents: number;
  annual_cost_cents: number;
  estimated_annual_savings_cents: number;
  break_even_bookings: number;
  roi_percentage: number;
  recommendation: "monthly" | "annual" | "not_recommended";
} {
  const pricing = getWorkingPassPricing();

  // Annual costs
  const monthly_annual_cost = pricing.monthly.price_cents * 12;
  const annual_cost = pricing.annual.price_cents;

  // Estimated savings per booking (10% discount + benefits)
  const discount_per_booking = average_booking_amount_cents * 0.1;
  const benefits_value = 4500; // $45 in service benefits
  const total_savings_per_booking = discount_per_booking + benefits_value;

  // Annual savings
  const estimated_annual_savings =
    total_savings_per_booking * expected_bookings_per_year;

  // Break-even calculation
  const break_even_bookings = Math.ceil(
    annual_cost / total_savings_per_booking,
  );

  // ROI calculation
  const roi_percentage =
    ((estimated_annual_savings - annual_cost) / annual_cost) * 100;

  // Recommendation
  let recommendation: "monthly" | "annual" | "not_recommended";
  if (expected_bookings_per_year < break_even_bookings) {
    recommendation = "not_recommended";
  } else if (expected_bookings_per_year >= 12) {
    recommendation = "annual"; // More than 1 booking per month
  } else {
    recommendation = "monthly";
  }

  return {
    monthly_cost_cents: pricing.monthly.price_cents,
    annual_cost_cents: annual_cost,
    estimated_annual_savings_cents: estimated_annual_savings,
    break_even_bookings,
    roi_percentage,
    recommendation,
  };
}

/**
 * Format Working Pass benefit summary for display
 */
export function formatWorkingPassBenefits(
  benefits: WorkingPassBookingBenefits,
  booking_amount_cents: number,
): string[] {
  const summary: string[] = [];

  if (benefits.discount_applicable) {
    const saved = (benefits.discount_cents / 100).toFixed(2);
    summary.push(
      `💰 Save $${saved} SGD (${Math.round(benefits.discount_percentage * 100)}% discount)`,
    );
  }

  if (benefits.tcent_bonus_applicable) {
    summary.push(
      `⭐ Earn ${Math.round(benefits.tcent_bonus_percentage * 100)}% bonus TCent`,
    );
  }

  if (benefits.free_cancellation) {
    summary.push("🔄 Free cancellation (up to 24h before check-in)");
  }

  if (benefits.flexible_checkin) {
    summary.push("⏰ Flexible check-in/check-out times");
  }

  if (benefits.priority_support) {
    summary.push("🎯 Priority customer support");
  }

  const total_value = (benefits.total_value_cents / 100).toFixed(2);
  summary.push(`📊 Total value: $${total_value} SGD in benefits`);

  return summary;
}
