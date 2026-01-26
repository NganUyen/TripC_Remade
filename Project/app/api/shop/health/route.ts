import { NextResponse } from 'next/server';
import { generateRequestId } from '@/lib/shop/utils';

export async function GET() {
    return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        meta: {
            request_id: generateRequestId(),
        },
    });
}
