// API Route: POST /api/dining/appointments - Create dining_appointment
// GET /api/dining/appointments?user_id=xxx

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { appointmentService } from "@/lib/dining";
import type { CreateDiningAppointmentRequest } from "@/lib/dining/types";

export async function POST(request: NextRequest) {
  try {
    const body: CreateDiningAppointmentRequest = await request.json();
    const user = await currentUser();
    const userId = user?.id || request.headers.get("x-user-id") || "anonymous";

    const { appointment, error } = await appointmentService.createAppointment(body, userId);
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: error || "Failed to create appointment" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data: appointment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create appointment";
    console.error("Error in POST /api/dining/appointments:", error);
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
    const message = error instanceof Error ? error.message : "Failed to fetch appointments";
    console.error("Error in GET /api/dining/appointments:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

