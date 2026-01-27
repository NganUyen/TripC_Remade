/**
 * Hotel Rooms API Endpoint
 *
 * GET /api/hotels/[slug]/rooms - List rooms for a hotel
 * POST /api/hotels/[slug]/rooms - Create a room (protected)
 *
 * Public endpoint for GET, requires authentication for POST.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/hotel/supabaseServerClient";
import { verifyClerkAuth } from "@/lib/hotel/clerkAuth";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;

    // Get hotel ID from slug
    const { data: hotel } = await supabaseServerClient
      .from("hotels")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    // Fetch rooms
    const { data: rooms, error } = await supabaseServerClient
      .from("hotel_rooms")
      .select("*")
      .eq("hotel_id", hotel.id)
      .eq("status", "active")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch rooms", message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    console.error("Rooms list error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Internal server error", message: errorMessage },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    let user;
    try {
      user = await verifyClerkAuth();
    } catch (authError) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication required to create rooms",
        },
        { status: 401 },
      );
    }

    const { slug } = params;

    // Get hotel ID from slug
    const { data: hotel } = await supabaseServerClient
      .from("hotels")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
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
      code,
      title,
      description,
      capacity,
      bed_type,
      bed_count,
      amenities,
      max_adults,
      max_children,
    } = body;

    // Validate required fields
    if (!code || !title) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message: "code and title are required",
        },
        { status: 400 },
      );
    }

    // Create room
    const { data: room, error } = await supabaseServerClient
      .from("hotel_rooms")
      .insert([
        {
          hotel_id: hotel.id,
          code,
          title,
          description: description || null,
          capacity: capacity || 2,
          bed_type: bed_type || null,
          bed_count: bed_count || 1,
          amenities: amenities || [],
          max_adults: max_adults || 2,
          max_children: max_children || 1,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Room creation error:", error);

      // Check for unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          {
            error: "Duplicate room code",
            message: "A room with this code already exists for this hotel",
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: "Failed to create room", message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: room,
        message: "Room created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Room creation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Internal server error", message: errorMessage },
      { status: 500 },
    );
  }
}
