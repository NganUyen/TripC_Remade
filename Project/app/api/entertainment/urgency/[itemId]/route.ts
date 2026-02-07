/**
 * Urgency Signals API - Display scarcity badges and urgency indicators
 *
 * GET /api/entertainment/urgency/:itemId - Get urgency signals for an item
 * POST /api/entertainment/urgency/calculate - Calculate urgency for all items (cron job)
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";

/**
 * GET /api/entertainment/urgency/:itemId
 * Get urgency signals for a specific item
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const { itemId } = await params;
    const supabase = createServiceSupabaseClient();

    // Get urgency signals from cache
    const { data: signals, error } = await supabase
      .from("entertainment_urgency_signals")
      .select("*")
      .eq("item_id", itemId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Urgency signals query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch urgency signals", details: error.message },
        { status: 500 },
      );
    }

    // If no cached signals or stale (> 1 hour), calculate fresh
    if (
      !signals ||
      new Date(signals.last_calculated).getTime() < Date.now() - 3600000
    ) {
      const freshSignals = await calculateUrgencyForItem(itemId);
      return NextResponse.json({ urgency: freshSignals });
    }

    return NextResponse.json({ urgency: signals });
  } catch (error: any) {
    console.error("Urgency GET error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

/**
 * Helper: Calculate urgency signals for a single item
 */
async function calculateUrgencyForItem(itemId: string) {
  const supabase = createServiceSupabaseClient();

  // Get item details
  const { data: item } = await supabase
    .from("entertainment_items")
    .select("*")
    .eq("id", itemId)
    .single();

  if (!item) return null;

  // Get sessions for this item
  const { data: sessions } = await supabase
    .from("entertainment_sessions")
    .select("*")
    .eq("item_id", itemId)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true });

  // Calculate signals
  const signals: any = {
    item_id: itemId,
    show_selling_fast: false,
    show_limited_seats: false,
    show_happening_soon: false,
    show_sold_out: false,
    show_last_chance: false,
    last_calculated: new Date().toISOString(),
  };

  if (!sessions || sessions.length === 0) {
    signals.show_sold_out = true;
  } else {
    // Check availability across sessions
    const totalCapacity = sessions.reduce((sum, s) => sum + s.capacity, 0);
    const totalBooked = sessions.reduce((sum, s) => sum + s.booked_count, 0);
    const availabilityPercent =
      ((totalCapacity - totalBooked) / totalCapacity) * 100;

    // Selling fast: < 30% availability
    if (availabilityPercent < 30 && availabilityPercent > 0) {
      signals.show_selling_fast = true;
    }

    // Limited seats: < 10 seats total
    const remainingSeats = totalCapacity - totalBooked;
    if (remainingSeats <= 10 && remainingSeats > 0) {
      signals.show_limited_seats = true;
      signals.remaining_count = remainingSeats;
    }

    // Sold out
    if (remainingSeats <= 0) {
      signals.show_sold_out = true;
    }

    // Happening soon: next session within 48 hours
    const nextSession = sessions[0];
    const hoursUntil =
      (new Date(nextSession.start_time).getTime() - Date.now()) /
      (1000 * 60 * 60);
    if (hoursUntil <= 48) {
      signals.show_happening_soon = true;
      signals.hours_until_start = Math.round(hoursUntil);
    }

    // Last chance: happening soon + limited seats
    if (signals.show_happening_soon && signals.show_limited_seats) {
      signals.show_last_chance = true;
    }
  }

  // Upsert signals
  await supabase
    .from("entertainment_urgency_signals")
    .upsert([signals], { onConflict: "item_id" });

  return signals;
}

/**
 * POST /api/entertainment/urgency/calculate
 * Recalculate urgency for all items (cron job endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify API key for cron job
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid API key" },
        { status: 401 },
      );
    }

    const supabase = createServiceSupabaseClient();

    // Get all active items
    const { data: items } = await supabase
      .from("entertainment_items")
      .select("id")
      .eq("status", "active");

    if (!items) {
      return NextResponse.json({ error: "No items found" }, { status: 404 });
    }

    // Calculate urgency for each item
    const results = [];
    for (const item of items) {
      const signals = await calculateUrgencyForItem(item.id);
      results.push({ item_id: item.id, signals });
    }

    return NextResponse.json({
      success: true,
      message: `Urgency calculated for ${items.length} items`,
      results,
    });
  } catch (error: any) {
    console.error("Urgency calculation error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
