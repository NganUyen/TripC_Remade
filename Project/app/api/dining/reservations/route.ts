// API Route: POST /api/dining/reservations - Create reservation
// GET /api/dining/reservations?user_id=xxx&venue_id=xxx&date=xxx

import { NextRequest, NextResponse } from 'next/server'
import { reservationService } from '@/lib/dining'
import type { CreateReservationRequest } from '@/lib/dining/types'

export async function POST(request: NextRequest) {
  try {
    const body: CreateReservationRequest = await request.json()

    // Get user ID from headers (you'll need to implement auth middleware)
    const userId = request.headers.get('x-user-id') || 'anonymous'

    if (!body.venue_id || !body.reservation_date || !body.reservation_time || !body.guest_count || !body.guest_name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: venue_id, reservation_date, reservation_time, guest_count, guest_name',
        },
        { status: 400 }
      )
    }

    // Check availability
    const availability = await reservationService.checkAvailability(
      body.venue_id,
      body.reservation_date,
      body.reservation_time,
      body.guest_count
    )

    if (!availability.available) {
      return NextResponse.json(
        {
          success: false,
          error: availability.reason || 'Time slot not available',
        },
        { status: 400 }
      )
    }

    const reservation = await reservationService.createReservation(body, userId)

    if (!reservation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create reservation',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: reservation,
    })
  } catch (error: any) {
    console.error('Error in POST /api/dining/reservations:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create reservation',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('user_id')
    const venueId = searchParams.get('venue_id')
    const date = searchParams.get('date')
    const status = searchParams.get('status') || undefined

    if (userId) {
      // Get user's reservations
      const reservations = await reservationService.getUserReservations(userId)
      return NextResponse.json({
        success: true,
        data: reservations,
      })
    }

    if (venueId && date) {
      // Get venue reservations for a date
      const reservations = await reservationService.getVenueReservationsByDate(venueId, date, status)
      return NextResponse.json({
        success: true,
        data: reservations,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'user_id or (venue_id and date) is required',
      },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error in GET /api/dining/reservations:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch reservations',
      },
      { status: 500 }
    )
  }
}
