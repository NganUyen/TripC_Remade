import { NextRequest, NextResponse } from "next/server";
import { appointmentService } from "@/lib/beauty";
import { validateCreateAppointment } from "@/lib/beauty/bookingLogic";
import { isSlotAvailable } from "@/lib/beauty/services/availabilityService";
import type { CreateAppointmentRequest } from "@/lib/beauty/types";

export async function POST(request: NextRequest) {
  try {
    const body: CreateAppointmentRequest = await request.json();
    const userId = request.headers.get("x-user-id") ?? "anonymous";

    const validation = await validateCreateAppointment(body);
    if (!validation.ok) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 },
      );
    }

    const { durationMinutes } = validation;
    const available = await isSlotAvailable(
      body.venue_id,
      body.appointment_date,
      body.appointment_time,
      durationMinutes,
    );
    if (!available) {
      return NextResponse.json(
        { success: false, error: "Slot not available (already booked or outside operating hours)" },
        { status: 409 },
      );
    }

    const appointment = await appointmentService.createAppointment(
      { ...body, duration_minutes: durationMinutes },
      userId,
    );
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: "Failed to create appointment" },
        { status: 500 },
      );
    }
    return NextResponse.json({ success: true, data: appointment });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create appointment";
    console.error("Error in POST /api/beauty/appointments:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("user_id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "user_id is required" },
        { status: 400 },
      );
    }
    const appointments = await appointmentService.getUserAppointments(userId);
    return NextResponse.json({ success: true, data: appointments });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch appointments";
    console.error("Error in GET /api/beauty/appointments:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
