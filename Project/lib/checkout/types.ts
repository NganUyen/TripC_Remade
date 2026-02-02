export type ServiceType =
    | 'hotel'
    | 'flight'
    | 'shop'
    | 'dining'
    | 'transport'
    | 'wellness'
    | 'activity'
    | 'event'
    | 'entertainment';

export type BookingStatus =
    | 'draft'
    | 'pending_payment'
    | 'payment_processing'
    | 'confirmed'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'refunded'
    | 'no_show';

export interface BaseCheckoutPayload {
    serviceType: ServiceType;
    userId: string;
    currency: string;
    metadata?: Record<string, any>;
}

// Service Specific Payloads
export interface ShopCheckoutDetails {
    items: {
        variantId: string;
        quantity: number;
        price: number;
        name?: string;
        image?: string | null;
    }[];
    shippingAddressId: string;
    shippingMethodId: string;
    cartId?: string;
    couponCode?: string;
    discountAmount?: number;
    isBuyNow?: boolean; // Flag for direct purchase (skips cart)
}

export interface HotelCheckoutDetails {
    hotelId: string;
    roomId: string; // or roomTypeId
    checkInDate?: string; // Legacy?
    checkOutDate?: string; // Legacy?
    dates: {
        start: string;
        end: string;
    };
    guests: {
        adults: number;
        children: number;
        ages?: number[];
    };
    rate: number;
}

export interface FlightCheckoutDetails {
    offerId: string;
    passengers: any[]; // Define strict passenger type later
}

export interface EventAttendee {
    name: string;
    email?: string;
    phone?: string;
    dob?: string;
}

export interface EventCheckoutDetails {
    eventId: string;
    sessionId: string;
    ticketTypeId: string;
    adultCount: number;
    childCount: number;
    guestDetails: {
        name: string;
        email: string;
        phone?: string;
    };
    attendees?: EventAttendee[];
    specialRequests?: string;
}

export interface EntertainmentCheckoutDetails {
    itemId: string;
    sessionId?: string;
    ticketTypeId: string;
    quantity: number;
    guestDetails: {
        name: string;
        email: string;
        phone?: string;
    };
    specialRequests?: string;
}

// Discriminated Union for Payload
export type CheckoutPayload =
    | ({ serviceType: 'shop' } & BaseCheckoutPayload & ShopCheckoutDetails)
    | ({ serviceType: 'hotel' } & BaseCheckoutPayload & HotelCheckoutDetails)
    | ({ serviceType: 'flight' } & BaseCheckoutPayload & FlightCheckoutDetails)
    | ({ serviceType: 'event' } & BaseCheckoutPayload & EventCheckoutDetails)
    | ({ serviceType: 'entertainment' } & BaseCheckoutPayload & EntertainmentCheckoutDetails)
    | ({ serviceType: 'dining' } & BaseCheckoutPayload & any) // Placeholder
    | ({ serviceType: 'transport' } & BaseCheckoutPayload & any) // Placeholder
    | ({ serviceType: 'wellness' } & BaseCheckoutPayload & any); // Placeholder

export interface CheckoutResult {
    bookingId: string;
    totalAmount: number;
    currency: string;
    status: BookingStatus;
    checkoutToken?: string; // For security during payment step
}
