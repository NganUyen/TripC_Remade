/**
 * Booking Management API for Flight Partners
 * GET /api/partner/flight/bookings - List all bookings
 */

import { NextRequest, NextResponse } from "next/server";
import { getPartnerBookings } from "@/lib/flight-partner/database";

function getPartnerId(req: NextRequest): string {
  const partnerId = req.headers.get("x-partner-id");
  if (!partnerId) {
    throw new Error("Partner ID not found");
  }
  return partnerId;
}

/**
 * GET /api/partner/flight/bookings
 * Get all bookings for partner's flights
 */
export async function GET(req: NextRequest) {
  try {
    const partnerId = getPartnerId(req);
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const filters = {
      flight_id: searchParams.get("flight_id") || undefined,
      status: searchParams.get("status") || undefined,
      start_date: searchParams.get("start_date") || undefined,
      end_date: searchParams.get("end_date") || undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 50,
      offset: searchParams.get("offset")
        ? parseInt(searchParams.get("offset")!)
        : 0,
    };

    const bookings = await getPartnerBookings(partnerId, filters);

    // Calculate totals
    const total = bookings.length;
    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + (booking.total_price || 0),
      0,
    );

    return NextResponse.json({
      success: true,
      data: bookings,
      meta: {
        count: bookings.length,
        limit: filters.limit,
        offset: filters.offset,
        total_revenue: totalRevenue,
      },
    });
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: error.message || "Failed to fetch bookings",
        },
      },
      { status: 500 },
    );
  }
}
