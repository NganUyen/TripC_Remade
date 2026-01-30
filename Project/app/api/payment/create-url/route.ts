import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Mock payment URL generator
// In production, this would integrate with real MoMo/VNPAY APIs
export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { bookingId, paymentMethod } = body;

        if (!bookingId || !paymentMethod) {
            return NextResponse.json(
                { error: "Missing bookingId or paymentMethod" },
                { status: 400 }
            );
        }

        const supabase = createServiceSupabaseClient();

        // Fetch booking to get amount
        const { data: booking, error: bookingError } = await supabase
            .from("bookings")
            .select("*")
            .eq("id", bookingId)
            .eq("user_id", user.id)
            .single();

        if (bookingError || !booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        // Create payment record
        const { data: payment, error: paymentError } = await supabase
            .from("payment_transactions")
            .insert({
                booking_id: bookingId,
                amount: booking.total_amount,
                provider: paymentMethod,
                status: "pending",
                provider_transaction_id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                currency: "VND"
            })
            .select()
            .single();

        if (paymentError) {
            console.error("Payment creation error:", paymentError);
            return NextResponse.json(
                { error: paymentError.message },
                { status: 500 }
            );
        }

        // Generate mock payment URL based on method
        let paymentUrl = "";
        const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment/callback?paymentId=${payment.id}`;

        if (paymentMethod === "momo") {
            // Mock MoMo payment URL
            paymentUrl = `https://test-payment.momo.vn/pay?amount=${booking.total_amount}&orderId=${payment.provider_transaction_id}&returnUrl=${encodeURIComponent(callbackUrl)}`;
        } else if (paymentMethod === "vnpay") {
            // Mock VNPAY payment URL
            paymentUrl = `https://sandbox.vnpayment.vn/pay?amount=${booking.total_amount}&orderId=${payment.provider_transaction_id}&returnUrl=${encodeURIComponent(callbackUrl)}`;
        }

        return NextResponse.json({
            success: true,
            paymentId: payment.id,
            paymentUrl: paymentUrl,
            // For demo purposes, we'll also return a mock success URL
            mockSuccessUrl: `/api/payment/callback?paymentId=${payment.id}&status=success`,
            message: "Payment URL generated. In production, redirect user to paymentUrl."
        });

    } catch (err: any) {
        console.error("Payment create-url error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
