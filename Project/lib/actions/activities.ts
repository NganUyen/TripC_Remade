"use server";

import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { Activity } from "@/types";
import { generateBookingCode } from "@/utils/booking-codes";
import { addMinutes } from "date-fns";

export async function getActivities(search?: string, category?: string): Promise<Activity[]> {
    const supabase = createServiceSupabaseClient();
    let query = supabase.from("activities").select("*");

    if (search) {
        query = query.ilike("title", `%${search}%`);
    }

    if (category && category !== 'All') {
        query = query.eq("category", category);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching activities:", error);
        return [];
    }

    return data as Activity[];
}

export async function getActivityById(id: string): Promise<Activity | null> {
    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error(`Error fetching activity ${id}:`, error);
        return null;
    }

    return data as Activity;
}

export async function createActivityBooking(data: {
    user_id: string
    activity_id: string
    total_amount: number
    booking_details: any
    title: string
    image_url: string
    start_date: string
    guest_details?: any
}) {
    const supabase = createServiceSupabaseClient()

    const expiresAt = addMinutes(new Date(), 10).toISOString();
    const bookingCode = generateBookingCode('activity');

    // Insert into bookings table
    const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
            user_id: data.user_id,
            category: 'activity',
            title: data.title,
            image_url: data.image_url,
            start_date: data.start_date,
            total_amount: data.total_amount,
            status: 'held',
            booking_code: bookingCode,
            expires_at: expiresAt,
            metadata: {
                activity_id: data.activity_id,
                tickets: data.booking_details.tickets
            },
            guest_details: data.guest_details,
            currency: 'USD'
        })
        .select('id')
        .single()

    if (error) {
        console.error('Booking creation error:', error)
        return { success: false, error: error.message }
    }

    return { success: true, booking }
}
