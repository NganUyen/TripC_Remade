import { successResponse, shopData, money } from '@/lib/shop/utils';

export async function GET() {
    const methods = shopData.shipping_methods
        .filter(m => m.is_active)
        .map(m => ({
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
