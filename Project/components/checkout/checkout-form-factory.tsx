import { ServiceType } from '@/lib/checkout/types';
import { ShopCheckoutForm } from './forms/shop-checkout-form';

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
            // return <HotelCheckoutForm ... />
            return <div className="p-4 bg-gray-100 rounded">Hotel Checkout Form Coming Soon</div>;

        case 'flight':
            // return <FlightCheckoutForm ... />
            return <div className="p-4 bg-gray-100 rounded">Flight Checkout Form Coming Soon</div>;

        case 'transport':
            return <TransportCheckoutForm initialData={initialData} onSubmit={onSubmit} />;

        default:
            return <div className="text-red-500">Service type not supported: {serviceType}</div>;
    }
};
