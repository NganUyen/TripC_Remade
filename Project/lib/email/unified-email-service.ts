import nodemailer from 'nodemailer';
import { smtpLogger } from './smtp-logger';

export interface UnifiedBookingEmailData {
  category: string;
  guest_name: string;
  guest_email: string;
  booking_code: string;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  total_amount: number;
  currency: string;
  location_summary?: string;
  metadata?: any;
  isGuest?: boolean; // Flag to show login invitation CTA
}

export class UnifiedEmailService {
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

  private getTemplate(data: UnifiedBookingEmailData) {
    const formattedDate = new Date(data.start_date).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let categoryIcon = "🎫";
    let categoryTitle = "Booking Confirmation";

    switch (data.category) {
      case 'flight':
        categoryIcon = "✈️";
        categoryTitle = "Flight Ticket Confirmed";
        break;
      case 'transport':
        categoryIcon = "🚗";
        categoryTitle = "Transport Booking Confirmed";
        break;
      case 'dining':
      case 'restaurant':
        categoryIcon = "🍽️";
        categoryTitle = "Table Reservation Confirmed";
        break;
      case 'activity':
        categoryIcon = "🎡";
        categoryTitle = "Activity Booking Confirmed";
        break;
      case 'wellness':
      case 'beauty':
        categoryIcon = "💆";
        categoryTitle = "Wellness & Beauty Appointment Confirmed";
        break;
      case 'entertainment':
        categoryIcon = "🎭";
        categoryTitle = "Entertainment Ticket Confirmed";
        break;
      case 'voucher':
        categoryIcon = "🎁";
        categoryTitle = "Voucher Purchase Confirmed";
        break;
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #FF6B2C 0%, #FF8A4C 100%); color: #fff; padding: 30px; text-align: center; }
    .content { padding: 30px; color: #333; }
    .booking-code { background: #FFF5F0; border: 2px dashed #FF6B2C; padding: 15px; text-align: center; margin: 20px 0; border-radius: 8px; }
    .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; }
    .footer { padding: 20px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; }
    .btn { display: inline-block; padding: 12px 25px; background: #FF6B2C; color: #fff; text-decoration: none; border-radius: 25px; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${categoryIcon} ${categoryTitle}</h1>
    </div>
    <div class="content">
      <p>Xin chào <strong>${data.guest_name}</strong>,</p>
      <p>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ tại <strong>TripC</strong>. Đơn hàng của bạn đã được xác nhận thành công!</p>
      
      <div class="booking-code">
        <p style="margin:0; color:#666; font-size:12px; text-transform:uppercase;">Mã Booking / Voucher</p>
        <h2 style="margin:5px 0 0 0; color:#FF6B2C; letter-spacing:2px;">${data.booking_code}</h2>
      </div>

      <div class="details">
        <h3 style="margin-top:0;">Chi tiết dịch vụ:</h3>
        <p><strong>Dịch vụ:</strong> ${data.title}</p>
        <p><strong>Ngày:</strong> ${formattedDate}</p>
        ${data.location_summary ? `<p><strong>Địa điểm:</strong> ${data.location_summary}</p>` : ''}
        <p><strong>Tổng cộng:</strong> ${data.total_amount} ${data.currency}</p>
      </div>

      <p style="margin-top:20px; font-size:14px; color:#666;">Vui lòng xuất trình mã booking này khi đến sử dụng dịch vụ.</p>
      
      ${data.isGuest ? `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; margin-top: 30px; text-align: center; color: #fff;">
        <h3 style="margin-top: 0; font-size: 20px;">🎁 Khám phá thêm nhiều ưu đãi độc quyền!</h3>
        <p style="margin: 15px 0; font-size: 14px; opacity: 0.95;">
          Đăng ký tài khoản TripC để nhận được:
        </p>
        <ul style="text-align: left; display: inline-block; margin: 10px 0;">
          <li style="margin: 8px 0;">✨ Theo dõi tất cả booking tại một nơi</li>
          <li style="margin: 8px 0;">💰 Ưu đãi và giảm giá dành riêng cho thành viên</li>
          <li style="margin: 8px 0;">⚡ Thanh toán nhanh hơn cho lần đặt tiếp theo</li>
          <li style="margin: 8px 0;">🎯 Gợi ý dịch vụ phù hợp với sở thích của bạn</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/welcome?source=booking-email&code=${data.booking_code}" 
           style="display: inline-block; padding: 14px 35px; background: #fff; color: #667eea; text-decoration: none; border-radius: 30px; font-weight: bold; margin-top: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
          Đăng nhập / Đăng ký ngay
        </a>
      </div>
      ` : ''}
      
      <div style="text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/my-bookings" class="btn">Quản lý đặt chỗ</a>
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

  async sendBookingEmail(data: UnifiedBookingEmailData) {
    const userType = data.isGuest ? 'guest' : 'user';

    try {
      const html = this.getTemplate(data);
      const info = await this.transporter.sendMail({
        from: `"TripC Support" <${process.env.EMAIL_USER}>`,
        to: data.guest_email,
        subject: `[TripC] Xác nhận Booking: ${data.booking_code} - ${data.title}`,
        html: html,
      });

      console.log("[Email Service] Success:", info.messageId);

      // Log successful email send
      smtpLogger.logSuccess(
        data.guest_email,
        userType,
        data.booking_code,
        info.messageId
      );

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("[Email Service] Error:", error);

      // Log failed email send
      const errorMessage = error instanceof Error ? error.message : String(error);
      smtpLogger.logFailure(
        data.guest_email,
        userType,
        data.booking_code,
        errorMessage
      );

      return { success: false, error };
    }
  }
}

export const unifiedEmailService = new UnifiedEmailService();
