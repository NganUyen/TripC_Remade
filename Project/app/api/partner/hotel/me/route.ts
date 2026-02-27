/**
 * GET /api/partner/hotel/me
 * Returns the authenticated partner's profile including status and role.
 * Used by useHotelPartnerStore to bootstrap the guard / portal identity.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_AUTH", message: "Unauthorized" },
        },
        { status: 401 },
      );
    }

    const supabase = getSupabase();

    // Resolve partner_id and role for this Clerk user
    const { data: pu, error: puErr } = await supabase
      .from("partner_users")
      .select("partner_id, role")
      .eq("clerk_user_id", userId)
      .eq("is_active", true)
      .single();

    if (puErr || !pu) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_PARTNER",
            message: "Not a registered hotel partner",
          },
        },
        { status: 404 },
      );
    }

    // Fetch the hotel partner record
    const { data: partner, error: partnerErr } = await supabase
      .from("hotel_partners")
      .select("id, name, code, is_active, status, rejection_reason")
      .eq("id", pu.partner_id)
      .single();

    if (partnerErr || !partner) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_PARTNER", message: "Partner record not found" },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: partner.id,
        name: partner.name,
        code: partner.code,
        is_active: partner.is_active,
        status: partner.status ?? "approved",
        rejection_reason: partner.rejection_reason ?? null,
        role: pu.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: err.message } },
      { status: 500 },
    );
  }
}
