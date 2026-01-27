/**
 * TCent Loyalty Points Calculator
 *
 * Calculates TCent points for hotel bookings based on:
 * - Base booking amount
 * - Partner-specific earn rates
 * - Working Pass status
 * - User tier/membership level
 *
 * Per flowchart: TCent system is integrated throughout booking flow
 */

export interface TcentCalculation {
  base_amount_cents: number;
  partner_earn_rate: number; // e.g., 0.05 = 5%
  working_pass_multiplier: number; // e.g., 1.5 = 50% bonus
  tier_multiplier: number; // e.g., 1.2 = 20% bonus
  base_tcent: number;
  working_pass_bonus: number;
  tier_bonus: number;
  total_tcent: number;
}

export interface WorkingPassDiscount {
  is_eligible: boolean;
  discount_percentage: number;
  discount_cents: number;
  reason?: string;
}

export interface TcentRedemption {
  tcent_to_use: number;
  cents_value: number; // How many cents the TCent is worth
  max_redeemable: number; // Maximum TCent that can be used for this booking
  max_percentage: number; // e.g., 0.3 = max 30% of booking can be paid with TCent
}

/**
 * Calculate TCent earning for a hotel booking
 */
export function calculateTcentEarning(
  booking_amount_cents: number,
  partner_earn_rate: number = 0.05, // Default 5%
  has_working_pass: boolean = false,
  user_tier: "standard" | "silver" | "gold" | "platinum" = "standard",
): TcentCalculation {
  // Base TCent calculation (1 cent = 1 TCent)
  const base_tcent = Math.floor(booking_amount_cents * partner_earn_rate);

  // Working Pass bonus (50% extra TCent)
  const working_pass_multiplier = has_working_pass ? 1.5 : 1.0;
  const working_pass_bonus = has_working_pass
    ? Math.floor(base_tcent * 0.5)
    : 0;

  // Tier-based bonus
  const tier_multipliers = {
    standard: 1.0,
    silver: 1.1, // 10% bonus
    gold: 1.2, // 20% bonus
    platinum: 1.5, // 50% bonus
  };
  const tier_multiplier = tier_multipliers[user_tier];
  const tier_bonus =
    tier_multiplier > 1.0
      ? Math.floor(base_tcent * (tier_multiplier - 1.0))
      : 0;

  // Total TCent earned
  const total_tcent = base_tcent + working_pass_bonus + tier_bonus;

  return {
    base_amount_cents: booking_amount_cents,
    partner_earn_rate,
    working_pass_multiplier,
    tier_multiplier,
    base_tcent,
    working_pass_bonus,
    tier_bonus,
    total_tcent,
  };
}

/**
 * Calculate Working Pass discount for a hotel booking
 */
export function calculateWorkingPassDiscount(
  booking_amount_cents: number,
  check_in_date: string,
  check_out_date: string,
  has_working_pass: boolean,
  min_nights: number = 3,
  discount_percentage: number = 0.1, // 10% discount
): WorkingPassDiscount {
  if (!has_working_pass) {
    return {
      is_eligible: false,
      discount_percentage: 0,
      discount_cents: 0,
      reason: "No Working Pass subscription",
    };
  }

  // Calculate nights
  const checkIn = new Date(check_in_date);
  const checkOut = new Date(check_out_date);
  const nights = Math.floor(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (nights < min_nights) {
    return {
      is_eligible: false,
      discount_percentage: 0,
      discount_cents: 0,
      reason: `Minimum ${min_nights} nights required for Working Pass discount`,
    };
  }

  // Check if it's a weekday-heavy booking (Working Pass is for business travelers)
  // Optional: Could add weekday check here

  const discount_cents = Math.floor(booking_amount_cents * discount_percentage);

  return {
    is_eligible: true,
    discount_percentage,
    discount_cents,
    reason: `Working Pass ${Math.round(discount_percentage * 100)}% discount applied`,
  };
}

/**
 * Calculate TCent redemption for payment
 */
export function calculateTcentRedemption(
  booking_amount_cents: number,
  available_tcent: number,
  max_percentage: number = 0.3, // Max 30% of booking can be paid with TCent
): TcentRedemption {
  // TCent to cents conversion (1 TCent = 1 cent)
  const tcent_to_cents_rate = 1.0;

  // Maximum amount that can be paid with TCent (30% of booking)
  const max_redeemable_cents = Math.floor(
    booking_amount_cents * max_percentage,
  );
  const max_redeemable_tcent = Math.floor(
    max_redeemable_cents / tcent_to_cents_rate,
  );

  // Actual TCent that can be used (limited by available and max)
  const tcent_to_use = Math.min(available_tcent, max_redeemable_tcent);
  const cents_value = Math.floor(tcent_to_use * tcent_to_cents_rate);

  return {
    tcent_to_use,
    cents_value,
    max_redeemable: max_redeemable_tcent,
    max_percentage,
  };
}

/**
 * Calculate final booking price after all discounts and TCent redemption
 */
export function calculateFinalBookingPrice(params: {
  base_amount_cents: number;
  working_pass_discount_cents?: number;
  tcent_redemption_cents?: number;
  promo_discount_cents?: number;
}): {
  base_amount_cents: number;
  total_discount_cents: number;
  final_amount_cents: number;
  breakdown: {
    working_pass_discount?: number;
    tcent_redemption?: number;
    promo_discount?: number;
  };
} {
  const {
    base_amount_cents,
    working_pass_discount_cents = 0,
    tcent_redemption_cents = 0,
    promo_discount_cents = 0,
  } = params;

  const total_discount_cents =
    working_pass_discount_cents + tcent_redemption_cents + promo_discount_cents;

  const final_amount_cents = Math.max(
    0,
    base_amount_cents - total_discount_cents,
  );

  return {
    base_amount_cents,
    total_discount_cents,
    final_amount_cents,
    breakdown: {
      working_pass_discount: working_pass_discount_cents || undefined,
      tcent_redemption: tcent_redemption_cents || undefined,
      promo_discount: promo_discount_cents || undefined,
    },
  };
}

/**
 * Get partner-specific earn rate
 * Different partners may have different TCent earning rates
 */
export function getPartnerEarnRate(partner_code: string): number {
  const partner_rates: Record<string, number> = {
    DIRECT: 0.1, // 10% - Highest rate for direct bookings
    AGODA: 0.06, // 6%
    BOOKING: 0.05, // 5%
    EXPEDIA: 0.05, // 5%
    HOTELSCOM: 0.05, // 5%
  };

  return partner_rates[partner_code] || 0.05; // Default 5%
}

/**
 * Validate if user has sufficient TCent for redemption
 */
export function validateTcentRedemption(
  tcent_to_use: number,
  available_tcent: number,
  booking_amount_cents: number,
): { valid: boolean; error?: string } {
  if (tcent_to_use <= 0) {
    return { valid: false, error: "TCent amount must be positive" };
  }

  if (tcent_to_use > available_tcent) {
    return {
      valid: false,
      error: `Insufficient TCent balance. Available: ${available_tcent}, Requested: ${tcent_to_use}`,
    };
  }

  // Check max redemption limit (30% of booking)
  const max_redeemable = Math.floor(booking_amount_cents * 0.3);
  if (tcent_to_use > max_redeemable) {
    return {
      valid: false,
      error: `Maximum ${max_redeemable} TCent can be used (30% of booking amount)`,
    };
  }

  return { valid: true };
}

/**
 * Format TCent for display
 */
export function formatTcent(tcent: number): string {
  return `${tcent.toLocaleString()} TC`;
}

/**
 * Format cents to currency
 */
export function formatCents(cents: number, currency: string = "SGD"): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: currency,
  }).format(amount);
}
