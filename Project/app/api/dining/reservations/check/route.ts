// API Route: GET /api/dining/reservations/check - Check availability

import { NextRequest, NextResponse } from 'next/server'
import { reservationService } from '@/lib/dining'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const venueId = searchParams.get('venue_id')
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    const guestCount = searchParams.get('guest_count')

    if (!venueId || !date || !time || !guestCount) {
      return NextResponse.json(
        {
          success: false,
          error: 'venue_id, date, time, and guest_count are required',
        },
        { status: 400 }
      )
    }

    const availability = await reservationService.checkAvailability(
      venueId,
      date,
      time,
      parseInt(guestCount)
    )

    return NextResponse.json({
      success: true,
      data: availability,
    })
  } catch (error: any) {
    console.error('Error in GET /api/dining/reservations/check:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check availability',
      },
      { status: 500 }
    )
  }
}
