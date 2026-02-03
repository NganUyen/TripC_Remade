const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually load env vars
try {
    const envPath = path.join(__dirname, '../.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/"/g, ''); // remove quotes
            if (key && !key.startsWith('#')) {
                process.env[key] = value;
            }
        }
    });
} catch (e) {
    console.error('Failed to load .env.local', e.message);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars:', { url: !!supabaseUrl, key: !!supabaseKey });
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function inspectSchema() {
    console.log('Inspecting schema...');

    // Attempt to list tables using RPC if available, or just guess
    // Since we can't easily list tables with client-js without permissions or specific function
    // We will try to fetch one row from common table names related to destinations

    // 1. Fetch all activities
    const { data: activities, error: actError } = await supabase.from('activities').select('id, title, location, price, image_url, rating, description');
    if (actError) {
        console.error('Error fetching activities:', actError);
        return;
    }

    // 2. Fetch bookings to count popularity
    const { data: bookings, error: bookError } = await supabase.from('bookings').select('metadata').eq('category', 'activity');
    if (bookError) {
        console.error('Error fetching bookings:', bookError);
        // We'll proceed with just activities if bookings fail
    }

    const popularityMap = {};
    if (bookings) {
        bookings.forEach(b => {
            const actId = b.metadata?.activity_id;
            if (actId) {
                popularityMap[actId] = (popularityMap[actId] || 0) + 1;
            }
        });
    }

    // 3. Attach popularity and sort
    const enriched = activities.map(a => ({
        ...a,
        bookingCount: popularityMap[a.id] || 0
    })).sort((a, b) => b.bookingCount - a.bookingCount || b.rating - a.rating);

    console.log('Popular Activities:');
    console.log(JSON.stringify(enriched.slice(0, 6), null, 2));
}

inspectSchema();
