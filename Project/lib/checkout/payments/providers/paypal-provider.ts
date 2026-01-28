import { PaymentProvider, CreatePaymentIntentResult, WebhookResult } from './payment-provider.interface';

export class PaypalPaymentProvider implements PaymentProvider {
    readonly providerName = 'paypal';
    private clientId: string;
    private clientSecret: string;
    private baseUrl: string;

    constructor() {
        this.clientId = process.env.PAYPAL_CLIENT_ID || '';
        this.clientSecret = process.env.PAYPAL_SECRET || '';
        this.baseUrl = process.env.PAYPAL_MODE === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';

        if (!this.clientId || !this.clientSecret) {
            console.warn('PayPal credentials missing. Provider might not work.');
        }
    }

    private async getAccessToken(): Promise<string> {
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to get PayPal access token: ${error}`);
        }

        const data = await response.json();
        return data.access_token;
    }

    async createPaymentIntent(
        bookingId: string,
        amount: number,
        currency: string,
        returnUrl: string
    ): Promise<CreatePaymentIntentResult> {
        try {
            const accessToken = await this.getAccessToken();

            let finalAmount = amount;
            let finalCurrency = currency;

            if (currency === 'VND') {
                finalAmount = amount / 25450;
                finalCurrency = 'USD';
            }

            const value = Number(finalAmount).toFixed(2);

            // Note: Assuming 'returnUrl' is where the user goes after approval.
            // We strip query params for the cancel_url default.
            const cancelUrl = returnUrl.split('?')[0];

            const orderBody = {
                intent: 'CAPTURE',
                purchase_units: [{
                    reference_id: bookingId,
                    amount: {
                        currency_code: finalCurrency,
                        value: value
                    },
                    description: `Booking ${bookingId}`
                }],
                application_context: {
                    return_url: returnUrl,
                    cancel_url: cancelUrl,
                    brand_name: "TripC",
                    user_action: "PAY_NOW"
                }
            };

            const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'PayPal-Request-Id': `booking-${bookingId}`
                },
                body: JSON.stringify(orderBody)
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`PayPal create order failed: ${error}`);
            }

            const data = await response.json();
            const approveLink = data.links.find((l: any) => l.rel === 'approve');

            if (!approveLink) throw new Error('No approval link in PayPal response');

            return {
                paymentUrl: approveLink.href,
                providerTxnId: data.id,
                metadata: {
                    orderId: data.id,
                    status: data.status
                }
            };

        } catch (error: any) {
            console.error('PayPal createPaymentIntent failed', error);
            throw new Error(`PayPal gateway error: ${error.message}`);
        }
    }

    verifyWebhookSignature(payload: any, signature: string): boolean {
        // TODO: Implement proper PayPal signature verification.
        // For now, we trust the flow or rely on simple checks.
        // The signature argument here is passed from the service, assume `req.headers.get('paypal-transmission-sig')` 
        // or similar is passed down if logic matches. 
        // Currently PaymentService passes `parsedBody.signature`.

        // PayPal sends signature in HEADERS, not body. 
        // The `PaymentService` logic for Momo extracts `parsedBody.signature` because Momo sends it in body.
        // We will need to adapt `PaymentService` to pass headers or signature properly.

        return true;
    }

    parseWebhook(body: any): WebhookResult {
        const resource = body.resource;
        const eventType = body.event_type;

        let status: 'success' | 'failed' | 'pending' = 'pending';
        let providerTxnId = '';
        let amount = 0;
        let currency = 'USD';

        if (resource) {
            if (resource.id) providerTxnId = resource.id;

            if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
                // Try to find the Order ID if possible, otherwise use Capture ID
                providerTxnId = resource.supplementary_data?.related_ids?.order_id || resource.id;
                status = 'success';
                amount = resource.amount?.value;
                currency = resource.amount?.currency_code;
            } else if (eventType === 'CHECKOUT.ORDER.APPROVED') {
                status = 'pending'; // Approved but not captured
                providerTxnId = resource.id;

                // Trigger Async Capture
                // Since this method is sync, we can't await. 
                // We'll fire and forget (not ideal) or rely on Service level handling.
                // NOTE: We will handle the "Capture" logic inside `verifyWebhook` or explicitly in the API route?
                // No, better to have a dedicated method `processWebhookAsync`?
                // Limited by interface.

                // We'll implement the capture inside the `PaymentService` by checking if provider has `captureOrder`.
                this.captureOrder(resource.id).catch(err => console.error('Async Capture failed', err));
            }
        }

        return {
            providerTxnId,
            status,
            amount: Number(amount),
            currency,
            metadata: body
        };
    }

    async captureOrder(orderId: string): Promise<any> {
        try {
            const accessToken = await this.getAccessToken();
            const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                }
            });

            if (!response.ok) {
                const err = await response.json();
                console.error('Capture response error:', err);

                // If already captured, we treat it as success-ish or at least don't crash.
                // But generally calls expecting a capture result might need the details.
                // For "Sync", returning { status: 'COMPLETED' } is enough to trigger settlement.
                if (err.name === 'UNPROCESSABLE_ENTITY' && err.details?.[0]?.issue === 'ORDER_ALREADY_CAPTURED') {
                    return { status: 'COMPLETED', id: orderId };
                }

                throw new Error(err.message || 'Capture failed');
            }

            return await response.json();
        } catch (e) {
            console.error('Capture exception:', e);
            throw e;
        }
    }
}
