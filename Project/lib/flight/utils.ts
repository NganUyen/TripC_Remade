/**
 * Flight Service Utilities
 * 
 * Helper functions for the Flight Service MVP
 * 
 * @module lib/flight/utils
 */

/**
 * Generate a random PNR (Passenger Name Record)
 * Format: 6 alphanumeric characters (uppercase)
 * 
 * @returns {string} Generated PNR
 * @example "A1B2C3"
 */
export function generatePNR(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pnr = '';
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
}

/**
 * Generate a search cache key
 * 
 * @param origin - Origin IATA code
 * @param destination - Destination IATA code  
 * @param date - Departure date
 * @param additionalParams - Additional search parameters
 * @returns {string} Cache key
 */
export function generateSearchKey(
  origin: string,
  destination: string,
  date: string,
  additionalParams?: Record<string, any>
): string {
  const baseKey = `${origin}_${destination}_${date}`;
  if (!additionalParams || Object.keys(additionalParams).length === 0) {
    return baseKey;
  }
  
  const paramsString = Object.entries(additionalParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('_');
  
  return `${baseKey}_${paramsString}`;
}

/**
 * Validate IATA airport code format
 * 
 * @param code - Airport code to validate
 * @returns {boolean} True if valid
 */
export function isValidIATACode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
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
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validate passenger data
 * 
 * @param passengers - Array of passenger objects
 * @returns {boolean} True if valid
 */
export function validatePassengers(passengers: any[]): boolean {
  if (!Array.isArray(passengers) || passengers.length === 0) {
    return false;
  }

  return passengers.every(passenger => {
    return (
      passenger.first_name &&
      passenger.last_name &&
      typeof passenger.first_name === 'string' &&
      typeof passenger.last_name === 'string' &&
      passenger.first_name.length > 0 &&
      passenger.last_name.length > 0
    );
  });
}

/**
 * Calculate pagination offset
 * 
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns {number} Offset value
 */
export function calculateOffset(page: number, limit: number): number {
  return (Math.max(1, page) - 1) * limit;
}

/**
 * Parse query parameter as number with default
 * 
 * @param value - Query parameter value
 * @param defaultValue - Default value
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns {number} Parsed number
 */
export function parseQueryNumber(
  value: string | string[] | undefined,
  defaultValue: number,
  min?: number,
  max?: number
): number {
  if (!value || Array.isArray(value)) {
    return defaultValue;
  }

  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    return defaultValue;
  }

  let result = parsed;
  if (min !== undefined) {
    result = Math.max(min, result);
  }
  if (max !== undefined) {
    result = Math.min(max, result);
  }

  return result;
}
