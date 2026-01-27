// API Route: GET /api/dining/venues/slug/[slug] - Get venue by slug

import { NextRequest, NextResponse } from 'next/server'
import { venueService } from '@/lib/dining'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const venue = await venueService.getVenueBySlug(params.slug)

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
    console.error('Error in GET /api/dining/venues/slug/[slug]:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch venue',
      },
      { status: 500 }
    )
  }
}
