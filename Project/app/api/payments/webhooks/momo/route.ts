import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from "@/lib/checkout/services/payment.service";
import { createServiceSupabaseClient } from "@/lib/supabase-server";

const paymentService = new PaymentService();

/**
 * MoMo IPN Webhook Handler
 * 
 * CRITICAL: This endpoint must be publicly accessible for MoMo to call.
 * Set MOMO_IPN_URL to: https://<your-domain>/api/payments/webhooks/momo
 * 
 * For local development, use ngrok: ngrok http 3000
 * Then set MOMO_IPN_URL=https://<ngrok-id>.ngrok.io/api/payments/webhooks/momo
 */
export async function POST(req: NextRequest) {
    const startTime = Date.now();
    const supabase = createServiceSupabaseClient();
    
    // Extract raw body FIRST (before any parsing) for signature verification
    const rawBody = await req.text();
    
    // Initial logging - BEFORE any processing
    console.log('[WEBHOOK_HIT] MoMo webhook received', {
        timestamp: new Date().toISOString(),
        bodyLength: rawBody.length,
        contentType: req.headers.get('content-type'),
        userAgent: req.headers.get('user-agent'),
    });

    let body: any;
    let bookingId: string | null = null;
    let orderId: string | null = null;

    try {
        // 1. Parse body
        try {
            body = JSON.parse(rawBody);
        } catch (parseError) {
            console.error('[WEBHOOK_ERROR] Invalid JSON body', { 
                rawBody: rawBody.substring(0, 500),
                error: parseError 
            });
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        // 2. Extract identifiers for logging
        orderId = body.orderId || null;
        const requestId = body.requestId || null;
        const transId = body.transId || null;
        const resultCode = body.resultCode;
        const amount = body.amount;
        
        // Extract booking ID from orderInfo (format: "Booking <uuid>")
        const orderInfoMatch = body.orderInfo?.match(/Booking\s+([a-f0-9-]+)/i);
        bookingId = orderInfoMatch ? orderInfoMatch[1] : null;

        console.log('[WEBHOOK_PARSED] MoMo payload', {
            provider: 'momo',
            booking_id: bookingId,
            orderId,
            requestId,
            transId,
            resultCode,
            amount,
            message: body.message,
            payType: body.payType,
        });

        // 3. Record WEBHOOK_HIT event BEFORE verification (to prove request arrived)
        if (bookingId) {
            const { error: auditError } = await supabase
                .from('booking_events')
                .insert({
                    booking_id: bookingId,
                    event_type: 'WEBHOOK_HIT',
                    // Note: Can't use metadata column if it doesn't exist; 
                    // the event_type itself proves the hit
                })
                .single();
            
            // Ignore duplicate key error (idempotent)
            if (auditError && auditError.code !== '23505') {
                console.warn('[WEBHOOK_AUDIT] Failed to record WEBHOOK_HIT', { 
                    booking_id: bookingId, 
                    error: auditError 
                });
            } else {
                console.log('[WEBHOOK_AUDIT] WEBHOOK_HIT recorded', { booking_id: bookingId });
            }
        }

        // 4. Store raw webhook payload for audit (even before verification)
        if (orderId) {
            await supabase
                .from('payment_transactions')
                .update({
                    webhook_payload: body,
                    updated_at: new Date().toISOString(),
                })
                .eq('provider', 'momo')
                .eq('provider_transaction_id', orderId);
        }

        // 5. Process webhook through service (includes signature verification)
        const result = await paymentService.handleWebhook('momo', rawBody, body);

        const duration = Date.now() - startTime;
        console.log('[WEBHOOK_SUCCESS] MoMo webhook processed', {
            provider: 'momo',
            booking_id: bookingId,
            orderId,
            resultCode,
            duration_ms: duration,
            result,
        });

        // MoMo expects 200 or 204 for success
        return NextResponse.json({ 
            ok: true,
            message: 'Webhook processed successfully',
        }, { status: 200 });

    } catch (error: any) {
        const duration = Date.now() - startTime;
        const errorMessage = error.message || 'Unknown error';
        
        console.error('[WEBHOOK_ERROR] MoMo webhook failed', {
            provider: 'momo',
            booking_id: bookingId,
            orderId,
            error: errorMessage,
            stack: error.stack,
            duration_ms: duration,
        });

        // Log failure event if we have booking_id
        if (bookingId) {
            await supabase
                .from('booking_events')
                .upsert({
                    booking_id: bookingId,
                    event_type: 'WEBHOOK_FAILED',
                }, { onConflict: 'booking_id, event_type', ignoreDuplicates: true });
        }

        // Return appropriate status based on error type
        if (errorMessage === 'Invalid signature') {
            // 400 for invalid signature - MoMo should not retry
            return NextResponse.json({ 
                ok: false, 
                error: 'Invalid signature' 
            }, { status: 400 });
        }
        
        if (errorMessage === 'Transaction not found') {
            // 404 - Transaction doesn't exist
            return NextResponse.json({ 
                ok: false, 
                error: 'Transaction not found' 
            }, { status: 404 });
        }

        // 500 for transient errors - MoMo will retry
        return NextResponse.json({ 
            ok: false, 
            error: errorMessage 
        }, { status: 500 });
    }
}
