import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Handle payment gateway callbacks
// This endpoint is called by MoMo/VNPAY after user completes payment
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const paymentId = searchParams.get("paymentId");
        const status = searchParams.get("status") || "success"; // Mock: default to success for testing

        if (!paymentId) {
            return NextResponse.redirect(new URL("/transport?error=missing_payment", request.url));
        }

        const supabase = createServiceSupabaseClient();

        // Fetch payment record
        const { data: payment, error: paymentError } = await supabase
            .from("payments")
            .select("*, bookings(*)")
            .eq("id", paymentId)
            .single();

        if (paymentError || !payment) {
            console.error("Payment not found:", paymentError);
            return NextResponse.redirect(new URL("/?error=payment_not_found", request.url));
        }

        // Update payment status
        const paymentStatus = status === "success" ? "success" : "failed";
        await supabase
            .from("payments")
            .update({
                status: paymentStatus,
                paid_at: status === "success" ? new Date().toISOString() : null
            })
            .eq("id", paymentId);

        // Update booking status if payment successful
        if (status === "success") {
            await supabase
                .from("bookings")
                .update({ status: "confirmed" })
                .eq("id", payment.booking_id);

            // Redirect to success page
            return NextResponse.redirect(
                new URL(`/my-bookings?success=true&tab=upcoming&bookingId=${payment.booking_id}`, request.url)
            );
        } else {
            // Payment failed - redirect with error
            const category = payment.bookings?.category || 'transport';
            const routeId = payment.bookings?.metadata?.routeId;
            const redirectUrl = category === 'transport' && routeId
                ? `/transport/checkout?routeId=${routeId}&error=payment_failed`
                : `/${category}?error=payment_failed`;

            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }

    } catch (err: any) {
        console.error("Payment callback error:", err);
        return NextResponse.redirect(new URL("/transport?error=callback_error", request.url));
    }
}

// Also support POST for some payment gateways
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { paymentId, status, transactionId } = body;

        if (!paymentId) {
            return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
        }

        const supabase = createServiceSupabaseClient();

        // Verify and update payment
        const paymentStatus = status === "success" || status === "00" ? "paid" : "failed";

        const { error: updateError } = await supabase
            .from("payments")
            .update({
                status: paymentStatus,
                transaction_id: transactionId || undefined,
                paid_at: paymentStatus === "paid" ? new Date().toISOString() : null
            })
            .eq("id", paymentId);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // Get booking and update if paid
        const { data: payment } = await supabase
            .from("payments")
            .select("booking_id")
            .eq("id", paymentId)
            .single();

        if (payment && paymentStatus === "paid") {
            await supabase
                .from("bookings")
                .update({ status: "confirmed" })
                .eq("id", payment.booking_id);
        }

        return NextResponse.json({
            success: true,
            status: paymentStatus
        });

    } catch (err: any) {
        console.error("Payment callback POST error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
