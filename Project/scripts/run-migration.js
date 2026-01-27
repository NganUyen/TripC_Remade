/**
 * Migration Runner - Execute Flight Service SQL migrations
 * Run: node scripts/run-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Starting Flight Service migration...\n');

  // Read schema migration
  const schemaPath = path.join(__dirname, '../supabase/migrations/20260125_flight_service_schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('📋 Running schema migration...');
  const { data: schemaData, error: schemaError } = await supabase.rpc('exec_sql', { 
    sql: schemaSql 
  });

  if (schemaError) {
    console.error('❌ Schema migration failed:', schemaError);
    
    // Try alternative method - split and execute statements
    console.log('\n🔄 Trying alternative method...');
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      if (error && !error.message.includes('already exists')) {
        console.error('❌ Error executing statement:', error);
      }
    }
  } else {
    console.log('✅ Schema migration completed');
  }

  // Read seed migration
  const seedPath = path.join(__dirname, '../supabase/migrations/20260125_flight_service_seed.sql');
  const seedSql = fs.readFileSync(seedPath, 'utf8');

  console.log('\n📋 Running seed migration...');
  const { data: seedData, error: seedError } = await supabase.rpc('exec_sql', { 
    sql: seedSql 
  });

  if (seedError) {
    console.error('❌ Seed migration failed:', seedError);
  } else {
    console.log('✅ Seed migration completed');
  }

  // Verify tables were created
  console.log('\n🔍 Verifying tables...');
  const { data: flights, error: flightsError } = await supabase
    .from('flights')
    .select('count');

  const { data: offers, error: offersError } = await supabase
    .from('flight_offers')
    .select('count');

  const { data: bookings, error: bookingsError } = await supabase
    .from('flight_bookings')
    .select('count');

  if (flightsError) console.error('⚠️  flights table:', flightsError.message);
  else console.log('✅ flights table exists');

  if (offersError) console.error('⚠️  flight_offers table:', offersError.message);
  else console.log('✅ flight_offers table exists');

  if (bookingsError) console.error('⚠️  flight_bookings table:', bookingsError.message);
  else console.log('✅ flight_bookings table exists');

  console.log('\n🎉 Migration process completed!');
}

runMigration().catch(console.error);
