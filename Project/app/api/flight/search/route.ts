/**
 * Flight Search API Endpoint
 *
 * GET /api/flight/search
 *
 * Search for available flights based on origin, destination, and date.
 * This endpoint is public and does not require authentication.
 *
 * Query Parameters:
 * - origin (required): IATA airport code (e.g., "SGN")
 * - destination (required): IATA airport code (e.g., "HAN")
 * - date (required): Departure date (YYYY-MM-DD format)
 * - cabin_class (optional): Economy, Business, First
 * - limit (optional): Results per page (default: 20, max: 100)
 * - offset (optional): Pagination offset (default: 0)
 *
 * @returns {JSON} Array of flight offers with flight details
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/flight/supabaseServerClient";
import { isValidIATACode } from "@/lib/flight/utils";

export const dynamic = "force-dynamic";

interface SearchParams {
  origin: string;
  destination: string;
  date: string;
  cabin_class?: string;
  limit: number;
  offset: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract and validate required parameters
    const origin = searchParams.get("origin")?.toUpperCase();
    const destination = searchParams.get("destination")?.toUpperCase();
    const date = searchParams.get("date");

    // Validation
    if (!origin || !destination || !date) {
      return NextResponse.json(
        {
          error: "Missing required parameters",
          message: "origin, destination, and date are required",
          example:
            "/api/flight/search?origin=SGN&destination=HAN&date=2026-02-20",
        },
        { status: 400 },
      );
    }

    // Validate IATA codes
    if (!isValidIATACode(origin)) {
      return NextResponse.json(
        {
          error: "Invalid origin airport code",
          message: "Must be 3-letter IATA code",
        },
        { status: 400 },
      );
    }

    if (!isValidIATACode(destination)) {
      return NextResponse.json(
        {
          error: "Invalid destination airport code",
          message: "Must be 3-letter IATA code",
        },
        { status: 400 },
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        {
          error: "Invalid date format",
          message: "Date must be in YYYY-MM-DD format",
        },
        { status: 400 },
      );
    }

    // Optional parameters
    const cabinClass = searchParams.get("cabin_class") || undefined;
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get("limit") || "20")),
      100,
    );
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0"));

    // Parse date to get start and end of day
    const departureDate = new Date(date);
    const nextDay = new Date(departureDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Build query
    let query = supabaseServerClient
      .from("flight_offers")
      .select(
        `
        id,
        offer_key,
        total_price,
        base_fare,
        taxes_fees,
        currency,
        seats_available,
        cabin_class,
        fare_family,
        fare_basis_code,
        booking_class,
        refundable,
        changeable,
        change_fee,
        cancellation_fee,
        baggage_included,
        provider,
        valid_until,
        created_at,
        flights:flight_id (
          id,
          airline_code,
          airline_name,
          flight_number,
          origin,
          origin_name,
          destination,
          destination_name,
          departure_at,
          arrival_at,
          duration_minutes,
          aircraft,
          status
        )
      `,
      )
      .gte("valid_until", new Date().toISOString())
      .gt("seats_available", 0);

    // Filter by cabin class if specified
    if (cabinClass) {
      query = query.eq("cabin_class", cabinClass);
    }

    // Execute query
    const {
      data: offers,
      error,
      count,
    } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Database query failed", message: error.message },
        { status: 500 },
      );
    }

    // Filter results by origin, destination, and date on the flights data
    const filteredOffers = (offers || []).filter((offer) => {
      const flight = offer.flights;
      if (!flight) return false;

      const flightDate = new Date(flight.departure_at);
      const matchesRoute =
        flight.origin === origin && flight.destination === destination;
      const matchesDate = flightDate >= departureDate && flightDate < nextDay;

      return matchesRoute && matchesDate;
    });

    // Sort by price (lowest first)
    filteredOffers.sort((a, b) => a.total_price - b.total_price);

    // Format response
    const response = {
      success: true,
      query: {
        origin,
        destination,
        date,
        cabin_class: cabinClass || "all",
      },
      results: {
        total: filteredOffers.length,
        limit,
        offset,
        offers: filteredOffers.map((offer) => ({
          offer_id: offer.id,
          price: {
            total: offer.total_price,
            base_fare: offer.base_fare,
            taxes_fees: offer.taxes_fees,
            currency: offer.currency,
          },
          seats_available: offer.seats_available,
          cabin_class: offer.cabin_class,
          fare_family: offer.fare_family,
          fare_basis_code: offer.fare_basis_code,
          booking_class: offer.booking_class,
          flexibility: {
            refundable: offer.refundable,
            changeable: offer.changeable,
            change_fee: offer.change_fee,
            cancellation_fee: offer.cancellation_fee,
          },
          baggage_included: offer.baggage_included,
          valid_until: offer.valid_until,
          flight: {
            id: offer.flights.id,
            airline: {
              code: offer.flights.airline_code,
              name: offer.flights.airline_name,
            },
            flight_number: offer.flights.flight_number,
            route: {
              origin: {
                code: offer.flights.origin,
                name: offer.flights.origin_name,
              },
              destination: {
                code: offer.flights.destination,
                name: offer.flights.destination_name,
              },
            },
            schedule: {
              departure: offer.flights.departure_at,
              arrival: offer.flights.arrival_at,
              duration_minutes: offer.flights.duration_minutes,
            },
            aircraft: offer.flights.aircraft,
            status: offer.flights.status,
          },
        })),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Search error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Internal server error", message: errorMessage },
      { status: 500 },
    );
  }
}
