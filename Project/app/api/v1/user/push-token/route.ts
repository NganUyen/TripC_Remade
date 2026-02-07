import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
    try {
        const { userId: clerkId } = await auth()
        if (!clerkId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { token, platform } = await request.json()
        if (!token) {
            return NextResponse.json({ error: 'Missing token' }, { status: 400 })
        }

        const supabase = createServiceSupabaseClient()

        // 1. Get internal User ID
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', clerkId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 2. Upsert Token
        // Table: user_push_tokens (user_id, token, platform, last_updated)
        // We assume this table exists or will be created.
        const { error } = await supabase
            .from('user_push_tokens')
            .upsert({
                user_id: user.id,
                token: token,
                platform: platform || 'android',
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'token'
            })

        if (error) {
            console.error('Error saving push token:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('Push Token API error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
