/**
 * Entertainment API Hooks
 *
 * Custom hooks for interacting with the Entertainment API.
 * Provides data fetching, caching, and state management for entertainment features.
 */

import { useState, useEffect } from "react";

// ============================================================================
// API Base URL
// ============================================================================

const API_BASE = "/api/entertainment";

// ============================================================================
// Types (matching backend response shapes)
// ============================================================================

export interface Money {
  amount: number;
  currency: string;
}

export interface Location {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  lat?: number;
  lng?: number;
}

export interface EntertainmentItemList {
  id: string;
  title: string;
  subtitle: string | null;
  type: "event" | "venue" | "show" | "tour";
  location: Location | null;
  min_price: number;
  currency: string;
  images: string[];
  rating_average: number;
  rating_count: number;
  is_featured: boolean;
}

export interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: number | Money;
  currency?: string;
  original_price?: number | null;
  max_quantity_per_order?: number;
  total_available?: number | null;
  total_sold?: number;
  benefits?: string[];
  is_active?: boolean;
  display_order?: number;
  // Legacy fields for backwards compatibility
  available_stock?: number;
  max_per_booking?: number;
  features?: string[];
}

export interface Session {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  available_count: number;
  status: "available" | "limited" | "sold_out" | "cancelled";
  is_active: boolean;
}

export interface EntertainmentItemDetail extends EntertainmentItemList {
  description: string;
  metadata?: {
    duration?: string | null;
    features?: string[];
    inclusions?: string[];
    long_description?: string | null;
  };
  ticket_types: TicketType[];

  sessions: Session[];
  addOns?: {
    id: string;
    name: string;
    description: string;
    price: number;
    currency?: string;
  }[];
  reviews_summary?: {
    total: number;
    average_rating: number;
    distribution: Record<number, number>;
  };
  user_interactions?: {
    is_wishlisted: boolean;
    wishlisted_at: string | null;
    has_booked_before: boolean;
    last_booking_status: string | null;
  };
  // Legacy fields for backwards compatibility with mock data
  long_description?: string | null;
  features?: string[];
  inclusions?: string[];
  exclusions?: string[];
  cancellation_policy?: string;
  important_info?: string[];
  aiInsight?: string;
  accessibility?: string[];
  urgency_signals?: {
    seats_left?: number;
    bookings_today?: number;
    trending?: boolean;
    last_booked_minutes?: number;
  };
}

export interface Review {
  id: string;
  user_name: string;
  user_avatar: string | null;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  helpful_count: number;
}

// ============================================================================
// API Functions
// ============================================================================

const entertainmentApi = {
  // Get list of entertainment items
  getItems: async (params?: {
    limit?: number;
    offset?: number;
    type?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    city?: string;
    sort?: "popular" | "price_asc" | "price_desc" | "rating";
  }): Promise<{ items: EntertainmentItemList[]; total: number }> => {
    const query = new URLSearchParams();
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.offset) query.append("offset", String(params.offset));
    if (params?.type) query.append("type", params.type);
    if (params?.category) query.append("category", params.category);
    if (params?.minPrice) query.append("minPrice", String(params.minPrice));
    if (params?.maxPrice) query.append("maxPrice", String(params.maxPrice));
    if (params?.city) query.append("city", params.city);
    if (params?.sort) query.append("sort", params.sort);

    const res = await fetch(`${API_BASE}/items?${query}`);
    if (!res.ok) throw new Error("Failed to fetch entertainment items");
    return res.json();
  },

  // Get single entertainment item details
  getItem: async (id: string): Promise<EntertainmentItemDetail> => {
    const res = await fetch(`${API_BASE}/items/${id}`);
    if (!res.ok) throw new Error("Failed to fetch entertainment item");
    return res.json();
  },

  // Get trending items
  getTrending: async (limit: number = 3): Promise<EntertainmentItemList[]> => {
    const res = await fetch(`${API_BASE}/trending?limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch trending items");
    const data = await res.json();
    return data.items || [];
  },

  // Search entertainment
  search: async (
    query: string,
    params?: {
      limit?: number;
      offset?: number;
      type?: string;
      city?: string;
      sort?: string;
    },
  ): Promise<{ items: EntertainmentItemList[]; total: number }> => {
    const searchParams = new URLSearchParams();
    searchParams.append("q", query);
    if (params?.limit) searchParams.append("limit", String(params.limit));
    if (params?.offset) searchParams.append("offset", String(params.offset));
    if (params?.type) searchParams.append("type", params.type);
    if (params?.city) searchParams.append("city", params.city);
    if (params?.sort) searchParams.append("sort", params.sort);

    const res = await fetch(`${API_BASE}/search?${searchParams}`);
    if (!res.ok) throw new Error("Failed to search entertainment");
    const data = await res.json();
    return {
      items: data.items || [],
      total: data.pagination?.total || 0,
    };
  },

  // Get categories
  getCategories: async (): Promise<
    Array<{ id: string; name: string; slug: string; count: number }>
  > => {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data.categories || [];
  },

  // Get reviews for an item
  getReviews: async (
    itemId: string,
    params?: {
      limit?: number;
      offset?: number;
      sort?: "recent" | "helpful";
    },
  ): Promise<{
    reviews: Review[];
    total: number;
    summary: {
      avg: number;
      count: number;
      distribution: Record<number, number>;
    };
  }> => {
    const query = new URLSearchParams();
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.offset) query.append("offset", String(params.offset));
    if (params?.sort) query.append("sort", params.sort);

    const res = await fetch(`${API_BASE}/items/${itemId}/reviews?${query}`);
    if (!res.ok) throw new Error("Failed to fetch reviews");
    return res.json();
  },
};

// ============================================================================
// React Hooks
// ============================================================================

/**
 * Hook to fetch entertainment items with filters
 */
export function useEntertainmentItems(
  params?: Parameters<typeof entertainmentApi.getItems>[0],
) {
  const [items, setItems] = useState<EntertainmentItemList[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await entertainmentApi.getItems(params);
        setItems(data.items);
        setTotal(data.total);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [JSON.stringify(params)]);

  return { items, total, loading, error };
}

/**
 * Hook to fetch a single entertainment item by ID
 */
export function useEntertainmentItem(id: string) {
  const [item, setItem] = useState<EntertainmentItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchItem = async () => {
      try {
        setLoading(true);
        const data = await entertainmentApi.getItem(id);
        setItem(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  return { item, loading, error };
}

/**
 * Hook to fetch trending entertainment items
 */
export function useTrendingEntertainment(limit: number = 3) {
  const [items, setItems] = useState<EntertainmentItemList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const data = await entertainmentApi.getTrending(limit);
        setItems(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [limit]);

  return { items, loading, error };
}

/**
 * Hook to search entertainment items
 */
export function useEntertainmentSearch(
  query: string,
  params?: Parameters<typeof entertainmentApi.search>[1],
) {
  const [items, setItems] = useState<EntertainmentItemList[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    const searchItems = async () => {
      try {
        setLoading(true);
        const data = await entertainmentApi.search(query, params);
        setItems(data.items);
        setTotal(data.total);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeout = setTimeout(searchItems, 300);
    return () => clearTimeout(timeout);
  }, [query, JSON.stringify(params)]);

  return { items, total, loading, error };
}

/**
 * Hook to fetch reviews for an item
 */
export function useEntertainmentReviews(
  itemId: string,
  params?: Parameters<typeof entertainmentApi.getReviews>[1],
) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<{
    avg: number;
    count: number;
    distribution: Record<number, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!itemId) {
      setLoading(false);
      return;
    }

    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await entertainmentApi.getReviews(itemId, params);
        setReviews(data.reviews);
        setTotal(data.total);
        setSummary(data.summary);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setReviews([]);
        setTotal(0);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [itemId, JSON.stringify(params)]);

  return { reviews, total, summary, loading, error };
}

/**
 * Format price for display
 */
export function formatPrice(price: number | Money, currency?: string): string {
  if (typeof price === "object") {
    return `${price.currency} ${price.amount.toFixed(2)}`;
  }
  return `${currency || "USD"} ${price.toFixed(2)}`;
}
