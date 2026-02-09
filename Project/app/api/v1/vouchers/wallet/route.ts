import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createServiceSupabaseClient()

        // 1. Get User ID from Clerk ID
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 2. Fetch User Vouchers with details
        const { data: userVouchers, error } = await supabase
            .from('user_vouchers')
            .select(`
                id,
                status,
                acquired_at,
                used_at,
                voucher: vouchers (
                    id,
                    code,
                    voucher_type,
                    discount_value,
                    min_spend,
                    global_expiry: expires_at,
                    description: voucher_type
                )
            `)
            .eq('user_id', user.id)
            .eq('status', 'AVAILABLE')
            .order('acquired_at', { ascending: false })

        if (error) {
            console.error('Error fetching wallet:', error)
            return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 })
        }

        return NextResponse.json({ vouchers: userVouchers })

    } catch (err) {
        console.error('Internal error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
