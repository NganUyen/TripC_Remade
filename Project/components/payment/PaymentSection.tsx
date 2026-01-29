"use client";

import { PaymentMethodSelector } from "@/components/checkout/payment-method-selector";
import { useState } from "react";
import { toast } from "sonner";

interface PaymentSectionProps {
    bookingId: string;
    amount: number;
    category?: string; // To conditionally show policies
}

export function PaymentSection({ bookingId, amount, category = 'transport' }: PaymentSectionProps) {
    const [method, setMethod] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        if (!method) {
            toast.error("Vui lòng chọn phương thức thanh toán!");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/payment/create-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId, paymentMethod: method })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Payment init failed");
            }

            toast.success(`Đang chuyển đến trang thanh toán ${method.toUpperCase()}...`);

            // Use mockSuccessUrl for demo, paymentUrl for production
            setTimeout(() => {
                window.location.href = data.mockSuccessUrl;
            }, 1500);

        } catch (error: any) {
            console.error(error);
            toast.error("Lỗi khởi tạo thanh toán: " + error.message);
        } finally {
            setLoading(false);
        }
    };


    const [agreed, setAgreed] = useState(false);
    const [canAgree, setCanAgree] = useState(false);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // Check if user has scrolled near the bottom (within 10px)
        if (scrollHeight - scrollTop <= clientHeight + 10) {
            setCanAgree(true);
        }
    };

    return (
        <div className="flex-1 py-4 flex flex-col">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Thanh toán</h1>
                <p className="text-muted-foreground">Chọn phương thức thanh toán ưu tiên của bạn.</p>
            </div>

            {/* Policy Section - Could be dynamic based on category */}
            <div className="mb-8 p-6 bg-white dark:bg-white/5 rounded-3xl border border-border-subtle dark:border-white/10">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">policy</span>
                    {category === 'transport' ? 'Chính sách vận chuyển' : 'Điều khoản dịch vụ'}
                </h4>
                <div
                    onScroll={handleScroll}
                    className="h-40 overflow-y-auto pr-2 text-sm text-muted-foreground mb-4 custom-scrollbar bg-slate-50 dark:bg-black/20 p-4 rounded-xl leading-relaxed"
                >
                    <p className="text-primary font-bold italic">Vui lòng cuộn xuống hết để có thể đồng ý.</p>
                    {category === 'transport' ? (
                        <>
                            <p className="mb-4">1. Quý khách vui lòng có mặt tại điểm đón ít nhất 15 phút trước giờ khởi hành.</p>
                            <p className="mb-4">2. Vé đã đặt có thể được hủy hoặc đổi trả tùy theo chính sách của nhà xe. Phí hủy vé có thể lên đến 100% nếu hủy sát giờ khởi hành.</p>
                            <p className="mb-4">3. TripC không chịu trách nhiệm về việc thất lạc hành lý cá nhân hoặc sự cố do lỗi của nhà vận chuyển.</p>
                        </>
                    ) : (
                        <>
                            <p className="mb-4">1. Quý khách vui lòng kiểm tra kỹ thông tin đơn hàng trước khi thanh toán.</p>
                            <p className="mb-4">2. Đơn hàng sau khi thanh toán có thể không được hoàn lại tùy theo chính sách của nhà cung cấp.</p>
                        </>
                    )}
                    <p className="mb-4">{category === 'transport' ? '4.' : '3.'} Bằng việc nhấn "Thanh toán", quý khách xác nhận đã đọc và đồng ý với tất cả điều khoản dịch vụ.</p>
                    <p className="mb-4">{category === 'transport' ? '5.' : '4.'} Vui lòng kiểm tra kỹ thông tin cá nhân và thời gian trước khi thanh toán.</p>

                </div>
                <label className={`flex items-center gap-3 cursor-pointer group transition-opacity ${!canAgree ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            checked={agreed}
                            disabled={!canAgree}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="peer appearance-none size-6 rounded-lg border-2 border-border-subtle hover:border-primary checked:bg-primary checked:border-primary transition-all cursor-pointer disabled:cursor-not-allowed"
                        />
                        <span className="material-symbols-outlined absolute text-white text-lg left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">check</span>
                    </div>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">
                        Tôi đã đọc và đồng ý với điều khoản trên
                    </span>
                </label>
            </div>



            <div className={`mb-8 transition-all duration-500 ${!agreed ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
                <PaymentMethodSelector
                    onSelect={setMethod}
                    disabled={!agreed}
                    defaultValue={method}
                />
            </div>

            <button
                onClick={handlePayment}
                disabled={loading || !agreed || !method}
                className="w-full bg-primary text-white py-5 rounded-pill font-extrabold text-lg shadow-xl shadow-primary/25 hover:shadow-2xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed disabled:translate-y-0"
            >
                {loading ? "Processing..." : `Thanh toán ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}`}
            </button>
        </div>
    );
}
