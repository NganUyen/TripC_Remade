
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createServiceSupabaseClient()

        const { data: user, error } = await supabase
            .from('users')
            .select('membership_tier, tcent_balance, tcent_pending')
            .eq('clerk_id', userId)
            .single()

        if (error) {
            // PGRST116: The result contains 0 rows (No user found)
            if (error.code === 'PGRST116') {
                // Auto-create user on the fly if they don't exist
                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert([{
                        clerk_id: userId,
                        email: 'user_' + userId.slice(-8) + '@example.com', // Placeholder
                        name: 'New Traveller',
                        membership_tier: 'BRONZE',
                        tcent_balance: 0,
                        tcent_pending: 0
                    }])
                    .select()
                    .single()

                if (createError) {
                    console.error('Failed to auto-create user for profile:', createError)
                    return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 })
                }

                return NextResponse.json({
                    membership_tier: newUser.membership_tier,
                    tcent_balance: newUser.tcent_balance,
                    tcent_pending: newUser.tcent_pending,
                })
            }

            console.error('Error fetching user profile:', error)
            return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
        }

        return NextResponse.json({
            membership_tier: user.membership_tier,
            tcent_balance: user.tcent_balance,
            tcent_pending: user.tcent_pending,
        })
    } catch (err) {
        console.error('Internal error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
