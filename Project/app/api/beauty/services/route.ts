import { NextRequest, NextResponse } from "next/server";
import { serviceService } from "@/lib/beauty";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const venueId = request.nextUrl.searchParams.get("venue_id");
    if (!venueId) {
      return NextResponse.json(
        { success: false, error: "venue_id is required" },
        { status: 400 },
      );
    }
    const services = await serviceService.getVenueServices(venueId);
    return NextResponse.json({ success: true, data: services });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch services";
    console.error("Error in GET /api/beauty/services:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
