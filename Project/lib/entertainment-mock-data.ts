/**
 * Entertainment Mock Data Loader
 *
 * Loads generated seed data for development/testing when database is not available
 */

import fs from "fs";
import path from "path";

let cachedData: any = null;

export interface MockEntertainmentData {
  categories: any[];
  organizers: any[];
  items: any[];
  sessions: any[];
  ticketTypes: any[];
}

/**
 * Load the generated seed data from JSON file
 */
export function loadMockData(): MockEntertainmentData {
  if (cachedData) {
    return cachedData;
  }

  try {
    const dataPath = path.join(
      process.cwd(),
      "docs",
      "entertainment",
      "generated_seed_data.json",
    );
    const fileContent = fs.readFileSync(dataPath, "utf8");
    cachedData = JSON.parse(fileContent);
    return cachedData;
  } catch (error) {
    console.error("Failed to load mock data:", error);
    return {
      categories: [],
      organizers: [],
      items: [],
      sessions: [],
      ticketTypes: [],
    };
  }
}

/**
 * Get items with filters applied
 */
export function getItemsWithFilters(params: {
  category?: string;
  type?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  limit?: number;
  offset?: number;
}) {
  const data = loadMockData();
  let items = [...data.items];

  // Apply filters
  if (params.category) {
    items = items.filter((item) => {
      const category = data.categories.find((c) => c.id === item.category_id);
      return category?.slug === params.category;
    });
  }

  if (params.type) {
    items = items.filter((item) => item.type === params.type);
  }

  if (params.city) {
    items = items.filter((item) =>
      item.location?.city?.toLowerCase().includes(params.city!.toLowerCase()),
    );
  }

  if (params.minPrice !== undefined) {
    items = items.filter((item) => item.min_price >= params.minPrice!);
  }

  if (params.maxPrice !== undefined) {
    items = items.filter((item) => item.min_price <= params.maxPrice!);
  }

  // Apply sorting
  switch (params.sort) {
    case "popular":
      items.sort((a, b) => b.total_bookings - a.total_bookings);
      break;
    case "price_asc":
      items.sort((a, b) => a.min_price - b.min_price);
      break;
    case "price_desc":
      items.sort((a, b) => b.min_price - a.min_price);
      break;
    case "rating":
      items.sort((a, b) => b.rating_average - a.rating_average);
      break;
    default:
      // Keep original order
      break;
  }

  // Apply pagination
  const offset = params.offset || 0;
  const limit = params.limit || 20;
  const paginatedItems = items.slice(offset, offset + limit);

  return {
    items: paginatedItems,
    total: items.length,
  };
}

/**
 * Get single item by ID with all relationships
 */
export function getItemById(id: string) {
  const data = loadMockData();
  const item = data.items.find((i) => i.id === id);

  if (!item) return null;

  // Get related data
  const category = data.categories.find((c) => c.id === item.category_id);
  const organizer = data.organizers.find((o) => o.id === item.organizer_id);
  const sessions = data.sessions.filter((s) => s.item_id === id);
  const ticket_types = data.ticketTypes.filter((t) => t.item_id === id);

  return {
    ...item,
    category,
    organizer,
    sessions,
    ticket_types,
    urgency_signals: {
      seats_left: sessions[0]?.available_spots || 0,
      bookings_today: Math.floor(Math.random() * 50) + 20,
      trending: item.is_trending,
      last_booked_minutes: Math.floor(Math.random() * 30) + 5,
    },
  };
}

/**
 * Get trending items
 */
export function getTrendingItems(limit: number = 3) {
  const data = loadMockData();
  const trending = data.items
    .filter((item) => item.is_trending || item.is_featured)
    .sort((a, b) => b.total_bookings - a.total_bookings)
    .slice(0, limit);

  return trending;
}

/**
 * Search items
 */
export function searchItems(
  query: string,
  params: {
    type?: string;
    city?: string;
    sort?: string;
    limit?: number;
    offset?: number;
  },
) {
  const data = loadMockData();
  let items = [...data.items];

  // Text search - only filter if query is provided
  if (query && query.trim()) {
    const searchLower = query.toLowerCase();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchLower) ||
        item.subtitle?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower),
    );
  }

  // Apply type filter
  if (params.type) {
    items = items.filter((item) => item.type === params.type);
  }

  // Apply city filter
  if (params.city) {
    items = items.filter((item) =>
      item.location?.city?.toLowerCase().includes(params.city!.toLowerCase()),
    );
  }

  // Apply sorting
  switch (params.sort) {
    case "price_low":
      items.sort((a, b) => a.min_price - b.min_price);
      break;
    case "price_high":
      items.sort((a, b) => b.max_price - a.max_price);
      break;
    case "rating":
      items.sort((a, b) => b.rating_average - a.rating_average);
      break;
    case "popular":
      items.sort((a, b) => b.total_bookings - a.total_bookings);
      break;
    case "relevance":
    default:
      // Relevance: featured first, then by rating and bookings
      items.sort((a, b) => {
        if (a.is_featured !== b.is_featured) {
          return a.is_featured ? -1 : 1;
        }
        if (a.rating_average !== b.rating_average) {
          return b.rating_average - a.rating_average;
        }
        return b.total_bookings - a.total_bookings;
      });
      break;
  }

  // Store total before pagination
  const total = items.length;

  // Pagination
  const offset = params.offset || 0;
  const limit = params.limit || 20;
  const paginatedItems = items.slice(offset, offset + limit);

  return {
    items: paginatedItems,
    total,
  };
}

/**
 * Get all categories
 */
export function getCategories() {
  const data = loadMockData();
  return data.categories;
}

/**
 * Generate mock reviews for an item
 */
export function getReviewsForItem(itemId: string, limit: number = 5) {
  const reviews = [
    {
      id: "1",
      user_name: "Sarah Johnson",
      user_avatar: null,
      rating: 5,
      title: "Amazing experience!",
      comment:
        "Had an incredible time! The atmosphere was perfect and the service was top-notch. Would definitely come back.",
      created_at: new Date(2026, 0, 25).toISOString(),
      helpful_count: 24,
    },
    {
      id: "2",
      user_name: "Michael Chen",
      user_avatar: null,
      rating: 4,
      title: "Great night out",
      comment:
        "Really enjoyed the evening. Music was fantastic and drinks were well-crafted. Only minor issue was the wait time.",
      created_at: new Date(2026, 0, 22).toISOString(),
      helpful_count: 18,
    },
    {
      id: "3",
      user_name: "Emily Rodriguez",
      user_avatar: null,
      rating: 5,
      title: "Best in the city!",
      comment:
        "This place exceeded all expectations. The venue is stunning and the entertainment was world-class.",
      created_at: new Date(2026, 0, 20).toISOString(),
      helpful_count: 31,
    },
    {
      id: "4",
      user_name: "David Kim",
      user_avatar: null,
      rating: 4,
      title: "Solid choice",
      comment:
        "Good overall experience. Staff was friendly and attentive. Would recommend for a special occasion.",
      created_at: new Date(2026, 0, 18).toISOString(),
      helpful_count: 12,
    },
    {
      id: "5",
      user_name: "Jessica Taylor",
      user_avatar: null,
      rating: 5,
      title: "Unforgettable!",
      comment:
        "One of the best nights out I've had! Everything from start to finish was perfect. Can't wait to return.",
      created_at: new Date(2026, 0, 15).toISOString(),
      helpful_count: 27,
    },
  ];

  return {
    reviews: reviews.slice(0, limit),
    total: reviews.length,
    summary: {
      avg: 4.6,
      count: reviews.length,
      distribution: {
        5: 3,
        4: 2,
        3: 0,
        2: 0,
        1: 0,
      },
    },
  };
}
