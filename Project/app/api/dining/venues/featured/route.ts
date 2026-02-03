// API Route: GET /api/dining/venues/featured - Get featured venues

import { NextRequest, NextResponse } from 'next/server'
import { venueService } from '@/lib/dining'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10

    const venues = await venueService.getFeaturedVenues(limit)

    return NextResponse.json({
      success: true,
      data: venues,
    })
  } catch (error: any) {
    console.error('Error in GET /api/dining/venues/featured:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch featured venues',
      },
      { status: 500 }
    )
  }
}
