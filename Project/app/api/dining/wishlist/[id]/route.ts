// API Route: DELETE /api/dining/wishlist/[id] - Remove from wishlist

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/dining/supabaseServerClient";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
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

    const { error } = await supabaseServerClient
      .from("dining_wishlist")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/dining/wishlist/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to remove from wishlist",
      },
      { status: 500 },
    );
  }
}
