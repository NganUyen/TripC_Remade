"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ShieldCheck, FileText, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
    onAccept: () => void;
    onDecline: () => void;
    isAccepted: boolean;
}

export function TermsAndConditions({ onAccept, onDecline, isAccepted }: Props) {
    const [hasReadToBottom, setHasReadToBottom] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (!scrollRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50; // 50px buffer

        if (isBottom) {
            setHasReadToBottom(true);
        }
    };

    const handleCheckboxClick = () => {
        if (!hasReadToBottom && !isAccepted) {
            toast.error("Vui lòng đọc hết điều khoản trước khi đồng ý.");
            return;
        }

        if (isAccepted) {
            onDecline();
        } else {
            onAccept();
        }
    };

    useEffect(() => {
        // Initial check for short content
        handleScroll();
    }, []);

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-slate-900 dark:text-white">Điều Khoản & Chính Sách</h3>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">

                {/* Scrollable Content Area */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="h-48 overflow-y-auto p-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
                >
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="font-bold text-slate-900 dark:text-white mb-2">1. Điều khoản chung</p>
                        <p className="mb-4">
                            Bằng việc đặt dịch vụ tại TripC, bạn đồng ý với các điều khoản sử dụng của chúng tôi.
                            Chúng tôi cam kết bảo vệ thông tin cá nhân và đảm bảo quyền lợi của khách hàng theo quy định pháp luật.
                        </p>

                        <p className="font-bold text-slate-900 dark:text-white mb-2">2. Chính sách hoàn hủy</p>
                        <p className="mb-4">
                            - Hủy trước 24h: Hoàn 100% giá trị đơn hàng.<br />
                            - Hủy trước 12h: Hoàn 50% giá trị đơn hàng.<br />
                            - Hủy trong vòng 12h: Không hoàn tiền.<br />
                            Thời gian hoàn tiền từ 3-5 ngày làm việc tùy thuộc vào ngân hàng thụ hưởng.
                        </p>

                        <p className="font-bold text-slate-900 dark:text-white mb-2">3. Trách nhiệm người dùng</p>
                        <p className="mb-4">
                            Khách hàng có trách nhiệm cung cấp thông tin chính xác khi đặt dịch vụ.
                            TripC không chịu trách nhiệm cho các sự cố phát sinh do sai lệch thông tin từ phía khách hàng.
                        </p>

                        <p className="font-bold text-slate-900 dark:text-white mb-2">4. Thanh toán an toàn</p>
                        <p className="mb-4">
                            Mọi giao dịch thanh toán đều được mã hóa và bảo mật tuyệt đối.
                            Chúng tôi không lưu trữ thông tin thẻ tín dụng của khách hàng.
                        </p>

                        <p className="font-bold text-slate-900 dark:text-white mb-2">5. Cam kết dịch vụ</p>
                        <p>
                            TripC cam kết cung cấp dịch vụ đúng như mô tả. Trong trường hợp dịch vụ không đạt chuẩn,
                            chúng tôi sẽ xem xét bồi thường hoặc hoàn tiền thỏa đáng.
                        </p>
                    </div>
                </div>

                {/* Footer / Checkbox */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900/50 cursor-pointer"
                    onClick={handleCheckboxClick}>

                    <div className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 transform",
                        isAccepted
                            ? "bg-primary border-primary scale-100 shadow-lg shadow-primary/25"
                            : cn("bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700", !hasReadToBottom && "opacity-50")
                    )}>
                        <Check className={cn("w-4 h-4 text-white transition-transform duration-200", isAccepted ? "scale-100" : "scale-0")} strokeWidth={3} />
                    </div>

                    <div className="flex-1">
                        <p className={cn("text-sm font-semibold transition-colors", isAccepted ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400")}>
                            Tôi đã đọc và đồng ý với các điều khoản
                        </p>
                        {!hasReadToBottom && !isAccepted && (
                            <p className="text-[10px] text-orange-500 font-medium flex items-center gap-1 mt-0.5 animate-pulse">
                                <ChevronDown className="w-3 h-3" />
                                Vui lòng cuộn xuống hết để đồng ý
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
