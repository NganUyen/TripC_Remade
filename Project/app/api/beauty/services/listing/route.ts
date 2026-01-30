import { NextRequest, NextResponse } from "next/server";
import { serviceService } from "@/lib/beauty";

export async function GET(request: NextRequest) {
  try {
    const limit = request.nextUrl.searchParams.get("limit")
      ? parseInt(request.nextUrl.searchParams.get("limit")!)
      : 20;
    const services = await serviceService.getServicesListing(limit);
    return NextResponse.json({ success: true, data: services });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch services listing";
    console.error("Error in GET /api/beauty/services/listing:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
