import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
    getAuthInfo,
    shopData
} from '@/lib/shop/utils';

// In-memory user vouchers
const userVouchers: Map<string, any[]> = new Map();

export async function POST(request: NextRequest) {
    const { userId } = getAuthInfo(request);

    if (!userId) {
        return errorResponse('UNAUTHORIZED', 'Must be logged in', 401);
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

    const template = shopData.voucher_templates.find(t => t.id === template_id);
    if (!template || !template.is_active) {
        return errorResponse('VOUCHER_NOT_AVAILABLE', 'Voucher template not found or inactive', 400);
    }

    // Check inventory
    if (template.total_inventory && template.redeemed_count >= template.total_inventory) {
        return errorResponse('VOUCHER_NOT_AVAILABLE', 'Voucher out of stock', 400);
    }

    // Mock: check TripCent balance (always pass in mock)
    // In real impl: check users.tcent_balance >= template.tcent_cost

    const voucher = {
        id: `voucher-${crypto.randomUUID().slice(0, 8)}`,
        unique_code: `V-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        status: 'active',
        template: {
            id: template.id,
            title: template.title,
            description: template.description,
            tcent_cost: template.tcent_cost,
            discount_mode: template.discount_mode,
            discount_value: template.discount_value,
            currency: template.currency,
            min_spend_threshold: template.min_spend_threshold,
            validity_days: template.validity_days,
        },
        acquired_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + template.validity_days * 24 * 60 * 60 * 1000).toISOString(),
        used_at: null,
    };

    if (!userVouchers.has(userId)) {
        userVouchers.set(userId, []);
    }
    userVouchers.get(userId)!.push(voucher);

    return successResponse(voucher, { status: 201 });
}

export { userVouchers };
