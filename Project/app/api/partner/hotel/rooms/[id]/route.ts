/**
 * Single Room Management API for Partners
 * GET /api/partner/hotel/rooms/[id] - Get room details
 * PUT /api/partner/hotel/rooms/[id] - Update room
 * DELETE /api/partner/hotel/rooms/[id] - Delete room
 */

import { NextRequest, NextResponse } from "next/server";
import { updateRoomSchema } from "@/lib/hotel-partner/validation";
import {
  getRoom,
  updateRoom,
  deleteRoom,
  getPartnerHotel,
} from "@/lib/hotel-partner/database";

function getPartnerId(req: NextRequest): string {
  const partnerId = req.headers.get("x-partner-id");
  if (!partnerId) {
    throw new Error("Partner ID not found");
  }
  return partnerId;
}

/**
 * GET /api/partner/hotel/rooms/[id]
 * Get room details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const partnerId = getPartnerId(req);
    const roomId = params.id;

    const room = await getRoom(roomId);

    if (!room) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Room not found",
          },
        },
        { status: 404 },
      );
    }

    // Verify hotel ownership
    const hotel = await getPartnerHotel(partnerId, room.hotel_id);
    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ACCESS_DENIED",
            message: "Access denied to this room",
          },
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      data: room,
    });
  } catch (error: any) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: error.message || "Failed to fetch room",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/partner/hotel/rooms/[id]
 * Update room
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const partnerId = getPartnerId(req);
    const roomId = params.id;
    const body = await req.json();

    // Get existing room
    const existingRoom = await getRoom(roomId);
    if (!existingRoom) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Room not found",
          },
        },
        { status: 404 },
      );
    }

    // Verify hotel ownership
    const hotel = await getPartnerHotel(partnerId, existingRoom.hotel_id);
    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ACCESS_DENIED",
            message: "Access denied to this room",
          },
        },
        { status: 403 },
      );
    }

    // Validate request body
    const validation = updateRoomSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid room data",
            details: validation.error.errors,
          },
        },
        { status: 422 },
      );
    }

    // Update room
    const room = await updateRoom(roomId, validation.data);

    return NextResponse.json({
      success: true,
      data: room,
      message: "Room updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating room:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_ERROR",
          message: error.message || "Failed to update room",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/partner/hotel/rooms/[id]
 * Delete room
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const partnerId = getPartnerId(req);
    const roomId = params.id;

    // Get existing room
    const existingRoom = await getRoom(roomId);
    if (!existingRoom) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Room not found",
          },
        },
        { status: 404 },
      );
    }

    // Verify hotel ownership
    const hotel = await getPartnerHotel(partnerId, existingRoom.hotel_id);
    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ACCESS_DENIED",
            message: "Access denied to this room",
          },
        },
        { status: 403 },
      );
    }

    await deleteRoom(roomId);

    return NextResponse.json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DELETE_ERROR",
          message: error.message || "Failed to delete room",
        },
      },
      { status: 500 },
    );
  }
}
