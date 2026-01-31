import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";

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

    let finalUser = existingUser;

    if (!existingUser) {
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
      finalUser = data;
    }

    // --- GUEST DATA SYNC LOGIC ---
    // Always run this to claim any new guest bookings made with this email
    const userEmail = user.emailAddresses[0]?.emailAddress;
    const dbUserId = finalUser.id; // UUID from users table
    const clerkId = userId;        // Clerk ID string

    if (userEmail) {
      console.log(`[SyncUser] Checking for guest data to claim for ${userEmail}`);

      // 1. Sync Bookings (Activity, Wellness, Dining, Transport, Flight, etc.)
      const { count: bookingsCount, error: bookingsError } = await supabase
        .from("bookings")
        .update({ user_id: clerkId })
        .eq("user_id", "GUEST")
        .filter("guest_details->>email", "eq", userEmail);

      if (bookingsError) console.error("Error syncing bookings:", bookingsError);
      else if (bookingsCount && bookingsCount > 0) console.log(`[SyncUser] Synced ${bookingsCount} bookings`);

      // 2. Sync Shop Orders
      const { count: ordersCount, error: ordersError } = await supabase
        .from("shop_orders")
        .update({ user_id: dbUserId })
        .is("user_id", null)
        .filter("shipping_address_snapshot->>email", "eq", userEmail);

      if (ordersError) console.error("Error syncing shop orders:", ordersError);
      else if (ordersCount && ordersCount > 0) console.log(`[SyncUser] Synced ${ordersCount} shop orders`);
    }

    return NextResponse.json({
      success: true,
      message: existingUser ? "Sync complete (existing user)" : "User synced and guest data claimed!",
      user: finalUser,
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
