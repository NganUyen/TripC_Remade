"use client";

import React, { useState } from "react";
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

export function ReviewsList() {
  const [reviews] = useState<Review[]>([
    {
      id: "1",
      guestName: "Nguyễn Văn A",
      rating: 5,
      comment: "Phòng rất sạch sẽ và tiện nghi, nhân viên thân thiện!",
      date: "2025-02-05",
      roomType: "Deluxe Room",
    },
    {
      id: "2",
      guestName: "Trần Thị B",
      rating: 4,
      comment: "Khách sạn đẹp, view đẹp, có điều máy lạnh hơi ồn",
      date: "2025-02-03",
      roomType: "Suite Room",
    },
  ]);

  const avgRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  ).toFixed(1);

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
