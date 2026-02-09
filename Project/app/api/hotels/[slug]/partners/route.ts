/**
 * Hotel Partners API Endpoint
 *
 * GET /api/hotels/[slug]/partners
 *
 * Get all booking partners available for a specific hotel.
 * Returns partner details including commission rates and priority.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/hotel/supabaseServerClient";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    // Get hotel
    const { data: hotel, error: hotelError } = await supabaseServerClient
      .from("hotels")
      .select("id, slug, name")
      .eq("slug", slug)
      .single();

    if (hotelError || !hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    // Get all partners for this hotel
    const { data: partnerListings, error: listingsError } =
      await supabaseServerClient
        .from("hotel_partner_listings")
        .select(
          `
        *,
        partner:hotel_partners(
          id,
          code,
          name,
          logo_url,
          website_url,
          commission_rate,
          priority,
          is_active
        )
      `,
        )
        .eq("hotel_id", hotel.id)
        .eq("is_available", true)
        .order("partner_priority", { ascending: true });

    if (listingsError) {
      console.error("Error fetching partners:", listingsError);
      return NextResponse.json(
        { error: "Failed to fetch partners", message: listingsError.message },
        { status: 500 },
      );
    }

    // Extract and format partner information
    const partners =
      partnerListings?.map((listing) => ({
        partner_id: listing.partner.id,
        code: listing.partner.code,
        name: listing.partner.name,
        logo_url: listing.partner.logo_url,
        website_url: listing.partner.website_url,
        external_id: listing.external_hotel_id,
        priority: listing.partner_priority,
        commission_rate: listing.partner.commission_rate,
        is_active: listing.partner.is_active && listing.is_available,
        last_sync: listing.last_sync_at,
      })) || [];

    // Group partners by type
    const grouped = {
      direct: partners.filter((p) => p.code === "DIRECT"),
      aggregators: partners.filter((p) => p.code !== "DIRECT"),
      all: partners,
    };

    return NextResponse.json({
      success: true,
      data: {
        hotel: {
          id: hotel.id,
          slug: hotel.slug,
          name: hotel.name,
        },
        partners: grouped,
        total_partners: partners.length,
      },
    });
  } catch (error) {
    console.error("Partners fetch error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Internal server error", message: errorMessage },
      { status: 500 },
    );
  }
}
