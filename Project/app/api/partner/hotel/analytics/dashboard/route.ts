/**
 * Analytics API for Partners
 * GET /api/partner/hotel/analytics/dashboard - Get dashboard metrics
 */

import { NextRequest, NextResponse } from "next/server";
import { getDashboardMetrics } from "@/lib/hotel-partner/database";
import { formatCurrency } from "@/lib/hotel-partner/calculations";

function getPartnerId(req: NextRequest): string {
  const partnerId = req.headers.get("x-partner-id");
  if (!partnerId) {
    throw new Error("Partner ID not found");
  }
  return partnerId;
}

/**
 * GET /api/partner/hotel/analytics/dashboard
 * Get dashboard metrics for the last 30 days
 */
export async function GET(req: NextRequest) {
  try {
    const partnerId = getPartnerId(req);

    const metrics = await getDashboardMetrics(partnerId);

    // Format for display
    const formattedMetrics = {
      ...metrics,
      gross_revenue: formatCurrency(metrics.gross_revenue_cents),
      net_revenue: formatCurrency(metrics.net_revenue_cents),
      avg_booking_value: formatCurrency(
        metrics.total_bookings > 0
          ? Math.round(metrics.gross_revenue_cents / metrics.total_bookings)
          : 0,
      ),
      confirmation_rate:
        metrics.total_bookings > 0
          ? Math.round(
              (metrics.confirmed_bookings / metrics.total_bookings) * 100,
            )
          : 0,
      cancellation_rate:
        metrics.total_bookings > 0
          ? Math.round(
              (metrics.cancelled_bookings / metrics.total_bookings) * 100,
            )
          : 0,
    };

    return NextResponse.json({
      success: true,
      data: formattedMetrics,
    });
  } catch (error: any) {
    console.error("Error fetching dashboard metrics:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: error.message || "Failed to fetch dashboard metrics",
        },
      },
      { status: 500 },
    );
  }
}
