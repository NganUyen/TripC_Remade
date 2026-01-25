import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = createServiceSupabaseClient()

        const { data: quests, error } = await supabase
            .from('quests')
            .select('id, title, description, reward_amount, quest_type, starts_at, expires_at')
            .eq('is_active', true)
            .order('reward_amount', { ascending: false }) // Show highest reward first

        if (error) {
            // PGRST205: Relation does not exist (Table missing)
            if (error.code === 'PGRST205') {
                console.warn('Quests table missing, returning empty list')
                return NextResponse.json({ quests: [] }) // Graceful degradation
            }
            console.error('Error fetching quests:', error)
            return NextResponse.json({ error: 'Failed to fetch quests' }, { status: 500 })
        }

        return NextResponse.json({ quests: quests || [] })
    } catch (err) {
        console.error('Internal error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
