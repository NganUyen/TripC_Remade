// API Route: GET /api/dining/menus?venue_id=xxx - Get menus for a venue

import { NextRequest, NextResponse } from 'next/server'
import { menuService } from '@/lib/dining'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const venueId = searchParams.get('venue_id')

    if (!venueId) {
      return NextResponse.json(
        {
          success: false,
          error: 'venue_id is required',
        },
        { status: 400 }
      )
    }

    const menus = await menuService.getVenueMenus(venueId)

    return NextResponse.json({
      success: true,
      data: menus,
    })
  } catch (error: any) {
    console.error('Error in GET /api/dining/menus:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch menus',
      },
      { status: 500 }
    )
  }
}
