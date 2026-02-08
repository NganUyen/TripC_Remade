"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Reply,
  Calendar,
  User,
} from "lucide-react";
import { useSupabaseClient } from "@/lib/supabase";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  route_id: string;
  booking_id: string;
  response?: string;
  transport_routes?:
    | {
        origin: string;
        destination: string;
      }[]
    | { origin: string; destination: string };
}

export function Reviews() {
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's providers
      const { data: providers } = await supabase
        .from("transport_providers")
        .select("id")
        .eq("owner_id", user.id);

      if (!providers || providers.length === 0) {
        setLoading(false);
        return;
      }

      const providerIds = providers.map((p) => p.id);

      const { data, error } = await supabase
        .from("transport_reviews")
        .select(
          `
                    id,
                    rating,
                    comment,
                    created_at,
                    user_id,
                    route_id,
                    booking_id,
                    response,
                    transport_routes!inner (
                        origin,
                        destination,
                        provider_id
                    )
                `,
        )
        .in("transport_routes.provider_id", providerIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
      } else {
        setReviews((data as unknown as Review[]) || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;

    try {
      const { error } = await supabase
        .from("transport_reviews")
        .update({ response: replyText })
        .eq("id", reviewId);

      if (error) {
        console.error("Error submitting reply:", error);
      } else {
        fetchReviews();
        setReplyingTo(null);
        setReplyText("");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-amber-400 fill-current" : "text-slate-300 dark:text-slate-600"}`}
      />
    ));
  };

  const filteredReviews =
    filterRating === "all"
      ? reviews
      : reviews.filter((r) => r.rating === filterRating);

  // Calculate stats
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage:
      reviews.length > 0
        ? (
            (reviews.filter((r) => r.rating === rating).length /
              reviews.length) *
            100
          ).toFixed(0)
        : 0,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-amber-500/10 rounded-2xl">
            <MessageSquare className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Đánh giá
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Phản hồi từ khách hàng và xếp hạng dịch vụ
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl self-start md:self-center">
          <div className="px-4 py-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
            <span className="text-sm font-black text-primary">
              {reviews.length}
            </span>
            <span className="ml-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              Phản hồi
            </span>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Average Rating Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Star className="w-40 h-40 fill-current" />
          </div>
          <div className="relative z-10 text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              Xếp hạng trung bình
            </p>
            <div className="text-7xl font-black tracking-tighter mb-4">
              {avgRating}
            </div>
            <div className="flex items-center justify-center gap-1.5 mb-6">
              {renderStars(Math.round(Number(avgRating)))}
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-xs font-bold">
              <ThumbsUp className="w-3.5 h-3.5 text-primary" />
              Độ hài lòng cao
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Phân bổ đánh giá
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-14">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {rating}
                  </span>
                  <Star className="w-3 h-3 text-amber-400 fill-current" />
                </div>
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="bg-amber-400 rounded-full h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.1 * (5 - rating), duration: 0.8 }}
                  />
                </div>
                <div className="w-10 text-right">
                  <span className="text-xs font-black text-slate-400">
                    {percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setFilterRating("all")}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            filterRating === "all"
              ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-primary"
          }`}
        >
          Tất cả
        </button>
        {[5, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            onClick={() => setFilterRating(rating)}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              filterRating === rating
                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-primary"
            }`}
          >
            {rating} <Star className="w-3.5 h-3.5 fill-current" />
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 animate-pulse"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/6" />
                </div>
              </div>
              <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="space-y-6">
          {filteredReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <User className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      Khách hàng ẩn danh
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex gap-0.5">
                        {renderStars(review.rating)}
                      </div>
                      <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(review.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
                {review.transport_routes && (
                  <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-black uppercase tracking-tight text-slate-500">
                      Chuyến:
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {(review.transport_routes as any).origin} →{" "}
                      {(review.transport_routes as any).destination}
                    </span>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full group-hover:bg-primary transition-colors" />
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg italic mb-8">
                  "{review.comment || "Khách hàng không để lại bình luận"}"
                </p>
              </div>

              {/* Provider Response */}
              {review.response && (
                <div className="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-3xl p-8 mb-8 border border-emerald-500/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Reply className="w-24 h-24 text-emerald-600" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-2">
                      Phản hồi từ bạn
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                      {review.response}
                    </p>
                  </div>
                </div>
              )}

              {/* Reply Form */}
              {replyingTo === review.id ? (
                <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Để lại lời cảm ơn hoặc giải đáp thắc mắc..."
                    rows={4}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-3xl outline-none transition-all resize-none text-slate-700 dark:text-white"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => submitReply(review.id)}
                      className="px-8 py-3 bg-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                      Gửi phản hồi
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText("");
                      }}
                      className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 pt-6 mt-auto">
                  {!review.response && (
                    <button
                      onClick={() => setReplyingTo(review.id)}
                      className="flex items-center gap-2.5 px-6 py-3 bg-primary/10 text-primary rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all group/btn"
                    >
                      <Reply className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                      Phản hồi
                    </button>
                  )}
                  <button className="flex items-center gap-2.5 px-6 py-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-500/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                    <ThumbsUp className="w-4 h-4" />
                    Hữu ích
                  </button>
                  <button className="flex items-center gap-2.5 px-6 py-3 text-slate-400 hover:text-red-600 hover:bg-red-500/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                    <Flag className="w-4 h-4" />
                    Báo cáo
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
          <MessageSquare className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Chưa có đánh giá
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Đánh giá từ khách hàng sẽ xuất hiện ở đây
          </p>
        </div>
      )}
    </div>
  );
}
