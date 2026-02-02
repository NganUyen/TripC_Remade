"use client";

import { PaymentMethodSelector } from "@/components/checkout/payment-method-selector";
import { useState } from "react";
import { toast } from "sonner";
import { CurrencyGuardModal } from "@/components/checkout/currency-guard-modal";
import { formatCurrency } from "@/lib/utils/currency";
import { Clock } from "lucide-react";

interface PaymentSectionProps {
    bookingId: string;
    amount: number;
    category?: string;
    currency?: string;
    title?: string;
    description?: string;
    bookingCode?: string;
    guestName?: string;
}

export function PaymentSection({
    bookingId,
    amount,
    category = 'transport',
    currency = 'USD',
    title,
    description,
    bookingCode,
    guestName
}: PaymentSectionProps) {
    const [method, setMethod] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Currency Guard State
    const [showGuard, setShowGuard] = useState(false);
    const [pendingMethod, setPendingMethod] = useState<string | null>(null);

    const executePayment = async (selectedMethod: string) => {
        setLoading(true);
        try {
            // Must use the standardized plural endpoint which supports PayPal & MoMo via PaymentService
            const res = await fetch('/api/payments/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId,
                    provider: method, // 'momo', 'paypal', 'vnpay'
                    returnUrl: `${window.location.origin}/my-bookings`
                })
            });

            const responseData = await res.json();

            if (!res.ok) {
                throw new Error(responseData.error || "Payment init failed");
            }

            toast.success(`Đang chuyển đến trang thanh toán ${selectedMethod.toUpperCase()}...`);

            const { data } = responseData;

            if (data?.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else if (data?.mockSuccessUrl) {
                setTimeout(() => {
                    window.location.href = data.mockSuccessUrl;
                }, 1500);
            } else {
                throw new Error("No payment URL returned");
            }

        } catch (error: any) {
            console.error("Payment Error:", error);
            toast.error("Lỗi khởi tạo thanh toán: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentClick = () => {
        if (!method) {
            toast.error("Vui lòng chọn phương thức thanh toán!");
            return;
        }

        // Currency Guard Logic
        // If Currency is VND and Method is PayPal -> SHOW GUARD
        if (currency === 'VND' && method === 'paypal') {
            setPendingMethod(method);
            setShowGuard(true);
            return;
        }

        // If Currency is USD and Method is MoMo/VNPAY -> SHOW GUARD
        if (currency === 'USD' && (method === 'momo' || method === 'vnpay')) {
            setPendingMethod(method);
            setShowGuard(true);
            return;
        }

        // Otherwise proceed directly
        executePayment(method);
    };

    const handleGuardConfirm = () => {
        if (pendingMethod) {
            executePayment(pendingMethod);
            setShowGuard(false);
            setPendingMethod(null);
        }
    };

    const handleGuardClose = () => {
        setShowGuard(false);
        setPendingMethod(null);
    };

    const handleGuardSwitch = (provider: string) => {
        setShowGuard(false);
        setMethod(provider);
        setPendingMethod(null);
        // Optional: auto-execute after switch? No, let user confirm.
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
                <p className="text-muted-foreground">Vui lòng kiểm tra thông tin và chọn phương thức thanh toán.</p>
            </div>

            {/* Unified Booking Summary within Payment Section */}
            {(title || bookingCode) && (
                <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col gap-1 mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thông tin đơn hàng</span>
                        <h2 className="text-xl font-bold">{title}</h2>
                        {description && <p className="text-sm text-slate-500 line-clamp-1">{description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Mã đặt chỗ</span>
                            <span className="font-mono font-bold text-primary">{bookingCode}</span>
                        </div>
                        <div className="text-right">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Tổng cộng</span>
                            <span className="font-black text-lg text-primary">{formatCurrency(amount, currency as 'USD' | 'VND')}</span>
                        </div>
                    </div>
                </div>
            )}

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
                onClick={handlePaymentClick}
                disabled={loading || !agreed || !method}
                className="w-full bg-primary text-white py-5 rounded-pill font-extrabold text-lg shadow-xl shadow-primary/25 hover:shadow-2xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed disabled:translate-y-0"
            >
                {loading ? "Processing..." : `Thanh toán ${formatCurrency(amount, currency as 'USD' | 'VND')}`}
            </button>
            <CurrencyGuardModal
                isOpen={showGuard}
                onClose={handleGuardClose}
                onConfirm={handleGuardConfirm}
                onSwitchProvider={handleGuardSwitch}
                amount={amount}
                currency={currency}
                targetProvider={pendingMethod || method || ''}
            />
        </div>
    );
}
