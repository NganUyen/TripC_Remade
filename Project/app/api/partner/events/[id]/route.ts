
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

        // Verify partner ownership
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single()

        if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const { data: event, error } = await supabase
            .from('events')
            .select(`
                *,
                sessions:event_sessions(*, ticket_types:event_ticket_types(*))
            `)
            .eq('id', id)
            .eq('partner_id', user.id)
            .single()

        if (error || !event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }

        // Transform for frontend
        // We assume single session for simple editing context for now, or just take the first one
        const session = event.sessions?.[0] || {}
        const ticket_types = session.ticket_types || []

        const formattedEvent = {
            ...event,
            start_date: session.session_date,
            start_time: session.start_time,
            end_time: session.end_time,
            ticket_types: ticket_types,
            image_url: event.cover_image_url || event.images?.[0] || ''
        }

        return NextResponse.json(formattedEvent)

    } catch (error) {
        console.error('Get Partner Event Error:', error)
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

        // Delete event (cascade should handle sessions/tickets if set up, otherwise we might need manual delete)
        // Checking schema usually implies cascade, but to be safe we can delete just the event and hope for cascade.
        // If no cascade, we'd error. Let's assume cascade or manually delete children.

        // Manual delete to be safe
        // 1. Get sessions
        const { data: sessions } = await supabase.from('event_sessions').select('id').eq('event_id', id)
        const sessionIds = sessions?.map(s => s.id) || []

        // 2. Delete tickets
        if (sessionIds.length > 0) {
            await supabase.from('event_ticket_types').delete().in('session_id', sessionIds)
            await supabase.from('event_sessions').delete().eq('event_id', id)
        }

        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id)
            .eq('partner_id', user.id)

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Delete Event Error:', error)
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

        // Update Event
        const { error: eventError } = await supabase
            .from('events')
            .update({
                title: body.title,
                description: body.description,
                city: body.location, // Mapping location input to city
                address: body.address,
                cover_image_url: body.image_url,
                images: body.image_url ? [body.image_url] : [],
                inclusions: body.inclusions,
                exclusions: body.exclusions,
                important_info: body.important_info,
                category: body.category
            })
            .eq('id', id)
            .eq('partner_id', user.id)

        if (eventError) throw eventError

        // Update Session (Simple 1 session assumption)
        const { data: sessions } = await supabase.from('event_sessions').select('id').eq('event_id', id)
        if (sessions && sessions.length > 0) {
            const sessionId = sessions[0].id
            await supabase.from('event_sessions').update({
                session_date: body.start_date,
                start_time: body.start_time,
                end_time: body.end_time
            }).eq('id', sessionId)

            // Update Tickets
            // Delete existing and re-create is simplest for update if IDs aren't tracked strictly on frontend
            // Or we check if ticket has ID.

            // For now, let's delete all tickets for this session and re-add them to avoid sync complexity
            await supabase.from('event_ticket_types').delete().eq('session_id', sessionId)

            if (body.ticket_types && body.ticket_types.length > 0) {
                const ticketsToInsert = body.ticket_types.map((t: any) => ({
                    event_id: id,
                    session_id: sessionId,
                    name: t.name,
                    price: Number(t.price),
                    currency: 'USD',
                    total_capacity: 100,
                    is_active: true
                }))
                await supabase.from('event_ticket_types').insert(ticketsToInsert)
            }
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Update Event Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
