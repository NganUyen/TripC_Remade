/**
 * Search API - Advanced search with filters
 *
 * GET /api/entertainment/search - Search with multiple filters
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { searchItems } from "@/lib/entertainment-mock-data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Search parameters
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type");
    const city = searchParams.get("city");
    const sort = searchParams.get("sort") || "relevance";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Use mock data for now
    const result = searchItems(q, {
      type: type || undefined,
      city: city || undefined,
      sort: sort || undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      items: result.items,
      pagination: {
        total: result.total,
        limit,
        offset,
        hasMore: offset + limit < result.total,
      },
      meta: {
        query: q,
        applied_filters: {
          type: type || undefined,
          city: city || undefined,
          sort: sort || undefined,
        },
      },
    });
  } catch (error: any) {
    console.error("Search GET error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

/* Database version for future implementation - currently not used
async function searchWithDatabase(searchParams: URLSearchParams) {
    const supabase = createServiceSupabaseClient();
    const q = searchParams.get("q") || "";
    const category_id = searchParams.get("category_id");
    const type = searchParams.get("type");
    const min_price = searchParams.get("min_price");
    const max_price = searchParams.get("max_price");
    const city = searchParams.get("city");
    const country = searchParams.get("country");
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");
    const rating_min = searchParams.get("rating_min");
    const is_featured = searchParams.get("is_featured");
    const sort_by = searchParams.get("sort_by") || "relevance";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("entertainment_items")
      .select("*", { count: "exact" })
      .eq("status", "published")
      .eq("available", true);

    // Text search
    if (q) {
      query = query.or(
        `title.ilike.%${q}%,subtitle.ilike.%${q}%,description.ilike.%${q}%`,
      );
    }

    // Type filter
    if (type) {
      query = query.eq("type", type);
    }

    // Category filter
    if (category_id) {
      query = query.eq("category_id", category_id);
    }

    // Price range filter
    if (min_price) {
      query = query.gte("min_price", parseFloat(min_price));
    }
    if (max_price) {
      query = query.lte("max_price", parseFloat(max_price));
    }

    // Location filter (using JSONB)
    if (city) {
      query = query.contains("location", { city });
    }
    if (country) {
      query = query.contains("location", { country });
    }

    // Date range filter
    if (start_date) {
      query = query.gte("start_date", start_date);
    }
    if (end_date) {
      query = query.lte("end_date", end_date);
    }

    // Rating filter
    if (rating_min) {
      query = query.gte("rating_average", parseFloat(rating_min));
    }

    // Featured filter
    if (is_featured === "true") {
      query = query.eq("is_featured", true);
    }

    // Sorting
    switch (sort_by) {
      case "price_low":
        query = query.order("min_price", { ascending: true });
        break;
      case "price_high":
        query = query.order("max_price", { ascending: false });
        break;
      case "rating":
        query = query.order("rating_average", { ascending: false });
        break;
      case "popular":
        query = query.order("total_bookings", { ascending: false });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "relevance":
      default:
        // For relevance, order by multiple factors
        query = query
          .order("is_featured", { ascending: false })
          .order("rating_average", { ascending: false })
          .order("total_bookings", { ascending: false });
        break;
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Search query error:", error);
      return NextResponse.json(
        { error: "Search failed", details: error.message },
        { status: 500 },
      );
    }

    // Get available filters for refinement
    const filters = await getAvailableFilters(supabase, { q, category_id });

    return NextResponse.json({
      data,
      filters,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false,
      },
      meta: {
        query: q,
        applied_filters: {
          type,
          category_id,
          min_price,
          max_price,
          city,
          country,
          rating_min,
          is_featured,
        },
      },
    });
}

async function getAvailableFilters(
  supabase: any,
  currentFilters: { q?: string; category_id?: string | null },
) {
  // This function is for future use with database search
  return null;
}
*/

/* Original getAvailableFilters implementation - for future database search
async function getAvailableFilters(
  supabase: any,
  currentFilters: { q?: string; category_id?: string | null },
) {
  try {
    // Get available categories
    const { data: categories } = await supabase
      .from("entertainment_categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .is("parent_id", null)
      .order("display_order");

    // Get available types
    const { data: types } = await supabase
      .from("entertainment_items")
      .select("type")
      .eq("status", "published")
      .eq("available", true);

    const uniqueTypes = [...new Set(types?.map((t) => t.type))];

    // Get price range
    const { data: priceRange } = await supabase
      .from("entertainment_items")
      .select("min_price, max_price")
      .eq("status", "published")
      .eq("available", true);

    const prices = priceRange
      ?.flatMap((p) => [p.min_price, p.max_price])
      .filter((p) => p !== null);
    const minPrice = prices && prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices && prices.length > 0 ? Math.max(...prices) : 1000;

    return {
      categories: categories || [],
      types: uniqueTypes,
      price_range: {
        min: minPrice,
        max: maxPrice,
      },
      rating_options: [
        { label: "4+ Stars", value: 4 },
        { label: "3+ Stars", value: 3 },
        { label: "2+ Stars", value: 2 },
      ],
    };
  } catch (error) {
    console.error("Failed to get filters:", error);
    return {
      categories: [],
      types: [],
      price_range: { min: 0, max: 1000 },
      rating_options: [],
    };
  }
}
*/
