
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        let { questId, questType } = body

        const supabase = createServiceSupabaseClient()

        if (!questId && questType) {
            const { data: quest } = await supabase
                .from('quests')
                .select('id')
                .eq('quest_type', questType)
                .eq('is_active', true)
                .single()
            if (quest) questId = quest.id
        }

        if (!questId) {
            return NextResponse.json({ error: 'Quest ID or Type required' }, { status: 400 })
        }

        // 1. Get User ID
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, bio, city, country, phone_number') // details needed for verification
            .eq('clerk_id', userId)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // 2. Verify Logic (Specific to Complete Profile for now)
        // In a real app, we might look up the quest requirements.
        // For now, hardcode the check for this specific quest type or ID.

        // Check if bio, city, country, and phone are filled
        const isProfileComplete = user.bio && user.city && user.country && user.phone_number

        if (!isProfileComplete) {
            const missing = []
            if (!user.bio) missing.push('bio')
            if (!user.city) missing.push('city')
            if (!user.country) missing.push('country')
            if (!user.phone_number) missing.push('phone')
            console.log('Profile incomplete, missing:', missing)
            return NextResponse.json({ completed: false, message: 'Profile incomplete', missing })
        }

        // Check if already claimed to avoid overwriting status
        const { data: existingSubmission } = await supabase
            .from('quest_submissions')
            .select('status')
            .eq('user_id', user.id)
            .eq('quest_id', questId)
            .single()

        if (existingSubmission?.status === 'claimed') {
            return NextResponse.json({ completed: true, message: 'Already claimed' })
        }

        // 3. Mark as Completed (but not claimed)
        const { error: upsertError } = await supabase
            .from('quest_submissions')
            .upsert({
                user_id: user.id,
                quest_id: questId,
                status: 'completed',
                submitted_at: new Date().toISOString(),
                submission_data: {} // Required by DB
            }, { onConflict: 'user_id, quest_id' })

        if (upsertError) {
            console.error('Failed to update submission:', upsertError)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        return NextResponse.json({ completed: true })

    } catch (err) {
        console.error('Internal error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
