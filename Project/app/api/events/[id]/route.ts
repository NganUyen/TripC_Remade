/**
 * Single Event API Endpoint
 *
 * GET /api/events/[id] - Get event by ID or slug
 *
 * Returns full event details including sessions and ticket types.
 * Public endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEventById, getEventBySlug } from '@/lib/events/data-access';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID or slug is required' },
        { status: 400 }
      );
    }

    // Try to fetch by UUID first, then by slug
    let event = null;
    
    // Check if it looks like a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (uuidRegex.test(id)) {
      event = await getEventById(id);
    } else {
      // Try slug
      event = await getEventBySlug(id);
    }

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Sort sessions by date and ticket types by display order
    const sortedEvent = {
      ...event,
      sessions: event.sessions
        .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime())
        .map(session => ({
          ...session,
          ticket_types: session.ticket_types.sort((a, b) => a.display_order - b.display_order),
        })),
    };

    console.log(`[Events API] Found event: ${event.title} (${event.sessions.length} sessions)`);

    return NextResponse.json({
      success: true,
      data: sortedEvent,
    });
  } catch (error) {
    console.error('[Events API] Get event error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}
