import { NextRequest, NextResponse } from "next/server";
import { serviceService } from "@/lib/beauty";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const limit = request.nextUrl.searchParams.get("limit")
      ? parseInt(request.nextUrl.searchParams.get("limit")!)
      : 10;
    const services = await serviceService.getTopRatedServices(limit);
    return NextResponse.json({ success: true, data: services });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch top rated services";
    console.error("Error in GET /api/beauty/services/top-rated:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
