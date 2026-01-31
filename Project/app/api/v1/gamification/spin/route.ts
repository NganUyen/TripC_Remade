import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = createServiceSupabaseClient();

        // Resolve user UUID
        const { data: dbUser } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', user.id)
            .single();

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userId = dbUser.id;

        // Check Rate Limit (1 spin per calendar day UTC)
        const today = new Date().toISOString().split('T')[0];
        const { data: existingSpin } = await supabase
            .from('spin_history')
            .select('created_at')
            .eq('user_id', userId)
            .gte('created_at', `${today}T00:00:00Z`)
            .lt('created_at', `${today}T23:59:59Z`)
            .limit(1)
            .single();

        return NextResponse.json({
            canSpin: !existingSpin,
            lastSpin: existingSpin ? existingSpin.created_at : null
        });

    } catch (error: any) {
        console.error("Spin check error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST() {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = createServiceSupabaseClient();

        // Resolve user UUID
        const { data: dbUser } = await supabase
            .from('users')
            .select('id, tcent_balance')
            .eq('clerk_id', user.id)
            .single();

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userId = dbUser.id;

        // 1. Check Rate Limit (1 spin per calendar day UTC)
        const today = new Date().toISOString().split('T')[0];
        const { data: existingSpin } = await supabase
            .from('spin_history')
            .select('id')
            .eq('user_id', userId)
            .gte('created_at', `${today}T00:00:00Z`)
            .lt('created_at', `${today}T23:59:59Z`)
            .limit(1)
            .single();

        if (existingSpin) {
            return NextResponse.json({ error: "Already spun today" }, { status: 429 });
        }

        // 2. Play the Game (Weighted Probabilities)
        /*
          50 T-Cents: 40% (0-39)
          100 T-Cents: 30% (40-69)
          500 T-Cents: 15% (70-84)
          2,000 T-Cents: 10% (85-94)
          5,000 T-Cents: 4% (95-98)
          10,000 T-Cents: 0.9% (99.0 - 99.8)
          100% Voucher: 0.1% (99.9)
        */

        const roll = Math.random() * 100; // 0 to 100 float
        let rewardType: 'TCENT' | 'VOUCHER' | 'NONE' = 'NONE';
        let rewardValue = '0';
        let message = '';

        if (roll < 40) {
            // 50 T-Cents (40%)
            rewardType = 'TCENT';
            rewardValue = '50';
            message = 'You won 50 T-Cents!';
        } else if (roll < 70) {
            // 100 T-Cents (30%)
            rewardType = 'TCENT';
            rewardValue = '100';
            message = 'You won 100 T-Cents!';
        } else if (roll < 85) {
            // 500 T-Cents (15%)
            rewardType = 'TCENT';
            rewardValue = '500';
            message = 'You won 500 T-Cents!';
        } else if (roll < 95) {
            // 2,000 T-Cents (10%)
            rewardType = 'TCENT';
            rewardValue = '2000';
            message = 'Big win! 2,000 T-Cents!';
        } else if (roll < 99) {
            // 5,000 T-Cents (4%)
            rewardType = 'TCENT';
            rewardValue = '5000';
            message = 'Huge win! 5,000 T-Cents!';
        } else if (roll < 99.9) {
            // 10,000 T-Cents (0.9%)
            rewardType = 'TCENT';
            rewardValue = '10000';
            message = 'JACKPOT! 10,000 T-Cents!';
        } else {
            // 100% Voucher (0.1%)
            rewardType = 'VOUCHER';
            rewardValue = 'SPIN_JACKPOT_100';
            message = 'SUPER JACKPOT! 100% Voucher!';
        }

        // 3. Process Reward & Record History (Atomic RPC)
        const { data: rpcResult, error: rpcError } = await supabase.rpc('process_spin_reward', {
            p_user_id: userId,
            p_reward_type: rewardType,
            p_reward_value: rewardValue
        });

        if (rpcError) {
            console.error("Spin RPC Error:", rpcError);
            return NextResponse.json({ error: "Transaction failed" }, { status: 500 });
        }

        // 4. Notification
        // Always send notification now as there is always a reward
        await supabase.from('notifications').insert({
            user_id: userId,
            type: 'reward',
            title: 'Spin & Win!',
            message: message,
            deep_link: '/rewards'
        });

        return NextResponse.json({
            ok: true,
            rewardType,
            rewardValue,
            message
        });

    } catch (error: any) {
        console.error("Spin error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
