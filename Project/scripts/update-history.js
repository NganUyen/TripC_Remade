const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runUpdate() {
    console.log('🚀 Updating User Search History Constraints...\n');

    const migrationPath = path.join(__dirname, '../database/migrations/update_user_search_history_category.sql');
    if (!fs.existsSync(migrationPath)) {
        console.error('❌ Migration file not found:', migrationPath);
        process.exit(1);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Split statements by semicolon
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (error) {
            console.error('❌ Error executing statement:', error);
            // If the error is regarding constraint check failing (e.g. existing data doesn't match), we might need to handle it.
            // But here we are broadening the check, so it should be fine unless we are shrinking it.
        } else {
            console.log('✅ Success');
        }
    }

    console.log('\n🎉 Update completed!');
}

runUpdate().catch(console.error);
