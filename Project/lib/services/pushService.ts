import "server-only";
import admin from "firebase-admin";

// Initialize Firebase Admin
// This requires GOOGLE_APPLICATION_CREDENTIALS or explicit config
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace \n with actual newlines if stored in env var
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

/**
 * Send a push notification to a specific user
 */
export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>,
) {
  // 1. Get tokens from Supabase (using service client logic)
  // We need to import the Supabase client here.
  // Ideally we pass the client in, or create a fresh service client.
  const { createServiceSupabaseClient } = await import("@/lib/supabase-server");
  const supabase = createServiceSupabaseClient();

  const { data: tokens } = await supabase
    .from("user_push_tokens")
    .select("token")
    .eq("user_id", userId);

  if (!tokens || tokens.length === 0) {
    console.log(`No push tokens found for user ${userId}`);
    return { success: false, error: "No tokens found" };
  }

  // 2. Send to all tokens
  const messages = tokens.map((t) => ({
    token: t.token,
    notification: {
      title,
      body,
    },
    data: data || {},
  }));

  try {
    const response = await admin.messaging().sendEach(messages);
    console.log(
      `Successfully sent ${response.successCount} messages; ${response.failureCount} failed.`,
    );

    // Optional: Cleanup invalid tokens if response.failureCount > 0
    return { success: true, results: response };
  } catch (error) {
    console.error("Error sending push notifications:", error);
    return { success: false, error };
  }
}

/**
 * Create a notification in the database AND send a push notification
 */
export async function createNotificationAndPush(
  userId: string,
  title: string,
  message: string,
  type: string,
  deepLink?: string,
  metadata?: any,
) {
  const { createServiceSupabaseClient } = await import("@/lib/supabase-server");
  const supabase = createServiceSupabaseClient();

  // 1. Insert into Notifications table
  const { error: dbError } = await supabase.from("notifications").insert({
    user_id: userId,
    type: type || "general",
    title: title,
    message: message,
    deep_link: deepLink,
    // metadata: metadata // If table supports it
  });

  if (dbError) {
    console.error("Error creating database notification:", dbError);
  }

  // 2. Send Push
  await sendPushToUser(userId, title, message, {
    url: deepLink || "/",
    type: type,
  });
}
