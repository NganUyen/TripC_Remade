/**
 * Flight Booking API Endpoint
 * 
 * POST /api/flight/book
 * 
 * Create a flight booking for an authenticated user.
 * This endpoint requires authentication via Clerk.
 * 
 * Request Body:
 * {
 *   "offer_id": "uuid",
 *   "passengers": [
 *     {
 *       "first_name": "John",
 *       "last_name": "Doe",
 *       "dob": "1990-01-01",
 *       "document_type": "passport",
 *       "document_number": "A12345678",
 *       "nationality": "VN"
 *     }
 *   ],
 *   "contact_info": {
 *     "email": "john@example.com",
 *     "phone": "+84901234567"
 *   }
 * }
 * 
 * @returns {JSON} Booking confirmation with PNR
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServerClient } from '@/lib/flight/supabaseServerClient';
import { verifyClerkAuth } from '@/lib/flight/clerkAuth';
import { generatePNR, validatePassengers } from '@/lib/flight/utils';

export const dynamic = 'force-dynamic';

interface Passenger {
  first_name: string;
  last_name: string;
  dob?: string;
  document_type?: string;
  document_number?: string;
  nationality?: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  emergency_contact?: string;
}

interface BookingRequest {
  offer_id: string;
  passengers: Passenger[];
  contact_info: ContactInfo;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    let user;
    try {
      user = await verifyClerkAuth();
    } catch (authError) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required. Please sign in to book flights.'
        },
        { status: 401 }
      );
    }

    // Parse request body
    let body: BookingRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON', message: 'Request body must be valid JSON' },
        { status: 400 }
      );
    }

    const { offer_id, passengers, contact_info } = body;

    // Validate required fields
    if (!offer_id) {
      return NextResponse.json(
        { error: 'Missing offer_id', message: 'offer_id is required' },
        { status: 400 }
      );
    }

    if (!passengers || !validatePassengers(passengers)) {
      return NextResponse.json(
        {
          error: 'Invalid passengers data',
          message: 'passengers must be an array with at least one passenger containing first_name and last_name'
        },
        { status: 400 }
      );
    }

    if (!contact_info || !contact_info.email || !contact_info.phone) {
      return NextResponse.json(
        {
          error: 'Invalid contact_info',
          message: 'contact_info must include email and phone'
        },
        { status: 400 }
      );
    }

    // Fetch offer details
    const { data: offer, error: offerError } = await supabaseServerClient
      .from('flight_offers')
      .select(`
        *,
        flights:flight_id (
          id,
          airline_code,
          airline_name,
          flight_number,
          origin,
          destination,
          departure_at,
          arrival_at
        )
      `)
      .eq('id', offer_id)
      .single();

    if (offerError || !offer) {
      return NextResponse.json(
        { error: 'Offer not found', message: 'The specified offer does not exist' },
        { status: 404 }
      );
    }

    // Check offer validity
    if (offer.valid_until && new Date(offer.valid_until) < new Date()) {
      return NextResponse.json(
        { error: 'Offer expired', message: 'This offer is no longer valid' },
        { status: 400 }
      );
    }

    // Check seat availability
    if (offer.seats_available < passengers.length) {
      return NextResponse.json(
        {
          error: 'Insufficient seats',
          message: `Only ${offer.seats_available} seats available, but ${passengers.length} requested`
        },
        { status: 400 }
      );
    }

    // Generate PNR
    let pnr = generatePNR();
    let pnrAttempts = 0;
    const maxPnrAttempts = 5;

    // Ensure PNR is unique
    while (pnrAttempts < maxPnrAttempts) {
      const { data: existingBooking } = await supabaseServerClient
        .from('flight_bookings')
        .select('id')
        .eq('pnr', pnr)
        .single();

      if (!existingBooking) break;

      pnr = generatePNR();
      pnrAttempts++;
    }

    if (pnrAttempts >= maxPnrAttempts) {
      return NextResponse.json(
        { error: 'System error', message: 'Failed to generate unique booking reference' },
        { status: 500 }
      );
    }

    // Create booking record
    const bookingData = {
      user_id: user.id,
      offer_id: offer.id,
      flight_id: offer.flight_id,
      passengers: passengers,
      contact_info: contact_info,
      price_paid: offer.total_price,
      currency: offer.currency,
      status: 'confirmed', // For MVP, auto-confirm (in production, would be 'pending' until payment)
      pnr: pnr,
      payment_status: 'pending', // Would integrate with Payment Service
      booked_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString(), // Auto-confirm for MVP
    };

    const { data: booking, error: bookingError } = await supabaseServerClient
      .from('flight_bookings')
      .insert([bookingData])
      .select()
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      return NextResponse.json(
        { error: 'Booking failed', message: bookingError.message },
        { status: 500 }
      );
    }

    // Auto-save travelers for the user
    try {
      const { upsertSavedTraveler } = await import('@/lib/actions/saved-travelers');
      for (const p of passengers) {
        await upsertSavedTraveler({
          first_name: p.first_name,
          last_name: p.last_name,
          email: contact_info.email, // Use booking contact email as fallback
          phone_number: contact_info.phone, // Use booking contact phone as fallback
          date_of_birth: p.dob,
          nationality: p.nationality,
          passport_number: p.document_number,
        }).catch(err => console.error('[AUTO_SAVE_TRAVELER] Failed for', p.first_name, err));
      }
    } catch (saveErr) {
      console.error('[AUTO_SAVE_TRAVELERS] Critical error in auto-save logic:', saveErr);
    }

    // Update seat availability (decrement)
    const { error: updateError } = await supabaseServerClient
      .from('flight_offers')
      .update({
        seats_available: offer.seats_available - passengers.length
      })
      .eq('id', offer.id);

    if (updateError) {
      console.error('Seat update error:', updateError);
      // Don't fail the booking, but log the error
    }

    // Format response
    const response = {
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: booking.id,
        pnr: booking.pnr,
        status: booking.status,
        payment_status: booking.payment_status,
        total_price: booking.price_paid,
        currency: booking.currency,
        passengers_count: passengers.length,
        flight: {
          airline: offer.flights.airline_code,
          flight_number: offer.flights.flight_number,
          route: `${offer.flights.origin} → ${offer.flights.destination}`,
          departure: offer.flights.departure_at,
          arrival: offer.flights.arrival_at,
        },
        booked_at: booking.booked_at,
      },
      next_steps: {
        payment: 'Payment integration pending - for MVP, booking is auto-confirmed',
        confirmation: 'Booking confirmation email would be sent via Notification Service',
        manage: `/my-bookings/${booking.id}`,
      }
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Booking error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/flight/book
 * 
 * Returns API documentation for the booking endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/flight/book',
    method: 'POST',
    authentication: 'Required (Clerk)',
    description: 'Create a flight booking',
    request_body: {
      offer_id: 'UUID of the flight offer',
      passengers: [
        {
          first_name: 'string (required)',
          last_name: 'string (required)',
          dob: 'string (optional, YYYY-MM-DD)',
          document_type: 'string (optional)',
          document_number: 'string (optional)',
          nationality: 'string (optional, 2-letter country code)',
        }
      ],
      contact_info: {
        email: 'string (required)',
        phone: 'string (required)',
        emergency_contact: 'string (optional)',
      }
    },
    response: {
      success: 'boolean',
      booking: {
        id: 'UUID',
        pnr: '6-character alphanumeric booking reference',
        status: 'confirmed | pending | cancelled',
        total_price: 'number',
        currency: 'string',
      }
    }
  });
}
