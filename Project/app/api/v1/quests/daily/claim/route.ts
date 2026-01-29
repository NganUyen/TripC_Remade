import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { auth } from '@clerk/nextjs/server'

export async function POST() {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Get User's DB UUID from Clerk ID
        const supabase = createServiceSupabaseClient()
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single()

        if (userError || !user) {
            console.error('User not found for daily claim:', userId)
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 2. Call the Database Function
        const { data, error } = await supabase
            .rpc('claim_daily_login', { p_user_id: user.id })

        if (error) {
            console.error('Error claiming daily reward:', error)
            return NextResponse.json({ error: 'Failed to claim reward' }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (err) {
        console.error('Internal daily claim error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
