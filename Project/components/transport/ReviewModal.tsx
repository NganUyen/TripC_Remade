"use client";

import { useState } from "react";
import { toast } from "sonner";

interface ReviewModalProps {
    bookingId: string;
    providerName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function ReviewModal({ bookingId, providerName, onClose, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error("Vui lòng chọn số sao đánh giá!");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/reviews/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId, rating, comment })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Review submission failed");
            }

            toast.success("Cảm ơn bạn đã đánh giá!", {
                description: "Đánh giá của bạn giúp cải thiện dịch vụ."
            });
            onSuccess();
            onClose();

        } catch (error: any) {
            console.error(error);
            toast.error("Lỗi gửi đánh giá: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1b1a18] rounded-3xl p-8 max-w-md w-full border border-border-subtle dark:border-white/10 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-extrabold">Đánh giá chuyến đi</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-background-light dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Provider Info */}
                <div className="mb-6 p-4 bg-background-light dark:bg-white/5 rounded-2xl">
                    <p className="text-sm text-muted mb-1">Nhà xe</p>
                    <p className="font-bold text-lg">{providerName}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Star Rating */}
                    <div>
                        <label className="text-sm font-bold mb-3 block">Đánh giá dịch vụ</label>
                        <div className="flex gap-2 justify-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-110 active:scale-95"
                                >
                                    <span
                                        className={`material-symbols-outlined text-5xl ${star <= (hoveredRating || rating)
                                                ? 'text-yellow-500'
                                                : 'text-gray-300 dark:text-gray-600'
                                            }`}
                                        style={{ fontVariationSettings: "'FILL' 1" }}
                                    >
                                        star
                                    </span>
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-center mt-2 text-sm font-bold text-primary">
                                {rating === 5 ? 'Tuyệt vời!' : rating === 4 ? 'Rất tốt!' : rating === 3 ? 'Tốt' : rating === 2 ? 'Trung bình' : 'Cần cải thiện'}
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="text-sm font-bold mb-2 block">Nhận xét (tùy chọn)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Chia sẻ trải nghiệm của bạn..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-2xl border border-border-subtle dark:border-white/10 bg-white dark:bg-white/5 outline-none focus:border-primary transition-colors resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || rating === 0}
                        className="w-full bg-primary text-white py-4 rounded-full font-extrabold text-lg shadow-xl shadow-primary/25 hover:shadow-2xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Đang gửi..." : "Gửi đánh giá"}
                        {!loading && <span className="material-symbols-outlined">send</span>}
                    </button>
                </form>
            </div>
        </div>
    );
}
