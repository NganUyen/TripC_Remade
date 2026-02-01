/**
 * Events API Endpoint
 *
 * GET /api/events - List events with filters
 *
 * Supports filtering by city, category, date, price, and pagination.
 * Public endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEvents } from '@/lib/events/data-access';
import { EventSearchParamsSchema } from '@/lib/events/validation';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters into object
    const rawParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      rawParams[key] = value;
    });

    // Validate parameters
    const parseResult = EventSearchParamsSchema.safeParse(rawParams);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const params = parseResult.data;

    // Fetch events
    const result = await getEvents(params);

    console.log(
      `[Events API] Found ${result.events.length} events (total: ${result.total}, city: ${params.city || 'all'}, category: ${params.category || 'all'})`
    );

    return NextResponse.json({
      success: true,
      data: result.events,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        returned: result.events.length,
      },
      query: {
        city: params.city || null,
        category: params.category || null,
        date_from: params.date_from || null,
        date_to: params.date_to || null,
        is_featured: params.is_featured ?? null,
        search: params.search || null,
        sort_by: params.sort_by,
        sort_order: params.sort_order,
      },
    });
  } catch (error) {
    console.error('[Events API] List error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}
