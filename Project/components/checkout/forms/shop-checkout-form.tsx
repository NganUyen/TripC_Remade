import { useState } from 'react';
import { ShopCheckoutDetails } from '@/lib/checkout/types';
import { BuyerInfoSection } from './buyer-info-section';
import { ShippingSection } from './shipping-section';
import { OrderSummaryCard } from './order-summary-card';

interface ShopCheckoutFormProps {
    initialData?: any;
    onSubmit: (details: ShopCheckoutDetails) => void;
}

export const ShopCheckoutForm = ({ initialData, onSubmit }: ShopCheckoutFormProps) => {
    const [shippingAddressId, setShippingAddressId] = useState('addr_default');
    const [shippingMethodId, setShippingMethodId] = useState('method_standard');

    const items = initialData?.items || [];
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const shippingCost = 0; // Free for now
    const discount = initialData?.discountAmount || 0;
    const total = subtotal + shippingCost - discount;

    const handleSubmit = () => {
        const payload: ShopCheckoutDetails = {
            items: items,
            shippingAddressId,
            shippingMethodId,
            cartId: initialData?.cartId,
            couponCode: initialData?.couponCode,
            discountAmount: initialData?.discountAmount
        };
        onSubmit(payload);
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Left Column: Forms */}
                <div className="w-full lg:flex-1 space-y-8">
                    <BuyerInfoSection />

                    <div className="w-full h-px bg-slate-100 dark:bg-slate-800" />

                    <ShippingSection
                        selectedMethodId={shippingMethodId}
                        onSelect={setShippingMethodId}
                    />
                </div>

                {/* Right Column: Sticky Summary */}
                <div className="w-full lg:w-[380px] flex-shrink-0 sticky top-4">
                    <OrderSummaryCard
                        items={items}
                        subtotal={subtotal}
                        shippingCost={shippingCost}
                        discount={discount}
                        total={total}
                        onContinue={handleSubmit}
                    />
                </div>
            </div>
        </form>
    );
};

