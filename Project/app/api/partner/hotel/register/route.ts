/**
 * Hotel Partner Registration
 * POST /api/partner/hotel/register
 *
 * Creates a new hotel_partners record + owner partner_users row,
 * linked to the authenticated Clerk user.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { registerHotelPartnerSchema } from "@/lib/hotel-partner/validation";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: NextRequest) {
  try {
    // ── 1. Verify Clerk session ──────────────────────────────
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Not signed in" },
        },
        { status: 401 },
      );
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not found" },
        },
        { status: 401 },
      );
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "BAD_REQUEST", message: "Clerk account has no email" },
        },
        { status: 400 },
      );
    }

    // ── 2. Validate request body ─────────────────────────────
    const body = await req.json();
    const validation = registerHotelPartnerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid registration data",
            details: validation.error.errors,
          },
        },
        { status: 422 },
      );
    }

    const {
      company_name,
      company_code,
      commission_rate,
      owner_full_name,
      owner_phone,
    } = validation.data;

    const supabase = getSupabase();

    // ── 3. Check no duplicate Clerk user or company code ─────
    const [existingUser, existingCode] = await Promise.all([
      supabase
        .from("partner_users")
        .select("id")
        .eq("clerk_user_id", userId)
        .maybeSingle(),
      supabase
        .from("hotel_partners")
        .select("id")
        .eq("code", company_code)
        .maybeSingle(),
    ]);

    if (existingUser.data) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONFLICT",
            message: "You are already registered as a hotel partner",
          },
        },
        { status: 409 },
      );
    }
    if (existingCode.data) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "CONFLICT", message: "Company code is already taken" },
        },
        { status: 409 },
      );
    }

    // ── 4. Create hotel_partners record ──────────────────────
    const { data: partner, error: partnerError } = await supabase
      .from("hotel_partners")
      .insert({
        name: company_name,
        code: company_code,
        commission_rate: commission_rate ?? 0.1,
        is_active: true,
      })
      .select("id")
      .single();

    if (partnerError || !partner) {
      console.error("Failed to create hotel partner:", partnerError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CREATE_ERROR",
            message: "Failed to create partner account",
          },
        },
        { status: 500 },
      );
    }

    // ── 5. Create owner partner_users row ────────────────────
    const { error: userError } = await supabase.from("partner_users").insert({
      partner_id: partner.id,
      clerk_user_id: userId,
      email,
      full_name: owner_full_name,
      phone: owner_phone ?? null,
      role: "owner",
      is_active: true,
      // password_hash is NOT NULL in the schema; set a sentinel since Clerk manages auth
      password_hash: "CLERK_MANAGED",
    });

    if (userError) {
      // Roll back the partner record to keep things consistent
      await supabase.from("hotel_partners").delete().eq("id", partner.id);
      console.error("Failed to create partner user:", userError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CREATE_ERROR",
            message: "Failed to create partner user",
          },
        },
        { status: 500 },
      );
    }

    // ── 6. Success ───────────────────────────────────────────
    return NextResponse.json(
      {
        success: true,
        data: {
          partner_id: partner.id,
          company_name,
          company_code,
          message: "Hotel partner account created successfully",
        },
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("Hotel partner registration error:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: err.message } },
      { status: 500 },
    );
  }
}
