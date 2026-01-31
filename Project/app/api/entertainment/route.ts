/**
 * Entertainment API Routes - List and Create
 * 
 * GET /api/entertainment - List entertainment items with optional search
 * POST /api/entertainment - Create new entertainment item (authenticated)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/entertainment
 * Query params:
 *  - q: search query (searches title, subtitle, description)
 *  - type: filter by entertainment type (tour, show, activity, etc.)
 *  - available: filter by availability (true/false)
 *  - limit: max results (default 50, max 100)
 *  - offset: pagination offset (default 0)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type');
    const available = searchParams.get('available');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('entertainment_items')
      .select('*', { count: 'exact' });

    // Search filter
    if (q) {
      query = query.or(`title.ilike.%${q}%,subtitle.ilike.%${q}%,description.ilike.%${q}%`);
    }

    // Type filter
    if (type) {
      query = query.eq('type', type);
    }

    // Availability filter
    if (available !== null) {
      query = query.eq('available', available === 'true');
    }

    // Pagination
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch entertainment items', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false,
      },
    });

  } catch (error: any) {
    console.error('Entertainment GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/entertainment
 * Body: Entertainment item object
 * Requires: Authentication (Clerk)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    const supabase = createServiceSupabaseClient();
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: title and type are required' },
        { status: 400 }
      );
    }

    // Insert new entertainment item
    const { data, error } = await supabase
      .from('entertainment_items')
      .insert([
        {
          title: body.title,
          subtitle: body.subtitle || null,
          description: body.description || null,
          type: body.type,
          provider: body.provider || null,
          price: body.price || null,
          currency: body.currency || 'USD',
          available: body.available !== undefined ? body.available : true,
          location: body.location || {},
          metadata: body.metadata || {},
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create entertainment item', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });

  } catch (error: any) {
    console.error('Entertainment POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
