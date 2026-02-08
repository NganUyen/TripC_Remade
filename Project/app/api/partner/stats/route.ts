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

        // 1. Get User and verify partner status
        const { data: user } = await supabase
            .from('users')
            .select('id, partner_status')
            .eq('clerk_id', userId)
            .single()

        if (!user || user.partner_status !== 'approved') {
            return NextResponse.json({ error: 'Forbidden: Partner access required' }, { status: 403 })
        }

        // 2. Get Activities owned by partner
        const { data: activities } = await supabase
            .from('activities')
            .select('id, title, price, rating')
            .eq('partner_id', user.id)

        if (!activities || activities.length === 0) {
            return NextResponse.json({
                revenue: 0,
                totalBookings: 0,
                averageRating: 0,
                activeListings: 0
            })
        }

        const activityIds = activities.map(a => a.id)

        // Calculate average rating
        const ratedActivities = activities.filter(a => a.rating > 0)
        const averageRating = ratedActivities.length > 0
            ? ratedActivities.reduce((sum, a) => sum + (a.rating || 0), 0) / ratedActivities.length
            : 0

        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days') || '7')
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        startDate.setHours(0, 0, 0, 0)

        // 3. Get All Time Bookings (for totals)
        const { data: allBookings } = await supabase
            .from('activity_bookings')
            .select('total_amount, status, created_at')
            .in('activity_id', activityIds)
            .eq('status', 'confirmed')

        // 4. Get Chart Bookings (filtered by date)
        const { data: chartBookings } = await supabase
            .from('activity_bookings')
            .select('total_amount, status, created_at')
            .in('activity_id', activityIds)
            .eq('status', 'confirmed')
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: true })

        const totalBookings = allBookings?.length || 0
        const revenue = allBookings?.reduce((sum, b) => sum + Number(b.total_amount), 0) || 0

        // Process Chart Data
        const chartDataMap = new Map<string, { date: string, revenue: number, bookings: number }>()

        // Initialize map with all dates in range
        for (let i = 0; i < days; i++) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dateStr = d.toISOString().split('T')[0] // YYYY-MM-DD
            chartDataMap.set(dateStr, { date: dateStr, revenue: 0, bookings: 0 })
        }

        if (chartBookings) {
            chartBookings.forEach(b => {
                const dateStr = new Date(b.created_at).toISOString().split('T')[0]
                if (chartDataMap.has(dateStr)) {
                    const entry = chartDataMap.get(dateStr)!
                    entry.revenue += Number(b.total_amount)
                    entry.bookings += 1
                }
            })
        }

        // Convert to array and sort by date
        const chartData = Array.from(chartDataMap.values()).sort((a, b) => a.date.localeCompare(b.date))

        return NextResponse.json({
            revenue,
            totalBookings,
            averageRating: Number(averageRating.toFixed(1)),
            activeListings: activities.length,
            chartData
        })

    } catch (error) {
        console.error('Partner Stats Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
