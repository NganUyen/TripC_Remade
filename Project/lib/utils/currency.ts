/**
 * Currency Utility
 * Handles conversion between USD and VND for payment providers.
 */

// Exchange Rate: 1 USD = 25,450 VND (approximate/fixed for now)
// In a real app, this should be fetched from an API or DB.
export const EXCHANGE_RATE_USD_VND = 25450;

/**
 * Converts USD amount to VND.
 * Rounds to the nearest integer.
 */
export function convertUsdToVnd(usdAmount: number): number {
    return Math.floor(usdAmount * EXCHANGE_RATE_USD_VND);
}

/**
 * Formats currency for display.
 */
export function formatCurrency(amount: number, currency: 'USD' | 'VND'): string {
    if (currency === 'VND') {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

/**
 * Converts VND amount to USD.
 * Rounds to 2 decimal places.
 */
export function convertVndToUsd(vndAmount: number): number {
    return Number((vndAmount / EXCHANGE_RATE_USD_VND).toFixed(2));
}
