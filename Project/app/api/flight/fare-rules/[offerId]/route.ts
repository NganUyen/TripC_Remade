/**
 * Fare Rules API
 * GET /api/flight/fare-rules/:offerId
 *
 * Returns detailed fare rules, cancellation policies, and restrictions
 * for a specific flight offer
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/flight/supabaseServerClient";

export async function GET(
  request: NextRequest,
  { params }: { params: { offerId: string } },
) {
  try {
    const { offerId } = params;

    if (!offerId) {
      return NextResponse.json(
        { error: "Offer ID is required" },
        { status: 400 },
      );
    }

    const supabase = createClient();

    // Get offer details with fare rules
    const { data: offer, error: offerError } = await supabase
      .from("flight_offers")
      .select(
        `
        *,
        flight:flights(*),
        fare_rules(*)
      `,
      )
      .eq("id", offerId)
      .single();

    if (offerError || !offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Format response
    const response = {
      offer_id: offer.id,
      price: {
        total: offer.total_price,
        base_fare: offer.base_fare,
        taxes_fees: offer.taxes_fees,
        currency: offer.currency,
      },
      flight: {
        origin: offer.flight.origin,
        destination: offer.flight.destination,
        departure_at: offer.flight.departure_at,
        arrival_at: offer.flight.arrival_at,
        airline: offer.flight.airline_name,
      },
      flexibility: {
        refundable: offer.refundable,
        changeable: offer.changeable,
        change_fee: offer.change_fee,
        cancellation_fee: offer.cancellation_fee,
      },
      baggage: {
        included: offer.baggage_included,
        checked_count: offer.fare_rules?.[0]?.checked_baggage_count || 0,
        checked_weight: offer.fare_rules?.[0]?.checked_baggage_weight || "N/A",
        carryon_count: offer.fare_rules?.[0]?.carryon_baggage_count || 1,
      },
      fare_rules: offer.fare_rules?.[0]
        ? {
            cancellation: {
              allowed: offer.fare_rules[0].cancellation_allowed,
              window_hours: offer.fare_rules[0].cancellation_window_hours,
              fee_percent: offer.fare_rules[0].cancellation_fee_percent,
              fee_fixed: offer.fare_rules[0].cancellation_fee_fixed,
              no_show_fee: offer.fare_rules[0].no_show_fee,
            },
            changes: {
              allowed: offer.fare_rules[0].changes_allowed,
              window_hours: offer.fare_rules[0].change_window_hours,
              fee_percent: offer.fare_rules[0].change_fee_percent,
              fee_fixed: offer.fare_rules[0].change_fee_fixed,
            },
            restrictions: {
              advance_purchase_days: offer.fare_rules[0].advance_purchase_days,
              minimum_stay_nights: offer.fare_rules[0].minimum_stay_nights,
              maximum_stay_nights: offer.fare_rules[0].maximum_stay_nights,
              saturday_night_stay_required:
                offer.fare_rules[0].saturday_night_stay_required,
            },
            seat_selection: {
              allowed: offer.fare_rules[0].seat_selection_allowed,
              fee: offer.fare_rules[0].seat_selection_fee,
            },
            amenities: {
              meal_included: offer.fare_rules[0].meal_included,
              lounge_access: offer.fare_rules[0].lounge_access,
              priority_boarding: offer.fare_rules[0].priority_boarding,
              fast_track_security: offer.fare_rules[0].fast_track_security,
            },
            full_text: offer.fare_rules[0].rules_text,
            html: offer.fare_rules[0].rules_html,
          }
        : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Fare rules API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
