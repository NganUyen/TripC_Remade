
/**
 * Generates a standardized booking code.
 * Format: {PREFIX}-{CATEGORY_CODE}-{RANDOM_SUFFIX}
 * Example: TRIPC-TRA-A1B2C3
 * 
 * @param category The booking category (transport, hotel, etc.)
 */
export function generateBookingCode(category: string = 'general'): string {
    const prefix = 'TRIPC';

    // Map category to shorter code
    const categoryMap: Record<string, string> = {
        'transport': 'TRA',
        'hotel': 'HOT',
        'flight': 'FLI',
        'tour': 'TOU',
        'beauty': 'BEA',
        'wellness': 'WEL',
        'dining': 'DIN',
        'events': 'EVE',
        'entertainment': 'ENT',
        'shopping': 'SHO'
    };

    const catCode = categoryMap[category.toLowerCase()] || 'GEN';

    // Generate 6 random alphanumeric characters
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();

    return `${prefix}-${catCode}-${randomSuffix}`;
}
