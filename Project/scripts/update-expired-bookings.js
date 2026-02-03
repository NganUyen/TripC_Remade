/**
 * Update Expired Bookings - Set all expired bookings to cancelled status
 * Run: node scripts/update-expired-bookings.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    console.error('   Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateExpiredBookings() {
    console.log('🚀 Starting expired bookings update...\n');
    console.log(`📅 Current time: ${new Date().toISOString()}\n`);

    try {
        // Read migration SQL
        const migrationPath = path.join(__dirname, '../supabase/migrations/20260203_update_expired_bookings.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        // Split into individual statements
        const statements = migrationSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log('📋 Executing updates...\n');

        // Execute each UPDATE statement
        const updateStatements = statements.filter(s => s.toUpperCase().startsWith('UPDATE'));

        for (const statement of updateStatements) {
            const tableName = statement.match(/UPDATE\s+(\w+)/i)?.[1];
            console.log(`  Updating ${tableName}...`);

            const { error } = await supabase.rpc('exec_sql', {
                sql: statement + ';'
            });

            if (error) {
                console.error(`  ❌ Error updating ${tableName}:`, error.message);
            } else {
                console.log(`  ✅ ${tableName} updated`);
            }
        }

        console.log('\n📊 Checking results...\n');

        // Check bookings table
        const { count: bookingsCount } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'cancelled')
            .not('expires_at', 'is', null)
            .lt('expires_at', new Date().toISOString());

        console.log(`  📦 bookings: ${bookingsCount || 0} expired bookings now cancelled`);

        // Check hotel_bookings table
        const { count: hotelCount } = await supabase
            .from('hotel_bookings')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'cancelled')
            .not('expires_at', 'is', null)
            .lt('expires_at', new Date().toISOString());

        console.log(`  🏨 hotel_bookings: ${hotelCount || 0} expired bookings now cancelled`);

        // Check event_bookings table
        const { count: eventCount } = await supabase
            .from('event_bookings')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'cancelled')
            .not('expires_at', 'is', null)
            .lt('expires_at', new Date().toISOString());

        console.log(`  🎫 event_bookings: ${eventCount || 0} expired bookings now cancelled`);

        // Check entertainment_bookings table
        const { count: entertainmentCount } = await supabase
            .from('entertainment_bookings')
            .select('*', { count: 'exact', head: true })
            .eq('booking_status', 'cancelled')
            .not('expires_at', 'is', null)
            .lt('expires_at', new Date().toISOString());

        console.log(`  🎭 entertainment_bookings: ${entertainmentCount || 0} expired bookings now cancelled`);

        // Check dining_appointment table
        const { count: diningCount } = await supabase
            .from('dining_appointment')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'cancelled')
            .not('expires_at', 'is', null)
            .lt('expires_at', new Date().toISOString());

        console.log(`  🍽️  dining_appointment: ${diningCount || 0} expired bookings now cancelled`);

        const totalUpdated = (bookingsCount || 0) + (hotelCount || 0) + (eventCount || 0) +
            (entertainmentCount || 0) + (diningCount || 0);

        console.log(`\n🎉 Update completed! Total expired bookings updated: ${totalUpdated}`);
        console.log('\n💡 Tip: Refresh your My Bookings page to see the changes');

    } catch (error) {
        console.error('\n❌ Error during update:', error);
        process.exit(1);
    }
}

updateExpiredBookings().catch(console.error);
