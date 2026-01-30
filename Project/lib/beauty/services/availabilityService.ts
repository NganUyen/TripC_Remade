/**
 * Beauty availability logic: compute free time slots for a venue/date
 * considering operating_hours and existing appointments (no double-booking).
 */

import { venueService } from "./venueService";
import { appointmentService } from "./appointmentService";
import { serviceService } from "./serviceService";

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
const DEFAULT_OPEN = "08:00";
const DEFAULT_CLOSE = "20:00";
const SLOT_INTERVAL_MINUTES = 30;

function timeToMinutes(t: string): number {
  const [h, m] = t.trim().split(/[:\s]/).map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getOperatingRangeForDate(
  operatingHours: Record<string, { open: string; close: string }> | null,
  dateStr: string
): { openMinutes: number; closeMinutes: number } {
  if (!operatingHours || Object.keys(operatingHours).length === 0) {
    return {
      openMinutes: timeToMinutes(DEFAULT_OPEN),
      closeMinutes: timeToMinutes(DEFAULT_CLOSE),
    };
  }
  const date = new Date(dateStr + "T12:00:00");
  const dayName = DAY_NAMES[date.getDay()];
  const hours = operatingHours[dayName] ?? operatingHours[dayName.toLowerCase()];
  if (!hours) {
    return {
      openMinutes: timeToMinutes(DEFAULT_OPEN),
      closeMinutes: timeToMinutes(DEFAULT_CLOSE),
    };
  }
  return {
    openMinutes: timeToMinutes(hours.open),
    closeMinutes: timeToMinutes(hours.close),
  };
}

/** Get list of available time slots for a venue on a given date (optionally for a service = duration). */
export async function getAvailableSlots(
  venueId: string,
  date: string,
  options?: { serviceId?: string; slotIntervalMinutes?: number }
): Promise<string[]> {
  const venue = await venueService.getVenueById(venueId);
  if (!venue) return [];

  let durationMinutes = 60;
  if (options?.serviceId) {
    const service = await serviceService.getServiceById(options.serviceId);
    if (service && service.venue_id === venueId) durationMinutes = service.duration_minutes;
  }
  const interval = options?.slotIntervalMinutes ?? SLOT_INTERVAL_MINUTES;
  const { openMinutes, closeMinutes } = getOperatingRangeForDate(venue.operating_hours, date);

  const appointments = await appointmentService.getVenueAppointmentsByDate(venueId, date);
  const activeAppointments = appointments.filter(
    (a) => a.status !== "cancelled" && a.status !== "no_show"
  );

  const blockedRanges: { start: number; end: number }[] = activeAppointments.map((a) => {
    const start = timeToMinutes(String(a.appointment_time).slice(0, 5));
    return { start, end: start + a.duration_minutes };
  });

  const slots: string[] = [];
  for (let slotStart = openMinutes; slotStart + durationMinutes <= closeMinutes; slotStart += interval) {
    const slotEnd = slotStart + durationMinutes;
    const overlaps = blockedRanges.some(
      (r) => (slotStart >= r.start && slotStart < r.end) || (slotEnd > r.start && slotEnd <= r.end) || (slotStart <= r.start && slotEnd >= r.end)
    );
    if (!overlaps) slots.push(minutesToTime(slotStart));
  }
  return slots;
}

/** Check if a specific slot is free for the given duration. */
export async function isSlotAvailable(
  venueId: string,
  date: string,
  time: string,
  durationMinutes: number
): Promise<boolean> {
  const venue = await venueService.getVenueById(venueId);
  if (!venue) return false;

  const { openMinutes, closeMinutes } = getOperatingRangeForDate(venue.operating_hours, date);
  const start = timeToMinutes(time);
  const end = start + durationMinutes;
  if (start < openMinutes || end > closeMinutes) return false;

  const appointments = await appointmentService.getVenueAppointmentsByDate(venueId, date);
  const activeAppointments = appointments.filter(
    (a) => a.status !== "cancelled" && a.status !== "no_show"
  );

  for (const a of activeAppointments) {
    const aptStart = timeToMinutes(String(a.appointment_time).slice(0, 5));
    const aptEnd = aptStart + a.duration_minutes;
    if (start < aptEnd && end > aptStart) return false;
  }
  return true;
}
