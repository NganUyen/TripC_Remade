/**
 * Hotel Price Comparison API Endpoint
 *
 * GET /api/hotels/[slug]/compare-prices
 *
 * Compare prices across all partner platforms for a hotel.
 * Public endpoint - no authentication required.
 *
 * Query Parameters:
 * - start: Start date (YYYY-MM-DD)
 * - end: End date (YYYY-MM-DD)
 * - room_id: Optional room ID filter
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/hotel/supabaseServerClient";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    const searchParams = request.nextUrl.searchParams;

    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");
    const roomId = searchParams.get("room_id");

    // Validate date parameters
    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          error: "Missing date parameters",
          message: "start and end dates are required (YYYY-MM-DD format)",
        },
        { status: 400 },
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json(
        {
          error: "Invalid date format",
          message: "Dates must be in YYYY-MM-DD format",
        },
        { status: 400 },
      );
    }

    // Validate date range
    if (new Date(endDate) <= new Date(startDate)) {
      return NextResponse.json(
        {
          error: "Invalid date range",
          message: "End date must be after start date",
        },
        { status: 400 },
      );
    }

    // Get hotel
    const { data: hotel } = await supabaseServerClient
      .from("hotels")
      .select("id, slug, name")
      .eq("slug", slug)
      .single();

    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    // Get hotel rooms
    const { data: rooms } = await supabaseServerClient
      .from("hotel_rooms")
      .select("id, code, title, capacity, bed_type")
      .eq("hotel_id", hotel.id)
      .eq("status", "active");

    if (!rooms || rooms.length === 0) {
      return NextResponse.json(
        { error: "No rooms available" },
        { status: 404 },
      );
    }

    const roomIds = roomId ? [roomId] : rooms.map((r) => r.id);

    // Get rates from all partners for date range
    const { data: rates } = await supabaseServerClient
      .from("hotel_rates")
      .select(
        `
        *,
        room:hotel_rooms(id, code, title),
        partner:hotel_partners(id, code, name, logo_url)
      `,
      )
      .in("room_id", roomIds)
      .gte("date", startDate)
      .lte("date", endDate)
      .gt("available_rooms", 0)
      .order("date", { ascending: true });

    if (!rates || rates.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          hotel: hotel,
          rooms: rooms,
          price_comparison: [],
          message: "No rates available for the selected dates",
        },
      });
    }

    // Calculate nights
    const nights = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    // Group rates by room and partner
    interface PartnerPrice {
      partner: any;
      total_cents: number;
      nightly_average_cents: number;
      original_total_cents: number;
      discount_percentage: number;
      total_savings_cents: number;
      is_best_price: boolean;
      breakfast_included: boolean;
      refundable: boolean;
      tcent_earn_rate: number;
      estimated_tcent_earned: number;
      available: boolean;
      rate_details: any[];
    }

    interface RoomComparison {
      room: any;
      partners: PartnerPrice[];
      best_partner: any;
      price_range: {
        min_cents: number;
        max_cents: number;
        savings_potential_cents: number;
      };
    }

    const comparison: RoomComparison[] = [];

    for (const room of rooms) {
      const roomRates = rates.filter((r) => r.room_id === room.id);

      // Group by partner
      const partnerGroups = new Map<string, any[]>();
      roomRates.forEach((rate) => {
        const partnerId = rate.partner?.id || "unknown";
        if (!partnerGroups.has(partnerId)) {
          partnerGroups.set(partnerId, []);
        }
        partnerGroups.get(partnerId)!.push(rate);
      });

      const partnerPrices: PartnerPrice[] = [];

      partnerGroups.forEach((partnerRates, partnerId) => {
        // Check if we have rates for all nights
        if (partnerRates.length !== nights) {
          // Not all nights available from this partner
          return;
        }

        const totalCents = partnerRates.reduce(
          (sum, r) => sum + r.price_cents,
          0,
        );
        const originalTotalCents = partnerRates.reduce(
          (sum, r) => sum + (r.original_price_cents || r.price_cents),
          0,
        );
        const totalSavings = originalTotalCents - totalCents;
        const avgDiscount =
          partnerRates.reduce(
            (sum, r) => sum + (r.discount_percentage || 0),
            0,
          ) / partnerRates.length;

        const partner = partnerRates[0].partner;
        const tcentEarnRate = partnerRates[0].tcent_earn_rate || 0.05;
        const estimatedTcent = Math.floor(totalCents * tcentEarnRate);

        partnerPrices.push({
          partner: partner,
          total_cents: totalCents,
          nightly_average_cents: Math.round(totalCents / nights),
          original_total_cents: originalTotalCents,
          discount_percentage: avgDiscount,
          total_savings_cents: totalSavings,
          is_best_price: partnerRates.some((r) => r.is_best_price),
          breakfast_included: partnerRates.every((r) => r.breakfast_included),
          refundable: partnerRates.every((r) => r.refundable),
          tcent_earn_rate: tcentEarnRate,
          estimated_tcent_earned: estimatedTcent,
          available: true,
          rate_details: partnerRates,
        });
      });

      if (partnerPrices.length > 0) {
        // Sort by total price
        partnerPrices.sort((a, b) => a.total_cents - b.total_cents);

        const minPrice = Math.min(...partnerPrices.map((p) => p.total_cents));
        const maxPrice = Math.max(...partnerPrices.map((p) => p.total_cents));

        comparison.push({
          room: room,
          partners: partnerPrices,
          best_partner: partnerPrices[0].partner,
          price_range: {
            min_cents: minPrice,
            max_cents: maxPrice,
            savings_potential_cents: maxPrice - minPrice,
          },
        });
      }
    }

    // Overall best price
    let overallBestPrice = Infinity;
    let overallBestRoom = null;
    let overallBestPartner = null;

    comparison.forEach((comp) => {
      if (comp.partners.length > 0) {
        const bestPrice = comp.partners[0].total_cents;
        if (bestPrice < overallBestPrice) {
          overallBestPrice = bestPrice;
          overallBestRoom = comp.room;
          overallBestPartner = comp.partners[0].partner;
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        hotel: hotel,
        search: {
          check_in: startDate,
          check_out: endDate,
          nights: nights,
        },
        price_comparison: comparison,
        summary: {
          rooms_available: comparison.length,
          partners_compared: partnerGroups.size,
          best_overall_price_cents:
            overallBestPrice !== Infinity ? overallBestPrice : null,
          best_overall_room: overallBestRoom,
          best_overall_partner: overallBestPartner,
        },
      },
    });
  } catch (error) {
    console.error("Price comparison error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Internal server error", message: errorMessage },
      { status: 500 },
    );
  }
}
