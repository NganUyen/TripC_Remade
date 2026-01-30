import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
} from '@/lib/shop/utils';
import { getDbUserId, redeemVoucher } from '@/lib/shop';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
        return errorResponse('UNAUTHORIZED', 'Must be logged in', 401);
    }

    const userId = await getDbUserId(clerkId);
    if (!userId) {
        return errorResponse('USER_NOT_FOUND', 'User record not found', 404);
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return errorResponse('INVALID_BODY', 'Invalid JSON body', 400);
    }

    const { template_id } = body;
    if (!template_id) {
        return errorResponse('INVALID_REQUEST', 'template_id required', 400);
    }

    // Get user balance
    const supabase = createServiceSupabaseClient();
    const { data: user } = await supabase.from('users').select('tcent_balance').eq('id', userId).single();
    const balance = user?.tcent_balance || 0;

    try {
        const result = await redeemVoucher(userId, template_id, balance);
        return successResponse(result, { status: 201 });
    } catch (err: any) {
        if (err.message.includes('Insufficient')) {
            return errorResponse('INSUFFICIENT_FUNDS', err.message, 409);
        }
        if (err.message.includes('found') || err.message.includes('inactive')) {
            return errorResponse('VOUCHER_NOT_AVAILABLE', err.message, 404);
        }
        return errorResponse('INTERNAL_ERROR', err.message, 500);
    }
}
