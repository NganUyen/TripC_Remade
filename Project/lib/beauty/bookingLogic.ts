/**
 * Beauty booking business logic: validation and cancellation policy.
 */

import { venueService } from "./services/venueService";
import { serviceService } from "./services/serviceService";
import type { CreateAppointmentRequest, BeautyAppointment } from "./types";

const CANCELLATION_HOURS_AHEAD = 24;

function parseDate(s: string): Date | null {
  const d = new Date(s + "T12:00:00Z");
  return isNaN(d.getTime()) ? null : d;
}

function parseTime(s: string): { h: number; m: number } | null {
  const match = String(s).trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return { h, m };
}

/** Validate create-appointment input and resolve duration. Returns error message or { ok, durationMinutes }. */
export async function validateCreateAppointment(
  data: CreateAppointmentRequest
): Promise<
  | { ok: true; durationMinutes: number }
  | { ok: false; error: string }
> {
  if (!data.venue_id?.trim()) return { ok: false, error: "venue_id is required" };
  if (!data.appointment_date?.trim()) return { ok: false, error: "appointment_date is required" };
  if (!data.appointment_time?.trim()) return { ok: false, error: "appointment_time is required" };
  if (!data.guest_name?.trim()) return { ok: false, error: "guest_name is required" };

  const venue = await venueService.getVenueById(data.venue_id);
  if (!venue) return { ok: false, error: "Venue not found" };

  let durationMinutes = data.duration_minutes ?? 60;
  if (data.service_id) {
    const service = await serviceService.getServiceById(data.service_id);
    if (!service) return { ok: false, error: "Service not found" };
    if (service.venue_id !== data.venue_id) return { ok: false, error: "Service does not belong to this venue" };
    durationMinutes = service.duration_minutes;
  }

  const date = parseDate(data.appointment_date);
  if (!date) return { ok: false, error: "Invalid appointment_date (use YYYY-MM-DD)" };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return { ok: false, error: "Appointment date cannot be in the past" };

  const time = parseTime(data.appointment_time);
  if (!time) return { ok: false, error: "Invalid appointment_time (use HH:mm)" };

  return { ok: true, durationMinutes };
}

/** Whether the appointment can be cancelled (status + at least CANCELLATION_HOURS_AHEAD before start). */
export function canCancelAppointment(appointment: BeautyAppointment): boolean {
  if (appointment.status === "cancelled" || appointment.status === "no_show" || appointment.status === "completed") {
    return false;
  }
  const start = new Date(`${appointment.appointment_date}T${String(appointment.appointment_time).slice(0, 5)}:00`);
  const cutoff = new Date(Date.now() + CANCELLATION_HOURS_AHEAD * 60 * 60 * 1000);
  return start >= cutoff;
}
