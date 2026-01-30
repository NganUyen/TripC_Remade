/**
 * Reviews API - User reviews for entertainment items
 *
 * GET /api/entertainment/reviews - Get reviews for an item
 * POST /api/entertainment/reviews - Create new review
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/entertainment/reviews?item_id=xxx
 * Get reviews for an entertainment item
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceSupabaseClient();
    const { searchParams } = new URL(request.url);

    const itemId = searchParams.get("item_id");
    const rating = searchParams.get("rating"); // Filter by rating (1-5)
    const sortBy = searchParams.get("sort") || "recent"; // recent, helpful, rating
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!itemId) {
      return NextResponse.json(
        { error: "Missing required parameter: item_id" },
        { status: 400 },
      );
    }

    let query = supabase
      .from("entertainment_reviews")
      .select("*", { count: "exact" })
      .eq("item_id", itemId)
      .range(offset, offset + limit - 1);

    // Apply filters
    if (rating) {
      query = query.eq("rating", parseInt(rating));
    }

    // Apply sorting
    switch (sortBy) {
      case "helpful":
        query = query.order("helpful_count", { ascending: false });
        break;
      case "rating":
        query = query.order("rating", { ascending: false });
        break;
      case "recent":
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data: reviews, error, count } = await query;

    if (error) {
      console.error("Reviews query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch reviews", details: error.message },
        { status: 500 },
      );
    }

    // Get rating distribution
    const { data: ratingStats } = await supabase
      .from("entertainment_reviews")
      .select("rating")
      .eq("item_id", itemId);

    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      total: ratingStats?.length || 0,
      average: 0,
    };

    if (ratingStats && ratingStats.length > 0) {
      ratingStats.forEach((r: any) => {
        ratingDistribution[r.rating as keyof typeof ratingDistribution] =
          (ratingDistribution[
            r.rating as keyof typeof ratingDistribution
          ] as number) + 1;
      });
      const sum = ratingStats.reduce((acc, r) => acc + r.rating, 0);
      ratingDistribution.average =
        Math.round((sum / ratingStats.length) * 10) / 10;
    }

    return NextResponse.json({
      reviews: reviews || [],
      rating_distribution: ratingDistribution,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false,
      },
    });
  } catch (error: any) {
    console.error("Reviews GET error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

/**
 * POST /api/entertainment/reviews
 * Create new review (requires completed booking)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 },
      );
    }

    const supabase = createServiceSupabaseClient();
    const body = await request.json();

    // Validate required fields
    if (!body.item_id || !body.rating || !body.review_text) {
      return NextResponse.json(
        { error: "Missing required fields: item_id, rating, review_text" },
        { status: 400 },
      );
    }

    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    // Verify user has a completed booking for this item
    const { data: booking } = await supabase
      .from("entertainment_bookings")
      .select("id")
      .eq("user_id", userId)
      .eq("item_id", body.item_id)
      .eq("booking_status", "completed")
      .single();

    if (!booking) {
      return NextResponse.json(
        { error: "You can only review items you have booked and completed" },
        { status: 403 },
      );
    }

    // Check if user already reviewed this item
    const { data: existingReview } = await supabase
      .from("entertainment_reviews")
      .select("id")
      .eq("user_id", userId)
      .eq("item_id", body.item_id)
      .single();

    if (existingReview) {
      return NextResponse.json(
        {
          error:
            "You have already reviewed this item. Use PUT to update your review.",
        },
        { status: 400 },
      );
    }

    // Create review
    const { data: review, error: reviewError } = await supabase
      .from("entertainment_reviews")
      .insert([
        {
          user_id: userId,
          item_id: body.item_id,
          booking_id: booking.id,
          rating: body.rating,
          review_text: body.review_text,
          reviewer_name: body.reviewer_name || "Anonymous",
        },
      ])
      .select()
      .single();

    if (reviewError) {
      console.error("Review creation error:", reviewError);
      return NextResponse.json(
        { error: "Failed to create review", details: reviewError.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        review,
        message: "Review submitted successfully",
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Review POST error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
