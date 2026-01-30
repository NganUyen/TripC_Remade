
import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { addMinutes } from "date-fns";
import { generateBookingCode } from "@/utils/booking-codes";

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            category,
            title,
            description,
            imageUrl,
            locationSummary,
            startDate,
            endDate,
            totalAmount,
            guestDetails,
            metadata
        } = body;

        // Basic Validation
        if (!category || !title || !startDate || totalAmount === undefined) {
            return NextResponse.json(
                { error: "Missing required fields: category, title, startDate, totalAmount" },
                { status: 400 }
            );
        }

        // TIME CONSTRAINT VALIDATION (Server-Side)
        const start = new Date(startDate);
        const now = new Date();
        const diffMinutes = (start.getTime() - now.getTime()) / (1000 * 60);

        // Allow booking as long as it's not more than 24 hours in the past (for demo flexibility)
        if (diffMinutes < -1440) {
            return NextResponse.json(
                { error: "Invalid booking time. You cannot book a flight that departed more than 24 hours ago." },
                { status: 400 }
            );
        }

        const supabase = createServiceSupabaseClient();
        const bookingCode = generateBookingCode(category);

        // Hold for 8 minutes (Strict Business Rule)
        const expiresAt = addMinutes(new Date(), 8).toISOString();

        const { data, error } = await supabase
            .from("bookings")
            .insert({
                user_id: user.id,
                category,
                title,
                description,
                image_url: imageUrl,
                location_summary: locationSummary,
                start_date: startDate,
                end_date: endDate,
                total_amount: totalAmount,
                status: "held",
                booking_code: bookingCode,
                guest_details: guestDetails,
                metadata: metadata,
                expires_at: expiresAt,
            })
            .select()
            .single();

        if (error) {
            console.error("Booking create error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Booking API error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
