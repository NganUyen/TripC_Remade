/**
 * Categories API - List and Get Categories
 *
 * GET /api/entertainment/categories - List all categories
 * GET /api/entertainment/categories/:id - Get single category with items
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase-server";

/**
 * GET /api/entertainment/categories
 * List all categories with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceSupabaseClient();
    const { searchParams } = new URL(request.url);

    const parentId = searchParams.get("parent_id");
    const includeChildren = searchParams.get("include_children") === "true";

    let query = supabase
      .from("entertainment_categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    // Filter by parent ID (null for top-level categories)
    if (parentId === "null" || parentId === "") {
      query = query.is("parent_id", null);
    } else if (parentId) {
      query = query.eq("parent_id", parentId);
    }

    const { data: categories, error } = await query;

    if (error) {
      console.error("Categories query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch categories", details: error.message },
        { status: 500 },
      );
    }

    // If include_children, fetch all subcategories
    if (includeChildren && categories) {
      const categoriesWithChildren = await Promise.all(
        categories.map(async (category) => {
          const { data: children } = await supabase
            .from("entertainment_categories")
            .select("*")
            .eq("parent_id", category.id)
            .eq("is_active", true)
            .order("display_order");

          return { ...category, children: children || [] };
        }),
      );

      return NextResponse.json({ data: categoriesWithChildren });
    }

    return NextResponse.json({ data: categories });
  } catch (error: any) {
    console.error("Categories GET error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
