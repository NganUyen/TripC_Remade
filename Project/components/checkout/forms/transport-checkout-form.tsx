"use client";

import { PassengerDetailsForm } from "@/components/transport/checkout/PassengerDetailsForm";
import { CheckoutPayload } from "@/lib/checkout/types";
import { useState } from "react";
import { toast } from "sonner";
import { CheckoutBookingSummary } from "@/components/transport/checkout/CheckoutBookingSummary";

interface Props {
    initialData?: any;
    onSubmit: (data: any) => void;
}

export function TransportCheckoutForm({ initialData, onSubmit }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // initialData should contain: { route, passengers, date } passed from the Page
    const { route, passengers, date } = initialData || {};

    if (!route) {
        return <div className="text-red-500">Route data missing. Please try searching again.</div>;
    }

    const handleFormSubmit = async (formData: any) => {
        setIsSubmitting(true);
        try {
            // Construct payload for api/checkout/initialize
            // We match the verification logic we saw in the old page.tsx
            const payload = {
                currency: 'VND', // Transport uses VND
                items: [{
                    name: `${route.vehicle_type} • ${route.origin} -> ${route.destination}`,
                    price: route.price,
                    quantity: parseInt(passengers || '1'),
                    image: route.images?.[0]
                }],
                metadata: {
                    routeId: route.id,
                    vehicleType: route.vehicle_type,
                    tripType: route.type,
                    pickupLocation: route.origin,
                    dropoffLocation: route.destination,
                    pickupTime: route.departure_time,
                    passengerCount: parseInt(passengers || '1'),
                    luggageCount: 0,
                    vehicleDetails: {
                        type: route.vehicle_type,
                        provider: route.transport_providers?.name
                    },
                    passengerInfo: formData,
                    contactInfo: {
                        email: formData.email,
                        phone: formData.phone
                    }
                }
            };

            // Pass to parent Container
            onSubmit(payload);

        } catch (error) {
            console.error(error);
            toast.error("Failed to prepare booking data");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row items-stretch gap-16 min-h-[700px]">
            {/* Left Column: Form */}
            <PassengerDetailsForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />

            {/* Right Column: Summary (Visual only) */}
            {/* We render it here so it looks exactly like the original design */}
            <div className="w-full max-w-md">
                <CheckoutBookingSummary
                    route={route}
                    date={date}
                    passengers={passengers?.toString() || '1'}
                    expiresAt={undefined} // New booking, no expiry yet
                />
            </div>
        </div>
    );
}