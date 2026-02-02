import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { newsletterService } from '@/lib/email/newsletter-service';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, token } = body;

        // Validate email
        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { success: false, message: 'Email không hợp lệ' },
                { status: 400 }
            );
        }

        // Verify token if provided
        if (token && !newsletterService.verifyUnsubscribeToken(email, token)) {
            return NextResponse.json(
                { success: false, message: 'Token không hợp lệ' },
                { status: 400 }
            );
        }

        // Create Supabase client
        const supabase = createServiceSupabaseClient();

        // Update subscriber status
        const { error: updateError } = await supabase
            .from('newsletter_subscribers')
            .update({
                is_active: false,
                unsubscribed_at: new Date().toISOString(),
            })
            .eq('email', email);

        if (updateError) {
            console.error('[Newsletter Unsubscribe] Error:', updateError);
            return NextResponse.json(
                { success: false, message: 'Có lỗi xảy ra, vui lòng thử lại' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Đã hủy đăng ký thành công. Rất tiếc khi bạn rời đi!',
        });
    } catch (error) {
        console.error('[Newsletter Unsubscribe] Error:', error);
        return NextResponse.json(
            { success: false, message: 'Có lỗi xảy ra, vui lòng thử lại' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');
        const token = searchParams.get('token');

        if (!email || !token) {
            return new NextResponse(
                `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Hủy đăng ký - TripC</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; background: #f4f4f4; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
            .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
            h1 { color: #FF6B2C; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Lỗi</h1>
            <p>Link hủy đăng ký không hợp lệ.</p>
          </div>
        </body>
        </html>
        `,
                { headers: { 'Content-Type': 'text/html' } }
            );
        }

        // Verify token
        if (!newsletterService.verifyUnsubscribeToken(email, token)) {
            return new NextResponse(
                `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Hủy đăng ký - TripC</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; background: #f4f4f4; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
            .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
            h1 { color: #FF6B2C; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Lỗi</h1>
            <p>Token không hợp lệ.</p>
          </div>
        </body>
        </html>
        `,
                { headers: { 'Content-Type': 'text/html' } }
            );
        }

        // Create Supabase client
        const supabase = createServiceSupabaseClient();

        // Update subscriber status
        const { error: updateError } = await supabase
            .from('newsletter_subscribers')
            .update({
                is_active: false,
                unsubscribed_at: new Date().toISOString(),
            })
            .eq('email', email);

        if (updateError) {
            console.error('[Newsletter Unsubscribe] Error:', updateError);
            return new NextResponse(
                `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Hủy đăng ký - TripC</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; background: #f4f4f4; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
            .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
            h1 { color: #FF6B2C; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Lỗi</h1>
            <p>Có lỗi xảy ra, vui lòng thử lại sau.</p>
          </div>
        </body>
        </html>
        `,
                { headers: { 'Content-Type': 'text/html' } }
            );
        }

        return new NextResponse(
            `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Hủy đăng ký thành công - TripC</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #f4f4f4; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
          .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
          h1 { color: #FF6B2C; margin-bottom: 20px; }
          p { color: #666; line-height: 1.6; margin-bottom: 30px; }
          .btn { display: inline-block; padding: 12px 30px; background: #FF6B2C; color: white; text-decoration: none; border-radius: 25px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✅ Hủy đăng ký thành công</h1>
          <p>Bạn đã hủy đăng ký nhận bản tin TripC Drops. Rất tiếc khi bạn rời đi!</p>
          <p>Nếu bạn thay đổi ý định, bạn có thể đăng ký lại bất kỳ lúc nào.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="btn">Quay về trang chủ</a>
        </div>
      </body>
      </html>
      `,
            { headers: { 'Content-Type': 'text/html' } }
        );
    } catch (error) {
        console.error('[Newsletter Unsubscribe] Error:', error);
        return new NextResponse(
            `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Hủy đăng ký - TripC</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #f4f4f4; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
          .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
          h1 { color: #FF6B2C; margin-bottom: 20px; }
          p { color: #666; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Lỗi</h1>
          <p>Có lỗi xảy ra, vui lòng thử lại sau.</p>
        </div>
      </body>
      </html>
      `,
            { headers: { 'Content-Type': 'text/html' } }
        );
    }
}
