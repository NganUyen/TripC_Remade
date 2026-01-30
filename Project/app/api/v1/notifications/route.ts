import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const { userId: clerkId } = await auth()
        if (!clerkId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createServiceSupabaseClient()

        // 1. Get internal UUID
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', clerkId)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 2. Fetch notifications
        const { data: notifications, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) throw error

        // Format timestamps to friendly string locally or send ISO
        // We'll send raw data and let client format
        return NextResponse.json(notifications)
    } catch (err) {
        console.error('Notifications API error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const { userId: clerkId } = await auth()
        if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { id, markAll } = body

        const supabase = createServiceSupabaseClient()
        const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single()
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        if (markAll) {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
        } else if (id) {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('id', id)
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { userId: clerkId } = await auth()
        if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

        const supabase = createServiceSupabaseClient()
        const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single()

        await supabase
            .from('notifications')
            .delete()
            .eq('user_id', user?.id)
            .eq('id', id)

        return NextResponse.json({ success: true })
    } catch (err) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }
}
