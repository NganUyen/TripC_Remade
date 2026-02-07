import { NextRequest, NextResponse } from "next/server";
import { venueService } from "@/lib/beauty";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const venue = await venueService.getVenueBySlug(slug);
    if (!venue) {
      return NextResponse.json(
        { success: false, error: "Venue not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: venue });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch venue";
    console.error("Error in GET /api/beauty/venues/slug/[slug]:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
