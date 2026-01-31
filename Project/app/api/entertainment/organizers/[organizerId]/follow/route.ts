/**
 * Follow Organizers API - Social engagement with event organizers
 *
 * GET /api/entertainment/organizers/:organizerId/follow - Check if following
 * POST /api/entertainment/organizers/:organizerId/follow - Follow organizer
 * DELETE /api/entertainment/organizers/:organizerId/follow - Unfollow organizer
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/entertainment/organizers/:organizerId/follow
 * Check if user is following this organizer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { organizerId: string } },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 },
      );
    }

    const supabase = createServiceSupabaseClient();
    const organizerId = params.organizerId;

    // Check if following
    const { data: follow } = await supabase
      .from("entertainment_organizer_followers")
      .select("id, created_at")
      .eq("user_id", userId)
      .eq("organizer_id", organizerId)
      .single();

    return NextResponse.json({
      is_following: !!follow,
      followed_at: follow?.created_at || null,
    });
  } catch (error: any) {
    console.error("Follow status check error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

/**
 * POST /api/entertainment/organizers/:organizerId/follow
 * Follow an organizer
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { organizerId: string } },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 },
      );
    }

    const supabase = createServiceSupabaseClient();
    const organizerId = params.organizerId;

    // Verify organizer exists
    const { data: organizer, error: organizerError } = await supabase
      .from("entertainment_organizers")
      .select("id, name")
      .eq("id", organizerId)
      .single();

    if (organizerError || !organizer) {
      return NextResponse.json(
        { error: "Organizer not found" },
        { status: 404 },
      );
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from("entertainment_organizer_followers")
      .select("id")
      .eq("user_id", userId)
      .eq("organizer_id", organizerId)
      .single();

    if (existingFollow) {
      return NextResponse.json(
        { error: "Already following this organizer" },
        { status: 400 },
      );
    }

    // Create follow relationship
    const { data: follow, error: followError } = await supabase
      .from("entertainment_organizer_followers")
      .insert([
        {
          user_id: userId,
          organizer_id: organizerId,
        },
      ])
      .select()
      .single();

    if (followError) {
      console.error("Follow creation error:", followError);
      return NextResponse.json(
        { error: "Failed to follow organizer", details: followError.message },
        { status: 500 },
      );
    }

    // Create notification for user
    await supabase.from("entertainment_notifications").insert([
      {
        user_id: userId,
        type: "organizer_followed",
        title: `Now following ${organizer.name}`,
        message: `You will receive notifications about new events from ${organizer.name}`,
        organizer_id: organizerId,
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: `Successfully followed ${organizer.name}`,
        follow,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Follow POST error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/entertainment/organizers/:organizerId/follow
 * Unfollow an organizer
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { organizerId: string } },
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 },
      );
    }

    const supabase = createServiceSupabaseClient();
    const organizerId = params.organizerId;

    // Delete follow relationship
    const { data, error } = await supabase
      .from("entertainment_organizer_followers")
      .delete()
      .eq("user_id", userId)
      .eq("organizer_id", organizerId)
      .select();

    if (error) {
      console.error("Unfollow error:", error);
      return NextResponse.json(
        { error: "Failed to unfollow organizer", details: error.message },
        { status: 500 },
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "You are not following this organizer" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully unfollowed organizer",
    });
  } catch (error: any) {
    console.error("Unfollow DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
