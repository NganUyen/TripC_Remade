"use client";

import React from 'react';
import { ShoppingBag, Package, Truck, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ShopBookingCardProps {
    booking: any;
}

export default function ShopBookingCard({ booking }: ShopBookingCardProps) {
    const router = useRouter();

    const isConfirmed = booking.status === 'confirmed' || booking.status === 'completed';
    const isCancelled = booking.status === 'cancelled';

    // Shop metadata often implicit or hard to parse without joining tables, 
    // but generic booking creation might not store item names in metadata unless we forced it.
    // We'll rely on generic fields for now.
    const title = booking.title || `Order #${booking.id.slice(0, 8)}`;
    const itemCount = booking.metadata?.items?.length || 1;

    return (
        <div className="group relative bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* Status Badge */}
            <div className="absolute top-4 right-4 z-10">
                <Badge
                    variant={isConfirmed ? "default" : isCancelled ? "destructive" : "secondary"}
                    className={isConfirmed ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                >
                    {isConfirmed ? "Thành công" : isCancelled ? "Đã hủy" : "Chờ thanh toán"}
                </Badge>
            </div>

            <div className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center flex-shrink-0 text-purple-600 dark:text-purple-400">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1">
                            {title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {itemCount} sản phẩm
                        </p>
                    </div>
                </div>

                {/* Details */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Truck size={16} />
                        <span>Giao hàng tiêu chuẩn</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                    <div>
                        <p className="text-xs text-slate-400 font-medium uppercase">Tổng đơn hàng</p>
                        <p className="text-lg font-bold text-[#FF5E1F]">
                            {/* Shop usually USD */}
                            {booking.total_amount}{booking.currency === 'USD' ? '$' : 'đ'}
                        </p>
                    </div>

                    {!isConfirmed && !isCancelled && (
                        <Button
                            onClick={() => router.push(`/payment?bookingId=${booking.id}`)}
                            className="bg-[#FF5E1F] hover:bg-[#ff4e0b] text-white rounded-full px-6"
                        >
                            Thanh toán
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
