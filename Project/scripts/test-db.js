const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually load env vars
try {
    const envPath = path.join(__dirname, '../.env.local');
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

async function checkVouchers() {
    console.log('Checking vouchers table...');

    // 1. Check Raw Count
    const { count, error: countError } = await supabase.from('vouchers').select('*', { count: 'exact', head: true });
    if (countError) {
        console.error('Error counting vouchers:', countError);
        return;
    }
    console.log(`Total rows in 'vouchers': ${count}`);

    // 2. Check Query Used by API
    const { data, error } = await supabase
        .from('vouchers')
        .select('id, code, is_active, is_purchasable, starts_at, expires_at')
        .eq('is_active', true)
        .eq('is_purchasable', true);

    if (error) {
        console.error('Error fetching active vouchers:', error);
    } else {
        console.log(`Rows matching API filters: ${data.length}`);
        if (data.length > 0) {
            console.log('First 3 rows:', data.slice(0, 3));
        } else {
            console.log('No matching rows found. Checking why...');
            // Debug: Fetch all to see why they failed
            const { data: all } = await supabase.from('vouchers').select('id, code, is_active, is_purchasable');
            console.log('Sample of all vouchers:', all ? all.slice(0, 3) : 'None');
        }
    }
}

checkVouchers();
