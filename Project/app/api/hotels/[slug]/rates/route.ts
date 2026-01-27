/**
 * Hotel Rates API Endpoint
 *
 * GET /api/hotels/[slug]/rates
 *
 * Fetch available rates for hotel rooms within a date range.
 * Updated to support partner-based pricing.
 * Public endpoint.
 *
 * Query Parameters:
 * - start: Start date (YYYY-MM-DD)
 * - end: End date (YYYY-MM-DD)
 * - room_id: Optional room ID filter
 * - partner_id: Optional partner ID filter
 * - group_by: 'room' | 'partner' | 'both' (default: 'both')
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
    const partnerId = searchParams.get("partner_id");
    const groupBy = searchParams.get("group_by") || "both"; // NEW

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

    // Get hotel ID from slug
    const { data: hotel } = await supabaseServerClient
      .from("hotels")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    // Build query for rates with partner information
    let ratesQuery = supabaseServerClient
      .from("hotel_rates")
      .select(
        `
        *,
        room:hotel_rooms(*),
        partner:hotel_partners(id, code, name, logo_url)
      `,
      )
      .gte("date", startDate)
      .lte("date", endDate)
      .gt("available_rooms", 0)
      .order("date", { ascending: true });

    // Filter by partner if specified
    if (partnerId) {
      ratesQuery = ratesQuery.eq("partner_id", partnerId);
    }

    // Filter by room if specified
    if (roomId) {
      ratesQuery = ratesQuery.eq("room_id", roomId);
    } else {
      // Filter by hotel's rooms
      const { data: hotelRooms } = await supabaseServerClient
        .from("hotel_rooms")
        .select("id")
        .eq("hotel_id", hotel.id);

      if (hotelRooms && hotelRooms.length > 0) {
        const roomIds = hotelRooms.map((r) => r.id);
        ratesQuery = ratesQuery.in("room_id", roomIds);
      }
    }

    const { data: rates, error } = await ratesQuery;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch rates", message: error.message },
        { status: 500 },
      );
    }

    // Group rates based on groupBy parameter
    let groupedRates: any = {};

    if (groupBy === "room") {
      // Group by room only
      rates?.forEach((rate) => {
        const roomId = rate.room_id;
        if (!groupedRates[roomId]) {
          groupedRates[roomId] = {
            room: rate.room,
            rates: [],
          };
        }
        groupedRates[roomId].rates.push(rate);
      });
    } else if (groupBy === "partner") {
      // Group by partner only
      rates?.forEach((rate) => {
        const partnerId = rate.partner_id;
        if (!groupedRates[partnerId]) {
          groupedRates[partnerId] = {
            partner: rate.partner,
            rates: [],
          };
        }
        groupedRates[partnerId].rates.push(rate);
      });
    } else {
      // Group by both room and partner
      rates?.forEach((rate) => {
        const roomId = rate.room_id;
        const partnerId = rate.partner_id;
        const key = `${roomId}_${partnerId}`;

        if (!groupedRates[key]) {
          groupedRates[key] = {
            room: rate.room,
            partner: rate.partner,
            rates: [],
          };
        }
        groupedRates[key].rates.push(rate);
      });
    }

    // Calculate summary statistics
    const summary = {
      total_rates: rates?.length || 0,
      total_combinations: Object.keys(groupedRates).length,
      date_range: {
        start: startDate,
        end: endDate,
      },
      lowest_rate:
        rates && rates.length > 0
          ? Math.min(...rates.map((r) => r.price_cents))
          : null,
      highest_rate:
        rates && rates.length > 0
          ? Math.max(...rates.map((r) => r.price_cents))
          : null,
      // Find best price (lowest) and partner offering it
      best_price:
        rates && rates.length > 0
          ? (() => {
              const sortedByPrice = [...rates].sort(
                (a, b) => a.price_cents - b.price_cents,
              );
              const bestRate = sortedByPrice[0];
              return {
                price_cents: bestRate.price_cents,
                partner: bestRate.partner?.name,
                room: bestRate.room?.title,
              };
            })()
          : null,
    };

    return NextResponse.json({
      success: true,
      data: {
        rates: rates || [],
        grouped_rates: groupedRates,
        summary,
        grouping: groupBy,
      },
    });
  } catch (error) {
    console.error("Rates fetch error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Internal server error", message: errorMessage },
      { status: 500 },
    );
  }
}
