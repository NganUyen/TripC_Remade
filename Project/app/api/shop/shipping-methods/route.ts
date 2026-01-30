import { successResponse, money } from '@/lib/shop/utils';
import { getShippingMethods } from '@/lib/shop';
import { NextResponse } from 'next/server';

export async function GET() {
    const shippingMethods = await getShippingMethods();

    const methods = shippingMethods.map(m => ({
        id: m.id,
        code: m.code,
        title: m.title,
        description: m.description,
        base_fee: money(m.base_fee, m.currency),
        estimated_days_min: m.estimated_days_min,
        estimated_days_max: m.estimated_days_max,
    }));

    return successResponse(methods);
}
