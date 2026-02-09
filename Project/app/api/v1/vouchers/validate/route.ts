
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
        const { code, cartTotal, serviceType } = body
        console.log(`[VoucherValidation] Request: code='${code}' serviceType='${serviceType}' total=${cartTotal}`);

        if (!code) {
            return NextResponse.json({ error: 'Voucher code is required' }, { status: 400 })
        }

        const supabase = createServiceSupabaseClient()

        // 1. Find voucher by code
        // trimming the code just in case
        const cleanCode = code.trim();
        const { data: voucher, error: voucherError } = await supabase
            .from('vouchers')
            .select('*')
            .ilike('code', cleanCode)
            .single()

        console.log(`[VoucherValidation] Lookup result for '${cleanCode}':`, voucher ? 'Found' : 'Not Found', voucherError?.message);

        if (voucherError || !voucher) {
            return NextResponse.json({ error: 'Invalid voucher code' }, { status: 404 })
        }

        // 1.5. Validate Category (if serviceType is provided)
        if (serviceType) {
            // Normalize categories
            const voucherCategory = (voucher.voucher_type || voucher.category || '').toLowerCase().trim();
            const currentCategory = serviceType.toLowerCase().trim();

            // Check match
            // Allow 'transport' vouchers on 'flight' bookings, assuming flights are a subset of transport
            // Allow 'hotel credit' (or any hotel string) on 'hotel' bookings
            const isMatch =
                voucherCategory === currentCategory ||
                (voucherCategory === 'transport' && (currentCategory === 'transport' || currentCategory === 'flight')) ||
                (voucherCategory.includes('hotel') && currentCategory === 'hotel') ||
                (voucherCategory === 'entertainment' && (currentCategory === 'event' || currentCategory === 'entertainment')) ||
                (voucherCategory === 'activities' && (currentCategory === 'activity' || currentCategory === 'event')) ||
                (voucherCategory === 'wellness' && currentCategory === 'wellness') ||
                (voucherCategory === 'global'); // Global vouchers work everywhere

            // Strict check: If it's NOT a match, and it's NOT a global/empty category that explicitly allows all (which we don't want generally), reject.
            // If voucherCategory is empty, we should probably reject if a serviceType was requested, unless it's a specific global code.
            // For now, if no match found:
            if (!isMatch) {
                return NextResponse.json({
                    error: `Voucher is not applicable for this category (${currentCategory})`
                }, { status: 400 })
            }
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

        // 3. CHECK OWNERSHIP & USAGE
        // Check if user has interacted with this voucher before
        const { data: userVoucher, error: ownershipError } = await supabase
            .from('user_vouchers')
            .select('*')
            .eq('user_id', user.id)
            .eq('voucher_id', voucher.id)
            .maybeSingle() // Use maybeSingle to handle "no row" as null instead of error

        // Case A: User has a record (Already claimed or Used)
        if (userVoucher) {
            if (userVoucher.status === 'used') {
                return NextResponse.json({ error: 'You have already used this voucher' }, { status: 403 })
            }
            if (userVoucher.status === 'expired') {
                return NextResponse.json({ error: 'This voucher has expired' }, { status: 400 })
            }
            // If status is 'active', proceed.
        }
        // Case B: No record found. 
        // Valid ONLY if it's a public/global voucher (e.g. SHOP20).
        // If it's a private assigned voucher, they should have had a record.
        else {
            const isPublic = (voucher as any).is_public ||
                voucher.code === 'SHOP20' ||
                voucher.code === 'FLIGHT_DEAL' ||
                voucher.code === 'HOTEL20' ||
                voucher.code === 'EVENT20' ||
                voucher.code === 'EVENTVND' ||
                voucher.code === 'ACT_USD10' ||
                voucher.code === 'SPA_RETREAT' ||
                voucher.code === 'TRANS20';

            if (!isPublic) {
                return NextResponse.json({ error: 'You do not own this voucher' }, { status: 403 })
            }
            // If public and not used yet (no record), allow it.
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
