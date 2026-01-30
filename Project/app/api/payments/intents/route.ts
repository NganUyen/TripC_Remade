import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from "@/lib/checkout/services/payment.service";

const paymentService = new PaymentService();

export async function POST(req: NextRequest) {
    try {
        const { bookingId, provider, returnUrl } = await req.json();

        if (!bookingId || !provider || !returnUrl) {
            return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
        }

        const result = await paymentService.createPaymentIntent(bookingId, provider, returnUrl);

        return NextResponse.json({
            ok: true,
            data: result
        });
    } catch (error: any) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
