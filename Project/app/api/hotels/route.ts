/**
 * Hotels API Endpoint
 *
 * GET /api/hotels - List hotels
 * POST /api/hotels - Create a hotel (protected)
 *
 * Supports filtering by query string, city, and pagination.
 * Public endpoint for GET, requires authentication for POST.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/hotel/supabaseServerClient";
import { verifyClerkAuth } from "@/lib/hotel/clerkAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract query parameters
    const q = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";
    const minRating = searchParams.get("min_rating");
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get("limit") || "20")),
      100,
    );
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0"));

    // Build query
    let query = supabaseServerClient
      .from("hotels")
      .select("*", { count: "exact" })
      .eq("status", "active")
      .order("created_at", { ascending: false });

    // Apply filters
    if (q) {
      query = query.ilike("name", `%${q}%`);
    }

    if (city) {
      query = query.ilike("address->>city", `%${city}%`);
    }

    if (minRating) {
      const rating = parseInt(minRating);
      if (!isNaN(rating)) {
        query = query.gte("star_rating", rating);
      }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: hotels, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch hotels", message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: hotels,
      pagination: {
        total: count || 0,
        limit,
        offset,
        returned: hotels?.length || 0,
      },
    });
  } catch (error) {
    console.error("Hotels list error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Internal server error", message: errorMessage },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    let user;
    try {
      user = await verifyClerkAuth();
    } catch (authError) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication required to create hotels",
        },
        { status: 401 },
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON", message: "Request body must be valid JSON" },
        { status: 400 },
      );
    }

    const {
      name,
      slug,
      description,
      address,
      star_rating,
      amenities,
      policies,
    } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message: "name and slug are required",
        },
        { status: 400 },
      );
    }

    // Validate star rating
    if (star_rating !== undefined && (star_rating < 0 || star_rating > 5)) {
      return NextResponse.json(
        {
          error: "Invalid star rating",
          message: "Star rating must be between 0 and 5",
        },
        { status: 400 },
      );
    }

    // Create hotel
    const { data: hotel, error } = await supabaseServerClient
      .from("hotels")
      .insert([
        {
          name,
          slug,
          description: description || null,
          address: address || {},
          star_rating: star_rating || null,
          amenities: amenities || [],
          policies: policies || {},
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Hotel creation error:", error);

      // Check for unique constraint violation (slug already exists)
      if (error.code === "23505") {
        return NextResponse.json(
          {
            error: "Duplicate slug",
            message: "A hotel with this slug already exists",
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: "Failed to create hotel", message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: hotel,
        message: "Hotel created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Hotel creation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Internal server error", message: errorMessage },
      { status: 500 },
    );
  }
}
