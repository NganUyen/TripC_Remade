/**
 * Booking Details API - Get specific booking by reference
 * 
 * GET /api/entertainment/bookings/:reference - Get booking details with tickets
 * PUT /api/entertainment/bookings/:reference - Update booking (cancel, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/entertainment/bookings/:reference
 * Get booking details with tickets
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { reference: string } }
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
    const bookingRef = params.reference;

    // Fetch booking with all related data
    const { data: booking, error } = await supabase
      .from('entertainment_bookings')
      .select(`
        *,
        item:entertainment_items(*),
        session:entertainment_sessions(*),
        organizer:entertainment_organizers(*),
        tickets:entertainment_tickets(
          id,
          ticket_number,
          qr_code_data,
          status,
          checked_in_at,
          ticket_type:entertainment_ticket_types(*)
        )
      `)
      .eq('booking_reference', bookingRef)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }
      console.error('Booking query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch booking', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ booking });

  } catch (error: any) {
    console.error('Booking GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/entertainment/bookings/:reference
 * Update booking (cancel, etc.)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { reference: string } }
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
    const bookingRef = params.reference;
    const body = await request.json();

    // Verify booking ownership
    const { data: existingBooking } = await supabase
      .from('entertainment_bookings')
      .select('*')
      .eq('booking_reference', bookingRef)
      .eq('user_id', userId)
      .single();

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found or access denied' },
        { status: 404 }
      );
    }

    // Handle cancellation
    if (body.action === 'cancel') {
      // Check if already cancelled
      if (existingBooking.booking_status === 'cancelled') {
        return NextResponse.json(
          { error: 'Booking is already cancelled' },
          { status: 400 }
        );
      }

      // Cancel booking
      const { data: updatedBooking, error: updateError } = await supabase
        .from('entertainment_bookings')
        .update({
          booking_status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: body.reason || 'Cancelled by user',
        })
        .eq('id', existingBooking.id)
        .select()
        .single();

      if (updateError) {
        console.error('Booking update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to cancel booking', details: updateError.message },
          { status: 500 }
        );
      }

      // Update session availability (release tickets)
      if (existingBooking.session_id) {
        await supabase
          .from('entertainment_sessions')
          .update({
            booked_count: Math.max(0, existingBooking.total_quantity)
          })
          .eq('id', existingBooking.session_id);
      }

      // Invalidate tickets
      await supabase
        .from('entertainment_tickets')
        .update({ status: 'cancelled' })
        .eq('booking_id', existingBooking.id);

      // Create notification
      await supabase
        .from('entertainment_notifications')
        .insert([{
          user_id: userId,
          type: 'booking_cancelled',
          title: 'Booking Cancelled',
          message: `Your booking ${bookingRef} has been cancelled.`,
          item_id: existingBooking.item_id,
          booking_id: existingBooking.id,
        }]);

      return NextResponse.json({
        success: true,
        booking: updatedBooking,
        message: 'Booking cancelled successfully',
      });
    }

    // Handle refund request
    if (body.action === 'request_refund') {
      const { error: updateError } = await supabase
        .from('entertainment_bookings')
        .update({
          refund_status: 'requested',
          refund_requested_at: new Date().toISOString(),
          refund_reason: body.reason || 'Refund requested',
        })
        .eq('id', existingBooking.id);

      if (updateError) {
        console.error('Refund request error:', updateError);
        return NextResponse.json(
          { error: 'Failed to request refund', details: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Refund requested successfully',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Supported: cancel, request_refund' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Booking PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
