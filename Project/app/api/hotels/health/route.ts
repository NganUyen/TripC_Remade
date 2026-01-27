/**
 * Hotel Service Health Check
 * 
 * GET /api/hotels/health
 * 
 * Detailed health check for hotel service database
 */

import { NextResponse } from 'next/server';
import { supabaseServerClient } from '@/lib/hotel/supabaseServerClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: any = {
    timestamp: new Date().toISOString(),
    database_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
    service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing',
    tables: {},
    overall_status: 'unknown'
  };

  try {
    // Check each table
    const tables = [
      'hotels',
      'hotel_rooms', 
      'hotel_partners',
      'hotel_partner_listings',
      'hotel_rates',
      'hotel_bookings',
      'hotel_reviews',
      'hotel_booking_modifications'
    ];

    for (const table of tables) {
      try {
        const { data, error, count } = await supabaseServerClient
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          checks.tables[table] = {
            status: 'error',
            error: error.message,
            code: error.code
          };
        } else {
          checks.tables[table] = {
            status: 'ok',
            count: count || 0
          };
        }
      } catch (err) {
        checks.tables[table] = {
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error'
        };
      }
    }

    // Determine overall status
    const allTablesOk = Object.values(checks.tables).every(
      (t: any) => t.status === 'ok'
    );
    checks.overall_status = allTablesOk ? 'ok' : 'error';

    // Add summary
    checks.summary = {
      total_tables: tables.length,
      ok: Object.values(checks.tables).filter((t: any) => t.status === 'ok').length,
      error: Object.values(checks.tables).filter((t: any) => t.status === 'error').length,
      total_records: Object.values(checks.tables)
        .filter((t: any) => t.status === 'ok')
        .reduce((sum: number, t: any) => sum + (t.count || 0), 0)
    };

    return NextResponse.json(checks, { 
      status: allTablesOk ? 200 : 500 
    });

  } catch (error) {
    return NextResponse.json({
      ...checks,
      overall_status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
