import { NextRequest, NextResponse } from "next/server";
import { appointmentService } from "@/lib/dining";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const appointment = await appointmentService.getAppointmentById(params.id);
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Appointment not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: appointment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch appointment";
    console.error("Error in GET /api/dining/appointments/[id]:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const reason = request.nextUrl.searchParams.get("reason") ?? undefined;
    const success = await appointmentService.cancelAppointment(params.id, reason);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to cancel appointment" },
        { status: 400 },
      );
    }
    return NextResponse.json({ success: true, message: "Appointment cancelled successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to cancel appointment";
    console.error("Error in DELETE /api/dining/appointments/[id]:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

