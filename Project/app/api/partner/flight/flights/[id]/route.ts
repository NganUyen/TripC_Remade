/**
 * Single Flight API for Partners
 * GET /api/partner/flight/flights/[id] - Get flight details
 * PUT /api/partner/flight/flights/[id] - Update flight
 * DELETE /api/partner/flight/flights/[id] - Delete flight
 */

import { NextRequest, NextResponse } from "next/server";
import { updateFlightSchema } from "@/lib/flight-partner/validation";
import {
  getPartnerFlight,
  updateFlight,
  deleteFlight,
} from "@/lib/flight-partner/database";
import { ZodError } from "zod";

function getPartnerId(req: NextRequest): string {
  const partnerId = req.headers.get("x-partner-id");
  if (!partnerId) {
    throw new Error("Partner ID not found");
  }
  return partnerId;
}

/**
 * GET /api/partner/flight/flights/[id]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const partnerId = getPartnerId(req);
    const flight = await getPartnerFlight(partnerId, params.id);

    return NextResponse.json({
      success: true,
      data: flight,
    });
  } catch (error: any) {
    console.error("Error fetching flight:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: error.message || "Failed to fetch flight",
        },
      },
      { status: error.message.includes("not found") ? 404 : 500 },
    );
  }
}

/**
 * PUT /api/partner/flight/flights/[id]
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const partnerId = getPartnerId(req);
    const body = await req.json();

    const validatedData = updateFlightSchema.parse(body);
    const flight = await updateFlight(partnerId, params.id, validatedData);

    return NextResponse.json({
      success: true,
      data: flight,
      message: "Flight updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating flight:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: error.errors,
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_ERROR",
          message: error.message || "Failed to update flight",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/partner/flight/flights/[id]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const partnerId = getPartnerId(req);
    await deleteFlight(partnerId, params.id);

    return NextResponse.json({
      success: true,
      message: "Flight cancelled successfully",
    });
  } catch (error: any) {
    console.error("Error deleting flight:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DELETE_ERROR",
          message: error.message || "Failed to cancel flight",
        },
      },
      { status: 500 },
    );
  }
}
