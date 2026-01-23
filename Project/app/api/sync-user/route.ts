import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Manual user sync endpoint
 * Use this to sync existing Clerk users to Supabase
 *
 * Access: /api/sync-user
 */
export async function POST() {
  try {
    // Get current user from Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create Supabase admin client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", userId)
      .single();

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: "User already exists in Supabase",
        user: existingUser,
      });
    }

    // Insert user into Supabase
    const { data, error } = await supabase
      .from("users")
      .insert({
        clerk_id: userId,
        email: user.emailAddresses[0]?.emailAddress || "",
        first_name: user.firstName || null,
        last_name: user.lastName || null,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
        image_url: user.imageUrl || null,
        is_email_verified:
          user.emailAddresses[0]?.verification?.status === "verified",
        membership_tier: "BRONZE",
        tcent_balance: 0,
        tcent_pending: 0,
        lifetime_spend: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating user in Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "User synced to Supabase successfully!",
      user: data,
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
      },
      { status: 500 },
    );
  }
}
