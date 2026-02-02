import { NextRequest, NextResponse } from "next/server";
import { serviceService } from "@/lib/beauty";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const venueId = request.nextUrl.searchParams.get("venue_id") ?? undefined;
    const limit = request.nextUrl.searchParams.get("limit")
      ? parseInt(request.nextUrl.searchParams.get("limit")!)
      : 20;
    const services = await serviceService.getFeaturedServices(venueId, limit);
    return NextResponse.json({ success: true, data: services });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch featured services";
    console.error("Error in GET /api/beauty/services/featured:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
