'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Calendar, Users, Ticket, MapPin, Clock } from 'lucide-react';
import { useSupabaseClient } from '@/lib/supabase';
import Image from 'next/image';
import { formatEventPrice, formatEventDate, formatEventTime } from '@/hooks/use-events';

interface Props {
    initialData: {
        eventId: string;
        sessionId: string;
        ticketTypeId: string;
        adults: number;
        children: number;
        voucherCode?: string;
        discountAmount?: number;
    };
    onSubmit: (data: any) => void;
}

interface EventDetails {
    eventTitle: string;
    eventImage: string;
    venueName: string;
    address: string;
    sessionDate: string;
    sessionTime: string;
    sessionName: string | null;
    ticketTypeName: string;
    ticketPrice: number;
    currency: string;
    perks: string[];
}

export const EventCheckoutForm = ({ initialData, onSubmit }: Props) => {
    const { user } = useUser();
    const supabase = useSupabaseClient();
    const [isLoading, setIsLoading] = useState(false);
    const [details, setDetails] = useState<EventDetails | null>(null);

    // Contact Info (Editable, Pre-filled from Clerk)
    const [contact, setContact] = useState({
        name: user?.fullName || '',
        email: user?.emailAddresses?.[0]?.emailAddress || '',
        phone: user?.primaryPhoneNumber?.phoneNumber || ''
    });

    // Special Requests
    const [specialRequests, setSpecialRequests] = useState('');

    // Fetch Event, Session, and Ticket Type Details
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Fetch Event
                const { data: event } = await supabase
                    .from('events')
                    .select('title, cover_image_url, venue_name, address, city')
                    .eq('id', initialData.eventId)
                    .single();

                // Fetch Session
                const { data: session } = await supabase
                    .from('event_sessions')
                    .select('session_date, start_time, name')
                    .eq('id', initialData.sessionId)
                    .single();

                // Fetch Ticket Type
                const { data: ticketType } = await supabase
                    .from('event_ticket_types')
                    .select('name, price, currency, perks')
                    .eq('id', initialData.ticketTypeId)
                    .single();

                if (event && session && ticketType) {
                    setDetails({
                        eventTitle: event.title,
                        eventImage: event.cover_image_url || '/images/placeholder-event.jpg',
                        venueName: event.venue_name || 'Venue TBA',
                        address: [event.address, event.city].filter(Boolean).join(', ') || 'Vietnam',
                        sessionDate: session.session_date,
                        sessionTime: session.start_time,
                        sessionName: session.name,
                        ticketTypeName: ticketType.name,
                        ticketPrice: ticketType.price,
                        currency: ticketType.currency,
                        perks: ticketType.perks || []
                    });
                }
            } catch (err) {
                console.error("Failed to fetch event details", err);
                toast.error("Failed to load event details");
            }
        };

        if (initialData.eventId && initialData.sessionId && initialData.ticketTypeId) {
            fetchDetails();
        }
    }, [initialData.eventId, initialData.sessionId, initialData.ticketTypeId, supabase]);

    // Update contact when user loads
    useEffect(() => {
        if (user) {
            setContact({
                name: user.fullName || '',
                email: user.emailAddresses?.[0]?.emailAddress || '',
                phone: user.primaryPhoneNumber?.phoneNumber || ''
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to continue');
            return;
        }

        if (!contact.name || !contact.email || !contact.phone) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Validate Phone (VN format)
        const phoneRegex = /^(0|\+84)(3|5|7|8|9|2)\d{8}$/;
        if (!phoneRegex.test(contact.phone.replace(/\s/g, ''))) {
            toast.error('Please enter a valid phone number (e.g., 0912345678)');
            return;
        }

        setIsLoading(true);

        // Build payload for checkout service
        const payload = {
            eventId: initialData.eventId,
            sessionId: initialData.sessionId,
            ticketTypeId: initialData.ticketTypeId,
            adultCount: initialData.adults,
            childCount: initialData.children,
            guestDetails: {
                name: contact.name,
                email: contact.email,
                phone: contact.phone || undefined
            },
            specialRequests: specialRequests || undefined,
            voucherCode: initialData.voucherCode,
            discountAmount: initialData.discountAmount
        };

        console.log('[EventCheckoutForm] Submitting Payload:', payload);

        onSubmit(payload);
    };

    // Calculate totals
    const totalQuantity = initialData.adults + initialData.children;
    const unitPrice = details?.ticketPrice || 0;
    const subtotal = totalQuantity * unitPrice;
    const discount = initialData.discountAmount || 0;
    const totalPrice = Math.max(0, subtotal - discount);
    const currency = details?.currency || 'VND';

    if (!details) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="bg-slate-200 dark:bg-slate-800 h-64 rounded-2xl" />
                <div className="bg-slate-200 dark:bg-slate-800 h-48 rounded-2xl" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

            {/* 1. Event Information Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="relative h-48 w-full">
                    <Image
                        src={details.eventImage}
                        alt={details.eventTitle}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                        <h2 className="text-white text-2xl font-bold">{details.eventTitle}</h2>
                        <div className="flex items-center gap-2 text-white/90 text-sm mt-1">
                            <MapPin className="w-4 h-4" />
                            {details.venueName}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-950/50">
                    {/* Session Info */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-white dark:bg-black rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Date</span>
                            <div className="font-semibold flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#FF5E1F]" />
                                {formatEventDate(details.sessionDate)}
                            </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-black rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Time</span>
                            <div className="font-semibold flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#FF5E1F]" />
                                {formatEventTime(details.sessionTime)}
                            </div>
                        </div>
                    </div>

                    {details.sessionName && (
                        <p className="text-sm text-[#FF5E1F] font-medium mb-4">{details.sessionName}</p>
                    )}

                    {/* Ticket Info */}
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-900/50">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#FF5E1F] rounded-full flex items-center justify-center">
                                    <Ticket className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{details.ticketTypeName}</p>
                                    <p className="text-sm text-slate-500">{formatEventPrice(unitPrice, currency)} / ticket</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-slate-500">{totalQuantity} ticket{totalQuantity !== 1 ? 's' : ''}</p>
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="space-y-1 pt-2 mt-2 border-t border-orange-200 dark:border-orange-800/50">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                                <span className="font-semibold text-slate-900 dark:text-white">{formatEventPrice(subtotal, currency)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600 font-medium">
                                    <span>Voucher Discount {initialData.voucherCode ? `(${initialData.voucherCode})` : ''}</span>
                                    <span>-{formatEventPrice(discount, currency)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-black text-[#FF5E1F] pt-2 border-t border-orange-200 dark:border-orange-800/50 mt-2">
                                <span>Total</span>
                                <span>{formatEventPrice(totalPrice, currency)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Ticket Breakdown - Guest Count */}
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>
                                {initialData.adults} Adult{initialData.adults !== 1 ? 's' : ''}
                                {initialData.children > 0 && `, ${initialData.children} Child${initialData.children !== 1 ? 'ren' : ''}`}
                            </span>
                        </div>
                    </div>

                    {/* Perks */}
                    {details.perks.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <p className="text-xs text-slate-500 font-bold uppercase mb-2">Included</p>
                            <ul className="space-y-1">
                                {details.perks.map((perk, i) => (
                                    <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                        {perk}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Contact Information */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <h2 className="text-xl font-semibold">Contact Information</h2>
                <p className="text-sm text-slate-500">E-tickets will be sent to this email address</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Full Name <span className="text-red-500">*</span></Label>
                        <Input
                            value={contact.name}
                            onChange={(e) => setContact({ ...contact, name: e.target.value })}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Phone Number <span className="text-red-500">*</span></Label>
                        <Input
                            value={contact.phone}
                            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                            placeholder="+84 912 345 678"
                            required
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Email Address <span className="text-red-500">*</span></Label>
                        <Input
                            type="email"
                            value={contact.email}
                            onChange={(e) => setContact({ ...contact, email: e.target.value })}
                            placeholder="john@example.com"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* 3. Special Requests (Optional) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                <h2 className="text-xl font-semibold">Special Requests</h2>
                <p className="text-sm text-slate-500">Optional: Let us know if you have any special requirements</p>
                <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g., Wheelchair accessibility, dietary requirements..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5E1F] focus:border-transparent resize-none"
                />
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                className="w-full h-12 text-lg font-bold bg-[#FF5E1F] hover:bg-orange-600 shadow-lg shadow-orange-500/20"
                disabled={isLoading}
            >
                {isLoading ? 'Processing...' : 'Proceed to Payment'}
            </Button>

            {/* Notice */}
            <p className="text-xs text-center text-slate-500">
                By proceeding, you agree to our Terms & Conditions and Privacy Policy.
                E-tickets are non-refundable unless otherwise stated.
            </p>
        </form>
    );
};
