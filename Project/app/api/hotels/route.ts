/**
 * Hotels API Endpoint
 *
 * GET /api/hotels - List hotels
 * POST /api/hotels - Create a hotel (protected)
 *
 * Supports filtering by query string, city, and pagination.
 * Public endpoint for GET, requires authentication for POST.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/hotel/supabaseServerClient";
import { verifyClerkAuth } from "@/lib/hotel/clerkAuth";

export const dynamic = "force-dynamic";

// City name mapping (Vietnamese ↔ English)
const CITY_NAME_MAP: Record<string, string[]> = {
  'hanoi': ['Hanoi', 'Hà Nội', 'Ha Noi'],
  'ho chi minh city': ['Ho Chi Minh City', 'Thành phố Hồ Chí Minh', 'TP. Hồ Chí Minh', 'TP.Hồ Chí Minh', 'TP Hồ Chí Minh', 'Saigon', 'Sài Gòn', 'Sai Gon', 'HCMC'],
  'da nang': ['Da Nang', 'Đà Nẵng'],
  'nha trang': ['Nha Trang'],
  'hoi an': ['Hoi An', 'Hội An'],
  'phu quoc': ['Phu Quoc', 'Phú Quốc'],
  'da lat': ['Da Lat', 'Đà Lạt', 'Dalat'],
  'vung tau': ['Vung Tau', 'Vũng Tàu']
};

// Normalize city name to find all variants
function normalizeCityName(city: string): string[] {
  // Remove common prefixes and clean up the input
  const cleanedCity = city
    .toLowerCase()
    .trim()
    .replace(/^tp\.\s*/i, '')  // Remove "TP." prefix
    .replace(/^tp\s*/i, '')     // Remove "TP" prefix
    .replace(/^thành phố\s*/i, ''); // Remove "Thành phố" prefix
  
  // Find matching variants
  for (const [key, variants] of Object.entries(CITY_NAME_MAP)) {
    if (variants.some(v => {
      const cleanedVariant = v
        .toLowerCase()
        .replace(/^tp\.\s*/i, '')
        .replace(/^tp\s*/i, '')
        .replace(/^thành phố\s*/i, '');
      return cleanedVariant === cleanedCity;
    })) {
      return variants;
    }
  }
  
  // If no match found, return original
  return [city];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract query parameters
    const q = searchParams.get("q") || "";
    const city = searchParams.get("city") || "";
    const minRating = searchParams.get("min_rating");
    const maxPrice = searchParams.get("maxPrice");
    const stars = searchParams.get("stars");
    const amenities = searchParams.get("amenities");
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get("limit") || "20")),
      100,
    );
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0"));

    // Build query
    let query = supabaseServerClient
      .from("hotels")
      .select("*", { count: "exact" })
      .eq("status", "active")
      .order("created_at", { ascending: false });

    // Apply filters
    if (q) {
      query = query.ilike("name", `%${q}%`);
    }

    if (city) {
      // Get all city name variants
      const cityVariants = normalizeCityName(city);
      
      // Build OR query for all variants
      if (cityVariants.length === 1) {
        query = query.ilike("address->>city", `%${cityVariants[0]}%`);
      } else {
        // Use OR condition for multiple variants
        const orConditions = cityVariants
          .map(variant => `address->>city.ilike.%${variant}%`)
          .join(',');
        query = query.or(orConditions);
      }
    }

    if (minRating) {
      const rating = parseInt(minRating);
      if (!isNaN(rating)) {
        query = query.gte("star_rating", rating);
      }
    }

    // Filter by star rating (exact match for selected ratings)
    if (stars) {
      const starArray = stars.split(',').map(s => parseInt(s)).filter(s => !isNaN(s));
      if (starArray.length > 0) {
        query = query.in("star_rating", starArray);
      }
    }

    // Filter by price (best_price <= maxPrice)
    if (maxPrice) {
      const price = parseInt(maxPrice);
      if (!isNaN(price)) {
        // Convert dollars to cents for comparison
        query = query.lte("best_price", price * 100);
      }
    }

    // Filter by amenities (contains all selected amenities)
    if (amenities) {
      const amenityArray = amenities.split(',');
      for (const amenity of amenityArray) {
        query = query.contains("amenities", [amenity]);
      }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: hotels, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { 
          success: false,
          error: "Failed to fetch hotels", 
          message: error.message,
          details: { city, q, minRating }
        },
        { status: 500 },
      );
    }

    // Log successful query for debugging
    console.log(`[Hotels API] Found ${hotels?.length || 0} hotels (city: ${city || 'all'}, stars: ${stars || 'all'}, maxPrice: ${maxPrice || 'any'}, total: ${count})`);

    return NextResponse.json({
      success: true,
      data: hotels,
      pagination: {
        total: count || 0,
        limit,
        offset,
        returned: hotels?.length || 0,
      },
      query: {
        city: city || null,
        search: q || null,
        minRating: minRating || null,
        stars: stars || null,
        maxPrice: maxPrice || null,
        amenities: amenities || null
      }
    });
  } catch (error) {
    console.error("Hotels list error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Internal server error", message: errorMessage },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    let user;
    try {
      user = await verifyClerkAuth();
    } catch (authError) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication required to create hotels",
        },
        { status: 401 },
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON", message: "Request body must be valid JSON" },
        { status: 400 },
      );
    }

    const {
      name,
      slug,
      description,
      address,
      star_rating,
      amenities,
      policies,
    } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message: "name and slug are required",
        },
        { status: 400 },
      );
    }

    // Validate star rating
    if (star_rating !== undefined && (star_rating < 0 || star_rating > 5)) {
      return NextResponse.json(
        {
          error: "Invalid star rating",
          message: "Star rating must be between 0 and 5",
        },
        { status: 400 },
      );
    }

    // Create hotel
    const { data: hotel, error } = await supabaseServerClient
      .from("hotels")
      .insert([
        {
          name,
          slug,
          description: description || null,
          address: address || {},
          star_rating: star_rating || null,
          amenities: amenities || [],
          policies: policies || {},
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Hotel creation error:", error);

      // Check for unique constraint violation (slug already exists)
      if (error.code === "23505") {
        return NextResponse.json(
          {
            error: "Duplicate slug",
            message: "A hotel with this slug already exists",
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: "Failed to create hotel", message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: hotel,
        message: "Hotel created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Hotel creation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Internal server error", message: errorMessage },
      { status: 500 },
    );
  }
}
