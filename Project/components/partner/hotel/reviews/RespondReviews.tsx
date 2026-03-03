"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Bell, Send, Star } from "lucide-react";

export function RespondReviews({ partnerId }: { partnerId: string }) {
  const { getToken } = useAuth();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<Record<string, boolean>>({});
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [pendingReviews, setPendingReviews] = useState<
    {
      id: string;
      guestName: string;
      rating: number;
      comment: string;
      date: string;
    }[]
  >([]);

  useEffect(() => {
    if (!partnerId) return;
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch("/api/partner/hotel/hotels", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const d = await res.json();
          if (d.success && d.data?.length > 0) setHotelId(d.data[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [partnerId]);

  useEffect(() => {
    if (!hotelId) return;
    (async () => {
      try {
        const token = await getToken();
        // Fetch reviews that haven't been responded to
        const res = await fetch(
          `/api/partner/hotel/reviews?hotel_id=${hotelId}&responded=false`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.ok) {
          const d = await res.json();
          if (d.success) {
            setPendingReviews(
              (d.data || []).map((r: any) => ({
                id: r.id,
                guestName: r.reviewer_name ?? r.profiles?.full_name ?? "Khách",
                rating: r.rating ?? 5,
                comment: r.comment ?? r.review_text ?? "",
                date: r.created_at?.split("T")[0] ?? "",
              })),
            );
          }
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [hotelId]);

  const handleSend = async (reviewId: string) => {
    const text = responses[reviewId];
    if (!text?.trim()) return;
    setSending((prev) => ({ ...prev, [reviewId]: true }));
    try {
      const token = await getToken();
      const res = await fetch(
        `/api/partner/hotel/reviews/${reviewId}/respond`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ response: text }),
        },
      );
      if (res.ok) {
        setPendingReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setResponses((prev) => {
          const n = { ...prev };
          delete n[reviewId];
          return n;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Phản hồi Đánh giá
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Trả lời đánh giá của khách hàng
        </p>
      </div>

      {pendingReviews.map((review, index) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
        >
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {review.guestName}
              </h3>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              {review.comment}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Phản hồi của bạn
            </label>
            <textarea
              value={responses[review.id] ?? ""}
              onChange={(e) =>
                setResponses((prev) => ({
                  ...prev,
                  [review.id]: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Nhập phản hồi..."
            />
            <button
              onClick={() => handleSend(review.id)}
              disabled={sending[review.id]}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {sending[review.id] ? "Đang gửi..." : "Gửi"}
            </button>
          </div>
        </motion.div>
      ))}
      {pendingReviews.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          Không có đánh giá nào cần phản hồi
        </div>
      )}
    </div>
  );
}
