/**
 * Single Hotel Management API for Partners
 * GET /api/partner/hotel/hotels/[id] - Get hotel details
 * PUT /api/partner/hotel/hotels/[id] - Update hotel
 * DELETE /api/partner/hotel/hotels/[id] - Delete hotel
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateHotelSchema } from '@/lib/hotel-partner/validation';
import {
  getPartnerHotel,
  updateHotel,
  deleteHotel,
} from '@/lib/hotel-partner/database';

function getPartnerId(req: NextRequest): string {
  const partnerId = req.headers.get('x-partner-id');
  if (!partnerId) {
    throw new Error('Partner ID not found');
  }
  return partnerId;
}

/**
 * GET /api/partner/hotel/hotels/[id]
 * Get hotel details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partnerId = getPartnerId(req);
    const hotelId = params.id;

    const hotel = await getPartnerHotel(partnerId, hotelId);

    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Hotel not found or access denied',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: hotel,
    });
  } catch (error: any) {
    console.error('Error fetching hotel:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error.message || 'Failed to fetch hotel',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/partner/hotel/hotels/[id]
 * Update hotel
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partnerId = getPartnerId(req);
    const hotelId = params.id;
    const body = await req.json();

    // Validate request body
    const validation = updateHotelSchema.safeParse(body);
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

    // Update hotel
    const hotel = await updateHotel(partnerId, hotelId, validation.data);

    return NextResponse.json({
      success: true,
      data: hotel,
      message: 'Hotel updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating hotel:', error);

    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Hotel not found or access denied',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error.message || 'Failed to update hotel',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/partner/hotel/hotels/[id]
 * Delete hotel (soft delete)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partnerId = getPartnerId(req);
    const hotelId = params.id;

    await deleteHotel(partnerId, hotelId);

    return NextResponse.json({
      success: true,
      message: 'Hotel deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting hotel:', error);

    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Hotel not found or access denied',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error.message || 'Failed to delete hotel',
        },
      },
      { status: 500 }
    );
  }
}
