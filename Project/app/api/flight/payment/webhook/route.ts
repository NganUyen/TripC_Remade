/**
 * Payment Webhook Handler
 * POST /api/flight/payment/webhook
 *
 * Receives payment status updates from PayOS/Stripe gateway
 * Handles payment success/failure and triggers ticket issuance
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/flight/supabaseServerClient";

interface PaymentWebhookPayload {
  transaction_id: string;
  payment_id?: string;
  status: "SUCCESS" | "FAILED" | "CANCELLED" | "PENDING";
  amount: number;
  currency: string;
  gateway_response?: any;
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (TODO: implement signature verification)
    // For PayOS: verify HMAC signature
    // For Stripe: verify webhook signature
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    const signature = request.headers.get("x-webhook-signature");

    // TODO: Verify signature
    // if (!verifyWebhookSignature(signature, webhookSecret, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const payload: PaymentWebhookPayload = await request.json();
    const { transaction_id, status, amount, currency, gateway_response } =
      payload;

    if (!transaction_id || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = createClient();

    // Find payment record by transaction ID
    const { data: payment, error: paymentError } = await supabase
      .from("booking_payments")
      .select("*, booking:flight_bookings(*)")
      .eq("gateway_transaction_id", transaction_id)
      .single();

    if (paymentError || !payment) {
      console.error("Payment not found:", transaction_id);
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 },
      );
    }

    const booking = payment.booking;

    // Update payment status
    const { error: updateError } = await supabase
      .from("booking_payments")
      .update({
        payment_status: status,
        gateway_response,
        paid_at: status === "SUCCESS" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (updateError) {
      console.error("Payment update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update payment status" },
        { status: 500 },
      );
    }

    // Handle payment success
    if (status === "SUCCESS") {
      // Update booking status
      await supabase
        .from("flight_bookings")
        .update({
          status: "CONFIRMED",
          payment_status: "COMPLETED",
          confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);

      // Calculate Tcent earned (e.g., 1% of amount)
      const tcent_earned = Math.floor(amount * 100 * 0.01); // 1% cashback

      // Update Tcent earned in booking
      await supabase
        .from("flight_bookings")
        .update({
          tcent_earned,
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);

      // Create loyalty transaction
      await supabase.from("loyalty_transactions").insert({
        user_id: booking.user_id,
        booking_id: booking.id,
        transaction_type: "EARN",
        tcent_amount: tcent_earned,
        description: `Earned Tcent from flight booking ${booking.pnr}`,
        status: "COMPLETED",
      });

      // Trigger ticket issuance (async job)
      await triggerTicketIssuance(booking.id);

      // Send confirmation notification
      await sendPaymentConfirmation(booking);
    } else if (status === "FAILED" || status === "CANCELLED") {
      // Update booking status to failed
      await supabase
        .from("flight_bookings")
        .update({
          payment_status: "FAILED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);

      // Release held seats if hold booking
      if (booking.is_hold_booking) {
        const { data: offer } = await supabase
          .from("flight_offers")
          .select("seats_available")
          .eq("id", booking.offer_id)
          .single();

        if (offer) {
          await supabase
            .from("flight_offers")
            .update({
              seats_available:
                offer.seats_available + booking.passengers.length,
              updated_at: new Date().toISOString(),
            })
            .eq("id", booking.offer_id);
        }
      }

      // Send payment failure notification
      await sendPaymentFailure(booking);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Webhook processed successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Trigger ticket issuance job
 * In production, this would be a background job queue
 */
async function triggerTicketIssuance(booking_id: string) {
  // TODO: Implement ticket issuance via job queue
  // For MVP, we'll call the ticket issuance API directly
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/flight/ticket/issue`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id }),
      },
    );

    if (!response.ok) {
      console.error("Ticket issuance failed:", await response.text());
    }
  } catch (error) {
    console.error("Ticket issuance trigger error:", error);
  }
}

/**
 * Send payment confirmation notification
 */
async function sendPaymentConfirmation(booking: any) {
  // TODO: Implement email/SMS notification
  const supabase = createClient();

  await supabase.from("booking_notifications").insert({
    booking_id: booking.id,
    user_id: booking.user_id,
    notification_type: "PAYMENT_SUCCESS",
    channel: "EMAIL",
    recipient: booking.lead_passenger_email,
    subject: `Payment Confirmed - Booking ${booking.pnr}`,
    content: `Your payment has been successfully processed. Your booking is confirmed.`,
    status: "PENDING",
  });
}

/**
 * Send payment failure notification
 */
async function sendPaymentFailure(booking: any) {
  const supabase = createClient();

  await supabase.from("booking_notifications").insert({
    booking_id: booking.id,
    user_id: booking.user_id,
    notification_type: "PAYMENT_FAILED",
    channel: "EMAIL",
    recipient: booking.lead_passenger_email,
    subject: `Payment Failed - Booking ${booking.pnr}`,
    content: `Your payment could not be processed. Please try again.`,
    status: "PENDING",
  });
}
