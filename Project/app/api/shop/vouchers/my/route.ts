import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
    getAuthInfo
} from '@/lib/shop/utils';
import { userVouchers } from '../redeem/route';

export async function GET(request: NextRequest) {
    const { userId } = getAuthInfo(request);

    if (!userId) {
        return errorResponse('UNAUTHORIZED', 'Must be logged in', 401);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let vouchers = userVouchers.get(userId) || [];

    if (status) {
        vouchers = vouchers.filter(v => v.status === status);
    }

    // Check for expired vouchers
    const now = new Date();
    vouchers = vouchers.map(v => {
        if (v.status === 'active' && new Date(v.expires_at) < now) {
            return { ...v, status: 'expired' };
        }
        return v;
    });

    return successResponse(vouchers);
}
