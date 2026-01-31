/**
 * Email Sending Utility for Booking Confirmations
 * Uses Nodemailer with Gmail SMTP
 */

interface BookingEmailData {
  guest_name: string;
  guest_email: string;
  confirmation_code: string;
  hotel_name: string;
  room_type: string;
  check_in_date: string;
  check_out_date: string;
  nights_count: number;
  total_amount: number;
  currency: string;
}

/**
 * Send booking confirmation email via Gmail SMTP
 */
export async function sendBookingConfirmationEmail(
  data: BookingEmailData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const nodemailer = require("nodemailer");

    // Create transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // App Password, not regular password
      },
    });
    // Format dates nicely
    const checkIn = new Date(data.check_in_date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const checkOut = new Date(data.check_out_date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Email HTML template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF6B2C 0%, #FF8A4C 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                ✓ Booking Confirmed!
              </h1>
            </td>
          </tr>
          
          <!-- Confirmation Code -->
          <tr>
            <td style="padding: 40px 30px; text-align: center; background-color: #FFF5F0;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Confirmation Code</p>
              <h2 style="margin: 0; color: #FF6B2C; font-size: 36px; font-weight: bold; letter-spacing: 4px;">
                ${data.confirmation_code}
              </h2>
            </td>
          </tr>
          
          <!-- Guest Info -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px 0; color: #333; font-size: 18px;">
                Dear ${data.guest_name},
              </p>
              <p style="margin: 0 0 20px 0; color: #666; font-size: 15px; line-height: 1.6;">
                Thank you for booking with TripC! Your reservation has been confirmed. 
                Please find your booking details below:
              </p>
              
              <!-- Booking Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-top: 20px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; font-weight: bold;">
                      ${data.hotel_name}
                    </h3>
                    <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                      <strong>Room Type:</strong> ${data.room_type}
                    </p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
                    
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #666; font-size: 14px;">
                          <strong>Check-in:</strong>
                        </td>
                        <td style="color: #333; font-size: 14px; text-align: right;">
                          ${checkIn}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666; font-size: 14px;">
                          <strong>Check-out:</strong>
                        </td>
                        <td style="color: #333; font-size: 14px; text-align: right;">
                          ${checkOut}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666; font-size: 14px;">
                          <strong>Duration:</strong>
                        </td>
                        <td style="color: #333; font-size: 14px; text-align: right;">
                          ${data.nights_count} night${data.nights_count > 1 ? "s" : ""}
                        </td>
                      </tr>
                      <tr style="background-color: #fff;">
                        <td style="color: #333; font-size: 16px; padding-top: 15px;">
                          <strong>Total Amount:</strong>
                        </td>
                        <td style="color: #FF6B2C; font-size: 20px; font-weight: bold; text-align: right; padding-top: 15px;">
                          $${data.total_amount.toFixed(2)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Important Info -->
              <div style="margin-top: 30px; padding: 20px; background-color: #e8f4fd; border-left: 4px solid #0066cc; border-radius: 8px;">
                <p style="margin: 0 0 10px 0; color: #0066cc; font-weight: bold; font-size: 14px;">
                  📌 Important Information
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 13px; line-height: 1.8;">
                  <li>Please arrive after 2:00 PM on your check-in date</li>
                  <li>Check-out time is before 12:00 PM</li>
                  <li>Bring a valid ID and your confirmation code</li>
                  <li>Contact the hotel directly for any special requests</li>
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 40px 30px; text-align: center;">
              <a href="https://tripc.com/my-bookings" 
                 style="display: inline-block; background-color: #FF6B2C; color: #ffffff; 
                        padding: 16px 40px; text-decoration: none; border-radius: 30px; 
                        font-weight: bold; font-size: 16px; margin-top: 20px;">
                View My Bookings
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; color: #999; font-size: 12px;">
                Need help? Contact us at <a href="mailto:support@tripc.com" style="color: #FF6B2C;">support@tripc.com</a>
              </p>
              <p style="margin: 0; color: #999; font-size: 12px;">
                © 2026 TripC. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Plain text version
    const textContent = `
Booking Confirmed!

Confirmation Code: ${data.confirmation_code}

Dear ${data.guest_name},

Thank you for booking with TripC! Your reservation has been confirmed.

BOOKING DETAILS:
Hotel: ${data.hotel_name}
Room Type: ${data.room_type}
Check-in: ${checkIn}
Check-out: ${checkOut}
Duration: ${data.nights_count} night${data.nights_count > 1 ? "s" : ""}
Total Amount: $${data.total_amount.toFixed(2)}

IMPORTANT INFORMATION:
- Check-in time: After 2:00 PM
- Check-out time: Before 12:00 PM
- Please bring a valid ID and your confirmation code
- Contact the hotel directly for any special requests

View your booking: https://tripc.com/my-bookings

Need help? Contact us at support@tripc.com

© 2026 TripC. All rights reserved.
    `;

    // Send email using Nodemailer
    const info = await transporter.sendMail({
      from: `"TripC Bookings" <${process.env.EMAIL_USER}>`,
      to: data.guest_email,
      subject: `Booking Confirmed - ${data.confirmation_code}`,
      text: textContent,
      html: htmlContent,
    });

    console.log("[Email Sent]", info.messageId);

    return { success: true };
  } catch (error) {
    console.error("[Email Exception]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
