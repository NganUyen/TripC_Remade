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

        // 1. Get User and verify partner status
        const { data: user } = await supabase
            .from('users')
            .select('id, partner_status')
            .eq('clerk_id', userId)
            .single()

        if (!user || user.partner_status !== 'approved') {
            return NextResponse.json({ error: 'Forbidden: Partner access required' }, { status: 403 })
        }

        // 2. Fetch all owned items with categories
        const [
            { data: activities },
            { data: events },
            { data: organizers },
            { data: entCategories }
        ] = await Promise.all([
            supabase.from('activities').select('id, price, rating, category').eq('partner_id', user.id),
            supabase.from('events').select('id, average_rating, category').eq('partner_id', user.id),
            supabase.from('entertainment_organizers').select('id').eq('partner_id', user.id),
            supabase.from('entertainment_categories').select('id, name')
        ])

        const activityIds = activities?.map(a => a.id) || []
        const eventIds = events?.map(e => e.id) || []
        const organizerIds = organizers?.map(o => o.id) || []

        console.log('Stats Debug:', {
            userId,
            activityCount: activityIds.length,
            eventCount: eventIds.length,
            organizerCount: organizerIds.length
        })

        // Map ItemId -> CategoryName
        const itemCategoryMap = new Map<string, string>()

        activities?.forEach(a => itemCategoryMap.set(a.id, a.category || 'Activity'))
        events?.forEach(e => itemCategoryMap.set(e.id, e.category || 'Event'))

        // Map CategoryId -> CategoryName for Entertainment
        const entCategoryNameMap = new Map<string, string>()
        entCategories?.forEach(c => entCategoryNameMap.set(c.id, c.name))

        let entertainmentIds: string[] = []
        let entertainmentItems: any[] = []
        if (organizerIds.length > 0) {
            const { data: entItems } = await supabase
                .from('entertainment_items')
                .select('id, rating_average, category_id, type')
                .in('organizer_id', organizerIds)

            if (entItems) {
                entertainmentItems = entItems
                entertainmentIds = entItems.map(e => e.id)
                entItems.forEach(e => {
                    const catName = entCategoryNameMap.get(e.category_id) || e.type || 'Entertainment'
                    itemCategoryMap.set(e.id, catName)
                })
            }
        }

        // Calculate Average Rating
        let totalRatingSum = 0;
        let totalRatedItems = 0;

        activities?.forEach(a => { if (a.rating) { totalRatingSum += a.rating; totalRatedItems++; } })
        events?.forEach(e => { if (e.average_rating) { totalRatingSum += e.average_rating; totalRatedItems++; } })
        entertainmentItems.forEach(e => { if (e.rating_average) { totalRatingSum += e.rating_average; totalRatedItems++; } })

        const averageRating = totalRatedItems > 0 ? (totalRatingSum / totalRatedItems) : 0;
        const activeListings = activityIds.length + eventIds.length + entertainmentIds.length;

        // 3. Date Range Setup
        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days') || '7')
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        startDate.setHours(0, 0, 0, 0)

        // 4. Fetch Bookings
        const fetchBookings = async (table: string, idColumn: string, ids: string[]) => {
            if (ids.length === 0) return []
            const { data } = await supabase
                .from(table)
                .select(`total_amount, created_at, status, currency, ${idColumn}`)
                .in(idColumn, ids)
                .eq('status', 'confirmed')
            return data || []
        }

        const [activityBookings, eventBookings, entertainmentBookings] = await Promise.all([
            fetchBookings('activity_bookings', 'activity_id', activityIds),
            fetchBookings('event_bookings', 'event_id', eventIds),
            fetchBookings('entertainment_bookings', 'entertainment_id', entertainmentIds)
        ])

        const normalizedBookings = [
            ...(activityBookings || []).map((b: any) => ({ ...b, itemId: b.activity_id })),
            ...(eventBookings || []).map((b: any) => ({ ...b, itemId: b.event_id })),
            ...(entertainmentBookings || []).map((b: any) => ({ ...b, itemId: b.entertainment_id }))
        ].map(b => {
            let amount = Number(b.total_amount || 0)
            if (b.currency === 'VND') {
                amount = convertVndToUsd(amount)
            }
            return { ...b, total_amount: amount }
        })



        const totalBookings = normalizedBookings.length
        const revenue = normalizedBookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0)

        // 5. Build Chart Data
        const chartDataMap = new Map<string, { date: string, revenue: number, bookings: number }>()
        const categoryRevenueMap = new Map<string, number>()

        for (let i = 0; i < days; i++) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dateStr = d.toISOString().split('T')[0]
            chartDataMap.set(dateStr, { date: dateStr, revenue: 0, bookings: 0 })
        }

        normalizedBookings.forEach(b => {
            const bookingDate = new Date(b.created_at)
            const amount = Number(b.total_amount || 0)

            if (bookingDate >= startDate) {
                // Line/Bar Chart Data
                const dateStr = bookingDate.toISOString().split('T')[0]
                if (chartDataMap.has(dateStr)) {
                    const entry = chartDataMap.get(dateStr)!
                    entry.revenue += amount
                    entry.bookings += 1
                }

                // Category Data
                const catName = itemCategoryMap.get(b.itemId) || 'Other'
                categoryRevenueMap.set(catName, (categoryRevenueMap.get(catName) || 0) + amount)
            }
        })

        const chartData = Array.from(chartDataMap.values()).sort((a, b) => a.date.localeCompare(b.date))

        // Format Revenue by Category
        const revenueByCategory = Array.from(categoryRevenueMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)

        return NextResponse.json({
            revenue,
            totalBookings,
            averageRating: Number(averageRating.toFixed(1)),
            activeListings,
            chartData,
            revenueByCategory
        })

    } catch (error) {
        console.error('Partner Stats Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
