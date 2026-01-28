import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const { userId } = await auth()
        const supabase = createServiceSupabaseClient()

        // 1. Fetch active quests
        const { data: quests, error: questsError } = await supabase
            .from('quests')
            .select('id, title, description, reward_amount, quest_type, starts_at, expires_at')
            .eq('is_active', true)
            .order('reward_amount', { ascending: false })

        if (questsError) {
            console.error('Error fetching quests:', questsError)
            return NextResponse.json({ error: 'Failed to fetch quests' }, { status: 500 })
        }



        // Wait, I need the internal user ID.
        // Let's get the user ID first.
        // 2. If user is logged in, fetch their submissions
        let submissions: any[] = []
        let internalUserId = null
        if (userId) {
            const { data: user } = await supabase.from('users').select('id').eq('clerk_id', userId).single()
            if (user) {
                internalUserId = user.id
                const { data: userSubmissions } = await supabase
                    .from('quest_submissions')
                    .select('quest_id, status')
                    .eq('user_id', internalUserId)
                submissions = userSubmissions || []
            }
        }

        // 3. Merge data
        const questsWithStatus = quests.map(quest => {
            const submission = submissions.find(s => s.quest_id === quest.id)
            return {
                ...quest,
                status: submission ? submission.status : null // 'pending', 'approved', 'rejected', 'completed', 'claimed'
            }
        })

        return NextResponse.json({ quests: questsWithStatus })
    } catch (err) {
        console.error('Internal error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
