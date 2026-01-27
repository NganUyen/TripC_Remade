/**
 * User Bookings API Endpoint
 *
 * GET /api/hotels/bookings/my-bookings
 *
 * Retrieve current user's hotel bookings with modification history.
 * Protected endpoint - requires Clerk authentication.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/hotel/supabaseServerClient";
import { verifyClerkAuth } from "@/lib/hotel/clerkAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    let user;
    try {
      user = await verifyClerkAuth();
    } catch (authError) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication required to view bookings",
        },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status"); // Filter by status
    const upcoming = searchParams.get("upcoming") === "true"; // Only upcoming bookings
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    let query = supabaseServerClient
      .from("hotel_bookings")
      .select(
        `
        *,
        hotel:hotels(id, slug, name, address, images, star_rating),
        room:hotel_rooms(id, code, title, bed_type, capacity),
        partner:hotel_partners(id, code, name, logo_url),
        modifications:hotel_booking_modifications(
          id,
          modification_type,
          old_values,
          new_values,
          price_difference_cents,
          status,
          created_at
        )
      `,
        { count: "exact" },
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (upcoming) {
      const today = new Date().toISOString().split("T")[0];
      query = query.gte("check_in_date", today);
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: bookings, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch bookings", message: error.message },
        { status: 500 },
      );
    }

    // Categorize bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const categorized = {
      upcoming:
        bookings?.filter((b) => {
          const checkIn = new Date(b.check_in_date);
          checkIn.setHours(0, 0, 0, 0);
          return (
            checkIn >= today && ["pending", "confirmed"].includes(b.status)
          );
        }) || [],
      past:
        bookings?.filter((b) => {
          const checkOut = new Date(b.check_out_date);
          checkOut.setHours(0, 0, 0, 0);
          return (
            checkOut < today || ["checked_out", "completed"].includes(b.status)
          );
        }) || [],
      cancelled: bookings?.filter((b) => b.status === "cancelled") || [],
      active: bookings?.filter((b) => b.status === "checked_in") || [],
    };

    // Calculate statistics
    const stats = {
      total_bookings: count || 0,
      upcoming_count: categorized.upcoming.length,
      past_count: categorized.past.length,
      cancelled_count: categorized.cancelled.length,
      active_count: categorized.active.length,
      total_spent_cents:
        bookings?.reduce((sum, b) => {
          if (b.status !== "cancelled") {
            return sum + (b.total_cents || 0);
          }
          return sum;
        }, 0) || 0,
      total_tcent_earned:
        bookings?.reduce((sum, b) => {
          if (b.status !== "cancelled") {
            return sum + (b.tcent_earned || 0);
          }
          return sum;
        }, 0) || 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        bookings: bookings || [],
        categorized: categorized,
        stats: stats,
      },
      pagination: {
        total: count || 0,
        limit: limit,
        offset: offset,
        has_more: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error("Bookings fetch error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Internal server error", message: errorMessage },
      { status: 500 },
    );
  }
}
