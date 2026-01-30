import { NextRequest, NextResponse } from "next/server";
import { venueService } from "@/lib/beauty";
import type { CreateVenueRequest, VenueSearchParams } from "@/lib/beauty/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params: VenueSearchParams = {
      city: searchParams.get("city") ?? undefined,
      district: searchParams.get("district") ?? undefined,
      categories: searchParams.get("categories")?.split(",") ?? undefined,
      price_range: searchParams.get("price_range") ?? undefined,
      min_rating: searchParams.get("min_rating")
        ? parseFloat(searchParams.get("min_rating")!)
        : undefined,
      is_featured: searchParams.get("is_featured") === "true" ? true : undefined,
      search: searchParams.get("search") ?? undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20,
      offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0,
    };

    const result = await venueService.searchVenues(params);
    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch venues";
    console.error("Error in GET /api/beauty/venues:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateVenueRequest = await request.json();
    const userId = request.headers.get("x-user-id") ?? undefined;

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Venue name is required" },
        { status: 400 },
      );
    }

    const venue = await venueService.createVenue(body, userId);
    if (!venue) {
      return NextResponse.json(
        { success: false, error: "Failed to create venue" },
        { status: 500 },
      );
    }
    return NextResponse.json({ success: true, data: venue });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create venue";
    console.error("Error in POST /api/beauty/venues:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
