/**
 * Hotel Details Component
 * Detailed view and management of a single hotel
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  MapPin,
  Star,
  Phone,
  Mail,
  Globe,
  Edit,
  Save,
  X,
  Upload,
  Check,
} from 'lucide-react';

export function HotelDetails() {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedHotel] = useState({
    id: '1',
    name: 'Grand Hotel Saigon',
    slug: 'grand-hotel-saigon',
    description:
      'A luxurious 5-star hotel located in the heart of Saigon, offering world-class amenities and services.',
    address: {
      street: '123 Nguyen Hue Boulevard',
      city: 'Ho Chi Minh City',
      state: 'Ho Chi Minh',
      country: 'Vietnam',
      postal_code: '700000',
    },
    star_rating: 5,
    phone: '+84 28 3829 2999',
    email: 'info@grandhotelsaigon.com',
    website: 'https://grandhotelsaigon.com',
    is_active: true,
    images: [],
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Parking'],
    policies: {
      check_in: '14:00',
      check_out: '12:00',
      cancellation_policy: 'Free cancellation up to 24 hours before check-in',
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Thông tin Chi tiết
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Xem và chỉnh sửa thông tin khách sạn
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Chỉnh sửa
          </button>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
              Hủy
            </button>
            <button
              onClick={() => {
                // Save changes
                setIsEditing(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Lưu thay đổi
            </button>
          </>
        )}
      </div>

      {/* Hotel Images */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Hình ảnh
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {selectedHotel.images.length === 0 ? (
            <div className="col-span-2 md:col-span-4 h-48 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Chưa có hình ảnh
              </p>
              {isEditing && (
                <button className="mt-3 px-4 py-2 bg-primary text-white rounded-lg text-sm">
                  Tải ảnh lên
                </button>
              )}
            </div>
          ) : (
            selectedHotel.images.map((img, idx) => (
              <div
                key={idx}
                className="relative h-32 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden"
              >
                <img
                  src={img}
                  alt={`Hotel image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Basic Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Thông tin cơ bản
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tên khách sạn
            </label>
            {isEditing ? (
              <input
                type="text"
                defaultValue={selectedHotel.name}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            ) : (
              <p className="text-slate-900 dark:text-white">
                {selectedHotel.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Slug (URL)
            </label>
            <p className="text-slate-900 dark:text-white">
              {selectedHotel.slug}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Xếp hạng sao
            </label>
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < (selectedHotel.star_rating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Trạng thái
            </label>
            <span
              className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                selectedHotel.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {selectedHotel.is_active ? 'Hoạt động' : 'Không hoạt động'}
            </span>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Mô tả
            </label>
            {isEditing ? (
              <textarea
                defaultValue={selectedHotel.description}
                rows={4}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            ) : (
              <p className="text-slate-900 dark:text-white">
                {selectedHotel.description}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Thông tin liên hệ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Số điện thoại
            </label>
            {isEditing ? (
              <input
                type="tel"
                defaultValue={selectedHotel.phone}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            ) : (
              <p className="text-slate-900 dark:text-white">
                {selectedHotel.phone}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                defaultValue={selectedHotel.email}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            ) : (
              <p className="text-slate-900 dark:text-white">
                {selectedHotel.email}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website
            </label>
            {isEditing ? (
              <input
                type="url"
                defaultValue={selectedHotel.website}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            ) : (
              <a
                href={selectedHotel.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {selectedHotel.website}
              </a>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Địa chỉ
            </label>
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  defaultValue={selectedHotel.address.street}
                  placeholder="Đường/Số nhà"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    defaultValue={selectedHotel.address.city}
                    placeholder="Thành phố"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    defaultValue={selectedHotel.address.postal_code}
                    placeholder="Mã bưu điện"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            ) : (
              <p className="text-slate-900 dark:text-white">
                {selectedHotel.address.street}, {selectedHotel.address.city},{' '}
                {selectedHotel.address.country}{' '}
                {selectedHotel.address.postal_code}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Amenities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Tiện nghi
        </h3>
        <div className="flex flex-wrap gap-2">
          {selectedHotel.amenities.map((amenity) => (
            <span
              key={amenity}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium"
            >
              <Check className="w-4 h-4" />
              {amenity}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Policies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Chính sách
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Check-in
            </label>
            <p className="text-slate-900 dark:text-white">
              {selectedHotel.policies.check_in}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Check-out
            </label>
            <p className="text-slate-900 dark:text-white">
              {selectedHotel.policies.check_out}
            </p>
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Chính sách hủy
            </label>
            <p className="text-slate-900 dark:text-white">
              {selectedHotel.policies.cancellation_policy}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
