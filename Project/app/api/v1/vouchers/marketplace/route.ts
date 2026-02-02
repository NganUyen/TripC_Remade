import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
    try {
        const supabase = createServiceSupabaseClient()

        // Get current user if authenticated
        const { data: { user } } = await supabase.auth.getUser()

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

        // If user is authenticated, filter out vouchers they've already redeemed
        if (user) {
            console.log('[MARKETPLACE API] User authenticated:', user.id)
            const { data: userProfile } = await supabase
                .from('users')
                .select('id')
                .eq('clerk_id', user.id)
                .single()

            if (userProfile) {
                console.log('[MARKETPLACE API] User profile found:', userProfile.id)
                const { data: redeemedVouchers } = await supabase
                    .from('user_vouchers')
                    .select('voucher_id')
                    .eq('user_id', userProfile.id)

                console.log('[MARKETPLACE API] Redeemed vouchers:', redeemedVouchers?.length || 0)
                const redeemedIds = new Set(redeemedVouchers?.map(v => v.voucher_id) || [])
                console.log('[MARKETPLACE API] Redeemed IDs:', Array.from(redeemedIds))

                // Filter out redeemed vouchers completely
                activeVouchers = activeVouchers.filter(v => !redeemedIds.has(v.id))
                console.log('[MARKETPLACE API] After filtering redeemed:', activeVouchers.length)
            } else {
                console.log('[MARKETPLACE API] User profile not found')
            }
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
