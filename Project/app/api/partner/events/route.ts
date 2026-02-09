
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { nanoid } from 'nanoid'

// Helper to generate a slug from title
function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + nanoid(6)
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            title,
            description,
            city,
            address,
            image_url,
            category,
            start_date,
            start_time,
            end_time,
            ticket_types,
            inclusions,
            exclusions,
            important_info
        } = body

        if (!title || !city || !start_date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = createServiceSupabaseClient()

        // 1. Verify partner
        const { data: user } = await supabase
            .from('users')
            .select('id, partner_status')
            .eq('clerk_id', userId)
            .single()

        if (!user || user.partner_status !== 'approved') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // 2. Create Event
        const slug = generateSlug(title)

        const { data: event, error: eventError } = await supabase
            .from('events')
            .insert({
                partner_id: user.id,
                title,
                slug,
                description,
                city, // Assuming 'city' maps to city column
                address,
                location_summary: city, // Simple fallback
                category: category || 'Event',
                cover_image_url: image_url,
                images: image_url ? [image_url] : [],
                inclusions: inclusions || [],
                exclusions: exclusions || [],
                important_info,
                is_active: true,
                is_featured: false
            })
            .select()
            .single()

        if (eventError) {
            console.error('Create Event Error:', eventError)
            return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
        }

        // 3. Create Session
        // For simplicity, we create one session based on start_date
        const { data: session, error: sessionError } = await supabase
            .from('event_sessions')
            .insert({
                event_id: event.id,
                session_date: start_date,
                start_time: start_time || '09:00',
                end_time: end_time || '17:00',
                name: 'Main Session',
                status: 'scheduled',
                total_capacity: 100 // Default capacity if not specified
            })
            .select()
            .single()

        if (sessionError) {
            console.error('Create Session Error:', sessionError)
            // Cleanup event? For now just fail
            return NextResponse.json({ error: 'Failed to create event session' }, { status: 500 })
        }

        // 4. Create Ticket Types
        if (ticket_types && ticket_types.length > 0) {
            const ticketsToInsert = ticket_types.map((t: any) => ({
                event_id: event.id,
                session_id: session.id,
                name: t.name,
                price: Number(t.price),
                currency: 'USD',
                total_capacity: 100, // Default per ticket type
                is_active: true
            }))

            const { error: ticketError } = await supabase
                .from('event_ticket_types')
                .insert(ticketsToInsert)

            if (ticketError) {
                console.error('Create Ticket Types Error:', ticketError)
                return NextResponse.json({ error: 'Failed to create ticket types' }, { status: 500 })
            }
        }

        return NextResponse.json({ success: true, id: event.id })

    } catch (error) {
        console.error('Create Partner Event Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
