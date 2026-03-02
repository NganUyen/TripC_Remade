import { NextRequest, NextResponse } from "next/server";
import { reviewsClient } from "@/lib/reviews/supabaseClient";

/**
 * POST /api/partner/hotel/apply
 * Creates hotel entity in the real `hotels` table + partner_profiles record.
 * Real hotels table columns: id, slug, name, description, address(jsonb),
 * star_rating, images, amenities, policies, contact(jsonb), metadata
 * + new columns added by migration: owner_user_id, email, phone, website,
 *   is_active, is_verified, room_count, property_type, display_name,
 *   business_registration_number, tax_id, certificate_urls
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_AUTH", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    // Check for existing application
    const { data: existing } = await reviewsClient
      .from("partner_profiles")
      .select("id, status")
      .eq("owner_user_id", userId)
      .eq("partner_type", "hotel")
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: "ALREADY_APPLIED", message: `Already registered (status: ${existing.status})` } },
        { status: 409 }
      );
    }

    const body = await request.json();
    const {
      hotel_name, display_name, email, phone, website,
      star_rating, property_type, room_count,
      address_line1, city, country_code, description,
      business_registration_number, tax_id, certificate_urls
    } = body;

    if (!hotel_name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "hotel_name and email are required" } },
        { status: 400 }
      );
    }

    // Generate a URL-safe slug
    const slug = hotel_name.trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();

    // 1. Insert into real `hotels` table using actual schema columns
    const { data: hotel, error: hotelError } = await reviewsClient
      .from("hotels")
      .insert({
        name: hotel_name.trim(),
        slug,
        description: description?.trim() || null,
        address: address_line1 ? { line1: address_line1, city, country_code } : {},
        star_rating: star_rating || 3,
        images: [],
        amenities: [],
        policies: {},
        contact: { email, phone: phone || null, website: website || null },
        metadata: { property_type: property_type || 'Hotel' },
        // New columns added by migration:
        owner_user_id: userId,
        email: email.trim(),
        phone: phone?.trim() || null,
        website: website?.trim() || null,
        is_active: true,
        is_verified: false,
        room_count: room_count || 0,
        property_type: property_type || 'Hotel',
        display_name: display_name?.trim() || hotel_name.trim(),
        business_registration_number: business_registration_number?.trim() || null,
        tax_id: tax_id?.trim() || null,
        certificate_urls: certificate_urls || [],
      })
      .select()
      .single();

    if (hotelError) {
      console.error("Hotel insert error:", hotelError);
      throw new Error(hotelError.message);
    }

    // 2. Create partner profile
    const { data: profile, error: profileError } = await reviewsClient
      .from("partner_profiles")
      .insert({
        owner_user_id: userId,
        partner_type: "hotel",
        status: "approved",
        entity_id: hotel.id,
        business_name: hotel_name.trim(),
        business_email: email.trim(),
        business_phone: phone?.trim() || null,
        tax_id: tax_id?.trim() || null,
        business_registration_number: business_registration_number?.trim() || null,
        metadata: { property_type, star_rating, room_count, country_code }
      })
      .select()
      .single();

    if (profileError) {
      // Rollback hotel creation
      await reviewsClient.from("hotels").delete().eq("id", hotel.id);
      throw new Error(profileError.message);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: hotel.id,
        name: hotel.name,
        is_active: hotel.is_active,
        status: profile.status,
        role: "owner",
      }
    }, { status: 201 });
  } catch (err: any) {
    console.error("Hotel partner apply error:", err);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: err.message } },
      { status: 500 }
    );
  }
}
