/**
 * POST /api/partner/flight/apply
 * Creates a new flight partner application with status = 'pending'.
 * Registers the Clerk user as the owner in flight_partner_users.
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

    // Check if already a flight partner
    const { data: existing } = await supabase
      .from("flight_partner_users")
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
            message: "You already have a flight partner account",
          },
        },
        { status: 409 },
      );
    }

    const body = await req.json();
    const {
      airline_name,
      airline_code,
      email,
      phone,
      website,
      headquarters_country,
      headquarters_city,
      fleet_size,
      description,
      iata_membership_number,
      certificate_urls,
    } = body;

    if (!airline_name?.trim() || !airline_code?.trim() || !email?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "airline_name, airline_code, and email are required",
          },
        },
        { status: 400 },
      );
    }

    // Check if this airline_code is already taken
    const { data: existingAirline } = await supabase
      .from("flight_partners")
      .select("id")
      .eq("airline_code", airline_code.trim().toUpperCase())
      .single();

    if (existingAirline) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_CODE",
            message: `Airline code ${airline_code.toUpperCase()} is already registered`,
          },
        },
        { status: 409 },
      );
    }

    // Create flight_partners row
    const { data: partner, error: partnerErr } = await supabase
      .from("flight_partners")
      .insert({
        name: airline_name.trim(),
        airline_code: airline_code.trim().toUpperCase(),
        email: email.trim(),
        phone: phone?.trim() || null,
        website: website?.trim() || null,
        description: description?.trim() || null,
        headquarters_country: headquarters_country?.trim() || null,
        headquarters_city: headquarters_city?.trim() || null,
        fleet_size: fleet_size || null,
        iata_membership_number: iata_membership_number?.trim() || null,
        certificate_urls: certificate_urls || [],
        status: "pending",
        is_active: false,
        commission_rate: 8,
      })
      .select("id, airline_code, name, is_active, status, rejection_reason")
      .single();

    if (partnerErr || !partner) {
      console.error("Failed to create flight partner:", partnerErr);
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

    // Link the Clerk user as owner in flight_partner_users
    const { error: fpuErr } = await supabase
      .from("flight_partner_users")
      .insert({
        partner_id: partner.id,
        clerk_user_id: userId,
        email: email.trim(),
        role: "owner",
        is_active: true,
      });

    if (fpuErr) {
      console.error("Failed to create flight_partner_users row:", fpuErr);
      // Rollback partner creation
      await supabase.from("flight_partners").delete().eq("id", partner.id);
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
          airline_code: partner.airline_code,
          name: partner.name,
          is_active: partner.is_active,
          status: partner.status,
          rejection_reason: partner.rejection_reason ?? null,
          role: "owner",
        },
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("Flight partner apply error:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: err.message } },
      { status: 500 },
    );
  }
}
