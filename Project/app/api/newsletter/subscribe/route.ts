import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { newsletterService } from '@/lib/email/newsletter-service';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, name, preferences } = body;

        // Validate email
        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { success: false, message: 'Email không hợp lệ' },
                { status: 400 }
            );
        }

        // Get current user if authenticated
        const user = await currentUser();
        const userId = user?.id || null;

        // Create Supabase client
        const supabase = createServiceSupabaseClient();

        // Check if email already exists
        const { data: existing, error: checkError } = await supabase
            .from('newsletter_subscribers')
            .select('*')
            .eq('email', email)
            .single();

        if (existing) {
            // If previously unsubscribed, reactivate
            if (!existing.is_active) {
                const { error: updateError } = await supabase
                    .from('newsletter_subscribers')
                    .update({
                        is_active: true,
                        unsubscribed_at: null,
                        subscribed_at: new Date().toISOString(),
                        user_id: userId,
                        preferences: preferences || existing.preferences,
                    })
                    .eq('email', email);

                if (updateError) {
                    console.error('[Newsletter Subscribe] Error reactivating:', updateError);
                    return NextResponse.json(
                        { success: false, message: 'Có lỗi xảy ra, vui lòng thử lại' },
                        { status: 500 }
                    );
                }

                // Send welcome email
                await newsletterService.sendWelcomeEmail(email, name || existing.name);

                return NextResponse.json({
                    success: true,
                    message: 'Đăng ký thành công! Kiểm tra email để xác nhận.',
                    subscriber: { id: existing.id, email: existing.email },
                });
            }

            return NextResponse.json(
                { success: false, message: 'Email này đã được đăng ký' },
                { status: 400 }
            );
        }

        // Insert new subscriber
        const { data: subscriber, error: insertError } = await supabase
            .from('newsletter_subscribers')
            .insert({
                email,
                name: name || null,
                user_id: userId,
                preferences: preferences || {
                    frequency: 'weekly',
                    categories: ['deals', 'tips', 'alerts'],
                },
                source: 'website',
            })
            .select()
            .single();

        if (insertError) {
            console.error('[Newsletter Subscribe] Error inserting:', insertError);
            return NextResponse.json(
                { success: false, message: 'Có lỗi xảy ra, vui lòng thử lại' },
                { status: 500 }
            );
        }

        // Send welcome email
        await newsletterService.sendWelcomeEmail(email, name);

        return NextResponse.json({
            success: true,
            message: 'Đăng ký thành công! Kiểm tra email để xác nhận.',
            subscriber: { id: subscriber.id, email: subscriber.email },
        });
    } catch (error) {
        console.error('[Newsletter Subscribe] Error:', error);
        return NextResponse.json(
            { success: false, message: 'Có lỗi xảy ra, vui lòng thử lại' },
            { status: 500 }
        );
    }
}
