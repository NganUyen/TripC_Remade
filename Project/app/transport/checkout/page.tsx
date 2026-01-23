"use client";

import { CheckoutHeader } from "@/components/transport/checkout/CheckoutHeader";
import { PassengerDetailsForm } from "@/components/transport/checkout/PassengerDetailsForm";
import { CheckoutBookingSummary } from "@/components/transport/checkout/CheckoutBookingSummary";
import Link from "next/link";

export default function TransportCheckoutPage() {
    return (
        <div className="min-h-screen items-center justify-center p-6 md:p-12 bg-background-light dark:bg-background-dark">
            <div className="max-w-7xl w-full mx-auto space-y-8">
                <CheckoutHeader />
                <div className="flex flex-col lg:flex-row items-stretch gap-16 min-h-[700px]">
                    <PassengerDetailsForm />
                    <CheckoutBookingSummary />
                </div>
                <div className="flex justify-center gap-8 pt-4">
                    <Link href="#" className="text-[11px] font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest">Help Center</Link>
                    <Link href="#" className="text-[11px] font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest">Terms of Service</Link>
                    <Link href="#" className="text-[11px] font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest">Privacy Policy</Link>
                </div>
            </div>
        </div>
    );
}
