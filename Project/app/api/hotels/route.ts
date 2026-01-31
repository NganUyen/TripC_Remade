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
  hanoi: ["Hanoi", "Hà Nội", "Ha Noi"],
  "ho chi minh city": [
    "Ho Chi Minh City",
    "Thành phố Hồ Chí Minh",
    "TP. Hồ Chí Minh",
    "TP.Hồ Chí Minh",
    "TP Hồ Chí Minh",
    "Saigon",
    "Sài Gòn",
    "Sai Gon",
    "HCMC",
  ],
  "da nang": ["Da Nang", "Đà Nẵng"],
  "nha trang": ["Nha Trang"],
  "hoi an": ["Hoi An", "Hội An"],
  "phu quoc": ["Phu Quoc", "Phú Quốc"],
  "da lat": ["Da Lat", "Đà Lạt", "Dalat"],
  "vung tau": ["Vung Tau", "Vũng Tàu"],
};

// Normalize city name to find all variants
function normalizeCityName(city: string): string[] {
  // Remove common prefixes and clean up the input
  const cleanedCity = city
    .toLowerCase()
    .trim()
    .replace(/^tp\.\s*/i, "") // Remove "TP." prefix
    .replace(/^tp\s*/i, "") // Remove "TP" prefix
    .replace(/^thành phố\s*/i, ""); // Remove "Thành phố" prefix

  // Find matching variants
  for (const [key, variants] of Object.entries(CITY_NAME_MAP)) {
    if (
      variants.some((v) => {
        const cleanedVariant = v
          .toLowerCase()
          .replace(/^tp\.\s*/i, "")
          .replace(/^tp\s*/i, "")
          .replace(/^thành phố\s*/i, "");
        return cleanedVariant === cleanedCity;
      })
    ) {
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
    const minPrice = searchParams.get("minPrice");
    const stars = searchParams.get("stars");
    const amenities = searchParams.get("amenities");
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get("limit") || "100")),
      100,
    );
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0"));

    console.log("[Hotels API] Filter params:", {
      city,
      maxPrice,
      minPrice,
      stars,
      amenities: amenities?.split(","),
    });

    // Build query
    let query = supabaseServerClient
      .from("hotels")
      .select("*", { count: "exact" })
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
          .map((variant) => `address->>city.ilike.%${variant}%`)
          .join(",");
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
      const starArray = stars
        .split(",")
        .map((s) => parseInt(s))
        .filter((s) => !isNaN(s) && s >= 1 && s <= 5);
      if (starArray.length > 0) {
        query = query.in("star_rating", starArray);
      }
    }

    // Filter by price range
    if (maxPrice) {
      const price = parseFloat(maxPrice);
      if (!isNaN(price)) {
        // Convert dollars to cents for comparison
        query = query.lte("best_price", Math.round(price * 100));
      }
    }

    if (minPrice) {
      const price = parseFloat(minPrice);
      if (!isNaN(price)) {
        // Convert dollars to cents for comparison
        query = query.gte("best_price", Math.round(price * 100));
      }
    }

    // Fetch data first to apply amenity filtering in JS (PostgreSQL contains is AND-based)
    const { data: rawData, error, count } = await query;

    if (error) {
      console.error("Error fetching hotels:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter by amenities in JavaScript for more flexible matching
    let filteredData = rawData || [];
    if (amenities) {
      const amenityArray = amenities.split(",").filter((a) => a.trim());
      console.log("[Hotels API] Filtering amenities:", amenityArray);

      filteredData = filteredData.filter((hotel: any) => {
        if (!hotel.amenities || !Array.isArray(hotel.amenities)) {
          return false;
        }
        // Hotel must have ALL selected amenities
        return amenityArray.every((requestedAmenity) =>
          hotel.amenities.some(
            (hotelAmenity: string) =>
              hotelAmenity
                .toLowerCase()
                .includes(requestedAmenity.toLowerCase()) ||
              requestedAmenity
                .toLowerCase()
                .includes(hotelAmenity.toLowerCase()),
          ),
        );
      });

      console.log("[Hotels API] After amenity filter:", filteredData.length);
    }

    const finalCount = filteredData.length;

    // Log successful query for debugging
    console.log(
      `[Hotels API] Found ${filteredData.length} hotels after filters (city: ${city || "all"}, stars: ${stars || "all"}, minPrice: ${minPrice || "any"}, maxPrice: ${maxPrice || "any"}, amenities: ${amenities || "none"}, total before filters: ${count})`,
    );

    return NextResponse.json({
      success: true,
      data: filteredData,
      pagination: {
        total: finalCount,
        limit,
        offset,
        returned: filteredData.length,
      },
      query: {
        city: city || null,
        search: q || null,
        minRating: minRating || null,
        stars: stars || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        amenities: amenities || null,
      },
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
