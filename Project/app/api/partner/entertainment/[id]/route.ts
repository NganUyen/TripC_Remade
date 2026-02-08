
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createServiceSupabaseClient()

        // Verify partner ownership via organizer
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single()

        if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        // Get organizer id for this partner
        const { data: organizer } = await supabase
            .from('entertainment_organizers')
            .select('id')
            .eq('partner_id', user.id)
            .single()

        if (!organizer) return NextResponse.json({ error: 'Organizer profile not found' }, { status: 404 })

        const { data: item, error } = await supabase
            .from('entertainment_items')
            .select(`
                *,
                sessions:entertainment_sessions(*),
                ticket_types:entertainment_ticket_types(*)
            `)
            .eq('id', id)
            .eq('organizer_id', organizer.id)
            .single()

        if (error || !item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 })
        }

        // Transform for frontend
        // We assume single session for simple editing context for now, or just take the first one
        const session = item.sessions?.[0] || {}

        // Ensure ticket types are arrays
        const ticket_types = item.ticket_types || []

        const formattedItem = {
            ...item,
            city: item.location?.city || '',
            address: item.location?.address || '',
            image_url: item.images?.[0] || '',
            start_date: session.session_date,
            start_time: session.start_time,
            end_time: session.end_time,
            ticket_types: ticket_types
        }

        return NextResponse.json(formattedItem)

    } catch (error) {
        console.error('Get Partner Entertainment Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const supabase = createServiceSupabaseClient()

        const { data: user } = await supabase.from('users').select('id').eq('clerk_id', userId).single()
        if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const { data: organizer } = await supabase
            .from('entertainment_organizers')
            .select('id')
            .eq('partner_id', user.id)
            .single()

        if (!organizer) return NextResponse.json({ error: 'Organizer not found' }, { status: 403 })

        // Manual delete children first if no cascade
        // 1. Get sessions and tickets
        // For entertainment, ticket_types links to item_id, so we can delete by item_id directly
        // sessions also link to item_id

        await supabase.from('entertainment_ticket_types').delete().eq('item_id', id)
        await supabase.from('entertainment_sessions').delete().eq('item_id', id)

        const { error } = await supabase
            .from('entertainment_items')
            .delete()
            .eq('id', id)
            .eq('organizer_id', organizer.id)

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Delete Entertainment Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const supabase = createServiceSupabaseClient()

        const { data: user } = await supabase.from('users').select('id').eq('clerk_id', userId).single()
        if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const { data: organizer } = await supabase
            .from('entertainment_organizers')
            .select('id')
            .eq('partner_id', user.id)
            .single()

        if (!organizer) return NextResponse.json({ error: 'Organizer not found' }, { status: 403 })

        // Update Item
        const { error: itemError } = await supabase
            .from('entertainment_items')
            .update({
                title: body.title,
                description: body.description,
                location: { city: body.city, address: body.address, country: 'Vietnam' },
                images: body.image_url ? [body.image_url] : [],
                category_id: body.category_id,
                type: body.type,
                min_price: body.min_price || 0,
                start_date: body.start_date
            })
            .eq('id', id)
            .eq('organizer_id', organizer.id)

        if (itemError) throw itemError

        // Update Session (Simple 1 session assumption)
        const { data: sessions } = await supabase.from('entertainment_sessions').select('id').eq('item_id', id)
        if (sessions && sessions.length > 0) {
            const sessionId = sessions[0].id
            await supabase.from('entertainment_sessions').update({
                session_date: body.start_date,
                start_time: body.start_time,
                end_time: body.end_time
            }).eq('id', sessionId)
        } else {
            // Create if missing?
            // ...
        }

        // Update Tickets
        // Delete all and re-create for simplicity
        await supabase.from('entertainment_ticket_types').delete().eq('item_id', id)

        if (body.ticket_types && body.ticket_types.length > 0) {
            const ticketsToInsert = body.ticket_types.map((t: any) => ({
                item_id: id,
                name: t.name,
                price: Number(t.price),
                currency: 'USD',
                total_available: 100,
                is_active: true
            }))
            await supabase.from('entertainment_ticket_types').insert(ticketsToInsert)
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Update Entertainment Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
