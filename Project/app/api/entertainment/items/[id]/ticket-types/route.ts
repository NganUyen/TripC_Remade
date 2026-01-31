/**
 * Ticket Types API - Get ticket types for an entertainment item
 *
 * GET /api/entertainment/items/:id/ticket-types - List available ticket types
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createServiceSupabaseClient();
    const itemId = params.id;

    // Verify item exists
    const { data: item, error: itemError } = await supabase
      .from("entertainment_items")
      .select("id, title, slug, min_price, max_price, currency")
      .eq("id", itemId)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: "Entertainment item not found" },
        { status: 404 },
      );
    }

    // Get ticket types
    const { data: ticketTypes, error } = await supabase
      .from("entertainment_ticket_types")
      .select("*")
      .eq("item_id", itemId)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Ticket types query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch ticket types", details: error.message },
        { status: 500 },
      );
    }

    // Calculate availability for each ticket type
    const ticketTypesWithAvailability = ticketTypes?.map((tt) => ({
      ...tt,
      available_count: (tt.total_available || 0) - (tt.total_sold || 0),
      is_available: (tt.total_available || 0) - (tt.total_sold || 0) > 0,
      has_discount: tt.original_price && tt.original_price > tt.price,
      discount_percentage:
        tt.original_price && tt.original_price > tt.price
          ? Math.round(
              ((tt.original_price - tt.price) / tt.original_price) * 100,
            )
          : 0,
    }));

    return NextResponse.json({
      item: {
        id: item.id,
        title: item.title,
        slug: item.slug,
        price_range: {
          min: item.min_price,
          max: item.max_price,
          currency: item.currency,
        },
      },
      ticket_types: ticketTypesWithAvailability || [],
      summary: {
        total_types: ticketTypesWithAvailability?.length || 0,
        lowest_price:
          ticketTypesWithAvailability && ticketTypesWithAvailability.length > 0
            ? Math.min(...ticketTypesWithAvailability.map((tt) => tt.price))
            : null,
        highest_price:
          ticketTypesWithAvailability && ticketTypesWithAvailability.length > 0
            ? Math.max(...ticketTypesWithAvailability.map((tt) => tt.price))
            : null,
      },
    });
  } catch (error: any) {
    console.error("Ticket types GET error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
