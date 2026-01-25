import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = createServiceSupabaseClient()

        const { data: vouchers, error } = await supabase
            .from('vouchers')
            .select('id, code, voucher_type, discount_value, min_spend, tcent_price, total_usage_limit, current_usage_count, expires_at')
            .eq('is_active', true)
            .eq('is_purchasable', true)
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

        // Process stock calculation
        const processedVouchers = (vouchers || []).map(v => ({
            ...v,
            stock_remaining: v.total_usage_limit ? (v.total_usage_limit - (v.current_usage_count || 0)) : 999
        }))

        return NextResponse.json({ vouchers: processedVouchers })
    } catch (err) {
        console.error('Internal error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
