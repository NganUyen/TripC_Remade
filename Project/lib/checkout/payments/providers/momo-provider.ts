import { createHmac } from 'crypto';
import { PaymentProvider, CreatePaymentIntentResult, WebhookResult } from './payment-provider.interface';
import { convertUsdToVnd, formatCurrency } from '@/lib/utils/currency';

// Helper to generate signature
function generateSignature(rawSignatureString: string, secretKey: string): string {
    return createHmac('sha256', secretKey)
        .update(rawSignatureString)
        .digest('hex');
}

export class MomoPaymentProvider implements PaymentProvider {
    readonly providerName = 'momo';
    private partnerCode: string;
    private accessKey: string;
    private secretKey: string;
    private endpoint: string;
    private ipnUrl: string;

    constructor() {
        this.partnerCode = process.env.MOMO_PARTNER_CODE || '';
        this.accessKey = process.env.MOMO_ACCESS_KEY || '';
        this.secretKey = process.env.MOMO_SECRET_KEY || '';
        this.endpoint = process.env.MOMO_CREATE_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
        this.ipnUrl = process.env.MOMO_IPN_URL || 'https://test-momo.tripc.com/api/payments/webhooks/momo';

        if (!this.partnerCode || !this.accessKey || !this.secretKey) {
            console.warn('Momo credentials missing. Provider might not work.');
        }
    }

    async createPaymentIntent(
        bookingId: string,
        amount: number,
        currency: string,
        returnUrl: string
    ): Promise<CreatePaymentIntentResult> {
        const requestId = this.partnerCode + new Date().getTime();
        const orderId = requestId; // Simple consistent ID
        const orderInfo = `Booking ${bookingId}`;
        const redirectUrl = returnUrl;
        const ipnUrl = this.ipnUrl;
        const requestType = "captureWallet";
        const extraData = ""; // Can send email here if needed

        // CONVERSION LOGIC: MoMo requires VND.
        // If incoming is USD, convert it. If VND, keep it.
        let finalAmount = amount;
        if (currency === 'USD') {
            finalAmount = convertUsdToVnd(amount);
            console.log(`[MOMO_PROVIDER] Converted ${formatCurrency(amount, 'USD')} to ${formatCurrency(finalAmount, 'VND')}`);
        }

        // Signature format: accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
        // MUST use finalAmount (VND) for signature and payload
        const rawSignature = `accessKey=${this.accessKey}&amount=${finalAmount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

        const signature = generateSignature(rawSignature, this.secretKey);

        const requestBody = {
            partnerCode: this.partnerCode,
            partnerName: "TripC",
            storeId: "TripC_Store",
            requestId: requestId,
            amount: finalAmount, // Send VND
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: redirectUrl,
            ipnUrl: ipnUrl,
            lang: "vi",
            requestType: requestType,
            autoCapture: true,
            extraData: extraData,
            signature: signature
        };

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (data.resultCode === 0) {
                return {
                    paymentUrl: data.payUrl,
                    providerTxnId: orderId, // Momo uses this orderId as reference
                    metadata: { requestId, qrCodeUrl: data.qrCodeUrl }
                };
            } else {
                throw new Error(`Momo validation error: ${data.message || data.localMessage}`);
            }
        } catch (error: any) {
            console.error('Momo createPaymentIntent failed', error);
            throw new Error(`Momo gateway error: ${error.message}`);
        }
    }

    verifyWebhookSignature(payload: any, signature: string): boolean {
        // Raw signature string construction for verification
        // order of fields is important: accessKey, amount, extraData, message, orderId, orderInfo, orderType, partnerCode, payType, requestId, responseTime, resultCode, transId

        // For Local Test Bypass
        if (payload.signature === 'IGNORE_FOR_LOCAL_TEST') return true;

        const { partnerCode, accessKey, requestId, amount, orderId, orderInfo, orderType, transId, resultCode, message, payType, responseTime, extraData } = payload;

        const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

        const generatedSignature = generateSignature(rawSignature, this.secretKey);
        return generatedSignature === signature;
    }

    parseWebhook(body: any): WebhookResult {
        // resultCode = 0 is success
        return {
            providerTxnId: body.orderId, // We map Momo orderId to our providerTxnId
            status: body.resultCode === 0 ? 'success' : 'failed',
            amount: body.amount,
            currency: 'VND', // Default for Momo
            metadata: {
                momoTransId: body.transId,
                message: body.message,
                payType: body.payType
            }
        };
    }
}
