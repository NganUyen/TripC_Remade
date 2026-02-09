/**
 * Flight Management API for Partners
 * GET /api/partner/flight/flights - List all flights
 * POST /api/partner/flight/flights - Create new flight
 */

import { NextRequest, NextResponse } from "next/server";
import { createFlightSchema } from "@/lib/flight-partner/validation";
import { getPartnerFlights, createFlight } from "@/lib/flight-partner/database";
import { ZodError } from "zod";

// Note: Authentication middleware should be added here
function getPartnerId(req: NextRequest): string {
  // TODO: Replace with actual authentication
  const partnerId = req.headers.get("x-partner-id");
  if (!partnerId) {
    throw new Error("Partner ID not found");
  }
  return partnerId;
}

/**
 * GET /api/partner/flight/flights
 * Get all flights for the authenticated partner
 */
export async function GET(req: NextRequest) {
  try {
    const partnerId = getPartnerId(req);

    const flights = await getPartnerFlights(partnerId);

    return NextResponse.json({
      success: true,
      data: flights,
      count: flights.length,
    });
  } catch (error: any) {
    console.error("Error fetching partner flights:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: error.message || "Failed to fetch flights",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/partner/flight/flights
 * Create a new flight
 */
export async function POST(req: NextRequest) {
  try {
    const partnerId = getPartnerId(req);
    const body = await req.json();

    // Validate input
    const validatedData = createFlightSchema.parse(body);

    const flight = await createFlight(partnerId, validatedData);

    return NextResponse.json(
      {
        success: true,
        data: flight,
        message: "Flight created successfully",
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating flight:", error);

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
          code: "CREATE_ERROR",
          message: error.message || "Failed to create flight",
        },
      },
      { status: 500 },
    );
  }
}
