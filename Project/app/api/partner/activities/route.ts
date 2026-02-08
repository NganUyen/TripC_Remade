
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { nanoid } from 'nanoid'

export async function GET(request: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createServiceSupabaseClient()

        // Verify partner status
        const { data: user } = await supabase
            .from('users')
            .select('id, partner_status')
            .eq('clerk_id', userId)
            .single()

        if (!user || user.partner_status !== 'approved') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { data: activities, error } = await supabase
            .from('activities')
            .select('*')
            .eq('partner_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(activities)
    } catch (error) {
        console.error('Partner Activities Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { title, description, location, price, images, ticket_types, inclusions, exclusions, important_info, category, duration } = body

        if (!title || !price || !location) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = createServiceSupabaseClient()

        // Verify partner
        const { data: user } = await supabase
            .from('users')
            .select('id, partner_status')
            .eq('clerk_id', userId)
            .single()

        if (!user || user.partner_status !== 'approved') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Generate a URL-friendly slug or ID
        // For simplicity, we stick to UUID from Supabase insert, but might need a slug.
        // The existing activities seem to rely on ID.

        const { data, error } = await supabase
            .from('activities')
            .insert({
                partner_id: user.id,
                title,
                description,
                location,
                price: Number(price),
                images: images || [],
                image_url: images?.[0] || '', // primary image
                ticket_types: ticket_types || {},
                inclusions: inclusions || [],
                exclusions: exclusions || [],
                important_info,
                rating: 0,
                reviews_count: 0,
                is_instant: true,
                category: category || 'Activity',
                features: { duration }
            })
            .select()
            .single()

        if (error) {
            console.error('Create Activity Error:', error)
            throw error
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Create Activity Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
