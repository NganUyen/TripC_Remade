import { NextRequest, NextResponse } from "next/server";
import { reviewsClient } from "@/lib/reviews/supabaseClient";

/**
 * GET /api/partner/hotel/me - Check hotel partner status
 * Uses real `hotels` table with owner_user_id column (added by migration)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_AUTH", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    // First check partner_profiles
    const { data: profile } = await reviewsClient
      .from("partner_profiles")
      .select("*")
      .eq("owner_user_id", userId)
      .eq("partner_type", "hotel")
      .single();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_PARTNER", message: "Not a registered hotel partner" } },
        { status: 404 }
      );
    }

    // Fetch hotel entity
    let hotel = null;
    if (profile.entity_id) {
      const { data } = await reviewsClient
        .from("hotels")
        .select("*")
        .eq("id", profile.entity_id)
        .single();
      hotel = data;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: profile.entity_id || profile.id,
        name: hotel?.name || profile.business_name,
        is_active: hotel?.is_active ?? (profile.status === 'approved'),
        status: profile.status,
        rejection_reason: profile.rejection_reason ?? null,
        role: "owner",
        clerk_user_id: userId,
        hotel,
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: err.message } },
      { status: 500 }
    );
  }
}
