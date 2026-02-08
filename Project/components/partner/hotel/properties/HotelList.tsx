/**
 * Hotel List Management Component
 * Displays and manages partner's hotels
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  MapPin,
  Star,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
} from 'lucide-react';

interface Hotel {
  id: string;
  is_active: boolean;
  hotel: {
    id: string;
    name: string;
    slug: string;
    address: any;
    star_rating: number | null;
    images: string[];
    created_at: string;
  };
}

interface HotelListProps {
  partnerId: string;
}

export function HotelList({ partnerId }: HotelListProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHotels();
  }, [partnerId]);

  async function fetchHotels() {
    try {
      setLoading(true);
      const response = await fetch('/api/partner/hotel/hotels', {
        headers: {
          'x-partner-id': partnerId,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hotels');
      }

      const result = await response.json();
      if (result.success) {
        setHotels(result.data);
      } else {
        throw new Error(result.error?.message || 'Unknown error');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredHotels = hotels.filter((hotel) =>
    hotel.hotel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Danh sách Khách sạn
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Quản lý thông tin các khách sạn của bạn
          </p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-32 h-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Danh sách Khách sạn
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Quản lý thông tin các khách sạn của bạn
          </p>
        </div>
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          <button
            onClick={fetchHotels}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Danh sách Khách sạn
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Quản lý thông tin các khách sạn của bạn
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-4 flex-1 w-full">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm khách sạn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
            <Filter className="w-5 h-5" />
            Lọc
          </button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-5 h-5" />
          Thêm khách sạn
        </button>
      </div>

      {/* Hotel List */}
      {filteredHotels.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <Building2 className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Chưa có khách sạn
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {searchQuery
              ? 'Không tìm thấy kết quả phù hợp'
              : 'Bắt đầu bằng cách thêm khách sạn đầu tiên của bạn'}
          </p>
          {!searchQuery && (
            <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90">
              Thêm khách sạn đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredHotels.map((item, index) => (
            <HotelCard key={item.hotel.id} hotel={item.hotel} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

interface HotelCardProps {
  hotel: Hotel['hotel'];
  index: number;
}

function HotelCard({ hotel, index }: HotelCardProps) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = hotel.images?.[0] || '/placeholder-hotel.jpg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex gap-4">
        {/* Hotel Image */}
        <div className="relative w-32 h-24 flex-shrink-0">
          {!imageError ? (
            <img
              src={imageUrl}
              alt={hotel.name}
              className="w-full h-full object-cover rounded-lg"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
              <Building2 className="w-8 h-8 text-slate-400" />
            </div>
          )}
          {/* Status Badge */}
          <div
            className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold ${
              item.is_active
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {item.is_active ? 'Hoạt động' : 'Không hoạt động'}
          </div>
        </div>

        {/* Hotel Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 truncate">
                {hotel.name}
              </h3>
              {hotel.star_rating && (
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(hotel.star_rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              )}
              {hotel.address && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">
                    {hotel.address.city}, {hotel.address.country}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle edit
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle delete
                }}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>

          {/* Meta Info */}
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span>ID: {hotel.slug}</span>
            <span>
              Tạo: {new Date(hotel.created_at).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
