/**
 * Hotel Bookings API Endpoint
 *
 * POST /api/hotels/bookings - Create a new hotel booking
 *
 * Protected endpoint - requires Clerk authentication.
 *
 * Updated to support:
 * - Partner-based booking (requires partner_id)
 * - TCent earning and redemption
 * - Working Pass discounts
 * - Price comparison validation
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/hotel/supabaseServerClient";
import { verifyClerkAuth } from "@/lib/hotel/clerkAuth";
import {
  generateConfirmationCode,
  calculateNights,
  validateDateRange,
  calculateTotalPrice,
} from "@/lib/hotel/utils";
import {
  calculateTcentEarning,
  calculateTcentRedemption,
  calculateFinalBookingPrice,
  validateTcentRedemption,
  getPartnerEarnRate,
} from "@/lib/hotel/tcentCalculator";
import {
  validateWorkingPassEligibility,
  calculateWorkingPassBenefits,
} from "@/lib/hotel/workingPassValidator";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    let user;
    try {
      user = await verifyClerkAuth();
    } catch (authError) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication required to create bookings",
        },
        { status: 401 },
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON", message: "Request body must be valid JSON" },
        { status: 400 },
      );
    }

    const {
      hotel_id,
      room_id,
      partner_id, // NEW: Required partner selection
      check_in_date,
      check_out_date,
      guest_info,
      special_requests,
      tcent_to_use = 0, // NEW: TCent redemption
      has_working_pass = false, // NEW: Working Pass status
      user_tier = "standard", // NEW: User tier for TCent calculation
    } = body;

    // Validate required fields
    if (
      !hotel_id ||
      !room_id ||
      !partner_id || // NEW: Partner is required
      !check_in_date ||
      !check_out_date ||
      !guest_info
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message:
            "hotel_id, room_id, partner_id, check_in_date, check_out_date, and guest_info are required",
        },
        { status: 400 },
      );
    }

    // Validate guest info
    if (!guest_info.first_name || !guest_info.last_name || !guest_info.email) {
      return NextResponse.json(
        {
          error: "Invalid guest info",
          message:
            "first_name, last_name, and email are required in guest_info",
        },
        { status: 400 },
      );
    }

    // Validate dates
    if (!validateDateRange(check_in_date, check_out_date)) {
      return NextResponse.json(
        {
          error: "Invalid dates",
          message: "Check-out date must be after check-in date",
        },
        { status: 400 },
      );
    }

    // Check if hotel exists
    const { data: hotel } = await supabaseServerClient
      .from("hotels")
      .select("id, title")
      .eq("id", hotel_id)
      .single();

    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    // Check if room exists and belongs to hotel
    const { data: room } = await supabaseServerClient
      .from("hotel_rooms")
      .select("id, hotel_id, title, capacity")
      .eq("id", room_id)
      .eq("hotel_id", hotel_id)
      .single();

    if (!room) {
      return NextResponse.json(
        { error: "Room not found or does not belong to this hotel" },
        { status: 404 },
      );
    }

    // Calculate nights and fetch rates
    const nights = calculateNights(check_in_date, check_out_date);

    // Fetch partner-specific rates
    const { data: rates } = await supabaseServerClient
      .from("hotel_rates")
      .select("*")
      .eq("room_id", room_id)
      .eq("partner_id", partner_id) // NEW: Filter by partner
      .gte("date", check_in_date)
      .lt("date", check_out_date)
      .order("date", { ascending: true });

    // Check availability for all nights
    if (!rates || rates.length !== nights) {
      return NextResponse.json(
        {
          error:
            "Rates not available for all nights in the date range from this partner",
        },
        { status: 400 },
      );
    }

    // Check if rooms are available
    const unavailableNights = rates.filter((r) => r.available_rooms <= 0);
    if (unavailableNights.length > 0) {
      return NextResponse.json(
        {
          error: "Room not available",
          message: `No rooms available on: ${unavailableNights.map((n) => n.date).join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Get partner information
    const { data: partner } = await supabaseServerClient
      .from("hotel_partners")
      .select("*")
      .eq("id", partner_id)
      .single();

    if (!partner) {
      return NextResponse.json({ error: "Invalid partner" }, { status: 400 });
    }

    // Calculate base price (sum all nightly rates)
    const basePriceCents = rates.reduce(
      (sum, rate) => sum + rate.price_cents,
      0,
    );

    // Calculate Working Pass benefits
    const workingPassEligibility = validateWorkingPassEligibility(
      {
        check_in_date,
        check_out_date,
        room_count: 1,
        guest_count: guest_info.adults + (guest_info.children || 0),
      },
      {
        has_working_pass: has_working_pass,
        is_active: has_working_pass,
      },
    );

    const workingPassBenefits = calculateWorkingPassBenefits(
      basePriceCents,
      {
        check_in_date,
        check_out_date,
        room_count: 1,
        guest_count: guest_info.adults + (guest_info.children || 0),
      },
      workingPassEligibility,
    );

    // Calculate TCent redemption if applicable
    let tcentRedemption = {
      tcent_to_use: 0,
      cents_value: 0,
      max_redeemable: 0,
      max_percentage: 0,
    };
    if (tcent_to_use > 0) {
      // TODO: Fetch user's actual TCent balance from database
      const userTcentBalance = 10000; // Placeholder

      const redemptionValidation = validateTcentRedemption(
        tcent_to_use,
        userTcentBalance,
        basePriceCents,
      );

      if (!redemptionValidation.valid) {
        return NextResponse.json(
          {
            error: "Invalid TCent redemption",
            message: redemptionValidation.error,
          },
          { status: 400 },
        );
      }

      tcentRedemption = calculateTcentRedemption(basePriceCents, tcent_to_use);
    }

    // Calculate final price after all discounts
    const pricing = calculateFinalBookingPrice({
      base_amount_cents: basePriceCents,
      working_pass_discount_cents: workingPassBenefits.discount_cents,
      tcent_redemption_cents: tcentRedemption.cents_value,
    });

    // Calculate TCent earning
    const partnerEarnRate = getPartnerEarnRate(partner.code);
    const tcentEarning = calculateTcentEarning(
      pricing.final_amount_cents, // Earn on final paid amount
      partnerEarnRate,
      has_working_pass,
      user_tier,
    );

    // Generate confirmation code
    const confirmationCode = generateConfirmationCode();

    // Create booking with partner and loyalty information
    const { data: booking, error: bookingError } = await supabaseServerClient
      .from("hotel_bookings")
      .insert([
        {
          hotel_id,
          room_id,
          partner_id, // NEW: Store partner
          user_id: user.id,
          check_in_date,
          check_out_date,
          nights,
          guest_info,
          special_requests: special_requests || null,
          base_price_cents: basePriceCents, // NEW: Separate base price
          working_pass_discount_cents: workingPassBenefits.discount_cents, // NEW
          working_pass_applied: has_working_pass, // NEW
          tcent_used: tcentRedemption.tcent_to_use, // NEW
          tcent_value_cents: tcentRedemption.cents_value, // NEW
          total_cents: pricing.final_amount_cents, // NEW: Final amount to pay
          tcent_earned: tcentEarning.total_tcent, // NEW
          tcent_earn_rate: partnerEarnRate, // NEW
          confirmation_code: confirmationCode,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (bookingError) {
      console.error("Booking creation error:", bookingError);
      return NextResponse.json(
        { error: "Failed to create booking", message: bookingError.message },
        { status: 500 },
      );
    }

    // Update available rooms count (decrement by 1 for each night)
    const updatePromises = rates.map((rate) =>
      supabaseServerClient
        .from("hotel_rates")
        .update({ available_rooms: rate.available_rooms - 1 })
        .eq("id", rate.id),
    );

    await Promise.all(updatePromises);

    // TODO: Update user's TCent balance
    // - Deduct tcent_to_use from balance
    // - Add tcent_earned to pending balance (credited after checkout)

    // Send Notification
    try {
      const { createNotificationAndPush } = await import('@/lib/services/pushService');
      await createNotificationAndPush(
        user.id,
        "Booking Confirmed!",
        `Your hotel booking at ${hotel.title} is confirmed!`,
        'booking',
        `/my-bookings`
      );
    } catch (e) {
      console.error("Failed to send notification", e);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...booking,
          hotel_name: hotel.title,
          room_name: room.title,
          partner_name: partner.name,
          pricing_breakdown: {
            base_price_cents: basePriceCents,
            working_pass_discount_cents: workingPassBenefits.discount_cents,
            tcent_redemption_cents: tcentRedemption.cents_value,
            total_discount_cents: pricing.total_discount_cents,
            final_amount_cents: pricing.final_amount_cents,
          },
          loyalty: {
            tcent_used: tcentRedemption.tcent_to_use,
            tcent_earned: tcentEarning.total_tcent,
            tcent_breakdown: {
              base: tcentEarning.base_tcent,
              working_pass_bonus: tcentEarning.working_pass_bonus,
              tier_bonus: tcentEarning.tier_bonus,
            },
          },
          working_pass: {
            applied: has_working_pass,
            benefits: workingPassBenefits,
          },
        },
        message: "Booking created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Booking creation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Internal server error", message: errorMessage },
      { status: 500 },
    );
  }
}
