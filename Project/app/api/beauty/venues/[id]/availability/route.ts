import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/beauty/services/availabilityService";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const venueId = params.id;
    const date = request.nextUrl.searchParams.get("date");
    const serviceId = request.nextUrl.searchParams.get("service_id") ?? undefined;

    if (!date?.trim()) {
      return NextResponse.json(
        { success: false, error: "Query param 'date' is required (YYYY-MM-DD)" },
        { status: 400 },
      );
    }

    const slots = await getAvailableSlots(venueId, date, { serviceId });
    return NextResponse.json({ success: true, data: { available_slots: slots } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to get availability";
    console.error("Error in GET /api/beauty/venues/[id]/availability:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
