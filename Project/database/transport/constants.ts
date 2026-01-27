/**
 * Business Rules for Transport Booking
 */

export const TRANSPORT_RULES = {
    /**
     * Minimum time in minutes before departure that a booking can be made.
     * Requirement: 1 hour (60 minutes)
     */
    MIN_BOOKING_NOTICE_MINUTES: 60,

    /**
     * Duration in minutes that a booking is held (reserved) before payment.
     * Requirement: 8 minutes
     */
    RESERVATION_HOLD_MINUTES: 8,

    /**
     * Default currency for transport bookings
     */
    DEFAULT_CURRENCY: 'VND',
};
