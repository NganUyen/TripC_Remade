# Transport Module - Database Schema

This document provides a reverse-engineered view of the database structure supporting the Transport Booking Module.

## 1. Core Transport Tables

### `transport_providers`
Stores information about transport operators (bus companies, private car services, etc.).
- `id` (UUID, PK)
- `name` (TEXT): Operator name.
- `logo_url` (TEXT): Branding image.
- `rating` (NUMERIC): Average user rating.

### `transport_routes`
Stores specific travel routes and vehicle availability.
- `id` (UUID, PK)
- `provider_id` (UUID, FK -> `transport_providers.id`)
- `type` (TEXT): `bus`, `train`, `airplane`, `limousine`, `private_car`.
- `vehicle_type` (TEXT): `4 seats`, `7 seats`, `16 seats`, `29 seats`, `45 seats`, `limousine 9 seats`.
- `origin`, `destination` (TEXT): Start and end points.
- `departure_time`, `arrival_time` (TIMESTAMPTZ)
- `price` (NUMERIC)
- `seats_available` (INTEGER)
- `vehicle_details` (JSONB): Utilities (wifi, AC, etc.).
- `images` (TEXT[]): Media gallery.

## 2. Booking & Payment Tables

### `bookings`
Unified table for all reservations in the system.
- `id` (UUID, PK)
- `user_id` (TEXT): Reference to Clerk ID.
- `category` (TEXT): Set to `transport` for this module.
- `status` (TEXT): `held`, `confirmed`, `completed`, `cancelled`.
- `total_amount` (NUMERIC)
- `booking_code` (TEXT, UNIQUE): Human-readable code (e.g., TRIPC-XXXXXX).
- `passenger_info` (JSONB): Details of travelers.
- `metadata` (JSONB): Stores `route_id` and other category-specific data.
- `held_at`, `expires_at` (TIMESTAMPTZ): Used for the 8-minute reservation hold logic.

### `payments`
Logs for financial transactions.
- `id` (UUID, PK)
- `booking_id` (UUID, FK -> `bookings.id`)
- `payment_method` (TEXT): `momo`, `vnpay`, `credit_card`.
- `status` (TEXT): `pending`, `success`, `failed`.
- `amount` (NUMERIC)
- `transaction_id` (TEXT)

## 3. Analytics & Personalization

### `user_search_history`
Tracks user searches for recommendations.
- `id` (UUID, PK)
- `user_id` (TEXT)
- `origin`, `destination` (TEXT)
- `search_date` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

## 4. Other Related Tables
- `reviews`: User feedback linked to `booking_id`.
- `email_logs`: History of confirmation and reminder emails.
- `partner_notifications`: Notifications sent to transport providers.
