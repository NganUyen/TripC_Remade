import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest, { params }: { params: { bookingId: string } }) {
    const supabase = createServiceSupabaseClient();
    const { bookingId } = params;

    const { data: booking, error } = await supabase
        .from('bookings')
        .select('status, payment_status')
        .eq('id', bookingId)
        .single();

    if (error || !booking) {
        return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
        ok: true,
        data: booking
    });
}
