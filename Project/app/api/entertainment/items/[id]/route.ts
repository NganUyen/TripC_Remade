/**
 * Entertainment API Routes - Item Detail
 *
 * GET /api/entertainment/items/:id - Get single entertainment item with full details
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";

/**
 * GET /api/entertainment/items/:id
 * Get a single entertainment item by ID with sessions, ticket types, and reviews summary
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createServiceSupabaseClient();
    const { id } = params;

    // Fetch the main item
    const { data: item, error: itemError } = await supabase
      .from("entertainment_items")
      .select("*")
      .eq("id", id)
      .single();

    if (itemError) {
      if (itemError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Entertainment item not found" },
          { status: 404 },
        );
      }
      console.error("Supabase query error:", itemError);
      return NextResponse.json(
        {
          error: "Failed to fetch entertainment item",
          details: itemError.message,
        },
        { status: 500 },
      );
    }

    // Fetch sessions for this item
    const { data: sessions, error: sessionsError } = await supabase
      .from("entertainment_sessions")
      .select("*")
      .eq("item_id", id)
      .order("session_date", { ascending: true });

    if (sessionsError) {
      console.error("Error fetching sessions:", sessionsError);
    }

    // Fetch ticket types for this item
    const { data: ticketTypes, error: ticketTypesError } = await supabase
      .from("entertainment_ticket_types")
      .select("*")
      .eq("item_id", id)
      .order("price", { ascending: true });

    if (ticketTypesError) {
      console.error("Error fetching ticket types:", ticketTypesError);
    }

    // Get reviews summary (average rating, count, distribution)
    const { data: reviews, error: reviewsError } = await supabase
      .from("entertainment_reviews")
      .select("rating")
      .eq("item_id", id);

    let reviews_summary = {
      average_rating: 0,
      total_reviews: 0,
      rating_distribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    };

    if (!reviewsError && reviews && reviews.length > 0) {
      const totalReviews = reviews.length;
      const sumRatings = reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      const avgRating = sumRatings / totalReviews;

      // Calculate rating distribution
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach((review) => {
        const rating = Math.floor(review.rating) as 1 | 2 | 3 | 4 | 5;
        if (rating >= 1 && rating <= 5) {
          distribution[rating]++;
        }
      });

      reviews_summary = {
        average_rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
        total_reviews: totalReviews,
        rating_distribution: distribution,
      };
    }

    // Increment view count
    await supabase
      .from("entertainment_items")
      .update({ total_views: (item.total_views || 0) + 1 })
      .eq("id", id);

    // Build the complete response with all related data
    const itemDetail = {
      ...item,
      sessions: sessions || [],
      ticket_types: ticketTypes || [],
      reviews_summary,
    };

    // Return the item directly (not wrapped in { data })
    return NextResponse.json(itemDetail);
  } catch (error: any) {
    console.error("Entertainment item detail error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
