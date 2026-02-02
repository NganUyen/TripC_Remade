/**
 * Payment Initiation API
 * POST /api/flight/payment/initiate
 *
 * Initiates payment transaction for a flight booking
 * Integrates with PayOS/Stripe payment gateway
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/flight/supabaseServerClient";
import { verifyClerkAuth } from "@/lib/flight/clerkAuth";

interface PaymentInitiateRequest {
  booking_id: string;
  payment_method:
    | "CREDIT_CARD"
    | "DEBIT_CARD"
    | "WALLET"
    | "TCENT"
    | "BANK_TRANSFER";
  tcent_to_redeem?: number;
  return_url?: string;
  cancel_url?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId, error: authError } = await verifyClerkAuth();
    if (authError || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: PaymentInitiateRequest = await request.json();
    const {
      booking_id,
      payment_method,
      tcent_to_redeem = 0,
      return_url = `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${booking_id}`,
      cancel_url = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${booking_id}`,
    } = body;

    // Validate input
    if (!booking_id || !payment_method) {
      return NextResponse.json(
        { error: "Missing required fields: booking_id, payment_method" },
        { status: 400 },
      );
    }

    const supabase = supabaseServerClient;

    // Get booking details with offer
    const { data: booking, error: bookingError } = await supabase
      .from("flight_bookings")
      .select("*, offer:flight_offers(*), flight:flights(*)")
      .eq("id", booking_id)
      .eq("user_id", userId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found or unauthorized" },
        { status: 404 },
      );
    }

    // Validate booking status
    if (booking.payment_status === "COMPLETED") {
      return NextResponse.json(
        { error: "Payment already completed for this booking" },
        { status: 400 },
      );
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot pay for cancelled booking" },
        { status: 400 },
      );
    }

    // Check if hold booking has expired
    if (booking.is_hold_booking && booking.hold_until) {
      const holdExpiry = new Date(booking.hold_until);
      if (holdExpiry < new Date()) {
        // Expire the booking
        await supabase
          .from("flight_bookings")
          .update({
            status: "EXPIRED",
            updated_at: new Date().toISOString(),
          })
          .eq("id", booking_id);

        return NextResponse.json(
          { error: "Hold booking has expired" },
          { status: 400 },
        );
      }
    }

    // Calculate final amount after Tcent redemption
    const totalPrice = parseFloat(booking.price_paid);
    const tcent_value = tcent_to_redeem * 0.01; // 1 Tcent = $0.01 (configurable)
    const finalAmount = Math.max(0, totalPrice - tcent_value);

    // Validate Tcent balance (TODO: implement user tcent balance check)
    // For now, we'll assume the user has sufficient Tcent

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from("booking_payments")
      .insert({
        booking_id: booking.id,
        user_id: userId,
        amount: finalAmount,
        currency: booking.currency,
        payment_method,
        payment_status: "PENDING",
        tcent_used: tcent_to_redeem,
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Payment creation error:", paymentError);
      return NextResponse.json(
        { error: "Failed to create payment record" },
        { status: 500 },
      );
    }

    // TODO: Integrate with actual payment gateway (PayOS/Stripe)
    // For MVP, we'll simulate the payment gateway response

    const paymentGatewayResponse = await simulatePaymentGateway({
      payment_id: payment.id,
      amount: finalAmount,
      currency: booking.currency,
      payment_method,
      return_url,
      cancel_url,
    });

    // Update payment record with gateway details
    await supabase
      .from("booking_payments")
      .update({
        gateway_transaction_id: paymentGatewayResponse.transaction_id,
        gateway_payment_url: paymentGatewayResponse.payment_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    // Update booking with payment intent
    await supabase
      .from("flight_bookings")
      .update({
        payment_status: "PROCESSING",
        tcent_used: tcent_to_redeem,
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking_id);

    return NextResponse.json(
      {
        success: true,
        payment: {
          id: payment.id,
          amount: finalAmount,
          currency: booking.currency,
          payment_method,
          tcent_used: tcent_to_redeem,
          tcent_value: tcent_value,
          payment_url: paymentGatewayResponse.payment_url,
          transaction_id: paymentGatewayResponse.transaction_id,
        },
        message: "Payment initiated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Simulate payment gateway integration
 * TODO: Replace with actual PayOS/Stripe integration
 */
async function simulatePaymentGateway(params: {
  payment_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  return_url: string;
  cancel_url: string;
}) {
  // Generate mock transaction ID
  const transaction_id = `TXN_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;

  // Generate mock payment URL
  const payment_url = `${process.env.NEXT_PUBLIC_APP_URL}/payment/gateway?txn=${transaction_id}`;

  // In production, this would call PayOS/Stripe API:
  /*
  const payosClient = new PayOS(process.env.PAYOS_CLIENT_ID, process.env.PAYOS_API_KEY);
  const paymentLink = await payosClient.createPaymentLink({
    orderCode: params.payment_id,
    amount: params.amount,
    description: `Flight Booking Payment - ${params.payment_id}`,
    returnUrl: params.return_url,
    cancelUrl: params.cancel_url
  });
  return {
    transaction_id: paymentLink.paymentLinkId,
    payment_url: paymentLink.checkoutUrl
  };
  */

  return {
    transaction_id,
    payment_url,
  };
}
