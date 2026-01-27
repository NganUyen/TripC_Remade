/**
 * Hotel Service Utilities
 *
 * Helper functions for the Hotel Service MVP
 *
 * @module lib/hotel/utils
 */

/**
 * Generate a random confirmation code
 * Format: 8 alphanumeric characters (uppercase)
 *
 * @returns {string} Generated confirmation code
 * @example "A1B2C3D4"
 */
export function generateConfirmationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Calculate number of nights between two dates
 *
 * @param checkIn - Check-in date
 * @param checkOut - Check-out date
 * @returns {number} Number of nights
 */
export function calculateNights(
  checkIn: Date | string,
  checkOut: Date | string,
): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Format date to YYYY-MM-DD
 *
 * @param date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Validate date range for hotel booking
 *
 * @param checkIn - Check-in date
 * @param checkOut - Check-out date
 * @returns {boolean} True if valid
 */
export function validateDateRange(
  checkIn: Date | string,
  checkOut: Date | string,
): boolean {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check-in must be today or future
  if (start < today) {
    return false;
  }

  // Check-out must be after check-in
  if (end <= start) {
    return false;
  }

  return true;
}

/**
 * Calculate total price from nightly rate
 *
 * @param nightlyRate - Nightly rate in cents
 * @param nights - Number of nights
 * @param taxRate - Tax rate (e.g., 0.1 for 10%)
 * @param fees - Additional fees in cents
 * @returns {object} Breakdown of total price
 */
export function calculateTotalPrice(
  nightlyRate: number,
  nights: number,
  taxRate: number = 0.1,
  fees: number = 0,
): {
  subtotal: number;
  tax: number;
  fees: number;
  total: number;
} {
  const subtotal = nightlyRate * nights;
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax + fees;

  return {
    subtotal,
    tax,
    fees,
    total,
  };
}

/**
 * Format price in cents to currency string
 *
 * @param cents - Price in cents
 * @param currency - Currency code
 * @returns {string} Formatted price
 */
export function formatPrice(cents: number, currency: string = "USD"): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Validate guest count
 *
 * @param guestCount - Guest count object
 * @returns {boolean} True if valid
 */
export function validateGuestCount(guestCount: any): boolean {
  if (!guestCount || typeof guestCount !== "object") {
    return false;
  }

  const { adults, children = 0, infants = 0 } = guestCount;

  if (typeof adults !== "number" || adults < 1) {
    return false;
  }

  if (typeof children !== "number" || children < 0) {
    return false;
  }

  if (typeof infants !== "number" || infants < 0) {
    return false;
  }

  return true;
}

/**
 * Generate date range array
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @returns {string[]} Array of dates in YYYY-MM-DD format
 */
export function generateDateRange(
  startDate: Date | string,
  endDate: Date | string,
): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current < end) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
