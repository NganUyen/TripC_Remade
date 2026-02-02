// API Route: GET /api/dining/menus/items?venue_id=xxx&menu_id=xxx&featured=true

import { NextRequest, NextResponse } from 'next/server'
import { menuService } from '@/lib/dining'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const venueId = searchParams.get('venue_id')
    const menuId = searchParams.get('menu_id')
    const featured = searchParams.get('featured') === 'true'

    if (menuId) {
      // Get items for specific menu
      const items = await menuService.getMenuItems(menuId)
      return NextResponse.json({
        success: true,
        data: items,
      })
    }

    if (venueId) {
      if (featured) {
        // Get featured items for venue
        const items = await menuService.getFeaturedMenuItems(venueId)
        return NextResponse.json({
          success: true,
          data: items,
        })
      } else {
        // Get all items for venue
        const items = await menuService.getVenueMenuItems(venueId)
        return NextResponse.json({
          success: true,
          data: items,
        })
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'venue_id or menu_id is required',
      },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error in GET /api/dining/menus/items:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch menu items',
      },
      { status: 500 }
    )
  }
}
