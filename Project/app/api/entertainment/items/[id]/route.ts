/**
 * Entertainment Item Detail v2 API - Single item with full relationships
 * 
 * GET /api/entertainment/items/:id - Get item with sessions, reviews, urgency, etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/entertainment/items/:id
 * Get single item with all related data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const supabase = createServiceSupabaseClient();
    const itemId = params.id;

    // Get main item data
    const { data: item, error: itemError } = await supabase
      .from('entertainment_items')
      .select(`
        *,
        category:entertainment_categories(*),
        organizer:entertainment_organizers(*)
      `)
      .eq('id', itemId)
      .single();

    if (itemError) {
      if (itemError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Item not found' },
          { status: 404 }
        );
      }
      console.error('Item query error:', itemError);
      return NextResponse.json(
        { error: 'Failed to fetch item', details: itemError.message },
        { status: 500 }
      );
    }

    // Get upcoming sessions
    const { data: sessions } = await supabase
      .from('entertainment_sessions')
      .select('*')
      .eq('item_id', itemId)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(10);

    // Get ticket types
    const { data: ticketTypes } = await supabase
      .from('entertainment_ticket_types')
      .select('*')
      .eq('item_id', itemId)
      .order('price', { ascending: true });

    // Get reviews summary
    const { data: reviews, count: reviewCount } = await supabase
      .from('entertainment_reviews')
      .select('rating', { count: 'exact' })
      .eq('item_id', itemId);

    const reviewsSummary = {
      total: reviewCount || 0,
      average_rating: item.average_rating || 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    if (reviews && reviews.length > 0) {
      reviews.forEach((r: any) => {
        reviewsSummary.distribution[r.rating as keyof typeof reviewsSummary.distribution]++;
      });
    }

    // Get urgency signals
    const { data: urgency } = await supabase
      .from('entertainment_urgency_signals')
      .select('*')
      .eq('item_id', itemId)
      .single();

    // Check if user-specific data exists (requires auth)
    let userInteractions = null;
    if (userId) {
      // Check wishlist
      const { data: wishlistItem } = await supabase
        .from('entertainment_wishlist')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .single();

      // Check if following organizer
      const { data: following } = await supabase
        .from('entertainment_organizer_followers')
        .select('id')
        .eq('user_id', userId)
        .eq('organizer_id', item.organizer_id)
        .single();

      // Check if user has booked before
      const { data: previousBooking } = await supabase
        .from('entertainment_bookings')
        .select('id, booking_status')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      userInteractions = {
        is_wishlisted: !!wishlistItem,
        wishlisted_at: wishlistItem?.created_at || null,
        is_following_organizer: !!following,
        has_booked_before: !!previousBooking,
        last_booking_status: previousBooking?.booking_status || null,
      };
    }

    // Increment view count (fire and forget)
    supabase
      .from('entertainment_items')
      .update({ total_views: (item.total_views || 0) + 1 })
      .eq('id', itemId)
      .then();

    return NextResponse.json({
      item: {
        ...item,
        sessions: sessions || [],
        ticket_types: ticketTypes || [],
        reviews_summary: reviewsSummary,
        urgency: urgency || null,
        user_interactions: userInteractions,
      }
    });

  } catch (error: any) {
    console.error('Item detail GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
