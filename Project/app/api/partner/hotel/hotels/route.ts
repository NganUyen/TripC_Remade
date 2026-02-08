/**
 * Hotel Management API for Partners
 * GET /api/partner/hotel/hotels - List all hotels
 * POST /api/partner/hotel/hotels - Create new hotel
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHotelSchema } from '@/lib/hotel-partner/validation';
import {
  getPartnerHotels,
  createHotel,
} from '@/lib/hotel-partner/database';
import { ZodError } from 'zod';

// Note: Authentication middleware should be added here
// For now, we'll use a mock partner ID from headers
function getPartnerId(req: NextRequest): string {
  // TODO: Replace with actual authentication
  const partnerId = req.headers.get('x-partner-id');
  if (!partnerId) {
    throw new Error('Partner ID not found');
  }
  return partnerId;
}

/**
 * GET /api/partner/hotel/hotels
 * Get all hotels for the authenticated partner
 */
export async function GET(req: NextRequest) {
  try {
    const partnerId = getPartnerId(req);

    const hotels = await getPartnerHotels(partnerId);

    return NextResponse.json({
      success: true,
      data: hotels,
      count: hotels.length,
    });
  } catch (error: any) {
    console.error('Error fetching partner hotels:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error.message || 'Failed to fetch hotels',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/partner/hotel/hotels
 * Create a new hotel
 */
export async function POST(req: NextRequest) {
  try {
    const partnerId = getPartnerId(req);
    const body = await req.json();

    // Validate request body
    const validation = createHotelSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid hotel data',
            details: validation.error.errors,
          },
        },
        { status: 422 }
      );
    }

    // Create hotel
    const hotel = await createHotel(partnerId, validation.data);

    return NextResponse.json(
      {
        success: true,
        data: hotel,
        message: 'Hotel created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating hotel:', error);

    // Handle duplicate slug error
    if (error.code === '23505') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_SLUG',
            message: 'A hotel with this slug already exists',
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error.message || 'Failed to create hotel',
        },
      },
      { status: 500 }
    );
  }
}
