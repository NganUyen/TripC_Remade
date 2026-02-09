
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
            city, // Maps to location.city
            address, // Maps to location.address
            image_url,
            category_id, // UUID from entertainment_categories
            type, // 'show', 'concert', etc.
            start_date,
            start_time,
            end_time,
            ticket_types,
            min_price
        } = body

        if (!title || !category_id || !start_date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = createServiceSupabaseClient()

        // 1. Verify partner and Get/Create Organizer Profile
        const { data: user } = await supabase
            .from('users')
            .select('id, first_name, last_name, email, partner_status')
            .eq('clerk_id', userId)
            .single()

        if (!user || user.partner_status !== 'approved') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Check for existing organizer profile
        let { data: organizer } = await supabase
            .from('entertainment_organizers')
            .select('id')
            .eq('partner_id', user.id)
            .single()

        // If no organizer profile, create one
        if (!organizer) {
            const organizerName = `${user.first_name} ${user.last_name}`.trim() || 'Partner Organizer'
            const organizerSlug = generateSlug(organizerName)

            const { data: newOrganizer, error: orgError } = await supabase
                .from('entertainment_organizers')
                .insert({
                    partner_id: user.id,
                    name: organizerName,
                    slug: organizerSlug,
                    email: user.email,
                    is_verified: true
                })
                .select()
                .single()

            if (orgError) {
                console.error('Create Organizer Error:', orgError)
                return NextResponse.json({ error: 'Failed to create organizer profile' }, { status: 500 })
            }
            organizer = newOrganizer
        }

        // 2. Create Entertainment Item
        const slug = generateSlug(title)

        const { data: item, error: itemError } = await supabase
            .from('entertainment_items')
            .insert({
                organizer_id: organizer.id,
                category_id: category_id,
                title,
                slug,
                description,
                type: type || 'show',
                status: 'published',
                is_featured: false,
                available: true,
                location: { city, address, country: 'Vietnam' }, // Simple JSON structure
                images: image_url ? [image_url] : [], // JSONB array
                min_price: min_price || 0,
                start_date: start_date, // Setting overall start date
                metadata: { created_by_partner: true }
            })
            .select()
            .single()

        if (itemError) {
            console.error('Create Entertainment Item Error:', itemError)
            return NextResponse.json({ error: 'Failed to create entertainment item' }, { status: 500 })
        }

        // 3. Create Session
        const { data: session, error: sessionError } = await supabase
            .from('entertainment_sessions')
            .insert({
                item_id: item.id,
                session_date: start_date,
                start_time: start_time || '09:00',
                end_time: end_time || '11:00',
                capacity: 100,
                is_active: true,
                status: 'scheduled'
            })
            .select()
            .single()

        if (sessionError) {
            console.error('Create Session Error:', sessionError)
            return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
        }

        // 4. Create Ticket Types
        if (ticket_types && ticket_types.length > 0) {
            const ticketsToInsert = ticket_types.map((t: any) => ({
                item_id: item.id,
                name: t.name,
                price: Number(t.price),
                currency: 'USD',
                total_available: 100,
                is_active: true
            }))

            const { error: ticketError } = await supabase
                .from('entertainment_ticket_types')
                .insert(ticketsToInsert)

            if (ticketError) {
                console.error('Create Ticket Types Error:', ticketError)
                return NextResponse.json({ error: 'Failed to create ticket types' }, { status: 500 })
            }
        }

        return NextResponse.json({ success: true, id: item.id })

    } catch (error) {
        console.error('Create Partner Entertainment Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
