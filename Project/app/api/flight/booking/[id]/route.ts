/**
 * Get Booking Details API Endpoint
 * 
 * GET /api/flight/booking/[id]
 * 
 * Retrieve details of a specific flight booking.
 * Requires authentication - users can only view their own bookings.
 * 
 * @param id - Booking UUID
 * @returns {JSON} Booking details
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerClient } from '@/lib/flight/supabaseServerClient';
import { verifyClerkAuth } from '@/lib/flight/clerkAuth';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verify authentication
    let user;
    try {
      user = await verifyClerkAuth();
    } catch (authError) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const bookingId = params.id;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Missing booking ID' },
        { status: 400 }
      );
    }

    // Fetch booking with flight details
    const { data: booking, error } = await supabaseServerClient
      .from('flight_bookings')
      .select(`
        *,
        offer:offer_id (
          cabin_class,
          fare_type
        ),
        flight:flight_id (
          airline_code,
          airline_name,
          flight_number,
          origin,
          origin_name,
          destination,
          destination_name,
          departure_at,
          arrival_at,
          duration_minutes,
          aircraft,
          amenities,
          baggage_allowance
        )
      `)
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify user owns this booking
    if (booking.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have access to this booking' },
        { status: 403 }
      );
    }

    // Format response
    const response = {
      success: true,
      booking: {
        id: booking.id,
        pnr: booking.pnr,
        status: booking.status,
        payment_status: booking.payment_status,
        price: {
          amount: booking.price_paid,
          currency: booking.currency,
        },
        passengers: booking.passengers,
        contact_info: booking.contact_info,
        flight: booking.flight ? {
          airline: {
            code: booking.flight.airline_code,
            name: booking.flight.airline_name,
          },
          flight_number: booking.flight.flight_number,
          route: {
            origin: {
              code: booking.flight.origin,
              name: booking.flight.origin_name,
            },
            destination: {
              code: booking.flight.destination,
              name: booking.flight.destination_name,
            },
          },
          schedule: {
            departure: booking.flight.departure_at,
            arrival: booking.flight.arrival_at,
            duration_minutes: booking.flight.duration_minutes,
          },
          aircraft: booking.flight.aircraft,
          amenities: booking.flight.amenities,
          baggage: booking.flight.baggage_allowance,
        } : null,
        cabin_class: booking.offer?.cabin_class,
        fare_type: booking.offer?.fare_type,
        tickets: booking.tickets,
        dates: {
          booked_at: booking.booked_at,
          confirmed_at: booking.confirmed_at,
          cancelled_at: booking.cancelled_at,
        },
        metadata: booking.metadata,
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Get booking error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/flight/booking/[id]
 * 
 * Cancel a flight booking (for MVP, just updates status to 'cancelled')
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verify authentication
    let user;
    try {
      user = await verifyClerkAuth();
    } catch (authError) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const bookingId = params.id;

    // Fetch existing booking
    const { data: booking, error: fetchError } = await supabaseServerClient
      .from('flight_bookings')
      .select('id, user_id, status, offer_id')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (booking.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You cannot cancel this booking' },
        { status: 403 }
      );
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Already cancelled', message: 'This booking is already cancelled' },
        { status: 400 }
      );
    }

    // Update booking status
    const { error: updateError } = await supabaseServerClient
      .from('flight_bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Cancellation failed', message: updateError.message },
        { status: 500 }
      );
    }

    // Return seats to inventory (if offer still exists)
    if (booking.offer_id) {
      const { data: bookingDetails } = await supabaseServerClient
        .from('flight_bookings')
        .select('passengers')
        .eq('id', bookingId)
        .single();

      if (bookingDetails?.passengers) {
        const passengerCount = Array.isArray(bookingDetails.passengers) 
          ? bookingDetails.passengers.length 
          : 0;

        await supabaseServerClient
          .from('flight_offers')
          .update({
            seats_available: supabaseServerClient.raw(`seats_available + ${passengerCount}`)
          })
          .eq('id', booking.offer_id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking_id: bookingId,
      note: 'Refund processing would be handled by Payment Service in production'
    }, { status: 200 });

  } catch (error) {
    console.error('Cancel booking error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}
