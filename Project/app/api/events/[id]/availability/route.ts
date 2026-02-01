/**
 * Event Availability API Endpoint
 *
 * GET /api/events/[id]/availability - Get ticket availability for an event
 *
 * Query params:
 *   - session_id: (optional) Filter by specific session
 *
 * Returns real-time ticket availability for each ticket type.
 * Public endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEventById, getTicketAvailability } from '@/lib/events/data-access';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: eventId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Verify event exists
    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // If session_id is provided, get availability for that session only
    if (sessionId) {
      // Verify session belongs to event
      const session = event.sessions.find(s => s.id === sessionId);
      if (!session) {
        return NextResponse.json(
          { error: 'Session not found for this event' },
          { status: 404 }
        );
      }

      const ticketTypes = await getTicketAvailability(sessionId);

      return NextResponse.json({
        success: true,
        data: {
          event_id: eventId,
          session_id: sessionId,
          session_date: session.session_date,
          session_name: session.name,
          ticket_types: ticketTypes,
        },
      });
    }

    // Get availability for all sessions
    const sessionsWithAvailability = await Promise.all(
      event.sessions.map(async (session) => {
        const ticketTypes = await getTicketAvailability(session.id);
        return {
          session_id: session.id,
          session_date: session.session_date,
          session_name: session.name,
          status: session.status,
          ticket_types: ticketTypes,
          total_available: ticketTypes.reduce((sum, t) => sum + t.available_count, 0),
          total_capacity: ticketTypes.reduce((sum, t) => sum + t.total_capacity, 0),
        };
      })
    );

    console.log(`[Events API] Availability for ${event.title}: ${sessionsWithAvailability.length} sessions`);

    return NextResponse.json({
      success: true,
      data: {
        event_id: eventId,
        event_title: event.title,
        sessions: sessionsWithAvailability,
      },
    });
  } catch (error) {
    console.error('[Events API] Availability error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}
