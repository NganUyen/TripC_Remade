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

async function updatePopularImages() {
    const updates = [
        {
            title: 'City Sightseeing Tour',
            imageUrl: 'https://images.unsplash.com/photo-1518391846015-55a9cc00bbad?q=80&w=2070&auto=format&fit=crop'
        },
        {
            title: 'Museum of Future Entry',
            imageUrl: 'https://images.unsplash.com/photo-1647424279391-49b15228800a?q=80&w=2070&auto=format&fit=crop'
        }
    ];

    for (const update of updates) {
        console.log(`Updating image for ${update.title}...`);
        const { data, error } = await supabase
            .from('activities')
            .update({ image_url: update.imageUrl })
            .ilike('title', `%${update.title}%`)
            .select();

        if (error) {
            console.error(`Error updating ${update.title}:`, error);
        } else {
            console.log(`Update successful for ${update.title}`);
        }
    }
}

updatePopularImages();
