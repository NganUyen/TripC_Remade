import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { auth } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
    try {
        const supabase = createServiceSupabaseClient()

        // Get current user if authenticated (using Clerk)
        const { userId } = await auth()

        const { data: vouchers, error } = await supabase
            .from('vouchers')
            .select('id, code, voucher_type, discount_value, min_spend, tcent_price, total_usage_limit, current_usage_count, expires_at, is_active, is_purchasable')
            .order('tcent_price', { ascending: true })

        if (error) {
            // PGRST205: Table missing
            if (error.code === 'PGRST205') {
                console.warn('Vouchers table missing, returning empty list')
                return NextResponse.json({ vouchers: [] })
            }
            console.error('Error fetching vouchers:', error)
            return NextResponse.json({ error: 'Failed to fetch marketplace' }, { status: 500 })
        }

        // Filter in JS since DB filtering was behaving inconsistently
        let activeVouchers = (vouchers || []).filter(v => v.is_active === true && v.is_purchasable === true)
        console.log('[MARKETPLACE API] Active vouchers count:', activeVouchers.length)

        // If user is authenticated, we might want to mark owned vouchers in future,
        // but for now we display ALL available vouchers as per requirements.
        if (userId) {
            console.log('[MARKETPLACE API] User authenticated:', userId)
            // Logic to filter owned vouchers removed to show all options.
        } else {
            console.log('[MARKETPLACE API] User not authenticated')
        }

        // Process stock calculation
        const processedVouchers = activeVouchers.map(v => ({
            ...v,
            stock_remaining: v.total_usage_limit ? (v.total_usage_limit - (v.current_usage_count || 0)) : 999
        }))

        return NextResponse.json({ vouchers: processedVouchers })
    } catch (err) {
        console.error('Internal error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
