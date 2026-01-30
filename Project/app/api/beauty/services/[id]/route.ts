import { NextRequest, NextResponse } from "next/server";
import { serviceService } from "@/lib/beauty";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const service = await serviceService.getServiceById(params.id);
    if (!service) {
      return NextResponse.json(
        { success: false, error: "Service not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: service });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch service";
    console.error("Error in GET /api/beauty/services/[id]:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
