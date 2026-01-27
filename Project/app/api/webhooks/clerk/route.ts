import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Clerk Webhook Handler for Supabase User Sync
 *
 * This syncs user data from Clerk to Supabase users table
 * Following Clerk's webhook guide for database sync
 *
 * Setup in Clerk Dashboard:
 * 1. Go to Webhooks
 * 2. Add endpoint: https://your-domain.com/api/webhooks/clerk
 * 3. Subscribe to: user.created, user.updated, user.deleted
 */

export async function POST(req: Request) {
  console.log("🔔 Webhook received!");

  // Verify webhook signature
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  console.log("📋 Headers:", {
    svix_id,
    svix_timestamp,
    has_signature: !!svix_signature,
  });

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("❌ Missing svix headers");
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  console.log("📦 Payload type:", payload.type);
  console.log("📦 User ID:", payload.data?.id);

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
    console.log("✅ Webhook verified successfully");
  } catch (err) {
    console.error("❌ Webhook verification failed:", err);
    return new Response("Error: Verification failed", { status: 400 });
  }

  // Create Supabase admin client (bypasses RLS)
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
  const eventType = evt.type;

  try {
    // Handle user.created event
    if (eventType === "user.created") {
      console.log("👤 Creating user in Supabase...");
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      console.log("📧 Email:", email_addresses[0]?.email_address);
      console.log("👤 Name:", first_name, last_name);

      const { error } = await supabase.from("users").insert({
        clerk_id: id,
        email: email_addresses[0]?.email_address || "",
        first_name: first_name || null,
        last_name: last_name || null,
        name: `${first_name || ""} ${last_name || ""}`.trim() || null,
        image_url: image_url || null,
        is_email_verified:
          email_addresses[0]?.verification?.status === "verified",
        membership_tier: "BRONZE",
        tcent_balance: 0,
        tcent_pending: 0,
        lifetime_spend: 0,
      });

      if (error) {
        console.error("❌ Supabase insert error:", error);
        throw error;
      }
      console.log(`✅ User created in Supabase: ${id}`);
    }

    // Handle user.updated event
    if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      const { error } = await supabase
        .from("users")
        .update({
          email: email_addresses[0]?.email_address || "",
          first_name: first_name || null,
          last_name: last_name || null,
          name: `${first_name || ""} ${last_name || ""}`.trim() || null,
          image_url: image_url || null,
          is_email_verified:
            email_addresses[0]?.verification?.status === "verified",
        })
        .eq("clerk_id", id);

      if (error) throw error;
      console.log(`✅ User updated in Supabase: ${id}`);
    }

    // Handle user.deleted event
    if (eventType === "user.deleted") {
      const { id } = evt.data;

      // Soft delete: mark as inactive
      const { error } = await supabase
        .from("users")
        .update({ is_active: false })
        .eq("clerk_id", id!);

      if (error) throw error;
      console.log(`✅ User deactivated in Supabase: ${id}`);
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    return new Response("Error: Processing failed", { status: 500 });
  }
}
