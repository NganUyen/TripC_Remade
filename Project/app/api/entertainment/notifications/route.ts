/**
 * Notifications API - User notification management
 *
 * GET /api/entertainment/notifications - Get user notifications
 * PUT /api/entertainment/notifications/:id - Mark notification as read
 * PUT /api/entertainment/notifications/read-all - Mark all as read
 * DELETE /api/entertainment/notifications/:id - Delete notification
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/entertainment/notifications
 * Get user's notifications
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 },
      );
    }

    const supabase = createServiceSupabaseClient();
    const { searchParams } = new URL(request.url);

    const unreadOnly = searchParams.get("unread_only") === "true";
    const type = searchParams.get("type"); // booking_confirmed, price_drop, event_reminder, etc.
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("entertainment_notifications")
      .select(
        `
        *,
        item:entertainment_items(id, title, images),
        booking:entertainment_bookings(id, booking_reference),
        organizer:entertainment_organizers(id, name, logo_url)
      `,
        { count: "exact" },
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.is("read_at", null);
    }

    if (type) {
      query = query.eq("type", type);
    }

    const { data: notifications, error, count } = await query;

    if (error) {
      console.error("Notifications query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch notifications", details: error.message },
        { status: 500 },
      );
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from("entertainment_notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null);

    return NextResponse.json({
      notifications: notifications || [],
      unread_count: unreadCount || 0,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false,
      },
    });
  } catch (error: any) {
    console.error("Notifications GET error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/entertainment/notifications/read-all
 * Mark all notifications as read
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 },
      );
    }

    const supabase = createServiceSupabaseClient();

    // Mark all unread notifications as read
    const { error } = await supabase
      .from("entertainment_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null);

    if (error) {
      console.error("Mark all read error:", error);
      return NextResponse.json(
        {
          error: "Failed to mark notifications as read",
          details: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error: any) {
    console.error("Notifications PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
