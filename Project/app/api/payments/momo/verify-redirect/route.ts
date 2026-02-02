import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from "@/lib/checkout/services/payment.service";
import { createServiceSupabaseClient } from "@/lib/supabase-server";

const paymentService = new PaymentService();

/**
 * POST /api/payments/momo/verify-redirect
 * 
 * Fallback endpoint for processing MoMo payment when webhook isn't available (localhost dev).
 * Called by frontend after redirect with MoMo params.
 * 
 * This serves as a backup when:
 * - MOMO_IPN_URL points to webhook.site (testing)
 * - Running on localhost (MoMo can't reach local server)
 */
export async function POST(req: NextRequest) {
    const startTime = Date.now();
    let orderId: string | undefined;

    try {
        const body = await req.json();
        orderId = body.orderId;
        const resultCode = body.resultCode;
        const signature = body.signature;

        console.log('[MOMO_REDIRECT_VERIFY_START]', {
            orderId,
            resultCode,
            hasSignature: !!signature,
        });

        if (!orderId) {
            return NextResponse.json({
                ok: false,
                error: 'Missing orderId'
            }, { status: 400 });
        }

        const supabase = createServiceSupabaseClient();

        // 1. Find the transaction
        const { data: txn, error: findError } = await supabase
            .from('payment_transactions')
            .select('*')
            .eq('provider', 'momo')
            .eq('provider_transaction_id', orderId)
            .single();

        if (findError || !txn) {
            console.error('[MOMO_REDIRECT_TXN_NOT_FOUND]', {
                orderId,
                error: findError?.message,
            });
            return NextResponse.json({
                ok: false,
                error: 'Transaction not found',
            }, { status: 404 });
        }

        console.log('[MOMO_REDIRECT_TXN_FOUND]', {
            orderId,
            txnId: txn.id,
            bookingId: txn.booking_id,
            currentStatus: txn.status,
        });

        // 2. Check if already processed
        if (txn.status === 'success') {
            console.log('[MOMO_REDIRECT_ALREADY_PROCESSED]', {
                orderId,
                bookingId: txn.booking_id,
            });
            return NextResponse.json({
                ok: true,
                status: 'already_processed',
                bookingId: txn.booking_id,
            });
        }

        // 3. Process payment based on resultCode
        const success = String(resultCode) === '0';
        const newStatus = success ? 'success' : 'failed';

        console.log('[MOMO_REDIRECT_PROCESSING]', {
            orderId,
            resultCode,
            success,
            newStatus,
        });

        // 4. Update transaction
        const { error: updateError } = await supabase
            .from('payment_transactions')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString(),
                metadata: {
                    ...(txn.metadata || {}),
                    redirectParams: body, // Store all redirect params
                    processedVia: 'redirect', // Mark how it was processed
                }
            })
            .eq('id', txn.id);

        if (updateError) {
            console.error('[MOMO_REDIRECT_UPDATE_FAILED]', {
                orderId,
                error: updateError.message,
            });
            throw new Error(`Failed to update transaction: ${updateError.message}`);
        }

        console.log('[MOMO_REDIRECT_TXN_UPDATED]', {
            orderId,
            newStatus,
        });

        // 5. Trigger settlement if successful
        if (success) {
            console.log('[MOMO_REDIRECT_SETTLEMENT_START]', {
                bookingId: txn.booking_id,
            });

            try {
                await paymentService['settlementService'].settleBooking(txn.booking_id);

                console.log('[MOMO_REDIRECT_SETTLEMENT_SUCCESS]', {
                    bookingId: txn.booking_id,
                });

                const duration = Date.now() - startTime;
                console.log('[MOMO_REDIRECT_VERIFY_SUCCESS]', {
                    orderId,
                    bookingId: txn.booking_id,
                    duration_ms: duration,
                });

                return NextResponse.json({
                    ok: true,
                    status: 'success',
                    bookingId: txn.booking_id,
                });
            } catch (settlementError: any) {
                console.error('[MOMO_REDIRECT_SETTLEMENT_FAILED]', {
                    bookingId: txn.booking_id,
                    error: settlementError.message,
                });
                throw settlementError;
            }
        } else {
            // Payment failed
            return NextResponse.json({
                ok: true,
                status: 'failed',
                message: body.message || 'Payment failed',
            });
        }

    } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error('[MOMO_REDIRECT_VERIFY_ERROR]', {
            orderId,
            error: error.message,
            duration_ms: duration,
        });

        return NextResponse.json({
            ok: false,
            error: error.message || 'Internal Server Error',
        }, { status: 500 });
    }
}
