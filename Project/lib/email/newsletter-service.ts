import nodemailer from 'nodemailer';
import crypto from 'crypto';

export interface NewsletterSubscriber {
    id: string;
    email: string;
    name?: string;
    preferences?: {
        frequency: 'daily' | 'weekly' | 'monthly';
        categories: string[];
    };
}

export interface NewsletterContent {
    deals?: Array<{
        title: string;
        description: string;
        price: string;
        imageUrl?: string;
        link: string;
    }>;
    tips?: Array<{
        title: string;
        content: string;
        imageUrl?: string;
    }>;
    customHtml?: string;
}

export class NewsletterService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    /**
     * Generate unsubscribe token for email
     */
    private generateUnsubscribeToken(email: string): string {
        return crypto
            .createHash('sha256')
            .update(`${email}-${process.env.CLERK_WEBHOOK_SECRET}`)
            .digest('hex')
            .substring(0, 32);
    }

    /**
     * Get welcome email template
     */
    private getWelcomeTemplate(email: string, name?: string): string {
        const unsubscribeToken = this.generateUnsubscribeToken(email);
        const displayName = name || 'Bạn';
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #FF6B2C 0%, #FF8A4C 100%); color: #fff; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; color: #333; }
    .feature { display: flex; align-items: start; margin: 20px 0; }
    .feature-icon { font-size: 24px; margin-right: 15px; }
    .footer { padding: 20px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; }
    .btn { display: inline-block; padding: 14px 30px; background: #FF6B2C; color: #fff; text-decoration: none; border-radius: 25px; font-weight: bold; margin-top: 20px; }
    .unsubscribe { color: #999; font-size: 11px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 32px;">🎉 Chào mừng đến với TripC Drops!</h1>
    </div>
    <div class="content">
      <p style="font-size: 18px; margin-bottom: 10px;">Xin chào <strong>${displayName}</strong>,</p>
      
      <p style="font-size: 16px; line-height: 1.6;">
        Cảm ơn bạn đã đăng ký nhận bản tin <strong>TripC Drops</strong>! 🌍✨
      </p>

      <p style="font-size: 16px; line-height: 1.6;">
        Mỗi tuần, chúng tôi sẽ gửi đến bạn:
      </p>

      <div class="feature">
        <div class="feature-icon">💰</div>
        <div>
          <strong style="font-size: 16px;">Flash Deals độc quyền</strong>
          <p style="margin: 5px 0 0 0; color: #666;">Giảm giá đặc biệt cho vé máy bay, khách sạn, hoạt động du lịch</p>
        </div>
      </div>

      <div class="feature">
        <div class="feature-icon">🗺️</div>
        <div>
          <strong style="font-size: 16px;">Gợi ý lịch trình</strong>
          <p style="margin: 5px 0 0 0; color: #666;">Những điểm đến hot và lịch trình du lịch được cá nhân hóa</p>
        </div>
      </div>

      <div class="feature">
        <div class="feature-icon">📊</div>
        <div>
          <strong style="font-size: 16px;">Cảnh báo giá</strong>
          <p style="margin: 5px 0 0 0; color: #666;">Thông báo khi giá vé giảm theo tuyến bạn quan tâm</p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${appUrl}" class="btn">Khám phá TripC ngay</a>
      </div>

      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        Hãy theo dõi hộp thư của bạn mỗi thứ Hai để không bỏ lỡ những ưu đãi tuyệt vời nhất!
      </p>

      <div class="unsubscribe">
        <p>Không muốn nhận email nữa? <a href="${appUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken}" style="color: #FF6B2C;">Hủy đăng ký</a></p>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 TripC. All rights reserved.</p>
      <p>Hỗ trợ: support@tripc.com | Hotline: 1900 xxxx</p>
    </div>
  </div>
</body>
</html>
    `;
    }

    /**
     * Get weekly digest template
     */
    private getWeeklyDigestTemplate(
        email: string,
        subject: string,
        content: NewsletterContent
    ): string {
        const unsubscribeToken = this.generateUnsubscribeToken(email);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        let dealsHtml = '';
        if (content.deals && content.deals.length > 0) {
            dealsHtml = `
        <div style="margin: 30px 0;">
          <h2 style="color: #FF6B2C; font-size: 24px; margin-bottom: 20px;">💰 Flash Deals Tuần Này</h2>
          ${content.deals.map(deal => `
            <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
              ${deal.imageUrl ? `<img src="${deal.imageUrl}" alt="${deal.title}" style="width: 100%; border-radius: 8px; margin-bottom: 15px;">` : ''}
              <h3 style="margin: 0 0 10px 0; font-size: 20px; color: #333;">${deal.title}</h3>
              <p style="margin: 0 0 10px 0; color: #666; line-height: 1.6;">${deal.description}</p>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 24px; font-weight: bold; color: #FF6B2C;">${deal.price}</span>
                <a href="${deal.link}" style="display: inline-block; padding: 10px 20px; background: #FF6B2C; color: #fff; text-decoration: none; border-radius: 20px; font-weight: bold;">Đặt ngay</a>
              </div>
            </div>
          `).join('')}
        </div>
      `;
        }

        let tipsHtml = '';
        if (content.tips && content.tips.length > 0) {
            tipsHtml = `
        <div style="margin: 30px 0;">
          <h2 style="color: #FF6B2C; font-size: 24px; margin-bottom: 20px;">🗺️ Tips Du Lịch</h2>
          ${content.tips.map(tip => `
            <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
              ${tip.imageUrl ? `<img src="${tip.imageUrl}" alt="${tip.title}" style="width: 100%; border-radius: 8px; margin-bottom: 15px;">` : ''}
              <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #333;">${tip.title}</h3>
              <p style="margin: 0; color: #666; line-height: 1.6;">${tip.content}</p>
            </div>
          `).join('')}
        </div>
      `;
        }

        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #FF6B2C 0%, #FF8A4C 100%); color: #fff; padding: 40px 30px; text-align: center; }
    .content { padding: 30px; color: #333; }
    .footer { padding: 20px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; }
    .unsubscribe { color: #999; font-size: 11px; margin-top: 30px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">✈️ TripC Drops Weekly</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Deals xịn & tips du lịch tuần này</p>
    </div>
    <div class="content">
      ${dealsHtml}
      ${tipsHtml}
      ${content.customHtml || ''}
      
      <div class="unsubscribe">
        <p>Không muốn nhận email nữa? <a href="${appUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken}" style="color: #FF6B2C;">Hủy đăng ký</a></p>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 TripC. All rights reserved.</p>
      <p>Hỗ trợ: support@tripc.com | Hotline: 1900 xxxx</p>
    </div>
  </div>
</body>
</html>
    `;
    }

    /**
     * Send welcome email to new subscriber
     */
    async sendWelcomeEmail(email: string, name?: string) {
        try {
            const html = this.getWelcomeTemplate(email, name);
            const info = await this.transporter.sendMail({
                from: `"TripC Drops" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: '🎉 Chào mừng đến với TripC Drops!',
                html: html,
            });

            console.log('[Newsletter Service] Welcome email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('[Newsletter Service] Error sending welcome email:', error);
            return { success: false, error };
        }
    }

    /**
     * Send newsletter to subscribers
     */
    async sendNewsletter(
        subscribers: NewsletterSubscriber[],
        subject: string,
        content: NewsletterContent
    ) {
        const results = {
            sent: 0,
            failed: 0,
            errors: [] as Array<{ email: string; error: any }>,
        };

        for (const subscriber of subscribers) {
            try {
                const html = this.getWeeklyDigestTemplate(
                    subscriber.email,
                    subject,
                    content
                );

                await this.transporter.sendMail({
                    from: `"TripC Drops" <${process.env.EMAIL_USER}>`,
                    to: subscriber.email,
                    subject: subject,
                    html: html,
                });

                results.sent++;
                console.log(`[Newsletter Service] Sent to ${subscriber.email}`);
            } catch (error) {
                results.failed++;
                results.errors.push({ email: subscriber.email, error });
                console.error(`[Newsletter Service] Failed to send to ${subscriber.email}:`, error);
            }
        }

        return results;
    }

    /**
     * Verify unsubscribe token
     */
    verifyUnsubscribeToken(email: string, token: string): boolean {
        const expectedToken = this.generateUnsubscribeToken(email);
        return token === expectedToken;
    }
}

export const newsletterService = new NewsletterService();
