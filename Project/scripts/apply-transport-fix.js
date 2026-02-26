const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyFix() {
    console.log('🚀 Applying transport_providers schema fix...');

    const sql = `
    -- 0. Fix transport_providers table (ensure all columns exist)
    ALTER TABLE public.transport_providers ADD COLUMN IF NOT EXISTS logo_url TEXT;
    ALTER TABLE public.transport_providers ADD COLUMN IF NOT EXISTS contact_email TEXT;
    ALTER TABLE public.transport_providers ADD COLUMN IF NOT EXISTS contact_phone TEXT;
    ALTER TABLE public.transport_providers ADD COLUMN IF NOT EXISTS address TEXT;
    ALTER TABLE public.transport_providers ADD COLUMN IF NOT EXISTS website TEXT;
    ALTER TABLE public.transport_providers ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE public.transport_providers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

    -- 1. Create Transport Vehicles Table
    CREATE TABLE IF NOT EXISTS public.transport_vehicles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID NOT NULL REFERENCES public.transport_providers(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        plate_number TEXT NOT NULL,
        model TEXT,
        capacity INTEGER DEFAULT 1,
        amenities JSONB DEFAULT '{}'::jsonb,
        images TEXT[] DEFAULT '{}'::text[],
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 2. Create Transport Drivers Table
    CREATE TABLE IF NOT EXISTS public.transport_drivers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID NOT NULL REFERENCES public.transport_providers(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        license_number TEXT,
        license_expiry DATE,
        status TEXT DEFAULT 'available' CHECK (status IN ('available', 'on_trip', 'off_duty')),
        rating NUMERIC DEFAULT 5.0,
        total_trips INTEGER DEFAULT 0,
        joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE public.transport_vehicles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.transport_drivers ENABLE ROW LEVEL SECURITY;
  `;

    console.log('📋 Running SQL statements...');

    // Split SQL into individual statements to avoid issues with some RPC implementations
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (error) {
            if (error.message.includes('already exists')) {
                console.log('Info: Already exists/Applied.');
            } else {
                console.error('❌ Error executing statement:', error);
            }
        }
    }

    console.log('✅ Fix applied!');
}

applyFix().catch(console.error);
