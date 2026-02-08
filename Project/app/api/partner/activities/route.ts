
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { nanoid } from 'nanoid'

export async function GET(request: Request) {
    try {
        console.log("API: /api/partner/activities called")
        const { userId } = await auth()
        if (!userId) {
            console.log("API: Unauthorized - No userId")
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createServiceSupabaseClient()

        // 1. Verify partner
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, partner_status')
            .eq('clerk_id', userId)
            .single()

        if (userError || !user) {
            console.error("API: User fetch error or not found", userError)
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        if (user.partner_status !== 'approved') {
            console.log("API: User partner status not approved:", user.partner_status)
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        console.log("API: Fetching items for partnerId:", user.id)

        // 2. Fetch all owned items

        // Fetch Activities
        const { data: activities, error: actError } = await supabase
            .from('activities')
            .select('id, title, location, price, rating')
            .eq('partner_id', user.id)
            .order('created_at', { ascending: false })

        if (actError) console.error("API: Activities fetch error", actError)
        else console.log(`API: Found ${activities?.length} activities`)

        // Fetch Events - CRITICAL: Do NOT select min_price as it doesn't exist
        const { data: events, error: evtError } = await supabase
            .from('events')
            .select('id, title, city, average_rating')
            .eq('partner_id', user.id)

        if (evtError) console.error("API: Events fetch error", evtError)
        else console.log(`API: Found ${events?.length} events`)

        // Fetch Organizers for Entertainment
        const { data: organizers, error: orgError } = await supabase
            .from('entertainment_organizers')
            .select('id')
            .eq('partner_id', user.id)

        if (orgError) console.error("API: Organizers fetch error", orgError)

        // Fetch Event Prices from Ticket Types
        let eventPrices: Record<string, number> = {}
        if (events && events.length > 0) {
            const eventIds = events.map(e => e.id)
            const { data: tickets, error: ticketError } = await supabase
                .from('event_ticket_types')
                .select('event_id, price, currency')
                .in('event_id', eventIds)

            if (ticketError) console.error("API: Ticket types fetch error", ticketError)

            if (tickets) {
                console.log(`API: Found ${tickets.length} ticket types`)
                tickets.forEach(t => {
                    let price = Number(t.price)
                    if (t.currency === 'VND') {
                        // Simple strict conversion to avoid circular dependencies if possible, 
                        // or use the same constant if imported. 
                        // Better to import the utility to keep it consistent.
                        // But for now, hardcoded 25450 or import? 
                        // Let's import to be safe.
                        price = Math.round((price / 25450) * 100) / 100
                    }

                    const currentMin = eventPrices[t.event_id]
                    if (currentMin === undefined || price < currentMin) {
                        eventPrices[t.event_id] = price
                    }
                })
            }
        }

        // Fetch Entertainment Items
        let entertainmentItems: any[] = []
        if (organizers && organizers.length > 0) {
            const organizerIds = organizers.map(o => o.id)
            const { data: entItems, error: entError } = await supabase
                .from('entertainment_items')
                .select('id, title, location, min_price, rating_average')
                .in('organizer_id', organizerIds)

            if (entError) console.error("API: Entertainment items fetch error", entError)

            if (entItems) {
                console.log(`API: Found ${entItems.length} entertainment items`)
                entertainmentItems = entItems
            }
        }

        // 3. Normalize and Combine
        const normalize = (item: any, type: 'activity' | 'event' | 'entertainment') => {
            // Handle location field variation
            let location = 'Unknown'
            if (typeof item.location === 'string') location = item.location
            else if (item.city) location = item.city
            else if (item.location?.city) location = item.location.city // if location is jsonb

            // Handle price
            let price = 0
            if (type === 'event') {
                price = eventPrices[item.id] || 0
            } else {
                price = Number(item.price || item.min_price || 0)
            }

            return {
                id: item.id,
                title: item.title,
                location: location,
                price: price,
                rating: item.rating || item.average_rating || item.rating_average || 0,
                type: type,
                status: 'Active' // Defaulting to Active for now
            }
        }

        const combinedItems = [
            ...(activities || []).map(a => normalize(a, 'activity')),
            ...(events || []).map(e => normalize(e, 'event')),
            ...(entertainmentItems || []).map(e => normalize(e, 'entertainment'))
        ]

        console.log(`API: returning ${combinedItems.length} combined items`)

        return NextResponse.json(combinedItems)

    } catch (error) {
        console.error('Partner Activities API Critical Error:', error)
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
