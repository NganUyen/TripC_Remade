import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { auth } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createServiceSupabaseClient()

        // Get user UUID
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Get Streak Data
        const { data: streak } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (!streak) {
            // No streak record yet, return defaults
            return NextResponse.json({
                current_streak: 0,
                last_claim_at: null,
                status: 'AVAILABLE'
            })
        }

        return NextResponse.json(streak)

    } catch (err) {
        console.error('Streak status error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
