import { ServiceType } from '@/lib/checkout/types';
import { ShopCheckoutForm } from './forms/shop-checkout-form';
import { TransportCheckoutForm } from './forms/transport-checkout-form';
import { HotelCheckoutForm } from './forms/hotel-checkout-form';
import { EventCheckoutForm } from './forms/event-checkout-form';
import { EntertainmentCheckoutForm } from './forms/entertainment-checkout-form';

interface Props {
    serviceType: ServiceType;
    initialData?: any;
    onSubmit: (data: any) => void;
}

export const CheckoutFormFactory = ({ serviceType, initialData, onSubmit }: Props) => {
    switch (serviceType) {
        case 'shop':
            return <ShopCheckoutForm initialData={initialData} onSubmit={onSubmit} />;

        case 'hotel':
            // @ts-ignore
            return <HotelCheckoutForm initialData={initialData} onSubmit={onSubmit} />;

        case 'event':
            return <EventCheckoutForm initialData={initialData} onSubmit={onSubmit} />;

        case 'entertainment':
            return <EntertainmentCheckoutForm initialData={initialData} onSubmit={onSubmit} />;

        case 'flight':
            // return <FlightCheckoutForm ... />
            return <div className="p-4 bg-gray-100 rounded">Flight Checkout Form Coming Soon</div>;

        case 'transport':
            return <TransportCheckoutForm initialData={initialData} onSubmit={onSubmit} />;

        default:
            return <div className="text-red-500">Service type not supported: {serviceType}</div>;
    }
};
