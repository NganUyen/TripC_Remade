import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
    const start = Date.now()
    let dbStatus = 'OK'
    let dbError = null
    const tableChecks: Record<string, boolean> = {}

    try {
        const supabase = createServiceSupabaseClient()

        // Check Users
        const { error: usersError } = await supabase.from('users').select('count', { count: 'exact', head: true })
        tableChecks.users = !usersError
        if (usersError) throw usersError

        // Check Quests (Often missing in dev)
        const { error: questsError } = await supabase.from('quests').select('count', { count: 'exact', head: true })
        tableChecks.quests = !questsError || questsError.code !== 'PGRST205' // Treat missing table as 'false' for check but handle overall status

        if (questsError && questsError.code === 'PGRST205') {
            dbStatus = 'DEGRADED' // Users OK, Quests Missing
        }

        // Check Vouchers
        const { error: vouchersError } = await supabase.from('vouchers').select('count', { count: 'exact', head: true })
        tableChecks.vouchers = !vouchersError || vouchersError.code !== 'PGRST205'

        if (vouchersError && vouchersError.code === 'PGRST205') {
            dbStatus = 'DEGRADED'
        }

    } catch (err) {
        console.error('Health check DB failed:', err)
        dbStatus = 'ERROR'
        dbError = err
    }

    return NextResponse.json({
        service: 'TripC Pro API',
        timestamp: new Date().toISOString(),
        status: dbStatus,
        message: dbStatus === 'DEGRADED' ? 'Partial functionality (Quests table missing)' : 'All systems operational',
        checks: {
            database: {
                status: dbStatus,
                tables: tableChecks
            },
            api: {
                status: 'OK',
                uptime_ms: process.uptime() * 1000
            }
        }
    }, { status: dbStatus === 'ERROR' ? 503 : 200 })
}
