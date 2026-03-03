/**
 * Analytics Dashboard API for Flight Partners
 * GET /api/partner/flight/analytics/dashboard - Get dashboard metrics
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getDashboardMetrics } from "@/lib/flight-partner/database";
import { getDateRange } from "@/lib/flight-partner/calculations";
import {
  resolveFlightPartnerId,
  authErrorStatus,
} from "@/lib/partner/clerkAuth";

/**
 * GET /api/partner/flight/analytics/dashboard
 */
export async function GET(req: NextRequest) {
  try {
    const { airlineCode: partnerId } = await resolveFlightPartnerId();
    const { searchParams } = new URL(req.url);

    const period = searchParams.get("period") || "last_30_days";
    const dateRange = getDateRange(period);

    const metrics = await getDashboardMetrics(partnerId, dateRange);

    return NextResponse.json({
      success: true,
      data: metrics,
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
