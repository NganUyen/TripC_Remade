"use server"

import { createServiceSupabaseClient } from "@/lib/supabase-server"
import { WellnessExperience } from "@/types"
import { generateBookingCode } from "@/utils/booking-codes"
import { addMinutes } from "date-fns"

export async function getWellnessExperiences(): Promise<WellnessExperience[]> {
    const supabase = createServiceSupabaseClient()

    const { data, error } = await supabase
        .from('wellness')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching wellness experiences:', error)
        return []
    }

    return data as WellnessExperience[]
}

export async function getWellnessById(id: string): Promise<WellnessExperience | null> {
    const supabase = createServiceSupabaseClient()

    const { data, error } = await supabase
        .from('wellness')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error(`Error fetching wellness experience ${id}:`, error)
        return null
    }

    return data as WellnessExperience
}

export async function createWellnessBooking(data: {
    user_id: string
    experience_id: string
    total_amount: number
    booking_details: any
    title: string
    image_url: string
    start_date: string
    location: string
    guest_details?: any
}) {
    const supabase = createServiceSupabaseClient()

    const expiresAt = addMinutes(new Date(), 10).toISOString();
    const bookingCode = generateBookingCode('wellness');

    // Insert into bookings table
    const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
            user_id: data.user_id,
            category: 'wellness',
            title: data.title,
            image_url: data.image_url,
            start_date: data.start_date,
            description: `${data.booking_details.guests} Guests • ${data.location}`,
            location_summary: data.location,
            total_amount: data.total_amount,
            status: 'held',
            booking_code: bookingCode,
            expires_at: expiresAt,
            metadata: {
                experience_id: data.experience_id,
                guests: data.booking_details.guests
            },
            guest_details: data.guest_details,
            currency: 'VND'
        })
        .select('id')
        .single()

    if (error) {
        console.error('Booking creation error:', error)
        return { success: false, error: error.message }
    }

    return { success: true, booking }
}
