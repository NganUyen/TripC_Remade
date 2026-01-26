/**
 * Supabase Server Client
 * 
 * This module provides a server-side Supabase client with service role access.
 * IMPORTANT: This should ONLY be used in server-side code (API routes, server components).
 * Never expose the service role key to the browser.
 * 
 * @module lib/flight/supabaseServerClient
 */

import { createClient } from '@supabase/supabase-js';

// Validate required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
    'Please add it to your .env.local file.'
  );
}

if (!supabaseServiceKey) {
  throw new Error(
    'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. ' +
    'Please add it to your .env.local file. ' +
    'WARNING: Never commit this key to version control!'
  );
}

/**
 * Server-side Supabase client with service role privileges
 * 
 * This client bypasses Row Level Security (RLS) and has full database access.
 * Use with caution and always validate user permissions in your application logic.
 */
export const supabaseServerClient = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

/**
 * Type-safe database schema types
 * These should be generated from your Supabase schema using the Supabase CLI:
 * npx supabase gen types typescript --project-id <project-id> > types/supabase.ts
 */
export type Database = {
  public: {
    Tables: {
      flights: {
        Row: {
          id: string;
          airline_code: string;
          airline_name: string | null;
          flight_number: string;
          origin: string;
          origin_name: string | null;
          destination: string;
          destination_name: string | null;
          departure_at: string;
          arrival_at: string;
          duration_minutes: number | null;
          aircraft: string | null;
          seat_classes: any;
          amenities: any;
          baggage_allowance: any;
          metadata: any;
          base_price: number;
          currency: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
      };
      flight_offers: {
        Row: {
          id: string;
          offer_key: string;
          flight_id: string;
          total_price: number;
          currency: string;
          seats_available: number;
          cabin_class: string;
          fare_type: string;
          provider: string;
          rules: any;
          metadata: any;
          valid_until: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      flight_bookings: {
        Row: {
          id: string;
          user_id: string;
          offer_id: string | null;
          flight_id: string | null;
          passengers: any;
          contact_info: any;
          price_paid: number;
          currency: string;
          status: string;
          pnr: string | null;
          booking_reference: string | null;
          payment_status: string;
          payment_id: string | null;
          tickets: any;
          metadata: any;
          booked_at: string;
          confirmed_at: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};

/**
 * Helper function to test database connectivity
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabaseServerClient
      .from('flights')
      .select('id')
      .limit(1);
    
    return !error;
  } catch (err) {
    console.error('Database connection test failed:', err);
    return false;
  }
}
