/**
 * Room Management API for Partners
 * GET /api/partner/hotel/rooms?hotel_id= - List rooms for a hotel
 * POST /api/partner/hotel/rooms - Create new room
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRoomSchema } from '@/lib/hotel-partner/validation';
import {
  getHotelRooms,
  createRoom,
  getPartnerHotel,
} from '@/lib/hotel-partner/database';

function getPartnerId(req: NextRequest): string {
  const partnerId = req.headers.get('x-partner-id');
  if (!partnerId) {
    throw new Error('Partner ID not found');
  }
  return partnerId;
}

/**
 * GET /api/partner/hotel/rooms?hotel_id=xxx
 * Get all rooms for a hotel
 */
export async function GET(req: NextRequest) {
  try {
    const partnerId = getPartnerId(req);
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get('hotel_id');

    if (!hotelId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PARAMETER',
            message: 'hotel_id parameter is required',
          },
        },
        { status: 400 }
      );
    }

    // Verify hotel ownership
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

    const rooms = await getHotelRooms(hotelId);

    return NextResponse.json({
      success: true,
      data: rooms,
      count: rooms.length,
    });
  } catch (error: any) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error.message || 'Failed to fetch rooms',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/partner/hotel/rooms
 * Create a new room
 */
export async function POST(req: NextRequest) {
  try {
    const partnerId = getPartnerId(req);
    const body = await req.json();

    // Validate request body
    const validation = createRoomSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid room data',
            details: validation.error.errors,
          },
        },
        { status: 422 }
      );
    }

    // Verify hotel ownership
    const hotel = await getPartnerHotel(partnerId, validation.data.hotel_id);
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

    // Create room
    const room = await createRoom(validation.data);

    return NextResponse.json(
      {
        success: true,
        data: room,
        message: 'Room created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating room:', error);

    // Handle duplicate room code error
    if (error.code === '23505') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_CODE',
            message: 'A room with this code already exists for this hotel',
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
          message: error.message || 'Failed to create room',
        },
      },
      { status: 500 }
    );
  }
}
