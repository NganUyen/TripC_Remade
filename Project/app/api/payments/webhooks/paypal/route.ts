import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from "@/lib/checkout/services/payment.service";

const paymentService = new PaymentService();

export async function POST(req: NextRequest) {
    const startTime = Date.now();

    // Extract raw body for signature verification
    const rawBody = await req.text();

    // Extract Headers for PayPal Verification
    const headers = {
        'paypal-transmission-id': req.headers.get('paypal-transmission-id'),
        'paypal-transmission-time': req.headers.get('paypal-transmission-time'),
        'paypal-transmission-sig': req.headers.get('paypal-transmission-sig'),
        'paypal-cert-url': req.headers.get('paypal-cert-url'),
        'paypal-auth-algo': req.headers.get('paypal-auth-algo'),
    };

    console.log('[WEBHOOK_HIT] PayPal webhook received', {
        timestamp: new Date().toISOString(),
        bodyLength: rawBody.length,
    });

    try {
        const body = JSON.parse(rawBody);

        // Inject headers into body (or a special field to be extracted by provider)
        // so that PaymentService can pass it to verifyWebhookSignature
        // PaymentService uses `parsedBody.signature` as the signature string.
        // But PayPal needs all headers.
        // We will overload `signature` field or just pass these in `metadata` or similar?
        // Actually PaymentService logic is: 
        // const signature = parsedBody.signature || '';
        // isValid = provider.verifyWebhookSignature(parsedBody, signature);

        // So we can pass the main signature as `signature`.
        // And we can attach other headers to the body object (it's just a JS object now).
        // Since we parsed it, we can mutate it.
        const bodyWithHeaders = {
            ...body,
            signature: headers['paypal-transmission-sig'], // Matches logic in service
            ...headers // Pass other headers as top level props for provider to read
        };

        const result = await paymentService.handleWebhook('paypal', rawBody, bodyWithHeaders);

        const duration = Date.now() - startTime;
        console.log('[WEBHOOK_SUCCESS] PayPal webhook processed', {
            duration_ms: duration,
            result,
        });

        return NextResponse.json({ ok: true }, { status: 200 });

    } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error('[WEBHOOK_ERROR] PayPal webhook failed', {
            error: error.message,
            duration_ms: duration,
        });

        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
