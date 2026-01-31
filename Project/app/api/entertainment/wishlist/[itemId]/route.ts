/**
 * Wishlist Item API - Remove specific item from wishlist
 *
 * DELETE /api/entertainment/wishlist/:itemId - Remove item from wishlist
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

/**
 * DELETE /api/entertainment/wishlist/:itemId
 * Remove item from wishlist
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
    const { itemId } = params;

    // Delete from wishlist
    const { error } = await supabase
      .from("entertainment_wishlist")
      .delete()
      .eq("user_id", userId)
      .eq("item_id", itemId);

    if (error) {
      console.error("Wishlist delete error:", error);
      return NextResponse.json(
        { error: "Failed to remove from wishlist", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Item removed from wishlist" });
  } catch (error: any) {
    console.error("Wishlist DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
