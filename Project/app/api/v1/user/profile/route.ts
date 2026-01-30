
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = createServiceSupabaseClient()


        const { data: user, error } = await supabase
            .from('users')
            .select('membership_tier, tcent_balance, tcent_pending, name, email, bio, city, country, phone_number, lifetime_spend, total_orders_completed')
            .eq('clerk_id', userId)
            .single()

        if (error) {
            // PGRST116: The result contains 0 rows (No user found)
            if (error.code === 'PGRST116') {
                // Auto-create user on the fly if they don't exist
                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert([{
                        clerk_id: userId,
                        email: 'user_' + userId.slice(-8) + '@example.com', // Placeholder
                        name: 'New Traveller',
                        membership_tier: 'BRONZE',
                        tcent_balance: 0,
                        tcent_pending: 0
                    }])
                    .select()
                    .single()

                if (createError) {
                    console.error('Failed to auto-create user for profile:', createError)
                    return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 })
                }

                return NextResponse.json(newUser)
            }

            console.error('Error fetching user profile:', error)
            return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
        }

        return NextResponse.json(user)
    } catch (err) {
        console.error('Internal error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, bio, city, country, phone_number } = body

        const supabase = createServiceSupabaseClient()

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({
                name,
                bio,
                city,
                country,
                phone_number
            })
            .eq('clerk_id', userId)
            .select()
            .single()

        if (error) {
            console.error('Error updating profile:', error)
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
        }

        return NextResponse.json(updatedUser)

    } catch (err) {
        console.error('Internal error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
