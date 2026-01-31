/**
 * Individual Notification API - Single notification operations
 *
 * PUT /api/entertainment/notifications/:id - Mark notification as read
 * DELETE /api/entertainment/notifications/:id - Delete notification
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

/**
 * PUT /api/entertainment/notifications/:id
 * Mark notification as read
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 },
      );
    }

    const supabase = createServiceSupabaseClient();
    const notificationId = params.id;

    // Update notification
    const { data, error } = await supabase
      .from("entertainment_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Notification not found or access denied" },
          { status: 404 },
        );
      }
      console.error("Notification update error:", error);
      return NextResponse.json(
        { error: "Failed to update notification", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      notification: data,
    });
  } catch (error: any) {
    console.error("Notification PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/entertainment/notifications/:id
 * Delete notification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 },
      );
    }

    const supabase = createServiceSupabaseClient();
    const notificationId = params.id;

    // Delete notification
    const { data, error } = await supabase
      .from("entertainment_notifications")
      .delete()
      .eq("id", notificationId)
      .eq("user_id", userId)
      .select();

    if (error) {
      console.error("Notification delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete notification", details: error.message },
        { status: 500 },
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Notification not found or access denied" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error: any) {
    console.error("Notification DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
