/**
 * Wishlist API - Manage user wishlist/favorites
 * 
 * GET /api/entertainment/wishlist - Get user's wishlist
 * POST /api/entertainment/wishlist - Add item to wishlist
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/entertainment/wishlist
 * Get user's wishlist with full item details
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

    const { data: wishlistItems, error } = await supabase
      .from('entertainment_wishlist')
      .select(`
        *,
        item:entertainment_items(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Wishlist query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch wishlist', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      wishlist: wishlistItems || [],
      count: wishlistItems?.length || 0,
    });

  } catch (error: any) {
    console.error('Wishlist GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/entertainment/wishlist
 * Add item to wishlist
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
    const { data: item } = await supabase
      .from('entertainment_items')
      .select('id')
      .eq('id', body.item_id)
      .single();

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Check if already in wishlist
    const { data: existing } = await supabase
      .from('entertainment_wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', body.item_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Item already in wishlist' },
        { status: 400 }
      );
    }

    // Add to wishlist
    const { data, error } = await supabase
      .from('entertainment_wishlist')
      .insert([{
        user_id: userId,
        item_id: body.item_id,
        notify_on_discount: body.notify_on_discount || false,
        notify_on_availability: body.notify_on_availability || false,
      }])
      .select()
      .single();

    if (error) {
      console.error('Wishlist insert error:', error);
      return NextResponse.json(
        { error: 'Failed to add to wishlist', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data, message: 'Item added to wishlist' },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Wishlist POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
