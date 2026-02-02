/**
 * Seed Entertainment Data to Supabase
 *
 * Reads the generated SQL file and executes it against Supabase
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing Supabase credentials in .env.local");
  console.error("Please set:");
  console.error("  - NEXT_PUBLIC_SUPABASE_URL");
  console.error("  - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function seedDatabase() {
  console.log("🎭 Seeding Entertainment Data to Supabase...\n");

  // Load generated data
  const jsonPath = path.join(
    __dirname,
    "../docs/entertainment/generated_seed_data.json",
  );
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  try {
    // 1. Seed Categories
    console.log("📁 Seeding categories...");
    const { error: catError } = await supabase
      .from("entertainment_categories")
      .upsert(data.categories, { onConflict: "id" });

    if (catError) throw catError;
    console.log(`✅ Seeded ${data.categories.length} categories`);

    // 2. Seed Organizers
    console.log("👥 Seeding organizers...");
    const { error: orgError } = await supabase
      .from("entertainment_organizers")
      .upsert(data.organizers, { onConflict: "id" });

    if (orgError) throw orgError;
    console.log(`✅ Seeded ${data.organizers.length} organizers`);

    // 3. Seed Items
    console.log("🎪 Seeding entertainment items...");

    // Map generated data to actual database schema
    const itemsToSeed = data.items.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      type: item.type,
      slug: item.slug,
      category_id: item.category_id || null,
      organizer_id: item.organizer_id || null,
      min_price: item.min_price,
      max_price: item.max_price,
      currency: item.currency,
      status: item.status,
      is_featured: item.is_featured,
      is_trending: item.is_trending,
      available: item.available,
      location: item.location,
      images: item.images,
      video_url: item.video_url || null,
      base_capacity: item.base_capacity || 0,
      total_bookings: item.total_bookings || 0,
      total_views: item.total_views || 0,
      total_wishlist: item.total_wishlist || 0,
      rating_average: item.rating_average || 0,
      rating_count: item.rating_count || 0,
      metadata: {
        duration: item.duration || null,
        features: item.features || [],
        inclusions: item.inclusions || [],
        long_description: item.long_description || null,
      },
    }));

    const { error: itemError } = await supabase
      .from("entertainment_items")
      .upsert(itemsToSeed, { onConflict: "id" });

    if (itemError) throw itemError;
    console.log(`✅ Seeded ${data.items.length} items`);

    // 4. Seed Ticket Types
    console.log("🎫 Seeding ticket types...");

    // Map ticket types to database schema (minimal fields)
    const ticketTypesToSeed = data.ticketTypes.map((tt) => ({
      id: tt.id,
      item_id: tt.item_id,
      name: tt.name,
      description: tt.description,
      price: tt.price,
      currency: tt.currency || "USD",
      is_active: tt.is_active !== false,
    }));

    const { error: ticketError } = await supabase
      .from("entertainment_ticket_types")
      .upsert(ticketTypesToSeed, { onConflict: "id" });

    if (ticketError) throw ticketError;
    console.log(`✅ Seeded ${data.ticketTypes.length} ticket types`);

    // 5. Seed Sessions
    console.log("📅 Seeding sessions...");

    // Map sessions to database schema (use session_date and capacity instead of date/total_spots)
    const sessionsToSeed = data.sessions.map((session) => ({
      id: session.id,
      item_id: session.item_id,
      session_date: session.date,
      start_time: session.start_time,
      end_time: session.end_time,
      capacity: session.total_spots,
      booked_count: session.booked_count || 0,
      status: session.status || "available",
      is_active: session.is_active !== false,
    }));

    const { error: sessionError } = await supabase
      .from("entertainment_sessions")
      .upsert(sessionsToSeed, { onConflict: "id" });

    if (sessionError) throw sessionError;
    console.log(`✅ Seeded ${data.sessions.length} sessions`);

    console.log("\n✨ Database seeding complete!");
    console.log("\nSummary:");
    console.log(`  - ${data.categories.length} categories`);
    console.log(`  - ${data.organizers.length} organizers`);
    console.log(`  - ${data.items.length} entertainment items`);
    console.log(`  - ${data.ticketTypes.length} ticket types`);
    console.log(`  - ${data.sessions.length} sessions`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();
