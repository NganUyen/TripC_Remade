import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        const supabase = createServiceSupabaseClient();

        // Try to fetch real routes if seeded
        const { data: routes, error } = await supabase
            .from('transport_routes')
            .select(`
                origin, 
                destination, 
                price,
                images,
                vehicle_type
            `)
            .limit(3);

        if (!error && routes && routes.length > 0) {
            // Transform to UI format
            const formatted = routes.map((r: any) => ({
                from: r.origin,
                to: r.destination,
                price: r.price,
                image: r.images?.[0] || "https://images.unsplash.com/photo-1533646422-9275cb687f8c?q=80&w=2670&auto=format&fit=crop"
            }));
            return NextResponse.json(formatted);
        }

        // Fallback Mock Data if DB empty
        return NextResponse.json([
            {
                from: "Hanoi",
                to: "Sapa",
                price: 250000,
                image: "https://images.unsplash.com/photo-1533646422-9275cb687f8c?q=80&w=2670&auto=format&fit=crop"
            },
            {
                from: "Hanoi",
                to: "Ha Long",
                price: 300000,
                image: "https://images.unsplash.com/photo-1506059612708-99d6c258160e?q=80&w=2669&auto=format&fit=crop"
            },
            {
                from: "Ho Chi Minh",
                to: "Da Lat",
                price: 350000,
                image: "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?q=80&w=2670&auto=format&fit=crop"
            }
        ]);
    } catch (err: any) {
        return NextResponse.json([]);
    }
}
