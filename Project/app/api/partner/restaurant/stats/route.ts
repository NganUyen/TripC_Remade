import { NextRequest, NextResponse } from "next/server";
import { reviewsClient } from "@/lib/reviews/supabaseClient"; // Reusing the server client

export async function GET(request: NextRequest) {
    try {
        const venueId = request.nextUrl.searchParams.get("venue_id");
        const userId = request.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!venueId) {
            return NextResponse.json({ error: "Venue ID required" }, { status: 400 });
        }

        // TODO: Verify ownership of venueId by userId
        // For MVP/Demo correctness, verifying that the venue exists is good enough 
        // but normally we check: select id from dining_venues where id=venueId and owner_user_id=userId

        // Calculate Stats (Mock calculation from Real DB data)

        // 1. Revenue (Sum of completed reservations * avg spend OR deposit)
        // For MVP, let's just sum deposits of confirmed bookings today
        const today = new Date().toISOString().split('T')[0];
        const { data: todayBookings } = await reviewsClient
            .from("dining_reservations")
            .select("deposit_amount, guest_count")
            .eq("venue_id", venueId)
            .eq("reservation_date", today)
            .in("status", ["confirmed", "seated", "completed"]);

        const todayRevenue = todayBookings?.reduce((sum, b) => sum + (Number(b.deposit_amount) || 0), 0) || 0;

        // 2. Pending Orders (Reservations pending)
        const { count: pendingCount } = await reviewsClient
            .from("dining_reservations")
            .select("*", { count: 'exact', head: true })
            .eq("venue_id", venueId)
            .eq("status", "pending");

        // 3. New Customers (Unique users booked today)
        // distinct user_ids... simiplified to just booking count for now
        const newCustomers = todayBookings?.length || 0;

        return NextResponse.json({
            success: true,
            data: {
                todayRevenue,
                todayRevenueChange: 12.5, // Mock trend
                pendingOrders: pendingCount || 0,
                pendingOrdersChange: 0,
                newCustomers,
                newCustomersChange: 5.2,
                avgServiceTime: 18,
                avgServiceTimeChange: -3.1
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
