/**
 * Sessions API - Get sessions for an entertainment item
 * 
 * GET /api/entertainment/items/:itemId/sessions - List sessions with availability
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const supabase = createServiceSupabaseClient();
    const { itemId } = params;
    const { searchParams } = new URL(request.url);
    
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const status = searchParams.get('status') || 'available';

    // Verify item exists
    const { data: item, error: itemError } = await supabase
      .from('entertainment_items')
      .select('id, title, slug')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Entertainment item not found' },
        { status: 404 }
      );
    }

    // Get sessions
    let query = supabase
      .from('entertainment_sessions')
      .select('*')
      .eq('item_id', itemId)
      .eq('is_active', true)
      .order('session_date', { ascending: true })
      .order('start_time', { ascending: true });

    // Filter by status
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Date range filter
    if (start_date) {
      query = query.gte('session_date', start_date);
    } else {
      // Default: only show future sessions
      query = query.gte('session_date', new Date().toISOString().split('T')[0]);
    }

    if (end_date) {
      query = query.lte('session_date', end_date);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error('Sessions query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sessions', details: error.message },
        { status: 500 }
      );
    }

    // Group sessions by date
    const sessionsByDate: Record<string, any[]> = {};
    sessions?.forEach(session => {
      const date = session.session_date;
      if (!sessionsByDate[date]) {
        sessionsByDate[date] = [];
      }
      sessionsByDate[date].push({
        ...session,
        availability_percentage: (session.available_count / session.capacity * 100).toFixed(0),
        is_selling_fast: session.available_count <= item.urgency_threshold || 10,
        is_low_stock: session.available_count <= item.low_stock_threshold || 5,
      });
    });

    return NextResponse.json({
      item: {
        id: item.id,
        title: item.title,
        slug: item.slug,
      },
      sessions: sessions || [],
      sessions_by_date: sessionsByDate,
      summary: {
        total_sessions: sessions?.length || 0,
        available_sessions: sessions?.filter(s => s.status === 'available').length || 0,
        sold_out_sessions: sessions?.filter(s => s.status === 'sold_out').length || 0,
      }
    });

  } catch (error: any) {
    console.error('Sessions GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
