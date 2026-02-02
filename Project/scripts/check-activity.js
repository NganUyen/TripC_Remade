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
    console.error('Failed to load .env', e.message);
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

async function checkSpecificActivity() {
    const activityId = '01d503a6-a6f1-4cf4-a229-6ff757c3d606';
    console.log(`Checking activity ID: ${activityId}`);

    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .limit(1)
        .single();

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Columns:', Object.keys(data).join(', '));
        console.log('Sample Data:', JSON.stringify(data, null, 2));
    }

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Result:', JSON.stringify(data, null, 2));
    }
}

checkSpecificActivity();
