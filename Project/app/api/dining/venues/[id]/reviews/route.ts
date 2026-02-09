// API Route: GET /api/dining/venues/[id]/reviews - Get venue reviews
// POST /api/dining/venues/[id]/reviews - Create a review for a venue

import { NextRequest, NextResponse } from "next/server";
import {
  reviewService,
  CreateReviewRequest,
} from "@/lib/dining/services/reviewService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const reviews = await reviewService.getVenueReviews(id, limit, offset);
    const stats = await reviewService.getVenueReviewStats(id);

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        stats,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/dining/venues/[id]/reviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch reviews",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body: CreateReviewRequest = await request.json();

    // Get user ID from headers (implement auth middleware)
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    if (body.venue_id !== id) {
      return NextResponse.json(
        {
          success: false,
          error: "Venue ID mismatch",
        },
        { status: 400 },
      );
    }

    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        {
          success: false,
          error: "Rating must be between 1 and 5",
        },
        { status: 400 },
      );
    }

    const review = await reviewService.createReview(body, userId);

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to create review. You may have already reviewed this venue.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: review,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error in POST /api/dining/venues/[id]/reviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create review",
      },
      { status: 500 },
    );
  }
}
