/**
 * Reviews API for Partners
 * GET /api/partner/hotel/reviews - List reviews
 */

import { NextRequest, NextResponse } from "next/server";
import { getPartnerReviews } from "@/lib/hotel-partner/database";

function getPartnerId(req: NextRequest): string {
  const partnerId = req.headers.get("x-partner-id");
  if (!partnerId) {
    throw new Error("Partner ID not found");
  }
  return partnerId;
}

/**
 * GET /api/partner/hotel/reviews
 * Get reviews for partner's hotels
 */
export async function GET(req: NextRequest) {
  try {
    const partnerId = getPartnerId(req);
    const { searchParams } = new URL(req.url);

    const filters = {
      hotel_id: searchParams.get("hotel_id") || undefined,
      has_response: searchParams.get("has_response")
        ? searchParams.get("has_response") === "true"
        : undefined,
      min_rating: searchParams.get("min_rating")
        ? parseInt(searchParams.get("min_rating")!)
        : undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 50,
    };

    const reviews = await getPartnerReviews(partnerId, filters);

    // Calculate statistics
    const stats = reviews.reduce(
      (acc, review) => ({
        total: acc.total + 1,
        with_response: acc.with_response + (review.partner_response ? 1 : 0),
        total_rating: acc.total_rating + review.rating,
      }),
      { total: 0, with_response: 0, total_rating: 0 },
    );

    return NextResponse.json({
      success: true,
      data: reviews,
      meta: {
        count: reviews.length,
        response_rate:
          stats.total > 0
            ? Math.round((stats.with_response / stats.total) * 100)
            : 0,
        avg_rating:
          stats.total > 0
            ? Math.round((stats.total_rating / stats.total) * 10) / 10
            : 0,
      },
    });
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: error.message || "Failed to fetch reviews",
        },
      },
      { status: 500 },
    );
  }
}
