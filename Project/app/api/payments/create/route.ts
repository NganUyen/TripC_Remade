
import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from "@/lib/checkout/services/payment.service";

const paymentService = new PaymentService();

/**
 * POST /api/payments/create
 * 
 * Creates a payment intent for a booking.
 * Returns a paymentUrl to redirect the user to the provider (e.g., MoMo).
 * 
 * Request body:
 * - bookingId: UUID of the booking
 * - provider: Payment provider ('momo', 'paypal', etc.)
 * - returnUrl: URL to redirect after payment (e.g., /my-bookings)
 */
export async function POST(req: NextRequest) {
    const startTime = Date.now();
    let bookingId: string | undefined;
    let provider: string | undefined;

    try {
        const body = await req.json();
        bookingId = body.bookingId;
        provider = body.provider;
        const returnUrl = body.returnUrl;

        console.log('[API_PAYMENT_CREATE_START]', {
            booking_id: bookingId,
            provider,
            returnUrl,
        });

        // Validate required fields
        if (!bookingId) {
            return NextResponse.json({ 
                ok: false, 
                error: 'Missing bookingId' 
            }, { status: 400 });
        }
        if (!provider) {
            return NextResponse.json({ 
                ok: false, 
                error: 'Missing provider' 
            }, { status: 400 });
        }
        if (!returnUrl) {
            return NextResponse.json({ 
                ok: false, 
                error: 'Missing returnUrl' 
            }, { status: 400 });
        }

        // Create payment intent
        const result = await paymentService.createPaymentIntent(bookingId, provider, returnUrl);

        const duration = Date.now() - startTime;
        console.log('[API_PAYMENT_CREATE_SUCCESS]', {
            booking_id: bookingId,
            provider,
            provider_transaction_id: result.providerTxnId,
            has_payment_url: !!result.paymentUrl,
            duration_ms: duration,
        });

        return NextResponse.json({
            ok: true,
            data: {
                paymentUrl: result.paymentUrl,
                providerTxnId: result.providerTxnId,
            },
        });
    } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error('[API_PAYMENT_CREATE_ERROR]', {
            booking_id: bookingId,
            provider,
            error: error.message,
            duration_ms: duration,
        });

        // Return appropriate status based on error
        const errorMessage = error.message || 'Internal Server Error';
        let status = 500;

        if (errorMessage.includes('not found')) status = 404;
        if (errorMessage.includes('already paid')) status = 409;
        if (errorMessage.includes('not valid')) status = 400;

        return NextResponse.json({
            ok: false,
            error: errorMessage,
        }, { status });
    }
}
