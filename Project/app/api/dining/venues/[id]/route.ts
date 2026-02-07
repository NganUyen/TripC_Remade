// API Route: GET /api/dining/venues/[id] - Get venue by ID
// PUT /api/dining/venues/[id] - Update venue
// DELETE /api/dining/venues/[id] - Delete venue

import { NextRequest, NextResponse } from 'next/server'
import { venueService } from '@/lib/dining'
import type { CreateVenueRequest } from '@/lib/dining/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const venue = await venueService.getVenueById(id)

    if (!venue) {
      return NextResponse.json(
        {
          success: false,
          error: 'Venue not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: venue,
    })
  } catch (error: any) {
    console.error('Error in GET /api/dining/venues/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch venue',
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
    const updates: Partial<CreateVenueRequest> = await request.json()

    const venue = await venueService.updateVenue(id, updates)

    if (!venue) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update venue',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: venue,
    })
  } catch (error: any) {
    console.error('Error in PUT /api/dining/venues/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update venue',
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
    const success = await venueService.deleteVenue(id)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete venue',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Venue deleted successfully',
    })
  } catch (error: any) {
    console.error('Error in DELETE /api/dining/venues/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete venue',
      },
      { status: 500 }
    )
  }
}
