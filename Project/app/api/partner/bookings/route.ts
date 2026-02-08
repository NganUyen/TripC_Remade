
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createServiceSupabaseClient()

        // Verify partner
        const { data: user } = await supabase
            .from('users')
            .select('id, partner_status')
            .eq('clerk_id', userId)
            .single()

        if (!user || user.partner_status !== 'approved') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Get activities owned by partner
        const { data: activities } = await supabase
            .from('activities')
            .select('id, title')
            .eq('partner_id', user.id)

        if (!activities || activities.length === 0) {
            return NextResponse.json([])
        }

        const activityIds = activities.map(a => a.id)

        // Get bookings for these activities
        // Join with activity title if possible, or mapping manually
        const { data: bookings, error } = await supabase
            .from('activity_bookings')
            .select('*')
            .in('activity_id', activityIds)
            .order('created_at', { ascending: false })

        if (error) throw error

        // Enhance booking data with activity title
        const enhancedBookings = bookings.map(booking => {
            const activity = activities.find(a => a.id === booking.activity_id)
            return {
                ...booking,
                activity_title: activity?.title || 'Unknown Activity'
            }
        })

        return NextResponse.json(enhancedBookings)

    } catch (error) {
        console.error('Partner Bookings Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
