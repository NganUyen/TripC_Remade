import { supabaseServerClient } from "../supabaseServerClient";
import type { BeautyAppointment, CreateAppointmentRequest } from "../types";

export class AppointmentService {
  private supabase = supabaseServerClient;

  async createAppointment(
    appointmentData: CreateAppointmentRequest,
    userId: string,
  ): Promise<BeautyAppointment | null> {
    const { data, error } = await this.supabase
      .from("beauty_appointments")
      .insert({
        ...appointmentData,
        user_id: userId || 'GUEST',
        status: "pending",
        duration_minutes: appointmentData.duration_minutes ?? 60,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating beauty appointment:", error);
      return null;
    }

    const appointment = data as BeautyAppointment;

    // Send confirmation email (Async)
    try {
      const { unifiedEmailService } = await import("@/lib/email/unified-email-service");
      await unifiedEmailService.sendBookingEmail({
        category: 'beauty',
        guest_name: appointment.guest_name,
        guest_email: appointment.guest_email || '',
        booking_code: appointment.appointment_code,
        title: "Beauty Appointment",
        description: `Service ID: ${appointment.service_id || 'General'}`,
        start_date: appointment.appointment_date,
        total_amount: 0, // Beauty usually handles payment at venue or via different flow in this app
        currency: "USD",
        metadata: {
          venue_id: appointment.venue_id,
          time: appointment.appointment_time
        }
      });
    } catch (emailErr) {
      console.error("[BEAUTY_EMAIL_ERROR]", emailErr);
    }

    return appointment;
  }

  async getAppointmentById(id: string): Promise<BeautyAppointment | null> {
    const { data, error } = await this.supabase
      .from("beauty_appointments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching beauty appointment:", error);
      return null;
    }
    return data as BeautyAppointment;
  }

  async getAppointmentByCode(code: string): Promise<BeautyAppointment | null> {
    const { data, error } = await this.supabase
      .from("beauty_appointments")
      .select("*")
      .eq("appointment_code", code)
      .single();

    if (error) {
      console.error("Error fetching beauty appointment by code:", error);
      return null;
    }
    return data as BeautyAppointment;
  }

  async getUserAppointments(userId: string, limit: number = 50): Promise<BeautyAppointment[]> {
    const { data, error } = await this.supabase
      .from("beauty_appointments")
      .select("*")
      .eq("user_id", userId)
      .order("appointment_date", { ascending: false })
      .order("appointment_time", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching user appointments:", error);
      return [];
    }
    return (data ?? []) as BeautyAppointment[];
  }

  async getVenueAppointmentsByDate(
    venueId: string,
    date: string,
    status?: string,
  ): Promise<BeautyAppointment[]> {
    let query = this.supabase
      .from("beauty_appointments")
      .select("*")
      .eq("venue_id", venueId)
      .eq("appointment_date", date)
      .order("appointment_time", { ascending: true });

    if (status) query = query.eq("status", status);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching venue appointments:", error);
      return [];
    }
    return (data ?? []) as BeautyAppointment[];
  }

  async updateAppointmentStatus(
    id: string,
    status: BeautyAppointment["status"],
    metadata?: Partial<BeautyAppointment>,
  ): Promise<BeautyAppointment | null> {
    const updateData: Record<string, unknown> = { status };
    if (status === "confirmed" && !metadata?.confirmed_at) updateData.confirmed_at = new Date().toISOString();
    if (status === "completed" && !metadata?.completed_at) updateData.completed_at = new Date().toISOString();
    if (status === "cancelled" && !metadata?.cancelled_at) updateData.cancelled_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from("beauty_appointments")
      .update({ ...updateData, ...metadata })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating beauty appointment:", error);
      return null;
    }
    return data as BeautyAppointment;
  }

  async cancelAppointment(id: string, reason?: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("beauty_appointments")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
      })
      .eq("id", id);

    if (error) {
      console.error("Error cancelling beauty appointment:", error);
      return false;
    }
    return true;
  }
}

export const appointmentService = new AppointmentService();
