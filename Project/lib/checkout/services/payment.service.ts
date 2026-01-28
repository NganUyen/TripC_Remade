import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { MomoPaymentProvider } from '../payments/providers/momo-provider';
import { SettlementService } from './settlement.service';

export class PaymentService {
    private supabase;
    private settlementService;
    private providers: Record<string, any>; // Map string to Provider Interface

    constructor() {
        this.supabase = createServiceSupabaseClient();
        this.settlementService = new SettlementService(this.supabase);
        this.providers = {
            'momo': new MomoPaymentProvider()
        };
    }

    async createPaymentIntent(bookingId: string, providerName: string, returnUrl: string) {
        const provider = this.providers[providerName];
        if (!provider) throw new Error(`Provider ${providerName} not supported`);

        // 1. Get payment details from booking
        const { data: booking, error } = await this.supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (error || !booking) throw new Error('Booking not found');
        if (booking.payment_status === 'paid') throw new Error('Booking already paid');

        // 2. Create Intent with Provider
        const result = await provider.createPaymentIntent(
            bookingId,
            Number(booking.total_amount),
            booking.currency,
            returnUrl
        );

        // 3. Save Transaction Record (Pending)
        const { error: txError } = await this.supabase
            .from('payment_transactions')
            .insert({
                booking_id: bookingId,
                provider: providerName,
                provider_transaction_id: result.providerTxnId,
                amount: Number(booking.total_amount),
                currency: booking.currency,
                status: 'pending',
                metadata: result.metadata
            });

        if (txError) throw new Error(`Failed to save transaction: ${txError.message}`);

        return result;
    }

    async handleWebhook(providerName: string, rawBody: any, parsedBody: any) {
        const provider = this.providers[providerName];
        if (!provider) throw new Error('Provider not found');

        // 1. Verify Signature
        const signature = parsedBody.signature || '';
        const isValid = provider.verifyWebhookSignature(parsedBody, signature);

        console.log('[WEBHOOK_SIGNATURE_VERIFICATION]', {
            provider: providerName,
            orderId: parsedBody.orderId,
            signatureValid: isValid,
            receivedSignature: signature.substring(0, 16) + '...',
        });

        if (!isValid) {
            console.error('[WEBHOOK_SIGNATURE_INVALID]', {
                provider: providerName,
                orderId: parsedBody.orderId,
            });
            throw new Error('Invalid signature');
        }

        // 2. Parse Event
        const { providerTxnId, status, amount } = provider.parseWebhook(parsedBody);

        console.log('[WEBHOOK_PARSED_EVENT]', {
            provider: providerName,
            providerTxnId,
            status,
            amount,
        });

        // 3. Find Transaction
        const { data: txn, error: findError } = await this.supabase
            .from('payment_transactions')
            .select('*')
            .eq('provider', providerName)
            .eq('provider_transaction_id', providerTxnId)
            .single();

        if (findError || !txn) {
            console.error('[WEBHOOK_TXN_NOT_FOUND]', {
                provider: providerName,
                providerTxnId,
                error: findError?.message,
            });

            // Store WEBHOOK_UNMATCHED event for audit
            const bookingIdMatch = parsedBody.orderInfo?.match(/Booking\s+([a-f0-9-]+)/i);
            const bookingId = bookingIdMatch ? bookingIdMatch[1] : null;

            if (bookingId) {
                await this.supabase
                    .from('booking_events')
                    .insert({
                        booking_id: bookingId,
                        event_type: 'WEBHOOK_UNMATCHED',
                        metadata: { providerTxnId, provider: providerName }
                    });
            }

            throw new Error('Transaction not found');
        }

        console.log('[WEBHOOK_TXN_MATCHED]', {
            provider: providerName,
            txnId: txn.id,
            bookingId: txn.booking_id,
            currentStatus: txn.status,
        });

        // 4. Idempotency check
        if (txn.status === 'success') {
            console.log('[WEBHOOK_ALREADY_PROCESSED]', {
                provider: providerName,
                txnId: txn.id,
                bookingId: txn.booking_id,
            });
            return { status: 'already_processed' };
        }

        // 5. Update Transaction
        const dbTxStatus = status === 'success' ? 'success' : 'failed';

        const { error: updateError } = await this.supabase
            .from('payment_transactions')
            .update({
                status: dbTxStatus,
                webhook_payload: parsedBody,
                updated_at: new Date().toISOString()
            })
            .eq('id', txn.id);

        if (updateError) {
            console.error('[WEBHOOK_TXN_UPDATE_FAILED]', {
                provider: providerName,
                txnId: txn.id,
                error: updateError.message,
                code: updateError.code,
            });
            throw new Error(`Failed to update transaction: ${updateError.message}`);
        }

        console.log('[WEBHOOK_TXN_UPDATED]', {
            provider: providerName,
            txnId: txn.id,
            bookingId: txn.booking_id,
            newStatus: dbTxStatus,
        });

        // 6. Trigger Settlement if success
        if (dbTxStatus === 'success') {
            console.log('[WEBHOOK_SETTLEMENT_START]', {
                provider: providerName,
                bookingId: txn.booking_id,
            });

            try {
                await this.settlementService.settleBooking(txn.booking_id);

                console.log('[WEBHOOK_SETTLEMENT_SUCCESS]', {
                    provider: providerName,
                    bookingId: txn.booking_id,
                });
            } catch (settlementError: any) {
                console.error('[WEBHOOK_SETTLEMENT_FAILED]', {
                    provider: providerName,
                    bookingId: txn.booking_id,
                    error: settlementError.message,
                    stack: settlementError.stack,
                });
                throw settlementError;
            }
        }

        return { status: dbTxStatus };
    }
}
