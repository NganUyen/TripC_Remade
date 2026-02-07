// API Route: GET /api/dining/reservations/[id] - Get reservation
// PUT /api/dining/reservations/[id] - Update reservation
// DELETE /api/dining/reservations/[id] - Cancel reservation

import { NextRequest, NextResponse } from 'next/server'
import { reservationService } from '@/lib/dining'
import type { DiningReservation } from '@/lib/dining/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reservation = await reservationService.getReservationById(id);

    if (!reservation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Reservation not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: reservation,
    })
  } catch (error: any) {
    console.error('Error in GET /api/dining/reservations/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch reservation',
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json()
    const { status, ...metadata } = body

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: 'status is required',
        },
        { status: 400 }
      )
    }

    const reservation = await reservationService.updateReservationStatus(
      id,
      status as DiningReservation['status'],
      metadata
    )

    if (!reservation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update reservation',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: reservation,
    })
  } catch (error: any) {
    console.error('Error in PUT /api/dining/reservations/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update reservation',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams
    const reason = searchParams.get('reason') || undefined

    const success = await reservationService.cancelReservation(id, reason)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to cancel reservation',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Reservation cancelled successfully',
    })
  } catch (error: any) {
    console.error('Error in DELETE /api/dining/reservations/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to cancel reservation',
      },
      { status: 500 }
    )
  }
}
