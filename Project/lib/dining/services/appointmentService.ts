// Dining appointment service - handles dining_appointment operations
// Business logic: validate blocked dates, enforce time slots, auto-assign table.

import { supabaseServerClient } from "../supabaseServerClient";
import type {
  DiningAppointment,
  DiningTable,
  DiningTimeSlot,
  CreateDiningAppointmentRequest,
} from "../types";

function parseTimeToMinutes(t: string): number {
  const m = String(t).trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  const h = m ? parseInt(m[1], 10) : 0;
  const mm = m ? parseInt(m[2], 10) : 0;
  return h * 60 + mm;
}

function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export class AppointmentService {
  private supabase = supabaseServerClient;

  async getAppointmentById(id: string): Promise<DiningAppointment | null> {
    const { data, error } = await this.supabase
      .from("dining_appointment")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("Error fetching dining appointment:", error);
      return null;
    }
    return data as DiningAppointment;
  }

  async getUserAppointments(userId: string, limit: number = 50): Promise<DiningAppointment[]> {
    const { data, error } = await this.supabase
      .from("dining_appointment")
      .select("*")
      .eq("user_id", userId)
      .order("appointment_date", { ascending: false })
      .order("appointment_time", { ascending: false })
      .limit(limit);
    if (error) {
      console.error("Error fetching user dining appointments:", error);
      return [];
    }
    return (data ?? []) as DiningAppointment[];
  }

  async getVenueAppointmentsByDate(
    venueId: string,
    date: string,
  ): Promise<DiningAppointment[]> {
    const { data, error } = await this.supabase
      .from("dining_appointment")
      .select("*")
      .eq("venue_id", venueId)
      .eq("appointment_date", date)
      .in("status", ["pending", "confirmed", "seated"])
      .order("appointment_time", { ascending: true });
    if (error) {
      console.error("Error fetching venue dining appointments:", error);
      return [];
    }
    return (data ?? []) as DiningAppointment[];
  }

  async cancelAppointment(id: string, reason?: string): Promise<boolean> {
    const existing = await this.getAppointmentById(id);
    if (!existing) return false;
    if (["cancelled", "completed", "no_show"].includes(existing.status)) return false;

    const { error } = await this.supabase
      .from("dining_appointment")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
      })
      .eq("id", id);
    if (error) {
      console.error("Error cancelling dining appointment:", error);
      return false;
    }
    return true;
  }

  /**
   * Return available times (HH:mm) for a venue/date and party size,
   * based on dining_time_slots + blocked dates + table availability + max limits.
   */
  async getAvailableTimes(
    venueId: string,
    date: string,
    guestCount: number,
  ): Promise<{ times: string[]; reason?: string }> {
    // Blocked dates
    const { data: blocked } = await this.supabase
      .from("dining_blocked_dates")
      .select("*")
      .eq("venue_id", venueId)
      .lte("start_date", date)
      .gte("end_date", date);
    if (blocked && blocked.length > 0) {
      return { times: [], reason: "Venue is closed on this date" };
    }

    const dayOfWeek = new Date(date + "T12:00:00").getDay();
    const { data: slots, error: slotErr } = await this.supabase
      .from("dining_time_slots")
      .select("*")
      .eq("venue_id", venueId)
      .eq("day_of_week", dayOfWeek)
      .eq("is_active", true);
    if (slotErr) {
      console.error("Error fetching dining time slots:", slotErr);
    }
    const timeSlots = (slots ?? []) as DiningTimeSlot[];
    if (timeSlots.length === 0) {
      return { times: [], reason: "No active time slots for this date" };
    }

    // Candidate tables
    const { data: tables } = await this.supabase
      .from("dining_tables")
      .select("*")
      .eq("venue_id", venueId)
      .eq("is_active", true)
      .eq("is_reservable", true)
      .lte("min_capacity", guestCount)
      .gte("max_capacity", guestCount)
      .order("max_capacity", { ascending: true })
      .order("premium_charge", { ascending: true });
    const candidateTables = (tables ?? []) as DiningTable[];
    if (candidateTables.length === 0) {
      return { times: [], reason: "No table fits this party size" };
    }

    const existing = await this.getVenueAppointmentsByDate(venueId, date);

    const results = new Set<string>();
    for (const ts of timeSlots) {
      const startMin = parseTimeToMinutes(ts.start_time);
      const endMin = parseTimeToMinutes(ts.end_time);
      const step = ts.slot_duration_minutes || 30;

      for (let t = startMin; t < endMin; t += step) {
        const timeStr = minutesToTime(t);

        // max_reservations_per_slot
        const countAtTime = existing.filter(
          (a) => String(a.appointment_time).slice(0, 5) === timeStr,
        ).length;
        if (ts.max_reservations_per_slot && countAtTime >= ts.max_reservations_per_slot) continue;

        // max_guests_per_slot (optional)
        if (ts.max_guests_per_slot) {
          const guestsAtTime = existing
            .filter((a) => String(a.appointment_time).slice(0, 5) === timeStr)
            .reduce((sum, a) => sum + (a.guest_count || 0), 0);
          if (guestsAtTime + guestCount > ts.max_guests_per_slot) continue;
        }

        // Check at least one table free at this time
        const tableFree = candidateTables.some((table) => {
          return !existing.some(
            (a) =>
              a.table_id === table.id &&
              String(a.appointment_time).slice(0, 5) === timeStr,
          );
        });
        if (tableFree) results.add(timeStr);
      }
    }

    return { times: Array.from(results).sort() };
  }

  /**
   * Create new appointment:
   * - validate blocked date
   * - validate time in time slot
   * - auto-assign table if not provided
   */
  async createAppointment(
    body: CreateDiningAppointmentRequest,
    userId: string,
  ): Promise<{ appointment: DiningAppointment | null; error?: string }> {
    // Basic required fields
    if (!body.venue_id || !body.appointment_date || !body.appointment_time || !body.guest_name) {
      return { appointment: null, error: "Missing required fields" };
    }
    if (!body.guest_count || body.guest_count < 1) {
      return { appointment: null, error: "guest_count must be >= 1" };
    }

    // Blocked dates
    const { data: blocked } = await this.supabase
      .from("dining_blocked_dates")
      .select("*")
      .eq("venue_id", body.venue_id)
      .lte("start_date", body.appointment_date)
      .gte("end_date", body.appointment_date);
    if (blocked && blocked.length > 0) {
      return { appointment: null, error: "Venue is closed on this date" };
    }

    const dayOfWeek = new Date(body.appointment_date + "T12:00:00").getDay();
    const { data: slots } = await this.supabase
      .from("dining_time_slots")
      .select("*")
      .eq("venue_id", body.venue_id)
      .eq("day_of_week", dayOfWeek)
      .eq("is_active", true);
    const timeSlots = (slots ?? []) as DiningTimeSlot[];
    const timeStr = String(body.appointment_time).slice(0, 5);
    const timeMin = parseTimeToMinutes(timeStr);
    const withinSlot = timeSlots.some((s) => {
      const start = parseTimeToMinutes(s.start_time);
      const end = parseTimeToMinutes(s.end_time);
      return timeMin >= start && timeMin < end;
    });
    if (!withinSlot) {
      return { appointment: null, error: "Time is outside venue time slots" };
    }

    // Auto-assign / validate table
    const { data: tables } = await this.supabase
      .from("dining_tables")
      .select("*")
      .eq("venue_id", body.venue_id)
      .eq("is_active", true)
      .eq("is_reservable", true)
      .lte("min_capacity", body.guest_count)
      .gte("max_capacity", body.guest_count)
      .order("max_capacity", { ascending: true })
      .order("premium_charge", { ascending: true });
    const candidateTables = (tables ?? []) as DiningTable[];
    if (candidateTables.length === 0) {
      return { appointment: null, error: "No table fits this party size" };
    }

    const existing = await this.getVenueAppointmentsByDate(body.venue_id, body.appointment_date);
    const duration = body.duration_minutes ?? 120;

    let tableId = body.table_id ?? null;
    if (tableId) {
      const ok = candidateTables.some((t) => t.id === tableId);
      if (!ok) return { appointment: null, error: "Invalid table_id for this party size" };
      const conflict = existing.some(
        (a) => a.table_id === tableId && String(a.appointment_time).slice(0, 5) === timeStr,
      );
      if (conflict) return { appointment: null, error: "Table is not available at this time" };
    } else {
      const free = candidateTables.find((t) => {
        return !existing.some(
          (a) => a.table_id === t.id && String(a.appointment_time).slice(0, 5) === timeStr,
        );
      });
      if (!free) return { appointment: null, error: "No available table for this time" };
      tableId = free.id;
    }

    // Insert into dining_appointment
    const { data, error } = await this.supabase
      .from("dining_appointment")
      .insert({
        ...body,
        user_id: userId,
        status: "confirmed",
        duration_minutes: duration,
        table_id: tableId,
        appointment_time: timeStr,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating dining appointment:", error);
      return { appointment: null, error: error.message };
    }

    const appointment = data as DiningAppointment;

    // Send confirmation email (Async)
    try {
      const { unifiedEmailService } = await import("@/lib/email/unified-email-service");
      await unifiedEmailService.sendBookingEmail({
        category: 'dining',
        guest_name: appointment.guest_name,
        guest_email: appointment.guest_email || '', // Should have it from body
        booking_code: appointment.appointment_code,
        title: "Dining Reservation",
        description: `${appointment.guest_count} Guests`,
        start_date: appointment.appointment_date,
        total_amount: 0, // Dining usually doesn't have prepayment here or handled differently
        currency: "USD",
        metadata: {
          venue_id: appointment.venue_id,
          time: appointment.appointment_time
        }
      });
    } catch (emailErr) {
      console.error("[DINING_EMAIL_ERROR]", emailErr);
    }

    return { appointment };
  }
}

export const appointmentService = new AppointmentService();

