/**
 * Notification Service API
 * POST /api/flight/notifications/send
 *
 * Sends booking notifications via email/SMS
 * Handles confirmation, reminder, and update messages
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/flight/supabaseServerClient";

interface NotificationRequest {
  booking_id: string;
  notification_type:
  | "BOOKING_CONFIRMATION"
  | "PAYMENT_SUCCESS"
  | "TICKET_ISSUED"
  | "FLIGHT_REMINDER"
  | "FLIGHT_UPDATE"
  | "CANCELLATION";
  channel: "EMAIL" | "SMS" | "PUSH";
  custom_message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: NotificationRequest = await request.json();
    const { booking_id, notification_type, channel, custom_message } = body;

    if (!booking_id || !notification_type || !channel) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = supabaseServerClient;

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("flight_bookings")
      .select(
        `
        *,
        offer:flight_offers(*),
        flight:flights(*)
      `,
      )
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Generate notification content
    const notificationContent =
      custom_message || generateNotificationContent(notification_type, booking);
    const subject = generateSubject(notification_type, booking.pnr);
    const recipient =
      channel === "SMS"
        ? booking.lead_passenger_phone
        : booking.lead_passenger_email;

    // Create notification record
    const { data: notification, error: notificationError } = await supabase
      .from("booking_notifications")
      .insert({
        booking_id: booking.id,
        user_id: booking.user_id,
        notification_type,
        channel,
        recipient,
        subject,
        content: notificationContent,
        status: "PENDING",
      })
      .select()
      .single();

    if (notificationError) {
      console.error("Notification creation error:", notificationError);
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500 },
      );
    }

    // Send notification
    let sendResult;
    if (channel === "EMAIL") {
      sendResult = await sendEmail(
        recipient,
        subject,
        notificationContent,
        booking,
      );
    } else if (channel === "SMS") {
      sendResult = await sendSMS(recipient, notificationContent);
    } else if (channel === "PUSH" || true) { // Force push attempt for now to ensure delivery
      // Try to send Push Notification
      try {
        const { createNotificationAndPush } = await import('@/lib/services/pushService');
        // Notification type as title, or subject
        await createNotificationAndPush(
          booking.user_id,
          subject,
          notificationContent,
          'flight',
          '/my-bookings',
          { notification_type, booking_id }
        );
        // If channel was PUSH, mark as success (or combined)
        if (channel === 'PUSH') sendResult = { success: true };
      } catch (e) {
        console.error("Push send error:", e);
        if (channel === 'PUSH') sendResult = { success: false, error: String(e) };
      }
    }

    // Default sendResult if not set by main channel (e.g. if we just added push as extra)
    if (!sendResult) sendResult = { success: true };

    // Update notification status
    await supabase
      .from("booking_notifications")
      .update({
        status: sendResult.success ? "SENT" : "FAILED",
        sent_at: sendResult.success ? new Date().toISOString() : null,
        error_message: sendResult.error || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", notification.id);

    return NextResponse.json(
      {
        success: sendResult.success,
        notification_id: notification.id,
        message: sendResult.success
          ? "Notification sent successfully"
          : "Failed to send notification",
        error: sendResult.error,
      },
      { status: sendResult.success ? 200 : 500 },
    );
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Generate notification content based on type
 */
function generateNotificationContent(type: string, booking: any): string {
  const passengerName = booking.passengers[0]?.first_name || "Valued Customer";
  const flightInfo = `${booking.flight.origin} → ${booking.flight.destination}`;
  const departureTime = new Date(
    booking.flight.departure_time,
  ).toLocaleString();

  switch (type) {
    case "BOOKING_CONFIRMATION":
      return `Dear ${passengerName},\n\nYour flight booking has been confirmed!\n\nBooking Reference: ${booking.pnr}\nFlight: ${booking.flight.flight_number}\nRoute: ${flightInfo}\nDeparture: ${departureTime}\n\nThank you for choosing TripC!`;

    case "PAYMENT_SUCCESS":
      return `Dear ${passengerName},\n\nYour payment of ${booking.currency} ${booking.price_paid} has been successfully processed.\n\nBooking Reference: ${booking.pnr}\n\nYour e-tickets will be sent shortly.`;

    case "TICKET_ISSUED":
      return `Dear ${passengerName},\n\nYour e-tickets have been issued!\n\nBooking Reference: ${booking.pnr}\nFlight: ${booking.flight.flight_number}\nRoute: ${flightInfo}\nDeparture: ${departureTime}\n\nPlease check your email for boarding passes.`;

    case "FLIGHT_REMINDER":
      return `Dear ${passengerName},\n\nReminder: Your flight departs in 24 hours!\n\nBooking Reference: ${booking.pnr}\nFlight: ${booking.flight.flight_number}\nRoute: ${flightInfo}\nDeparture: ${departureTime}\n\nPlease arrive at the airport 2 hours before departure.`;

    case "FLIGHT_UPDATE":
      return `Dear ${passengerName},\n\nImportant update regarding your flight ${booking.flight.flight_number}.\n\nBooking Reference: ${booking.pnr}\n\nPlease check your booking details for the latest information.`;

    case "CANCELLATION":
      return `Dear ${passengerName},\n\nYour booking has been cancelled.\n\nBooking Reference: ${booking.pnr}\nFlight: ${booking.flight.flight_number}\n\nIf you paid for this booking, your refund will be processed within 7-10 business days.`;

    default:
      return `Update regarding your booking ${booking.pnr}`;
  }
}

/**
 * Generate email subject
 */
function generateSubject(type: string, pnr: string): string {
  const subjects: Record<string, string> = {
    BOOKING_CONFIRMATION: `Booking Confirmed - ${pnr}`,
    PAYMENT_SUCCESS: `Payment Successful - ${pnr}`,
    TICKET_ISSUED: `E-Tickets Issued - ${pnr}`,
    FLIGHT_REMINDER: `Flight Reminder - ${pnr}`,
    FLIGHT_UPDATE: `Flight Update - ${pnr}`,
    CANCELLATION: `Booking Cancelled - ${pnr}`,
  };

  return subjects[type] || `Booking Update - ${pnr}`;
}

/**
 * Send email notification
 * TODO: Integrate with SendGrid/Resend/AWS SES
 */
async function sendEmail(
  to: string,
  subject: string,
  content: string,
  booking: any,
) {
  try {
    console.log("Sending email to:", to);
    console.log("Subject:", subject);
    console.log("Content:", content);

    // TODO: Implement actual email service
    /*
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: 'bookings@tripc.com',
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a56db; color: white; padding: 20px; text-align: center;">
            <h1>TripC Flight Booking</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <pre style="white-space: pre-wrap; font-family: inherit;">${content}</pre>
          </div>
          <div style="padding: 20px; background: #333; color: white; text-align: center;">
            <p>© 2024 TripC. All rights reserved.</p>
          </div>
        </div>
      `
    });
    */

    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Send SMS notification
 * TODO: Integrate with Twilio/AWS SNS
 */
async function sendSMS(to: string, content: string) {
  try {
    console.log("Sending SMS to:", to);
    console.log("Content:", content);

    // TODO: Implement actual SMS service
    /*
    import twilio from 'twilio';
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    await client.messages.create({
      body: content,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    */

    return { success: true };
  } catch (error) {
    console.error("SMS send error:", error);
    return { success: false, error: String(error) };
  }
}
