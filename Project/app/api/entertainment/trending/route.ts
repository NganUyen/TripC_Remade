/**
 * Trending API - Get trending entertainment items
 * 
 * GET /api/entertainment/trending - List trending items
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const category_id = searchParams.get('category_id');

    // Try to get from cache first
    let query = supabase
      .from('entertainment_trending_cache')
      .select(`
        *,
        item:entertainment_items(*)
      `)
      .gt('expires_at', new Date().toISOString())
      .order('trending_rank', { ascending: true })
      .limit(limit);

    const { data: cachedTrending, error: cacheError } = await query;

    if (cacheError) {
      console.error('Trending cache query error:', cacheError);
      // Fall back to direct query
      return await getTrendingDirect(supabase, limit, category_id);
    }

    // If cache is empty or expired, calculate trending
    if (!cachedTrending || cachedTrending.length === 0) {
      return await getTrendingDirect(supabase, limit, category_id);
    }

    // Extract items from cache
    const items = cachedTrending
      .map(t => t.item)
      .filter(item => item && item.status === 'published' && item.available);

    // Filter by category if requested
    const filteredItems = category_id 
      ? items.filter(item => item.category_id === category_id)
      : items;

    return NextResponse.json({
      data: filteredItems.slice(0, limit),
      meta: {
        is_cached: true,
        calculated_at: cachedTrending[0]?.calculated_at,
      }
    });

  } catch (error: any) {
    console.error('Trending GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get trending items directly from database (no cache)
 */
async function getTrendingDirect(supabase: any, limit: number, category_id: string | null) {
  try {
    // Calculate trending score based on views, bookings, and wishlist
    // Score = (views * 0.3) + (bookings * 0.5) + (wishlist * 0.2)
    let query = supabase
      .from('entertainment_items')
      .select('*')
      .eq('status', 'published')
      .eq('available', true)
      .eq('is_trending', true)
      .order('total_bookings', { ascending: false })
      .limit(limit);

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Calculate and sort by trending score
    const itemsWithScore = data?.map(item => ({
      ...item,
      trending_score: (item.total_views || 0) * 0.3 + 
                     (item.total_bookings || 0) * 0.5 + 
                     (item.total_wishlist || 0) * 0.2
    })).sort((a, b) => b.trending_score - a.trending_score);

    return NextResponse.json({
      data: itemsWithScore,
      meta: {
        is_cached: false,
        calculated_at: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    console.error('Direct trending query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending items', details: error.message },
      { status: 500 }
    );
  }
}
