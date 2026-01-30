import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from "@/lib/checkout/services/payment.service";
import { PaypalPaymentProvider } from '@/lib/checkout/payments/providers/paypal-provider';
import { SettlementService } from '@/lib/checkout/services/settlement.service';
import { createServiceSupabaseClient } from '@/lib/supabase-server';

const paymentService = new PaymentService();

/**
 * POST /api/payments/sync
 * Manually sync/capture a payment when webhook is unavailable (e.g. localhost)
 */
export async function POST(req: NextRequest) {
    const startTime = Date.now();
    const supabase = createServiceSupabaseClient();

    try {
        const body = await req.json();
        const { token, payerId, provider } = body;

        console.log('[API_SYNC_START]', { token, payerId, provider });

        if (provider === 'paypal') {
            // 1. Capture/Verify Order with PayPal
            // We need to instantiate the provider manually or expose a method in service
            // Since PaymentService doesn't expose `captureOrder` generically, we'll cast or use custom logic
            // Ideally PaymentService should have `syncPayment(bookingId, provider, data)`

            // For now, let's use the provider directly for the "Sync" logic 
            // OR reuse the provider instance from the service (but it's private).
            const paypalProvider = new PaypalPaymentProvider();

            // Capture the order
            // Note: If already captured, this handles it gracefully ideally
            console.log('[API_SYNC_CAPTURING]', { token });
            const captureResult = await paypalProvider.captureOrder(token);

            console.log('[API_SYNC_CAPTURE_RESULT]', {
                status: captureResult.status,
                id: captureResult.id
            });

            if (captureResult.status === 'COMPLETED') {
                // 2. Find associated booking/transaction and Settle
                // We need to find which booking this order belongs to.
                // We can search payment_transactions by provider_transaction_id = token (Order ID)
                // OR we can rely on the reference_id in the capture result if PayPal returns it?
                // PayPal capture response usually has `purchase_units[0].reference_id` which is our bookingId

                const bookingId = captureResult.purchase_units?.[0]?.reference_id;

                if (!bookingId) {
                    // Fallback: search DB
                    const { data: txn } = await supabase
                        .from('payment_transactions')
                        .select('booking_id')
                        .eq('provider_transaction_id', token)
                        .single();

                    if (!txn) throw new Error('Transaction not found for Order ID');
                    // bookingId = txn.booking_id; // Const reassignment error if I used const
                }

                const finalBookingId = bookingId || captureResult.purchase_units?.[0]?.reference_id;

                if (!finalBookingId) throw new Error('Could not determine Booking ID');

                console.log('[API_SYNC_SETTLING]', { finalBookingId });

                // Update transaction status
                await supabase
                    .from('payment_transactions')
                    .update({ status: 'success', metadata: captureResult })
                    .eq('provider_transaction_id', token);

                // Settle
                const settlementService = new SettlementService(supabase);
                await settlementService.settleBooking(finalBookingId);

                return NextResponse.json({ ok: true, status: 'success', bookingId: finalBookingId });
            }

            return NextResponse.json({ ok: false, error: 'Payment not completed', details: captureResult });
        }

        return NextResponse.json({ ok: false, error: 'Provider not supported for sync' }, { status: 400 });

    } catch (error: any) {
        console.error('[API_SYNC_ERROR]', error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
