"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ReviewModal } from "@/components/transport/ReviewModal";


interface Booking {
    id: string;
    category: string;
    title: string;
    description: string;
    image_url: string;
    location_summary: string;
    status: string;
    total_amount: number;
    currency: string;
    created_at: string;
    start_date: string;
    expires_at?: string;
    metadata: any;
}

export default function MyBookingsPage() {
    const searchParams = useSearchParams();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    useEffect(() => {
        // Show success message if redirected from payment
        if (searchParams.get('success') === 'true') {
            toast.success("Thanh toán thành công!", {
                description: "Đặt chỗ của bạn đã được xác nhận."
            });
        }
    }, [searchParams]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/bookings/user');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setBookings(data);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách đặt chỗ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // Helper function to check if booking is expired
    const isExpired = (booking: Booking) => {
        if (!booking.expires_at) return false;
        return new Date(booking.expires_at) < new Date();
    };

    const filteredBookings = bookings.filter(booking => {
        const expired = isExpired(booking);

        if (activeTab === 'upcoming') {
            // Exclude expired bookings from upcoming tab
            return ['held', 'confirmed'].includes(booking.status) && !expired;
        }
        if (activeTab === 'completed') return booking.status === 'completed';
        if (activeTab === 'cancelled') {
            // Include cancelled bookings AND expired ones
            return ['cancelled', 'payment_failed'].includes(booking.status) || expired;
        }
        return true;
    });

    const statusColors: Record<string, string> = {
        held: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        payment_failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };

    const statusLabels: Record<string, string> = {
        held: 'Chờ thanh toán',
        confirmed: 'Đã xác nhận',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy',
        payment_failed: 'Thanh toán lỗi',
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold">Đặt chỗ của tôi</h1>
                        <p className="text-muted">Quản lý tất cả các chuyến đi của bạn</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 p-1 bg-white dark:bg-white/5 rounded-full w-fit border border-border-subtle dark:border-white/10">
                    {(['upcoming', 'completed', 'cancelled'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${activeTab === tab
                                ? 'bg-primary text-white'
                                : 'text-muted hover:text-charcoal dark:hover:text-white'
                                }`}
                        >
                            {tab === 'upcoming' ? 'Sắp tới' : tab === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <span className="material-symbols-outlined text-6xl text-muted mb-4">
                            {activeTab === 'upcoming' ? 'event_upcoming' : activeTab === 'completed' ? 'check_circle' : 'cancel'}
                        </span>
                        <h3 className="text-xl font-bold mb-2">Không có đặt chỗ nào</h3>
                        <p className="text-muted mb-6">
                            {activeTab === 'upcoming'
                                ? 'Bạn chưa có chuyến đi nào sắp tới.'
                                : activeTab === 'completed'
                                    ? 'Bạn chưa hoàn thành chuyến đi nào.'
                                    : 'Không có đặt chỗ nào bị hủy.'}
                        </p>
                        <Link
                            href="/transport"
                            className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors"
                        >
                            Đặt xe ngay
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="bg-white dark:bg-[#1b1a18] rounded-3xl p-6 border border-border-subtle dark:border-white/10 shadow-sm"
                            >
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    {/* Logo */}
                                    <div className="size-16 rounded-2xl overflow-hidden bg-background-light dark:bg-white/5 shrink-0">
                                        <img
                                            src={booking.image_url || "https://via.placeholder.com/64"}
                                            alt="Logo"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[booking.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                                                {statusLabels[booking.status] || booking.status}
                                            </span>
                                            {isExpired(booking) && (
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                                    Hết hạn thanh toán
                                                </span>
                                            )}
                                            <span className="text-xs text-muted">
                                                {new Date(booking.created_at).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg mb-1">
                                            {booking.location_summary || booking.title}
                                        </h3>
                                        <p className="text-sm text-muted">
                                            {booking.title} {booking.description ? `• ${booking.description}` : ''}
                                        </p>
                                    </div>

                                    {/* Date & Time */}
                                    <div className="text-right">
                                        <p className="text-sm text-muted">Ngày thực hiện</p>
                                        <p className="font-bold">
                                            {booking.start_date
                                                ? new Date(booking.start_date).toLocaleString('vi-VN')
                                                : 'N/A'}
                                        </p>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-primary">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: booking.currency || 'VND' }).format(booking.total_amount)}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions for held bookings */}
                                {booking.status === 'held' && (
                                    <div className="mt-4 pt-4 border-t border-border-subtle dark:border-white/10 flex gap-4">
                                        <Link
                                            href={booking.category === 'transport'
                                                ? `/transport/checkout?routeId=${booking.metadata?.routeId}&bookingId=${booking.id}`
                                                : `/${booking.category}/checkout?bookingId=${booking.id}`}
                                            className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary/90 transition-colors"
                                        >
                                            Thanh toán ngay
                                        </Link>
                                        <button className="text-red-500 font-bold text-sm hover:underline">
                                            Hủy đặt chỗ
                                        </button>
                                    </div>
                                )}

                                {/* Review button for completed bookings */}
                                {booking.status === 'completed' && (
                                    <div className="mt-4 pt-4 border-t border-border-subtle dark:border-white/10">
                                        <button
                                            onClick={() => {
                                                setSelectedBooking(booking);
                                                setReviewModalOpen(true);
                                            }}
                                            className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">star</span>
                                            Đánh giá trải nghiệm
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {reviewModalOpen && selectedBooking && (
                <ReviewModal
                    bookingId={selectedBooking.id}
                    providerName={selectedBooking.title}
                    onClose={() => {
                        setReviewModalOpen(false);
                        setSelectedBooking(null);
                    }}
                    onSuccess={() => {
                        fetchBookings(); // Refresh to update review status
                    }}
                />
            )}
        </div>
    );
}
