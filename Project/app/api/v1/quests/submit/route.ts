import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
    try {
        // 1. Auth Check
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Parse Body
        const body = await req.json()
        const { questId, evidenceUrl, notes } = body

        if (!questId) {
            return NextResponse.json({ error: 'Missing questId' }, { status: 400 })
        }

        const supabase = createServiceSupabaseClient()

        // 3. Verify User ID in Supabase from Clerk ID
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'User profile not found. Please refresh.' }, { status: 404 })
        }

        // 4. Verify Quest Logic (Optional: Check if already submitted? - relying on logic or UI for now, allowing multiple for repeatable quests unless constrained)
        // Check if quest exists and is active
        const { data: quest, error: questError } = await supabase
            .from('quests')
            .select('reward_amount, title')
            .eq('id', questId)
            .single()

        if (questError || !quest) {
            return NextResponse.json({ error: 'Quest not found or invalid' }, { status: 404 })
        }

        // 5. Submit Quest & Create Ledger Entry (Transaction-like)
        // Supabase doesn't support complex transactions via JS client easily without RPC, so we do simpler sequential inserts.
        // If strict atomicity is needed, move to RPC/Postgres Function.

        // A. Create Submission
        const { data: submission, error: subError } = await supabase
            .from('quest_submissions')
            .insert([{
                quest_id: questId,
                user_id: user.id,
                status: 'completed', // Auto-approve for demo
                submission_data: { evidenceUrl, notes }
            }])
            .select()
            .single()

        if (subError) {
            if (subError.code === 'PGRST205') {
                return NextResponse.json({ error: 'Quest system currently unavailable (Table Missing)' }, { status: 503 })
            }
            console.error('Submission failed:', subError)
            return NextResponse.json({ error: 'Failed to submit quest' }, { status: 500 })
        }

        // B. Create Ledger Entry (PENDING)
        const { error: ledgerError } = await supabase
            .from('tcent_ledger')
            .insert([{
                user_id: user.id,
                amount: quest.reward_amount,
                transaction_type: 'EARN',
                status: 'PENDING',
                description: `Reward pending for: ${quest.title}`,
                reference_type: 'quest_submission',
                reference_id: submission.id
            }])

        if (ledgerError) {
            console.error('Ledger entry failed:', ledgerError)
            // Rollback submission? (Ideally yes, but for MVP we log error. User will see 'Submitted' but maybe no pending balance UI if it relies on ledger)
            return NextResponse.json({ error: 'Submission recorded but ledger update failed' }, { status: 500 })
        }

        return NextResponse.json({ success: true, submissionId: submission.id })

    } catch (err) {
        console.error('Internal error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
