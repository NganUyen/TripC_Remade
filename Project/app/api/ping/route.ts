/**
 * Health Check API Endpoint
 * 
 * GET /api/ping
 * 
 * Returns the health status of the API and database connection.
 * This endpoint is public and does not require authentication.
 * 
 * @returns {JSON} Health status object
 */

import { NextResponse } from 'next/server';
import { supabaseServerClient, testDatabaseConnection } from '@/lib/flight/supabaseServerClient';

export const dynamic = 'force-dynamic';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  api: 'ok' | 'error';
  database: 'ok' | 'error';
  version: string;
  error?: string;
}

export async function GET() {
  const timestamp = new Date().toISOString();
  
  try {
    // Test database connection
    const dbHealthy = await testDatabaseConnection();
    
    if (!dbHealthy) {
      const response: HealthStatus = {
        status: 'degraded',
        timestamp,
        api: 'ok',
        database: 'error',
        version: '1.0.0',
        error: 'Database connection failed'
      };
      
      return NextResponse.json(response, { status: 503 });
    }

    // All systems operational
    const response: HealthStatus = {
      status: 'ok',
      timestamp,
      api: 'ok',
      database: 'ok',
      version: '1.0.0'
    };

    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    const response: HealthStatus = {
      status: 'error',
      timestamp,
      api: 'error',
      database: 'error',
      version: '1.0.0',
      error: errorMessage
    };

    return NextResponse.json(response, { status: 500 });
  }
}
