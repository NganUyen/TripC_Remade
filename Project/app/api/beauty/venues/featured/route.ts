import { NextRequest, NextResponse } from "next/server";
import { venueService } from "@/lib/beauty";

export async function GET(request: NextRequest) {
  try {
    const limit = request.nextUrl.searchParams.get("limit")
      ? parseInt(request.nextUrl.searchParams.get("limit")!)
      : 10;
    const venues = await venueService.getFeaturedVenues(limit);
    return NextResponse.json({ success: true, data: venues });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch featured venues";
    console.error("Error in GET /api/beauty/venues/featured:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
