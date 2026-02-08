
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createServiceSupabaseClient()

        // Verify partner & ownership
        const { data: user } = await supabase
            .from('users')
            .select('id, partner_status')
            .eq('clerk_id', userId)
            .single()

        if (!user || user.partner_status !== 'approved') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { data: activity } = await supabase
            .from('activities')
            .select('*')
            .eq('id', params.id)
            .single()

        if (!activity || activity.partner_id !== user.id) {
            return NextResponse.json({ error: 'Activity not found or unauthorized' }, { status: 404 })
        }

        return NextResponse.json(activity)
    } catch (error) {
        console.error('Get Activity Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { title, description, location, price, images, ticket_types, inclusions, exclusions, important_info, category, duration } = body

        const supabase = createServiceSupabaseClient()

        // Verify partner & ownership
        const { data: user } = await supabase
            .from('users')
            .select('id, partner_status')
            .eq('clerk_id', userId)
            .single()

        if (!user || user.partner_status !== 'approved') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Check ownership
        const { data: existingActivity } = await supabase
            .from('activities')
            .select('id, partner_id, features')
            .eq('id', params.id)
            .single()

        if (!existingActivity || existingActivity.partner_id !== user.id) {
            return NextResponse.json({ error: 'Activity not found or unauthorized' }, { status: 404 })
        }

        const updates: any = {
            updated_at: new Date().toISOString()
        }
        if (title) updates.title = title
        if (description) updates.description = description
        if (location) updates.location = location
        if (price) updates.price = Number(price)
        if (images) {
            updates.images = images
            updates.image_url = images[0] || ''
        }
        if (ticket_types) updates.ticket_types = ticket_types
        if (inclusions) updates.inclusions = inclusions
        if (exclusions) updates.exclusions = exclusions
        if (important_info) updates.important_info = important_info
        if (category) updates.category = category
        if (duration) {
            updates.features = {
                ...existingActivity.features,
                duration
            }
        }

        const { data, error } = await supabase
            .from('activities')
            .update(updates)
            .eq('id', params.id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        console.error('Update Activity Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createServiceSupabaseClient()

        // Verify partner & ownership
        const { data: user } = await supabase
            .from('users')
            .select('id, partner_status')
            .eq('clerk_id', userId)
            .single()

        if (!user || user.partner_status !== 'approved') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Check ownership
        const { data: existingActivity } = await supabase
            .from('activities')
            .select('id, partner_id')
            .eq('id', params.id)
            .single()

        if (!existingActivity || existingActivity.partner_id !== user.id) {
            return NextResponse.json({ error: 'Activity not found or unauthorized' }, { status: 404 })
        }

        // Check bookings
        const { count } = await supabase
            .from('activity_bookings')
            .select('id', { count: 'exact', head: true })
            .eq('activity_id', params.id)

        if (count && count > 0) {
            return NextResponse.json({ error: 'Cannot delete activity with existing bookings' }, { status: 400 })
        }

        const { error } = await supabase
            .from('activities')
            .delete()
            .eq('id', params.id)

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Delete Activity Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
