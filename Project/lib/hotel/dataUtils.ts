/**
 * Hotel Data Utilities
 * Helper functions for transforming and handling hotel data from API
 */

interface HotelAPIResponse {
  id?: string;
  slug: string;
  name: string;
  description?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    country?: string;
    postal_code?: string;
    lat?: number;
    lng?: number;
  };
  star_rating?: number;
  images?: string[] | { url: string; caption?: string; is_primary?: boolean }[];
  amenities?: string[];
  policies?: any;
  best_price?: number; // Price in cents
  created_at?: string;
}

interface TransformedHotel {
  id: number;
  slug: string;
  name: string;
  location: string;
  address?: any;
  rating: number;
  stars: number;
  reviews: number;
  image: string;
  priceOld?: number;
  priceNew: number;
  originalPrice: number;
  price: number;
  amenities: string[];
  description?: string;
  badge: string | null;
}

/**
 * Extract image URL from various formats
 */
export function extractHotelImage(images: any): string {
  const fallbackImage =
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800";

  if (!images) return fallbackImage;

  // Handle array of strings
  if (Array.isArray(images)) {
    if (images.length === 0) return fallbackImage;

    const firstImage = images[0];

    // If it's a string, return it
    if (typeof firstImage === "string") {
      return firstImage;
    }

    // If it's an object with url property
    if (firstImage && typeof firstImage === "object" && "url" in firstImage) {
      return firstImage.url || fallbackImage;
    }
  }

  return fallbackImage;
}

/**
 * Calculate hotel price based on star rating and room type
 * This is a temporary solution until we fetch actual rates from the API
 */
export function calculateHotelPrice(
  starRating: number = 3,
  city?: string,
): { price: number; originalPrice: number } {
  // Base prices by star rating (in USD)
  const basePrices: Record<number, number> = {
    5: 200,
    4: 120,
    3: 80,
    2: 50,
    1: 30,
  };

  const basePrice = basePrices[Math.floor(starRating)] || basePrices[3];

  // Add city multiplier
  const cityMultipliers: Record<string, number> = {
    Hanoi: 1.0,
    "Ho Chi Minh City": 1.1,
    "Da Nang": 0.9,
    "Nha Trang": 0.85,
    "Hoi An": 0.95,
    "Phu Quoc": 1.15,
    "Da Lat": 0.8,
  };

  const multiplier = city ? cityMultipliers[city] || 1.0 : 1.0;
  const price = Math.round(basePrice * multiplier);

  // Original price is 15-25% higher
  const discountPercent = 15 + Math.random() * 10;
  const originalPrice = Math.round(price / (1 - discountPercent / 100));

  return { price, originalPrice };
}

/**
 * Generate review count based on hotel rating and star level
 */
export function generateReviewCount(starRating: number = 3): number {
  // 5-star hotels have more reviews
  const baseReviews: Record<number, [number, number]> = {
    5: [1500, 3500],
    4: [800, 2000],
    3: [400, 1200],
    2: [200, 600],
    1: [50, 200],
  };

  const [min, max] = baseReviews[Math.floor(starRating)] || baseReviews[3];
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Determine badge based on hotel properties and index
 */
export function determineBadge(
  index: number,
  starRating?: number,
  city?: string,
): string | null {
  if (index === 0) return "Flash Sale";
  if (index === 1 && starRating === 5) return "Top Rated";
  if (index === 2) return "Best Value";

  // Random badges for some hotels
  if (Math.random() > 0.8) {
    const badges = ["Limited Time", "Popular", "Recommended", "New"];
    return badges[Math.floor(Math.random() * badges.length)];
  }

  return null;
}

/**
 * Transform hotel data from API response to component format
 */
export function transformHotelData(
  hotels: HotelAPIResponse[],
  destinationCity?: string,
): TransformedHotel[] {
  return hotels.map((hotel, index) => {
    const city = hotel.address?.city || destinationCity || "Vietnam";
    const starRating = hotel.star_rating || 4;

    // Use best_price from database if available, otherwise calculate
    let priceNew: number;
    let priceOld: number | undefined;

    if (hotel.best_price && hotel.best_price > 0) {
      // Convert cents to dollars
      priceNew = Math.round(hotel.best_price / 100);
      // Add 30% markup for "old price" to show discount
      priceOld = Math.round(priceNew * 1.3);
    } else {
      // Fallback to calculated prices
      const { price, originalPrice } = calculateHotelPrice(starRating, city);
      priceNew = price;
      priceOld = originalPrice;
    }

    return {
      id: hotel.id || index + 1,
      slug: hotel.slug,
      name: hotel.name,
      location: city,
      address: hotel.address,
      rating: starRating,
      stars: starRating,
      reviews: generateReviewCount(starRating),
      image: extractHotelImage(hotel.images),
      priceOld,
      priceNew,
      originalPrice: priceOld,
      price: priceNew,
      amenities: Array.isArray(hotel.amenities) ? hotel.amenities : [],
      description: hotel.description,
      badge: determineBadge(index, starRating, city),
    };
  });
}

/**
 * Format price for display
 */
export function formatPrice(cents: number, currency: string = "USD"): string {
  const symbols: Record<string, string> = {
    USD: "$",
    VND: "₫",
    EUR: "€",
    GBP: "£",
  };

  const symbol = symbols[currency] || currency;
  const amount = cents / 100;

  if (currency === "VND") {
    // Vietnamese Dong doesn't use decimals
    return `${amount.toLocaleString("vi-VN")}${symbol}`;
  }

  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Validate hotel data completeness
 */
export function validateHotelData(hotel: HotelAPIResponse): {
  isValid: boolean;
  missingFields: string[];
} {
  const required = ["slug", "name", "address"];
  const missingFields: string[] = [];

  for (const field of required) {
    if (!(field in hotel) || !hotel[field as keyof HotelAPIResponse]) {
      missingFields.push(field);
    }
  }

  // Check if address has city
  if (hotel.address && !hotel.address.city) {
    missingFields.push("address.city");
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}
