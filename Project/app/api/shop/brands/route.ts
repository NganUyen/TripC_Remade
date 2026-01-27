import { NextResponse } from 'next/server';
import { getBrands } from '@/lib/shop/queries';
import { successResponse, errorResponse } from '@/lib/shop/utils';

export async function GET() {
    try {
        const brands = await getBrands();
        return successResponse(brands);
    } catch (error) {
        console.error('API Brands Error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to fetch brands', 500);
    }
}
