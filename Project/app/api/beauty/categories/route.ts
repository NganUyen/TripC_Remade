import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/beauty/supabaseServerClient";

/** GET /api/beauty/categories – distinct categories from venues (categories[]) and services (category). */
export async function GET() {
  try {
    const supabase = supabaseServerClient;

    const [venuesRes, servicesRes] = await Promise.all([
      supabase.from("beauty_venues").select("categories").eq("is_active", true),
      supabase.from("beauty_services").select("category").eq("is_active", true),
    ]);

    const set = new Set<string>();
    (venuesRes.data ?? []).forEach((row: { categories?: string[] | null }) => {
      (row.categories ?? []).forEach((c) => {
        if (c?.trim()) set.add(c.trim().toLowerCase());
      });
    });
    (servicesRes.data ?? []).forEach((row: { category?: string | null }) => {
      if (row.category?.trim()) set.add(row.category.trim().toLowerCase());
    });

    const categories = Array.from(set).sort((a, b) => a.localeCompare(b));
    const withLabel = categories.map((c) => ({
      id: c,
      label: c.charAt(0).toUpperCase() + c.slice(1),
    }));

    return NextResponse.json({ success: true, data: withLabel });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch categories";
    console.error("Error in GET /api/beauty/categories:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
