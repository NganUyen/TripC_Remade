'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BedDouble,
  Plus,
  Edit,
  Trash2,
  Users,
  Ruler,
  Wifi,
  Tv,
  Coffee,
  Wind,
  X,
  Save,
  Image as ImageIcon
} from 'lucide-react';

interface RoomType {
  id: string;
  name: string;
  capacity: number;
  size: number; // in sqm
  beds: string;
  basePrice: number;
  amenities: string[];
  description: string;
  images: string[];
}

export function RoomTypes() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([
    {
      id: '1',
      name: 'Deluxe Room',
      capacity: 2,
      size: 30,
      beds: '1 King Bed',
      basePrice: 1500000,
      amenities: ['wifi', 'ac', 'tv', 'minibar'],
      description: 'Phòng rộng rãi với view đẹp',
      images: []
    }
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);
  const [formData, setFormData] = useState<Partial<RoomType>>({
    amenities: []
  });

  const amenityOptions = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'ac', label: 'Điều hòa', icon: Wind },
    { id: 'tv', label: 'TV', icon: Tv },
    { id: 'minibar', label: 'Minibar', icon: Coffee }
  ];

  const handleSave = () => {
    if (editingRoom) {
      setRoomTypes(prev => prev.map(r => r.id === editingRoom.id ? { ...editingRoom, ...formData } : r));
    } else {
      const newRoom: RoomType = {
        id: Date.now().toString(),
        name: formData.name || '',
        capacity: formData.capacity || 2,
        size: formData.size || 20,
        beds: formData.beds || '1 King Bed',
        basePrice: formData.basePrice || 1000000,
        amenities: formData.amenities || [],
        description: formData.description || '',
        images: []
      };
      setRoomTypes(prev => [...prev, newRoom]);
    }
    setShowModal(false);
    setEditingRoom(null);
    setFormData({ amenities: [] });
  };

  const handleEdit = (room: RoomType) => {
    setEditingRoom(room);
    setFormData(room);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa loại phòng này?')) {
      setRoomTypes(prev => prev.filter(r => r.id !== id));
    }
  };

  const toggleAmenity = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities?.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...(prev.amenities || []), amenityId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Loại Phòng
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Quản lý các loại phòng và thông tin
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setEditingRoom(null); setFormData({ amenities: [] }); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm Loại Phòng
        </button>
      </div>

      {/* Room Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roomTypes.map((room, index) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <BedDouble className="w-20 h-20 text-primary" />
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    {room.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {room.beds}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(room)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Users className="w-4 h-4" />
                  <span>{room.capacity} khách</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Ruler className="w-4 h-4" />
                  <span>{room.size} m²</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {room.amenities.map(amenityId => {
                  const amenity = amenityOptions.find(a => a.id === amenityId);
                  if (!amenity) return null;
                  const Icon = amenity.icon;
                  return (
                    <div key={amenityId} className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
                      <Icon className="w-3 h-3" />
                      <span>{amenity.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-lg font-bold text-primary">
                  {room.basePrice.toLocaleString('vi-VN')} VNĐ
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Giá cơ bản/đêm</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingRoom ? 'Chỉnh sửa' : 'Thêm'} Loại Phòng
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tên loại phòng</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="VD: Deluxe Room"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Sức chứa</label>
                    <input
                      type="number"
                      value={formData.capacity || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Diện tích (m²)</label>
                    <input
                      type="number"
                      value={formData.size || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Loại giường</label>
                  <input
                    type="text"
                    value={formData.beds || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, beds: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="VD: 1 King Bed hoặc 2 Single Beds"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Giá cơ bản (VNĐ/đêm)</label>
                  <input
                    type="number"
                    value={formData.basePrice || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tiện nghi</label>
                  <div className="grid grid-cols-2 gap-2">
                    {amenityOptions.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleAmenity(id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
                          formData.amenities?.includes(id)
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mô tả</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="Mô tả chi tiết về loại phòng..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Lưu
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}