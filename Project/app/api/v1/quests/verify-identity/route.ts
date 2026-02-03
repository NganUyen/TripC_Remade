import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

const COMPLETE_PROFILE_QUEST_ID = 'e6cf7abb-2a91-4c29-9d6d-a35f91f5cc8d'

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const supabase = createServiceSupabaseClient()

        // 1. Get User Profile
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('clerk_id', userId)
            .single()

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        // 2. Check if Profile is Complete (Email + Phone + Name)
        // Adjust criteria as needed
        const isProfileComplete = !!(user.email && user.phone)

        if (!isProfileComplete) {
            return NextResponse.json({
                success: false,
                message: 'Profile incomplete',
                missing: {
                    email: !user.email,
                    phone: !user.phone
                }
            })
        }

        // 3. Check if already submitted/completed
        const { data: existing } = await supabase
            .from('quest_submissions')
            .select('*')
            .eq('user_id', user.id)
            .eq('quest_id', COMPLETE_PROFILE_QUEST_ID)
            .single()

        if (existing) {
            if (existing.status === 'SUBMITTED') {
                // Auto-upgrade to completed if it was just submitted
                await supabase
                    .from('quest_submissions')
                    .update({ status: 'completed' })
                    .eq('id', existing.id)
                return NextResponse.json({ success: true, status: 'completed', upgraded: true })
            }
            return NextResponse.json({ success: true, status: existing.status, alreadyExists: true })
        }

        // 4. Create Completed Submission
        const { error: insertError } = await supabase
            .from('quest_submissions')
            .insert([{
                quest_id: COMPLETE_PROFILE_QUEST_ID,
                user_id: user.id,
                status: 'completed', // Direct to completed
                submission_data: { method: 'auto-verify' }
            }])

        if (insertError) throw insertError

        return NextResponse.json({ success: true, status: 'completed', created: true })

    } catch (err) {
        console.error('Verify error:', err)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
