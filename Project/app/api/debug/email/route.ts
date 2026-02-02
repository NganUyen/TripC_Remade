
import { NextResponse } from 'next/server';
import { unifiedEmailService } from '@/lib/email/unified-email-service';

export async function POST(reqRequest: Request) {
    try {
        const body = await reqRequest.json();
        const { email, name } = body;

        if (!email) {
            return NextResponse.json({ ok: false, error: 'Missing email' }, { status: 400 });
        }

        console.log('[DEBUG_EMAIL_API] Attempting test email to:', email);

        const result = await unifiedEmailService.sendBookingEmail({
            category: 'test',
            guest_name: name || 'Test User',
            guest_email: email,
            booking_code: 'TEST-CODE-123',
            title: 'Test Email Service',
            description: 'This is a test to verify Nodemailer and SMTP configuration.',
            start_date: new Date().toISOString(),
            total_amount: 0,
            currency: 'USD'
        });

        console.log('[DEBUG_EMAIL_API] Result:', result);

        return NextResponse.json({
            ok: result.success,
            messageId: (result as any).messageId,
            error: (result as any).error
        });
    } catch (err: any) {
        console.error('[DEBUG_EMAIL_API] Fatal Error:', err);
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
}
