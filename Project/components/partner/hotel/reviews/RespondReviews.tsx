'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Star } from 'lucide-react';

export function RespondReviews() {
  const [response, setResponse] = useState('');
  const pendingReviews = [
    {
      id: '1',
      guestName: 'Lê Văn C',
      rating: 3,
      comment: 'Phòng ổn nhưng dịch vụ cần cải thiện',
      date: '2025-02-08'
    }
  ];

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
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-slate-900 dark:text-white">{review.guestName}</h3>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-4">{review.comment}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phản hồi của bạn</label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Nhập phản hồi..."
            />
            <button className="mt-3 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors">
              <Send className="w-4 h-4" />
              Gửi
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
