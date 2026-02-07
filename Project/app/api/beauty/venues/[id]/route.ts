import { NextRequest, NextResponse } from "next/server";
import { venueService } from "@/lib/beauty";
import type { CreateVenueRequest } from "@/lib/beauty/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const venue = await venueService.getVenueById(id);
    if (!venue) {
      return NextResponse.json(
        { success: false, error: "Venue not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: venue });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch venue";
    console.error("Error in GET /api/beauty/venues/[id]:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const updates: Partial<CreateVenueRequest> = await request.json();
    const venue = await venueService.updateVenue(id, updates);
    if (!venue) {
      return NextResponse.json(
        { success: false, error: "Failed to update venue" },
        { status: 500 },
      );
    }
    return NextResponse.json({ success: true, data: venue });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update venue";
    console.error("Error in PUT /api/beauty/venues/[id]:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const success = await venueService.deleteVenue(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to delete venue" },
        { status: 500 },
      );
    }
    return NextResponse.json({ success: true, message: "Venue deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete venue";
    console.error("Error in DELETE /api/beauty/venues/[id]:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
