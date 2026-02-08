/**
 * Routes Management API for Flight Partners
 * GET /api/partner/flight/routes - List all routes
 * POST /api/partner/flight/routes - Create new route
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteSchema } from '@/lib/flight-partner/validation';
import {
  getPartnerRoutes,
  createRoute,
} from '@/lib/flight-partner/database';
import { ZodError } from 'zod';

function getPartnerId(req: NextRequest): string {
  const partnerId = req.headers.get('x-partner-id');
  if (!partnerId) {
    throw new Error('Partner ID not found');
  }
  return partnerId;
}

/**
 * GET /api/partner/flight/routes
 */
export async function GET(req: NextRequest) {
  try {
    const partnerId = getPartnerId(req);
    const routes = await getPartnerRoutes(partnerId);

    return NextResponse.json({
      success: true,
      data: routes,
      count: routes.length,
    });
  } catch (error: any) {
    console.error('Error fetching routes:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error.message || 'Failed to fetch routes',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/partner/flight/routes
 */
export async function POST(req: NextRequest) {
  try {
    const partnerId = getPartnerId(req);
    const body = await req.json();

    const validatedData = createRouteSchema.parse(body);
    const route = await createRoute(partnerId, validatedData);

    return NextResponse.json(
      {
        success: true,
        data: route,
        message: 'Route created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating route:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error.message || 'Failed to create route',
        },
      },
      { status: 500 }
    );
  }
}
