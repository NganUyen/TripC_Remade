export type ServiceType =
    | 'hotel'
    | 'flight'
    | 'shop'
    | 'dining'
    | 'transport'
    | 'wellness'
    | 'activity'
    | 'event';

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
}

export interface HotelCheckoutDetails {
    hotelId: string;
    roomId: string; // or roomTypeId
    checkInDate: string;
    checkOutDate: string;
    guests: {
        adults: number;
        children: number;
        ages?: number[];
    };
}

export interface FlightCheckoutDetails {
    offerId: string;
    passengers: any[]; // Define strict passenger type later
}

// Discriminated Union for Payload
export type CheckoutPayload =
    | ({ serviceType: 'shop' } & BaseCheckoutPayload & ShopCheckoutDetails)
    | ({ serviceType: 'hotel' } & BaseCheckoutPayload & HotelCheckoutDetails)
    | ({ serviceType: 'flight' } & BaseCheckoutPayload & FlightCheckoutDetails)
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
