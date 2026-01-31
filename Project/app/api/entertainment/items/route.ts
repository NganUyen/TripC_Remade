/**
 * Entertainment Items v2 API - Enhanced item listing with full relationships
 * 
 * GET /api/entertainment/items - List items with enhanced data
 * GET /api/entertainment/items/:id - Get single item with all relationships
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/entertainment/items
 * List entertainment items with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const organizer = searchParams.get('organizer');
    const status = searchParams.get('status') || 'active';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'created_at';

    let query = supabase
      .from('entertainment_items')
      .select(`
        *,
        category:entertainment_categories(*),
        organizer:entertainment_organizers(*)
      `, { count: 'exact' })
      .eq('status', status)
      .range(offset, offset + limit - 1);

    // Apply filters
    if (category) {
      query = query.eq('category_id', category);
    }
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    if (organizer) {
      query = query.eq('organizer_id', organizer);
    }

    // Apply sorting
    switch (sort) {
      case 'rating':
        query = query.order('average_rating', { ascending: false, nullsFirst: false });
        break;
      case 'popular':
        query = query.order('total_bookings', { ascending: false });
        break;
      case 'price_low':
        query = query.order('base_price', { ascending: true });
        break;
      case 'price_high':
        query = query.order('base_price', { ascending: false });
        break;
      case 'created_at':
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data: items, error, count } = await query;

    if (error) {
      console.error('Items query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch items', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items: items || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false,
      }
    });

  } catch (error: any) {
    console.error('Items GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
