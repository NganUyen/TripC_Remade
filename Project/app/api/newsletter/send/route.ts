import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { newsletterService, NewsletterContent } from '@/lib/email/newsletter-service';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
    try {
        // Check if user is authenticated and is admin
        const user = await currentUser();

        // TODO: Add proper admin check based on your user roles
        // For now, we'll just check if user is authenticated
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { subject, template, content } = body as {
            subject: string;
            template: 'weekly' | 'promotional';
            content: NewsletterContent;
        };

        // Validate input
        if (!subject || !template || !content) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create Supabase client
        const supabase = createServiceSupabaseClient();

        // Fetch all active subscribers
        const { data: subscribers, error: fetchError } = await supabase
            .from('newsletter_subscribers')
            .select('*')
            .eq('is_active', true);

        if (fetchError) {
            console.error('[Newsletter Send] Error fetching subscribers:', fetchError);
            return NextResponse.json(
                { success: false, message: 'Error fetching subscribers' },
                { status: 500 }
            );
        }

        if (!subscribers || subscribers.length === 0) {
            return NextResponse.json(
                { success: false, message: 'No active subscribers found' },
                { status: 404 }
            );
        }

        // Send newsletter to all subscribers
        const results = await newsletterService.sendNewsletter(
            subscribers,
            subject,
            content
        );

        return NextResponse.json({
            success: true,
            message: `Newsletter sent successfully`,
            results: {
                total: subscribers.length,
                sent: results.sent,
                failed: results.failed,
                errors: results.errors,
            },
        });
    } catch (error) {
        console.error('[Newsletter Send] Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
