# Comprehensive Guest Booking Support Guide

This document covers the end-to-end implementation of guest booking support across all 11 service categories in the TripC platform.

## 1. Database Infrastructure
We have modified the database to allow anonymous bookings ("GUEST") without requiring a registered user account.

- **Nullable UUIDs**: All service-specific tables (e.g., `flight_bookings`, `hotel_bookings`, `shop_orders`) now have nullable `user_uuid` or `user_id` columns.
- **Explicit Guest Marking**: The main `bookings` table uses the string `'GUEST'` in the `user_id` column for anonymous checkouts.
- **Guest Email Tracking**: A `guest_email` column was added to the `bookings` table for reliable contact retrieval.

## 2. Settlement Handlers
Every category settlement handler (Flight, Hotel, Transport, etc.) has been updated with the following logic:
- **User Resolution**: The handler checks if `booking.user_id === 'GUEST'`.
- **Safe Insertion**: If it's a guest, the service-specific table is updated with a `NULL` user reference to prevent UUID casting errors.
- **Terminal Logging**: Each handler prints detailed progress logs (e.g., `[FLIGHT_SETTLEMENT]`) for real-time monitoring.

## 3. Security & Access (RLS)
To allow guests to complete their checkout and view their own data safely:
- **Public Guest Access**: Added RLS policies to the `bookings` table allowing anonymous `anon` access (SELECT/INSERT/UPDATE) strictly for records where `user_id = 'GUEST'`.
- **URL-based Security**: Access is restricted by the unique Booking UUID. Only those with the direct link/ID can view the guest booking details.

## 4. Guest Experience Flow
1. **Checkout**: Guests can create bookings by providing an email and phone number.
2. **Payment**: The checkout page fetches booking details via the unauthenticated `bookingId`.
3. **Confirmation**: Immediately after payment, the `SettlementService` sends a confirmation email.
4. **Invitation**: The email contains a link to the `/welcome` page, inviting guests to claim their booking and register for a full account.
5. **My Bookings**: Guests can view their active booking by clicking the link in their email or via a direct `bookingId` query parameter on the `/my-bookings` page.

## 5. Summary of Categories Supported
- Flight
- Hotel
- Shop / Vouchers
- Transport
- Dining
- Activity
- Event
- Wellness
- Beauty
- Entertainment
