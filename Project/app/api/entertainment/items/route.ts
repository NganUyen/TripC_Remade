/**
 * Entertainment Items v2 API - Enhanced item listing with full relationships
 *
 * GET /api/entertainment/items - List items with enhanced data
 * GET /api/entertainment/items/:id - Get single item with all relationships
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";
import { getItemsWithFilters } from "@/lib/entertainment-mock-data";

export const dynamic = 'force-dynamic';

/**
 * GET /api/entertainment/items
 * List entertainment items with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const city = searchParams.get("city");
    const featured = searchParams.get("featured"); // New: filter by featured
    const minPrice = searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice")!)
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice")!)
      : undefined;
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const sort = searchParams.get("sort") || "created_at";

    const supabase = createServiceSupabaseClient();

    // Build query
    let query = supabase
      .from("entertainment_items")
      .select("*", { count: "exact" })
      .eq("status", "published")
      .eq("available", true)
      .range(offset, offset + limit - 1);

    // Apply filters
    if (category) {
      query = query.eq("category_id", category);
    }
    if (type) {
      query = query.eq("type", type);
    }
    if (city) {
      // Search in location jsonb field
      query = query.contains("location", { city });
    }
    if (featured === "true") {
      query = query.eq("is_featured", true);
    }
    if (minPrice !== undefined) {
      query = query.gte("min_price", minPrice);
    }
    if (maxPrice !== undefined) {
      query = query.lte("max_price", maxPrice);
    }

    // Apply sorting
    switch (sort) {
      case "rating":
        query = query
          .order("rating_average", { ascending: false, nullsFirst: false })
          .order("rating_count", { ascending: false });
        break;
      case "popular":
        query = query
          .order("total_bookings", { ascending: false })
          .order("total_views", { ascending: false });
        break;
      case "price_low":
        query = query.order("min_price", {
          ascending: true,
          nullsFirst: false,
        });
        break;
      case "price_high":
        query = query.order("max_price", {
          ascending: false,
          nullsFirst: false,
        });
        break;
      case "trending":
        // For trending, prioritize is_trending flag then bookings
        query = query
          .order("is_trending", { ascending: false })
          .order("total_bookings", { ascending: false });
        break;
      case "created_at":
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data: items, error, count } = await query;

    if (error) {
      console.error("Items query error:", error);
      // Fallback to mock data
      const result = getItemsWithFilters({
        category: category || undefined,
        type: type || undefined,
        city: city || undefined,
        minPrice,
        maxPrice,
        sort,
        limit,
        offset,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({
      items: items || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false,
      },
      meta: {
        filters: { category, type, city, featured, minPrice, maxPrice },
        sort,
      },
    });
  } catch (error: any) {
    console.error("Items GET error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
