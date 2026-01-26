# Transport Module - Business Logic Prompts Summary

This document summarizes the key business logic instructions and constraints implemented for the Transport Booking Module.

## 1. Search Logic
- **Real-time Validation**: Search parameters (origin, destination, date, passengers) are validated in real-time to ensure data integrity before submission.
- **Time Constraint**: Bookings must be made at least **1 hour** in advance of the current time. This prevents last-minute bookings that cannot be fulfilled by partners.

## 2. Payment Flow & Reservation Hold
- **Reservation Hold**: Once a vehicle is selected and the booking is initiated, the system places a **held** status on the booking for **8 minutes**.
- **Payment Cleanup**: A background process (or client-side check) monitors the 8-minute window. If payment is not completed within this time, the reservation is released.
- **Booking Tabs**:
    - **Pending**: Shows bookings that are currently held or awaiting payment.
    - **Cancelled**: Shows bookings where the hold expired or the user explicitly cancelled.
    - **Upcoming**: Shows successfully confirmed bookings.

## 3. State Persistence
- **Reload Handling**: The checkout flow uses state management (e.g., `localStorage` or URL parameters) to ensure that if a user reloads the page during the passenger form or payment step, their progress is not lost.
- **Navigation Safety**: Users are warned or state is preserved when navigating away from the checkout process.

## 4. Personalization & Recommendations
- **Search History**: Every search performed by a logged-in user is saved to the `user_search_history` table.
- **Recommendations**: The "Popular Transfers" or "Recommended for You" sections leverage the user's search history to show relevant routes and destinations.
- **Fallback**: If no history exists, the system displays globally popular transfers.
