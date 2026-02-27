/**
 * POST /api/partner/hotel/apply
 * Creates a new hotel partner application with status = 'pending'.
 * Registers the Clerk user as the owner in partner_users.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: NextRequest) {
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

    // Check if already a hotel partner
    const { data: existing } = await supabase
      .from("partner_users")
      .select("partner_id")
      .eq("clerk_user_id", userId)
      .eq("is_active", true)
      .single();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ALREADY_PARTNER",
            message: "You already have a hotel partner account",
          },
        },
        { status: 409 },
      );
    }

    const body = await req.json();
    const {
      hotel_name,
      display_name,
      email,
      phone,
      website,
      star_rating,
      property_type,
      room_count,
      address_line1,
      city,
      country_code,
      description,
      business_registration_number,
      tax_id,
      certificate_urls,
    } = body;

    if (!hotel_name?.trim() || !email?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "hotel_name and email are required",
          },
        },
        { status: 400 },
      );
    }

    // Create hotel_partners row
    const { data: partner, error: partnerErr } = await supabase
      .from("hotel_partners")
      .insert({
        name: hotel_name.trim(),
        code: display_name?.trim() || hotel_name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        website: website?.trim() || null,
        description: description?.trim() || null,
        star_rating: star_rating || null,
        property_type: property_type || null,
        room_count: room_count || null,
        address: address_line1
          ? { line1: address_line1, city, country_code }
          : null,
        business_registration_number:
          business_registration_number?.trim() || null,
        tax_id: tax_id?.trim() || null,
        certificate_urls: certificate_urls || [],
        status: "pending",
        is_active: false,
      })
      .select("id, name, code, is_active, status, rejection_reason")
      .single();

    if (partnerErr || !partner) {
      console.error("Failed to create hotel partner:", partnerErr);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DB_ERROR",
            message: "Failed to create partner record",
          },
        },
        { status: 500 },
      );
    }

    // Link the Clerk user as owner in partner_users
    const { error: puErr } = await supabase.from("partner_users").insert({
      partner_id: partner.id,
      clerk_user_id: userId,
      role: "owner",
      is_active: true,
    });

    if (puErr) {
      console.error("Failed to create partner_users row:", puErr);
      // Rollback partner creation
      await supabase.from("hotel_partners").delete().eq("id", partner.id);
      return NextResponse.json(
        {
          success: false,
          error: { code: "DB_ERROR", message: "Failed to link user account" },
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: partner.id,
          name: partner.name,
          code: partner.code,
          is_active: partner.is_active,
          status: partner.status,
          rejection_reason: partner.rejection_reason ?? null,
          role: "owner",
        },
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("Hotel partner apply error:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: err.message } },
      { status: 500 },
    );
  }
}
