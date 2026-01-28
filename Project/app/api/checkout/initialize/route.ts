import { NextRequest, NextResponse } from 'next/server';
import { CheckoutService } from '@/lib/checkout/services/checkout.service';

const checkoutService = new CheckoutService();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Basic validation
        if (!body.serviceType || !body.userId) {
            return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
        }

        const result = await checkoutService.createBooking(body);

        return NextResponse.json({
            ok: true,
            data: result
        });
    } catch (error: any) {
        console.error('Checkout Init Error:', error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}
