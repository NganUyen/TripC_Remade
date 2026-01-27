/**
 * Hotel Details API Endpoint
 *
 * GET /api/hotels/[slug]
 *
 * Retrieve details of a specific hotel including rooms.
 * Public endpoint - no authentication required.
 *
 * @param slug - Hotel slug
 * @returns {JSON} Hotel details with rooms
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/hotel/supabaseServerClient";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: "Missing hotel slug" },
        { status: 400 },
      );
    }

    // Fetch hotel with rooms
    const { data: hotel, error: hotelError } = await supabaseServerClient
      .from("hotels")
      .select(
        `
        *,
        rooms:hotel_rooms(*)
      `,
      )
      .eq("slug", slug)
      .eq("status", "active")
      .single();

    if (hotelError || !hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    // Fetch recent reviews
    const { data: reviews } = await supabaseServerClient
      .from("hotel_reviews")
      .select("*")
      .eq("hotel_id", hotel.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(10);

    // Calculate average rating
    const avgRating =
      reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length
        : null;

    return NextResponse.json({
      success: true,
      data: {
        ...hotel,
        reviews: {
          items: reviews || [],
          count: reviews?.length || 0,
          average_rating: avgRating,
        },
      },
    });
  } catch (error) {
    console.error("Hotel details error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Internal server error", message: errorMessage },
      { status: 500 },
    );
  }
}
