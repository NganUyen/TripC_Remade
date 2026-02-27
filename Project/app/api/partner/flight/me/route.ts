/**
 * GET /api/partner/flight/me
 * Returns the authenticated flight partner's identity including status and role.
 * Used by useFlightPartnerStore to bootstrap the guard / portal identity.
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

    // Resolve flight partner and role for this Clerk user
    const { data: fpu, error: fpuErr } = await supabase
      .from("flight_partner_users")
      .select(
        "partner_id, role, flight_partners!inner(id, airline_code, name, is_active, status, rejection_reason)",
      )
      .eq("clerk_user_id", userId)
      .eq("is_active", true)
      .single();

    if (fpuErr || !fpu) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_PARTNER",
            message: "Not a registered flight partner",
          },
        },
        { status: 404 },
      );
    }

    const fp = fpu.flight_partners as unknown as {
      id: string;
      airline_code: string;
      name: string;
      is_active: boolean;
      status?: string;
      rejection_reason?: string | null;
    };

    return NextResponse.json({
      success: true,
      data: {
        id: fp.id,
        airline_code: fp.airline_code,
        name: fp.name,
        is_active: fp.is_active,
        status: fp.status ?? "approved",
        rejection_reason: fp.rejection_reason ?? null,
        role: fpu.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: err.message } },
      { status: 500 },
    );
  }
}
