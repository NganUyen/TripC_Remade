import { NextRequest } from 'next/server';
import {
    successResponse,
    errorResponse,
} from '@/lib/shop/utils';
import { getUserAddresses, createAddress, getDbUserId } from '@/lib/shop';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return errorResponse('UNAUTHORIZED', 'Must be logged in', 401);
        }

        const userId = await getDbUserId(clerkId);
        if (!userId) {
            return errorResponse('USER_NOT_FOUND', 'User record not found', 404);
        }

        const addresses = await getUserAddresses(userId);
        return successResponse(addresses);
    } catch (error) {
        console.error('Addresses GET error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to fetch addresses', 500);
    }
}

export async function POST(request: NextRequest) {
    try {
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

        const { 
            full_name, 
            country, 
            city, 
            line1, 
            phone, 
            district, 
            line2, 
            postal_code, 
            label, 
            is_default 
        } = body;

        if (!full_name || !country || !city || !line1) {
            return errorResponse('INVALID_REQUEST', 'full_name, country, city, line1 required', 400);
        }

        const address = await createAddress(userId, {
            label: label || null,
            recipient_name: full_name,
            phone: phone || null,
            country_code: country,
            city,
            state_province: district || '',
            address_line1: line1,
            address_line2: line2 || null,
            postal_code: postal_code || null,
            is_default: is_default || false,
        });

        return successResponse(address, { status: 201 });
    } catch (error) {
        console.error('Addresses POST error:', error);
        return errorResponse('INTERNAL_ERROR', 'Failed to create address', 500);
    }
}
