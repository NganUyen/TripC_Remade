
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { convertVndToUsd } from '@/lib/utils/currency'

export async function GET(request: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createServiceSupabaseClient()

        // 1. Verify partner
        const { data: user } = await supabase
            .from('users')
            .select('id, partner_status')
            .eq('clerk_id', userId)
            .single()

        if (!user || user.partner_status !== 'approved') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // 2. Fetch all owned items
        const [
            { data: activities },
            { data: events },
            { data: organizers }
        ] = await Promise.all([
            supabase.from('activities').select('id, title').eq('partner_id', user.id),
            supabase.from('events').select('id, title').eq('partner_id', user.id),
            supabase.from('entertainment_organizers').select('id').eq('partner_id', user.id)
        ])

        const activityMap = new Map((activities || []).map(a => [a.id, a.title]))
        const eventMap = new Map((events || []).map(e => [e.id, e.title]))

        const activityIds = (activities || []).map(a => a.id)
        const eventIds = (events || []).map(e => e.id)

        let entertainmentIds: string[] = []
        let entertainmentMap = new Map<string, string>() // id -> title

        if (organizers && organizers.length > 0) {
            const organizerIds = organizers.map(o => o.id)
            const { data: entItems } = await supabase
                .from('entertainment_items')
                .select('id, title')
                .in('organizer_id', organizerIds)

            if (entItems) {
                entItems.forEach(i => entertainmentMap.set(i.id, i.title))
                entertainmentIds = entItems.map(i => i.id)
            }
        }

        // 3. Fetch Bookings
        const fetchBookings = async (table: string, idColumn: string, ids: string[]) => {
            if (ids.length === 0) return []
            const { data } = await supabase
                .from(table)
                .select('*')
                .in(idColumn, ids)
                .order('created_at', { ascending: false })
            return data || []
        }

        const [activityBookings, eventBookings, entertainmentBookings] = await Promise.all([
            fetchBookings('activity_bookings', 'activity_id', activityIds),
            fetchBookings('event_bookings', 'event_id', eventIds),
            fetchBookings('entertainment_bookings', 'entertainment_id', entertainmentIds)
        ])



        // 4. Normalize and Combine
        const normalize = (booking: any, type: 'activity' | 'event' | 'entertainment', titleMap: Map<string, string>, idCol: string) => {
            let amount = Number(booking.total_amount || 0)
            if (booking.currency === 'VND') {
                amount = convertVndToUsd(amount)
            }

            return {
                id: booking.id,
                total_amount: amount,
                status: booking.status || booking.booking_status, // Handle entertainment booking_status
                created_at: booking.created_at,
                booking_reference: booking.booking_reference,
                customer_name: booking.customer_name || booking.user_name || 'Guest', // Fallback if name missing
                customer_email: booking.customer_email || booking.user_email,
                item_title: titleMap.get(booking[idCol]) || 'Unknown Item',
                type: type
            }
        }

        const combinedBookings = [
            ...(activityBookings || []).map(b => normalize(b, 'activity', activityMap, 'activity_id')),
            ...(eventBookings || []).map(b => normalize(b, 'event', eventMap, 'event_id')),
            ...(entertainmentBookings || []).map(b => normalize(b, 'entertainment', entertainmentMap, 'entertainment_id'))
        ]

        // 5. Sort by created_at desc
        combinedBookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        return NextResponse.json(combinedBookings)

    } catch (error) {
        console.error('Partner Bookings Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
