/**
 * Waitlist Item API - Leave waitlist
 *
 * DELETE /api/entertainment/waitlist/:itemId - Leave waitlist for specific item
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

/**
 * DELETE /api/entertainment/waitlist/:itemId
 * Leave waitlist
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } },
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
    const itemId = params.itemId;

    // Remove from waitlist (soft delete by updating status)
    const { data, error } = await supabase
      .from("entertainment_waitlist")
      .update({ status: "cancelled" })
      .eq("user_id", userId)
      .eq("item_id", itemId)
      .eq("status", "waiting")
      .select();

    if (error) {
      console.error("Waitlist removal error:", error);
      return NextResponse.json(
        { error: "Failed to leave waitlist", details: error.message },
        { status: 500 },
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "You are not on the waitlist for this event" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully left waitlist",
    });
  } catch (error: any) {
    console.error("Waitlist DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
