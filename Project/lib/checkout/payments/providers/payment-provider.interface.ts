export interface CreatePaymentIntentResult {
    paymentUrl: string;
    providerTxnId: string;
    metadata?: any;
}

export interface WebhookResult {
    providerTxnId: string;
    status: 'success' | 'failed' | 'pending';
    amount: number;
    currency: string;
    metadata?: any;
}

export interface PaymentProvider {
    providerName: string;

    createPaymentIntent(
        bookingId: string,
        amount: number,
        currency: string,
        returnUrl: string
    ): Promise<CreatePaymentIntentResult>;

    verifyWebhookSignature(payload: any, signature: string): boolean;

    parseWebhook(body: any): WebhookResult;
}
