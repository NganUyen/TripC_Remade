/**
 * Single Booking Management API for Partners
 * GET /api/partner/hotel/bookings/[id] - Get booking details
 * PATCH /api/partner/hotel/bookings/[id] - Update booking status
 */

import { NextRequest, NextResponse } from "next/server";
import { updateBookingStatusSchema } from "@/lib/hotel-partner/validation";
import {
  getBooking,
  updateBookingStatus,
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
 * GET /api/partner/hotel/bookings/[id]
 * Get booking details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const partnerId = getPartnerId(req);
    const bookingId = params.id;

    const booking = await getBooking(bookingId);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Booking not found",
          },
        },
        { status: 404 },
      );
    }

    // Verify hotel ownership
    const hotel = await getPartnerHotel(partnerId, booking.hotel_id);
    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ACCESS_DENIED",
            message: "Access denied to this booking",
          },
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: error.message || "Failed to fetch booking",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/partner/hotel/bookings/[id]
 * Update booking status
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const partnerId = getPartnerId(req);
    const bookingId = params.id;
    const body = await req.json();

    // Get existing booking
    const existingBooking = await getBooking(bookingId);
    if (!existingBooking) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Booking not found",
          },
        },
        { status: 404 },
      );
    }

    // Verify hotel ownership
    const hotel = await getPartnerHotel(partnerId, existingBooking.hotel_id);
    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ACCESS_DENIED",
            message: "Access denied to this booking",
          },
        },
        { status: 403 },
      );
    }

    // Validate request body
    const validation = updateBookingStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid booking data",
            details: validation.error.errors,
          },
        },
        { status: 422 },
      );
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["checked_in", "cancelled", "no_show"],
      checked_in: ["checked_out"],
      checked_out: [],
      cancelled: [],
      no_show: [],
    };

    const allowedStatuses = validTransitions[existingBooking.status] || [];
    if (!allowedStatuses.includes(validation.data.status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TRANSITION",
            message: `Cannot transition from ${existingBooking.status} to ${validation.data.status}`,
          },
        },
        { status: 400 },
      );
    }

    // Update booking
    const booking = await updateBookingStatus(
      bookingId,
      validation.data.status,
      validation.data.notes,
    );

    return NextResponse.json({
      success: true,
      data: booking,
      message: "Booking status updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_ERROR",
          message: error.message || "Failed to update booking",
        },
      },
      { status: 500 },
    );
  }
}
