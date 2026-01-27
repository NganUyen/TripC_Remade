// API Route: GET /api/dining/wishlist - Get user's dining wishlist
// POST /api/dining/wishlist - Add venue to wishlist
// DELETE /api/dining/wishlist/[id] - Remove from wishlist

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/dining/supabaseServerClient";

export async function GET(request: NextRequest) {
  try {
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

    // Get wishlist items with venue details
    const { data, error } = await supabaseServerClient
      .from("dining_wishlist")
      .select(
        `
        *,
        venue:dining_venues(*)
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    console.error("Error in GET /api/dining/wishlist:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch wishlist",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { venue_id } = body;

    if (!venue_id) {
      return NextResponse.json(
        {
          success: false,
          error: "venue_id is required",
        },
        { status: 400 },
      );
    }

    // Check if already in wishlist
    const { data: existing } = await supabaseServerClient
      .from("dining_wishlist")
      .select("id")
      .eq("user_id", userId)
      .eq("venue_id", venue_id)
      .single();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Venue already in wishlist",
        },
        { status: 400 },
      );
    }

    // Add to wishlist
    const { data, error } = await supabaseServerClient
      .from("dining_wishlist")
      .insert({
        user_id: userId,
        venue_id: venue_id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error in POST /api/dining/wishlist:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to add to wishlist",
      },
      { status: 500 },
    );
  }
}
