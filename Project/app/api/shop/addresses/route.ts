import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
    getAuthInfo,
    generateRequestId
} from '@/lib/shop/utils';

// In-memory address store
const addresses: Map<string, any[]> = new Map();

export async function GET(request: NextRequest) {
    const { userId } = getAuthInfo(request);

    if (!userId) {
        return errorResponse('UNAUTHORIZED', 'Must be logged in', 401);
    }

    const userAddresses = addresses.get(userId) || [];
    return successResponse(userAddresses);
}

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

    const { full_name, country, city, line1, phone, district, line2, postal_code, label, is_default } = body;

    if (!full_name || !country || !city || !line1) {
        return errorResponse('INVALID_REQUEST', 'full_name, country, city, line1 required', 400);
    }

    const address = {
        id: `addr-${crypto.randomUUID().slice(0, 8)}`,
        label: label || null,
        full_name,
        phone: phone || null,
        country,
        city,
        district: district || null,
        line1,
        line2: line2 || null,
        postal_code: postal_code || null,
        is_default: is_default || false,
    };

    if (!addresses.has(userId)) {
        addresses.set(userId, []);
    }

    // If is_default, unset other defaults
    if (is_default) {
        addresses.get(userId)!.forEach(a => a.is_default = false);
    }

    addresses.get(userId)!.push(address);

    return successResponse(address, { status: 201 });
}
