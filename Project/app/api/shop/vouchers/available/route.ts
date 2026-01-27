import {
    successResponse,
    getAvailableVouchers,
} from '@/lib/shop';

export async function GET() {
    try {
        const vouchers = await getAvailableVouchers();
        return successResponse(vouchers);
    } catch (error) {
        console.error('Vouchers error:', error);
        return successResponse([]);
    }
}
