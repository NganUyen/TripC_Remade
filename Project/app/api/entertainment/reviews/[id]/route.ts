/**
 * Individual Review API - Update and delete user reviews
 * 
 * PUT /api/entertainment/reviews/:id - Update review
 * DELETE /api/entertainment/reviews/:id - Delete review
 * POST /api/entertainment/reviews/:id/helpful - Mark review as helpful
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { auth } from '@clerk/nextjs/server';

/**
 * PUT /api/entertainment/reviews/:id
 * Update existing review
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    const supabase = createServiceSupabaseClient();
    const reviewId = params.id;
    const body = await request.json();

    // Validate rating if provided
    if (body.rating && (body.rating < 1 || body.rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Update review (only owner can update)
    const updateData: any = {};
    if (body.rating) updateData.rating = body.rating;
    if (body.review_text) updateData.review_text = body.review_text;
    if (body.reviewer_name) updateData.reviewer_name = body.reviewer_name;

    const { data, error } = await supabase
      .from('entertainment_reviews')
      .update(updateData)
      .eq('id', reviewId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Review not found or access denied' },
          { status: 404 }
        );
      }
      console.error('Review update error:', error);
      return NextResponse.json(
        { error: 'Failed to update review', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      review: data,
      message: 'Review updated successfully',
    });

  } catch (error: any) {
    console.error('Review PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/entertainment/reviews/:id
 * Delete review
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    const supabase = createServiceSupabaseClient();
    const reviewId = params.id;

    // Delete review (only owner can delete)
    const { data, error } = await supabase
      .from('entertainment_reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Review delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete review', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Review not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });

  } catch (error: any) {
    console.error('Review DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
