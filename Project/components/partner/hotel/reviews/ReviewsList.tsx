"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Star, ThumbsUp, MessageCircle } from "lucide-react";

interface Review {
  id: string;
  guestName: string;
  rating: number;
  comment: string;
  date: string;
  roomType: string;
}

export function ReviewsList({ partnerId }: { partnerId: string }) {
  const { getToken } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [hotelId, setHotelId] = useState<string | null>(null);

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
        setLoading(true);
        const token = await getToken();
        const res = await fetch(
          `/api/partner/hotel/reviews?hotel_id=${hotelId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          const d = await res.json();
          if (d.success) {
            setReviews(
              (d.data || []).map((r: any) => ({
                id: r.id,
                guestName: r.reviewer_name ?? r.profiles?.full_name ?? "Khách",
                rating: r.rating ?? 5,
                comment: r.comment ?? r.review_text ?? "",
                date: r.created_at?.split("T")[0] ?? "",
                roomType: r.room_name ?? r.hotel_rooms?.name ?? "-",
              })),
            );
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [hotelId]);

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Danh sách Đánh giá
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Xem và quản lý đánh giá của khách
        </p>
      </div>

      <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <Star className="w-12 h-12 fill-current" />
          <div>
            <p className="text-4xl font-bold">{avgRating}/5</p>
            <p className="text-sm opacity-90">{reviews.length} đánh giá</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                  {review.guestName}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {review.roomType} •{" "}
                  {new Date(review.date).toLocaleDateString("vi-VN")}
                </p>
              </div>
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
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <MessageCircle className="w-4 h-4" />
                Trả lời
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
