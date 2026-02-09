/**
 * Rate Management API for Partners
 * GET /api/partner/hotel/rates?room_id=&start_date=&end_date= - Get rates for a room
 * POST /api/partner/hotel/rates - Create/update rates (single or bulk)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createRateSchema,
  bulkUpdateRatesSchema,
} from "@/lib/hotel-partner/validation";
import {
  getRoomRates,
  upsertRates,
  bulkUpdateRates,
  getRoom,
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
 * GET /api/partner/hotel/rates
 * Get rates for a room within date range
 */
export async function GET(req: NextRequest) {
  try {
    const partnerId = getPartnerId(req);
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("room_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    if (!roomId || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_PARAMETERS",
            message: "room_id, start_date, and end_date are required",
          },
        },
        { status: 400 },
      );
    }

    // Verify room exists and partner has access
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

    const rates = await getRoomRates(roomId, startDate, endDate, partnerId);

    return NextResponse.json({
      success: true,
      data: rates,
      count: rates.length,
    });
  } catch (error: any) {
    console.error("Error fetching rates:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: error.message || "Failed to fetch rates",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/partner/hotel/rates
 * Create/update rates (supports both single and bulk operations)
 */
export async function POST(req: NextRequest) {
  try {
    const partnerId = getPartnerId(req);
    const body = await req.json();

    // Check if it's a bulk update or single rate
    const isBulkUpdate = body.start_date && body.end_date;

    if (isBulkUpdate) {
      // Bulk update
      const validation = bulkUpdateRatesSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid rate data",
              details: validation.error.errors,
            },
          },
          { status: 422 },
        );
      }

      const { room_id, start_date, end_date, ...rateData } = validation.data;

      // Verify room access
      const room = await getRoom(room_id);
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

      // Bulk update rates
      const rates = await bulkUpdateRates(
        room_id,
        partnerId,
        start_date,
        end_date,
        rateData,
      );

      return NextResponse.json(
        {
          success: true,
          data: rates,
          message: `${rates.length} rates updated successfully`,
        },
        { status: 201 },
      );
    } else {
      // Single rate create/update
      const validation = createRateSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid rate data",
              details: validation.error.errors,
            },
          },
          { status: 422 },
        );
      }

      // Verify room access
      const room = await getRoom(validation.data.room_id);
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

      // Create/update rate
      const rates = await upsertRates([
        {
          ...validation.data,
          partner_id: partnerId,
        },
      ]);

      return NextResponse.json(
        {
          success: true,
          data: rates[0],
          message: "Rate saved successfully",
        },
        { status: 201 },
      );
    }
  } catch (error: any) {
    console.error("Error saving rates:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SAVE_ERROR",
          message: error.message || "Failed to save rates",
        },
      },
      { status: 500 },
    );
  }
}
