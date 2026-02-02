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

async function broadUpdate() {
    const patterns = [
        { title: '%Desert%', url: 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=2000' },
        { title: '%Museum%', url: 'https://images.unsplash.com/photo-1647424279391-49b15228800a?q=80&w=2000' },
        { title: '%Sightseeing%', url: 'https://images.unsplash.com/photo-1518391846015-55a9cc00bbad?q=80&w=2000' },
        { title: '%Cruise%', url: 'https://images.unsplash.com/photo-1506059612708-99d6c258160e?q=80&w=2000' },
        { title: '%Sapa%', url: 'https://images.unsplash.com/photo-1509059852496-f3822ae057bf?q=80&w=2000' }
    ];

    console.log('Performing broad database update for images...');

    for (const p of patterns) {
        const { data, error } = await supabase
            .from('activities')
            .update({
                image_url: p.url,
                images: [p.url],
                category: 'activity' // Fix possible null categories
            })
            .ilike('title', p.title)
            .select();

        if (error) {
            console.error(`Error updating ${p.title}:`, error);
        } else {
            console.log(`Updated ${data.length} activities matching ${p.title}`);
        }
    }

    // Catch-all for any activity with missing image
    const { data: missing, error: missingErr } = await supabase
        .from('activities')
        .update({
            image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000',
            category: 'activity'
        })
        .is('image_url', null)
        .select();

    if (!missingErr) {
        console.log(`Updated ${missing.length} activities with missing images.`);
    }
}

broadUpdate();
