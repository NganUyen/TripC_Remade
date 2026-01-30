/**
 * Waitlist API - Manage waitlist for sold-out events
 * 
 * GET /api/entertainment/waitlist - Get user's waitlist entries
 * POST /api/entertainment/waitlist - Join waitlist for sold-out event
 * DELETE /api/entertainment/waitlist/:itemId - Leave waitlist
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/entertainment/waitlist
 * Get user's waitlist entries
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    const supabase = createServiceSupabaseClient();

    const { data: waitlist, error } = await supabase
      .from('entertainment_waitlist')
      .select(`
        *,
        item:entertainment_items(*),
        session:entertainment_sessions(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'waiting')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Waitlist query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch waitlist', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      waitlist: waitlist || [],
      total: waitlist?.length || 0,
    });

  } catch (error: any) {
    console.error('Waitlist GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/entertainment/waitlist
 * Join waitlist for sold-out event
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    const supabase = createServiceSupabaseClient();
    const body = await request.json();

    if (!body.item_id) {
      return NextResponse.json(
        { error: 'Missing required field: item_id' },
        { status: 400 }
      );
    }

    // Verify item exists
    const { data: item, error: itemError } = await supabase
      .from('entertainment_items')
      .select('id, title')
      .eq('id', body.item_id)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Check if already on waitlist
    const { data: existing } = await supabase
      .from('entertainment_waitlist')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', body.item_id)
      .eq('status', 'waiting')
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'You are already on the waitlist for this event' },
        { status: 400 }
      );
    }

    // Get waitlist position
    const { count: position } = await supabase
      .from('entertainment_waitlist')
      .select('id', { count: 'exact', head: true })
      .eq('item_id', body.item_id)
      .eq('status', 'waiting');

    // Join waitlist
    const { data: waitlistEntry, error: waitlistError } = await supabase
      .from('entertainment_waitlist')
      .insert([{
        user_id: userId,
        item_id: body.item_id,
        session_id: body.session_id || null,
        email: body.email,
        phone: body.phone || null,
        notify_via: body.notify_via || 'email',
        status: 'waiting',
        position: (position || 0) + 1,
      }])
      .select()
      .single();

    if (waitlistError) {
      console.error('Waitlist creation error:', waitlistError);
      return NextResponse.json(
        { error: 'Failed to join waitlist', details: waitlistError.message },
        { status: 500 }
      );
    }

    // Create notification
    await supabase
      .from('entertainment_notifications')
      .insert([{
        user_id: userId,
        type: 'waitlist_joined',
        title: 'Added to Waitlist',
        message: `You've been added to the waitlist for ${item.title}. We'll notify you if spots become available.`,
        item_id: body.item_id,
      }]);

    return NextResponse.json({
      success: true,
      waitlist_entry: waitlistEntry,
      message: `Successfully joined waitlist for ${item.title}`,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Waitlist POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
