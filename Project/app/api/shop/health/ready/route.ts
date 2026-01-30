import { NextResponse } from 'next/server';
import { generateRequestId } from '@/lib/shop/utils';

export async function GET() {
    return NextResponse.json({
        ready: true,
        dependencies: {
            database: true,
            cache: true,
            mock: true,
        },
        meta: {
            request_id: generateRequestId(),
        },
    });
}
