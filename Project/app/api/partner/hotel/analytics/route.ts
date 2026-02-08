/**
 * Detailed Analytics API for Partners
 * GET /api/partner/hotel/analytics?start_date=&end_date=&hotel_id= - Get detailed analytics
 */

import { NextRequest, NextResponse } from "next/server";
import { analyticsQuerySchema } from "@/lib/hotel-partner/validation";
import { getPartnerAnalytics } from "@/lib/hotel-partner/database";

function getPartnerId(req: NextRequest): string {
  const partnerId = req.headers.get("x-partner-id");
  if (!partnerId) {
    throw new Error("Partner ID not found");
  }
  return partnerId;
}

/**
 * GET /api/partner/hotel/analytics
 * Get detailed analytics for date range
 */
export async function GET(req: NextRequest) {
  try {
    const partnerId = getPartnerId(req);
    const { searchParams } = new URL(req.url);

    const queryData = {
      start_date: searchParams.get("start_date"),
      end_date: searchParams.get("end_date"),
      hotel_id: searchParams.get("hotel_id") || undefined,
    };

    // Validate query parameters
    const validation = analyticsQuerySchema.safeParse(queryData);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
            details: validation.error.errors,
          },
        },
        { status: 422 },
      );
    }

    const { start_date, end_date, hotel_id } = validation.data;

    const analytics = await getPartnerAnalytics(
      partnerId,
      start_date,
      end_date,
      hotel_id,
    );

    // Calculate aggregated metrics
    const aggregated = analytics.reduce(
      (acc, row) => ({
        total_bookings: acc.total_bookings + row.total_bookings,
        confirmed_bookings: acc.confirmed_bookings + row.confirmed_bookings,
        cancelled_bookings: acc.cancelled_bookings + row.cancelled_bookings,
        pending_bookings: acc.pending_bookings + row.pending_bookings,
        gross_revenue_cents: acc.gross_revenue_cents + row.gross_revenue_cents,
        net_revenue_cents: acc.net_revenue_cents + row.net_revenue_cents,
        commission_cents: acc.commission_cents + row.commission_cents,
        total_reviews: acc.total_reviews + row.new_reviews,
        days: acc.days + 1,
      }),
      {
        total_bookings: 0,
        confirmed_bookings: 0,
        cancelled_bookings: 0,
        pending_bookings: 0,
        gross_revenue_cents: 0,
        net_revenue_cents: 0,
        commission_cents: 0,
        total_reviews: 0,
        days: 0,
      },
    );

    // Calculate rates and averages
    const metrics = {
      summary: {
        ...aggregated,
        avg_daily_revenue_cents:
          aggregated.days > 0
            ? Math.round(aggregated.gross_revenue_cents / aggregated.days)
            : 0,
        avg_daily_bookings:
          aggregated.days > 0
            ? Math.round((aggregated.total_bookings / aggregated.days) * 10) /
              10
            : 0,
        confirmation_rate:
          aggregated.total_bookings > 0
            ? Math.round(
                (aggregated.confirmed_bookings / aggregated.total_bookings) *
                  100,
              )
            : 0,
        cancellation_rate:
          aggregated.total_bookings > 0
            ? Math.round(
                (aggregated.cancelled_bookings / aggregated.total_bookings) *
                  100,
              )
            : 0,
      },
      daily: analytics,
    };

    return NextResponse.json({
      success: true,
      data: metrics,
      period: {
        start_date,
        end_date,
        days: aggregated.days,
      },
    });
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: error.message || "Failed to fetch analytics",
        },
      },
      { status: 500 },
    );
  }
}
