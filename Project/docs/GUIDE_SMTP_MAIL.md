# SMTP & Booking Email System Guide

This document summarizes the architecture and implementation of the booking confirmation email system, including guest support and SMTP logging.

## Core Components

### 1. Unified Email Service
**File:** `lib/email/unified-email-service.ts`
The central service for sending all booking-related emails.
- **Transporters**: Supports multiple providers (Postmark, SendGrid, SMTP).
- **Guest Support**: Dynamically adjust templates for guests (user_id = 'GUEST'), adding a "Sign In/Up" invitation.
- **Dynamic Content**: Renders booking details, PNRs, and price breakdowns into HTML templates.

### 2. SMTP Logger
**File:** `lib/email/smtp-logger.ts`
A specialized utility for tracking every email attempt.
- **Log Location**: `logs/smtp/smtp-YYYY-MM-DD.log`
- **Format**: `[TIMESTAMP] [STATUS] recipient={email} type={guest|user} code={booking_code}`
- **Usage**: Automatically records successful deliveries and detailed error messages for failed attempts.

### 3. Settlement Integration
**File:** `lib/checkout/services/settlement.service.ts`
Triggers the email flow immediately after a successful payment and database synchronization (settlement).
- **Logic**: Resolves the user's email (guest or authenticated) and passes the internal `isGuest` flag to the email service.

## Email Template Features (Guest vs. User)

| Feature | Authenticated User | Guest User |
| :--- | :--- | :--- |
| **Email Source** | User's profile email | `guest_email` from booking |
| **CTA Button** | "View My Booking" | "Claim My Booking & Join TripC" |
| **Destination** | `/my-bookings` | `/welcome?code={booking_code}` |
| **Benefits Section** | Standard footer | Vibrant member benefits list |

## Monitoring & Debugging

### Real-time Logs
Check the terminal running `npm run dev`. You will see tags like:
- `[SETTLEMENT_EMAIL] Sending email to: ...`
- `[SMTP_LOG] Email delivered successfully`

### Historical Logs
Navigate to the `logs/smtp/` folder in your project root to view past delivery statuses and debug SMTP connection issues.

## Configuration
Ensure your `.env` file contains the correct SMTP credentials:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL` (e.g., noreply@tripc.pro)
