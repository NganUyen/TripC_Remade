// API Route: GET /api/dining/venues/[id]/available-times
// Query: date=YYYY-MM-DD&guest_count=2

import { NextRequest, NextResponse } from "next/server";
import { appointmentService } from "@/lib/dining";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const date = request.nextUrl.searchParams.get("date");
    const guestCount = parseInt(request.nextUrl.searchParams.get("guest_count") || "2", 10);
    if (!date) {
      return NextResponse.json(
        { success: false, error: "date is required (YYYY-MM-DD)" },
        { status: 400 },
      );
    }

    const result = await appointmentService.getAvailableTimes(params.id, date, guestCount);
    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get available times";
    console.error("Error in GET /api/dining/venues/[id]/available-times:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

