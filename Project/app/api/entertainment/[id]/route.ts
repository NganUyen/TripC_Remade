/**
 * Entertainment API Routes - Single Item Operations
 *
 * GET /api/entertainment/:id - Get single entertainment item
 * PUT /api/entertainment/:id - Update entertainment item (authenticated)
 * DELETE /api/entertainment/:id - Delete entertainment item (authenticated)
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/entertainment/:id
 * Get a single entertainment item by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = createServiceSupabaseClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from("entertainment_items")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Entertainment item not found" },
          { status: 404 },
        );
      }
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch entertainment item", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Entertainment GET by ID error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/entertainment/:id
 * Update an entertainment item
 * Requires: Authentication (Clerk)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 },
      );
    }

    const supabase = createServiceSupabaseClient();
    const { id } = await params;
    const body = await request.json();

    // Build update object with only provided fields
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.provider !== undefined) updateData.provider = body.provider;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.available !== undefined) updateData.available = body.available;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    // Ensure at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("entertainment_items")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Entertainment item not found" },
          { status: 404 },
        );
      }
      console.error("Supabase update error:", error);
      return NextResponse.json(
        {
          error: "Failed to update entertainment item",
          details: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Entertainment PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/entertainment/:id
 * Delete an entertainment item
 * Requires: Authentication (Clerk)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 },
      );
    }

    const supabase = createServiceSupabaseClient();
    const { id } = params;

    const { error } = await supabase
      .from("entertainment_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json(
        {
          error: "Failed to delete entertainment item",
          details: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Entertainment item deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Entertainment DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
