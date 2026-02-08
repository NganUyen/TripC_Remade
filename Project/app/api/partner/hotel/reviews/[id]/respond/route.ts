/**
 * Review Response API for Partners
 * POST /api/partner/hotel/reviews/[id]/respond - Respond to a review
 */

import { NextRequest, NextResponse } from 'next/server';
import { reviewResponseSchema } from '@/lib/hotel-partner/validation';
import { respondToReview } from '@/lib/hotel-partner/database';
import { supabaseServerClient } from '@/lib/hotel/supabaseServerClient';

function getPartnerId(req: NextRequest): string {
  const partnerId = req.headers.get('x-partner-id');
  if (!partnerId) {
    throw new Error('Partner ID not found');
  }
  return partnerId;
}

function getPartnerUserId(req: NextRequest): string {
  const userId = req.headers.get('x-partner-user-id');
  if (!userId) {
    throw new Error('Partner user ID not found');
  }
  return userId;
}

/**
 * POST /api/partner/hotel/reviews/[id]/respond
 * Add partner response to a review
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partnerId = getPartnerId(req);
    const partnerUserId = getPartnerUserId(req);
    const reviewId = params.id;
    const body = await req.json();

    // Validate request body
    const validation = reviewResponseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid response data',
            details: validation.error.errors,
          },
        },
        { status: 422 }
      );
    }

    // Get review to verify ownership
    const { data: review, error: reviewError } = await supabaseServerClient
      .from('hotel_reviews')
      .select('hotel_id, partner_response')
      .eq('id', reviewId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Review not found',
          },
        },
        { status: 404 }
      );
    }

    // Check if already responded
    if (review.partner_response) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ALREADY_RESPONDED',
            message: 'This review already has a partner response',
          },
        },
        { status: 400 }
      );
    }

    // Verify hotel ownership
    const { data: listing } = await supabaseServerClient
      .from('hotel_partner_listings')
      .select('id')
      .eq('partner_id', partnerId)
      .eq('hotel_id', review.hotel_id)
      .eq('is_active', true)
      .single();

    if (!listing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Access denied to this review',
          },
        },
        { status: 403 }
      );
    }

    // Add response
    const updatedReview = await respondToReview(
      reviewId,
      validation.data.response_text,
      partnerUserId
    );

    return NextResponse.json({
      success: true,
      data: updatedReview,
      message: 'Response added successfully',
    });
  } catch (error: any) {
    console.error('Error responding to review:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RESPONSE_ERROR',
          message: error.message || 'Failed to add response',
        },
      },
      { status: 500 }
    );
  }
}
