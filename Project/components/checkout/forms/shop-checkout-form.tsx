import { useState } from 'react';
import { ShopCheckoutDetails } from '@/lib/checkout/types';

interface ShopCheckoutFormProps {
    initialData?: any;
    onSubmit: (details: ShopCheckoutDetails) => void;
}

export const ShopCheckoutForm = ({ initialData, onSubmit }: ShopCheckoutFormProps) => {
    // Placeholder: Need actual address selection logic
    // For now, hardcode or simple input
    const [shippingAddressId, setShippingAddressId] = useState('addr_default');
    const [shippingMethodId, setShippingMethodId] = useState('method_standard');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload: ShopCheckoutDetails = {
            items: initialData?.items || [], // Items passed from cart context
            shippingAddressId,
            shippingMethodId,
            cartId: initialData?.cartId
        };

        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold mb-4">Shipping Info</h3>
                <div className="text-sm text-zinc-500 mb-4">
                    Address selection will go here. Defaulting to 'Default Address'.
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <ul className="space-y-3 mb-4">
                    {initialData?.items?.map((item: any, idx: number) => (
                        <li key={idx} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.name}</span>
                            <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-zinc-800 transition-colors"
            >
                Continue to Payment
            </button>
        </form>
    );
};
