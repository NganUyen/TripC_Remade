
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { code, cartTotal } = body

        if (!code) {
            return NextResponse.json({ error: 'Voucher code is required' }, { status: 400 })
        }

        const supabase = createServiceSupabaseClient()

        // 1. Find voucher by code
        const { data: voucher, error: voucherError } = await supabase
            .from('vouchers')
            .select('*')
            .eq('code', code)
            .single()

        if (voucherError || !voucher) {
            return NextResponse.json({ error: 'Invalid voucher code' }, { status: 404 })
        }

        // 2. Get internal User ID
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 3. CHECK OWNERSHIP: Does user have this voucher in user_vouchers?
        const { data: userVoucher, error: ownershipError } = await supabase
            .from('user_vouchers')
            .select('*')
            .eq('user_id', user.id)
            .eq('voucher_id', voucher.id)
            .eq('status', 'active') // Must be active
            .single()

        if (ownershipError || !userVoucher) {
            return NextResponse.json({ error: 'You do not own this voucher or it has been used' }, { status: 403 })
        }

        // 4. Validate Logic (Min Spend, Expiry)
        if (voucher.min_spend && cartTotal < voucher.min_spend) {
            return NextResponse.json({
                error: `Minimum spend of $${voucher.min_spend} required`
            }, { status: 400 })
        }

        if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Voucher has expired' }, { status: 400 })
        }

        // 5. Calculate Discount
        // Assuming voucher_type or logic determines flexible vs fixed. 
        // For this demo, let's assume 'discount_value' is the fixed amount (e.g. 50 T-cents or $50) or percent logic.
        // User didn't specify percent vs fixed in prompt, but `vouchers` schema has `discount_value`.
        // Let's assume it acts as a direct dollar discount for simplicity unless type indicates otherwise.

        // However, looking at previous artifacts, `voucher_type` is usually category like 'Transport'.
        // Let's assume simple fixed discount for now based on `discount_value`.

        let discountAmount = Number(voucher.discount_value) || 0

        // Cap discount at cart total (no negative total)
        if (discountAmount > cartTotal) {
            discountAmount = cartTotal
        }

        return NextResponse.json({
            valid: true,
            voucherId: voucher.id,
            code: voucher.code,
            discountAmount: discountAmount,
            message: 'Voucher applied successfully'
        })

    } catch (err) {
        console.error('Validation error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
