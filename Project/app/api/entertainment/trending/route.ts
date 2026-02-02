/**
 * Trending API - Get trending entertainment items
 *
 * GET /api/entertainment/trending - List trending items
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { getTrendingItems } from "@/lib/entertainment-mock-data";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 20);
    const category_id = searchParams.get("category_id");

    const supabase = createServiceSupabaseClient();

    // Get trending items directly from database
    let query = supabase
      .from("entertainment_items")
      .select("*")
      .eq("status", "published")
      .eq("available", true)
      .eq("is_trending", true)
      .order("total_bookings", { ascending: false })
      .order("rating_average", { ascending: false })
      .limit(limit);

    if (category_id) {
      query = query.eq("category_id", category_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Trending query error:", error);
      // Fallback to mock data if database fails
      const items = getTrendingItems(limit);
      return NextResponse.json({ items });
    }

    // Calculate trending score for better sorting
    const itemsWithScore = (data || [])
      .map((item) => ({
        ...item,
        trending_score:
          (item.total_views || 0) * 0.3 +
          (item.total_bookings || 0) * 0.5 +
          (item.total_wishlist || 0) * 0.2,
      }))
      .sort((a, b) => b.trending_score - a.trending_score);

    return NextResponse.json({
      items: itemsWithScore,
      meta: {
        calculated_at: new Date().toISOString(),
        criteria: {
          is_trending: true,
          score_formula: "views*0.3 + bookings*0.5 + wishlist*0.2",
        },
      },
    });
  } catch (error: any) {
    console.error("Trending GET error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
