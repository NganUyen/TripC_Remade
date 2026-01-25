/**
 * Migration API Route
 * GET /api/migrate - Run database migrations
 * For development/admin use only
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const results: any[] = [];

    // Read and execute schema migration
    const schemaPath = path.join(process.cwd(), 'supabase/migrations/20260125_flight_service_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    results.push({ step: 'schema', status: 'executing' });

    // Execute schema SQL directly
    const { data: schemaData, error: schemaError } = await supabase.rpc('exec_sql', {
      sql: schemaSql
    });

    if (schemaError) {
      results.push({ step: 'schema', status: 'error', error: schemaError.message });
    } else {
      results.push({ step: 'schema', status: 'success' });
    }

    // Read and execute seed migration
    const seedPath = path.join(process.cwd(), 'supabase/migrations/20260125_flight_service_seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    
    results.push({ step: 'seed', status: 'executing' });

    const { data: seedData, error: seedError } = await supabase.rpc('exec_sql', {
      sql: seedSql
    });

    if (seedError) {
      results.push({ step: 'seed', status: 'error', error: seedError.message });
    } else {
      results.push({ step: 'seed', status: 'success' });
    }

    // Verify tables
    const { count: flightCount } = await supabase
      .from('flights')
      .select('*', { count: 'exact', head: true });

    const { count: offerCount } = await supabase
      .from('flight_offers')
      .select('*', { count: 'exact', head: true });

    const { count: bookingCount } = await supabase
      .from('flight_bookings')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      results,
      verification: {
        flights: flightCount,
        flight_offers: offerCount,
        flight_bookings: bookingCount
      }
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        error: 'Migration failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
