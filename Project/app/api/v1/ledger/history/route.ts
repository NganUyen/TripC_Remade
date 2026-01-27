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

        // 2. Fetch Ledger History
        const { data: history, error } = await supabase
            .from('tcent_ledger')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            console.error('Error fetching ledger:', error)
            return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
        }

        return NextResponse.json({ history })

    } catch (err) {
        console.error('Internal error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
