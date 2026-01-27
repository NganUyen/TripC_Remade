import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const origin = searchParams.get("origin")?.trim();
        const destination = searchParams.get("destination")?.trim();
        const date = searchParams.get("date"); // YYYY-MM-DD
        const passengers = parseInt(searchParams.get("passengers") || "1");
        const vehicleType = searchParams.get("vehicleType"); // '4 seats', '7 seats', etc.
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");

        if (!origin || !destination) {
            return NextResponse.json(
                { error: "Vui lòng nhập điểm đi và điểm đến!" },
                { status: 400 }
            );
        }

        // Optional: Date might be optional if flexible, but usually required. 
        // If date is missing, we could default to today or return error. 
        // Requirement says strict validation.
        if (!date) {
            // If strict date is required
            // return NextResponse.json({ error: "Vui lòng chọn ngày đi!" }, { status: 400 });
        }

        const supabase = createServiceSupabaseClient();

        let query = supabase
            .from("transport_routes")
            .select(`
        *,
        transport_providers (
          name,
          logo_url,
          rating
        )
      `)
            .ilike("origin", `%${origin}%`)
            .ilike("destination", `%${destination}%`)
            .gte("seats_available", passengers);

        // Date Filter
        if (date) {
            query = query
                .gte("departure_time", `${date}T00:00:00`)
                .lt("departure_time", `${date}T23:59:59`);
        }

        // Vehicle Type Filter
        if (vehicleType) {
            if (vehicleType === '4') query = query.eq("vehicle_type", "4 seats");
            else if (vehicleType === '7') query = query.eq("vehicle_type", "7 seats");
            else if (vehicleType === '16') query = query.eq("vehicle_type", "16 seats");
            else if (vehicleType === '29') query = query.eq("vehicle_type", "29 seats");
            else if (vehicleType === 'limousine') query = query.ilike("vehicle_type", "%limousine%");
            // Add more mapping if needed
        }

        // Price Range Filter
        if (minPrice) {
            query = query.gte("price", minPrice);
        }
        if (maxPrice) {
            query = query.lte("price", maxPrice);
        }

        const { data: routes, error } = await query.order("price", { ascending: true });

        if (error) {
            console.error("Supabase search error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(routes || []);
    } catch (err: any) {
        console.error("Search API error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
