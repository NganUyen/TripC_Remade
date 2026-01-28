
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
        const { questId } = body

        if (!questId) {
            return NextResponse.json({ error: 'Quest ID required' }, { status: 400 })
        }

        const supabase = createServiceSupabaseClient()

        // 1. Get User Internal ID
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single()

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        // 2. Verify submission exists and is 'completed' (not claimed)
        // 2. Verify submission exists and is 'completed' (not claimed)
        const { data: submission } = await supabase
            .from('quest_submissions')
            .select('status, quest_id, quests(reward_amount, title)')
            .eq('user_id', user.id)
            .eq('quest_id', questId)
            .single()

        if (!submission) {
            return NextResponse.json({ error: 'No submission found' }, { status: 404 })
        }

        if (submission.status === 'claimed') {
            return NextResponse.json({ error: 'Already claimed' }, { status: 400 })
        }

        if (submission.status !== 'completed') {
            return NextResponse.json({ error: 'Quest not completed yet' }, { status: 400 })
        }

        const rewardAmount = (submission.quests as any)?.reward_amount || 0
        const questTitle = (submission.quests as any)?.title || 'Quest Reward'

        // 3. Process Transaction (Use RPC if strict, but manual for now)
        // A. Update submission status ATOMICALLY
        // We only update if the status is currently 'completed'.
        // This prevents race conditions where multiple requests try to claim at once.
        const { data: updatedSubmission, error: updateError } = await supabase
            .from('quest_submissions')
            .update({ status: 'claimed' })
            .eq('user_id', user.id)
            .eq('quest_id', questId)
            .eq('status', 'completed') // Critical check
            .select()
            .single()

        if (updateError) throw updateError

        if (!updatedSubmission) {
            // If no row was returned, it means the check failed (likely already claimed in a race)
            return NextResponse.json({ error: 'Quest already claimed or not completed' }, { status: 400 })
        }

        // B. Add Balance (Increment)
        const { data: currentUser } = await supabase.from('users').select('tcent_balance').eq('id', user.id).single()
        const newBalance = (currentUser?.tcent_balance || 0) + rewardAmount

        const { error: balanceError } = await supabase
            .from('users')
            .update({ tcent_balance: newBalance })
            .eq('id', user.id)

        if (balanceError) throw balanceError

        // C. Add Ledger Entry
        const { error: ledgerError } = await supabase
            .from('tcent_ledger')
            .insert({
                user_id: user.id,
                amount: rewardAmount,
                transaction_type: 'EARN',
                status: 'COMPLETED',
                balance_after: newBalance,
                reference_type: 'QUEST',
                reference_id: questId,
                description: `Reward for: ${questTitle}`
            })

        if (ledgerError) console.error('Failed to create ledger entry:', ledgerError)

        return NextResponse.json({ success: true, newBalance })

    } catch (err) {
        console.error('Internal error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
