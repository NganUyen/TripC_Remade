"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    Store, 
    MapPin, 
    Clock, 
    Edit, 
    Plus,
    Trash2,
    CheckCircle2,
    XCircle
} from 'lucide-react'

interface Outlet {
    id: string
    name: string
    address: string
    cuisineType: string
    openTime: string
    closeTime: string
    status: 'active' | 'inactive'
    image?: string
}

export function MyOutlets() {
    const [outlets, setOutlets] = useState<Outlet[]>([
        {
            id: '1',
            name: 'Madame Vo\'s Kitchen - Da Nang',
            address: '123 Le Loi Street, Da Nang',
            cuisineType: 'Vietnamese Fusion',
            openTime: '10:00',
            closeTime: '22:00',
            status: 'active',
            image: 'https://images.unsplash.com/photo-1514362545857-3bc165497db5?q=80&w=2670&auto=format&fit=crop'
        },
        {
            id: '2',
            name: 'Madame Vo\'s Kitchen - Ho Chi Minh',
            address: '456 Nguyen Hue Boulevard, HCMC',
            cuisineType: 'Vietnamese Fusion',
            openTime: '11:00',
            closeTime: '23:00',
            status: 'active'
        }
    ])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Quản lý Cơ sở
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Quản lý thông tin các cơ sở nhà hàng của bạn
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingOutlet(null)
                        setIsModalOpen(true)
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Thêm cơ sở mới
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {outlets.map((outlet, index) => (
                    <motion.div
                        key={outlet.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                        {outlet.image && (
                            <div className="h-48 overflow-hidden">
                                <img
                                    src={outlet.image}
                                    alt={outlet.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                        {outlet.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>{outlet.address}</span>
                                    </div>
                                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-3">
                                        {outlet.cuisineType}
                                    </span>
                                </div>
                                <div className={`p-2 rounded-lg ${
                                    outlet.status === 'active' 
                                        ? 'bg-green-100 dark:bg-green-900/20' 
                                        : 'bg-red-100 dark:bg-red-900/20'
                                }`}>
                                    {outlet.status === 'active' ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                                <Clock className="w-4 h-4" />
                                <span>{outlet.openTime} - {outlet.closeTime}</span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditingOutlet(outlet)
                                        setIsModalOpen(true)
                                    }}
                                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    Chỉnh sửa
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Bạn có chắc muốn xóa cơ sở này?')) {
                                            setOutlets(outlets.filter(o => o.id !== outlet.id))
                                        }
                                    }}
                                    className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <OutletModal
                    outlet={editingOutlet}
                    onClose={() => setIsModalOpen(false)}
                    onSave={(outlet) => {
                        if (editingOutlet) {
                            setOutlets(outlets.map(o => o.id === outlet.id ? outlet : o))
                        } else {
                            setOutlets([...outlets, { ...outlet, id: Date.now().toString() }])
                        }
                        setIsModalOpen(false)
                    }}
                />
            )}
        </div>
    )
}

interface OutletModalProps {
    outlet: Outlet | null
    onClose: () => void
    onSave: (outlet: Omit<Outlet, 'id'> & { id?: string }) => void
}

function OutletModal({ outlet, onClose, onSave }: OutletModalProps) {
    const [formData, setFormData] = useState({
        name: outlet?.name || '',
        address: outlet?.address || '',
        cuisineType: outlet?.cuisineType || '',
        openTime: outlet?.openTime || '10:00',
        closeTime: outlet?.closeTime || '22:00',
        status: outlet?.status || 'active' as const
    })

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    {outlet ? 'Chỉnh sửa Cơ sở' : 'Thêm Cơ sở mới'}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Tên cơ sở
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Địa chỉ
                        </label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Loại hình ẩm thực
                        </label>
                        <input
                            type="text"
                            value={formData.cuisineType}
                            onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Giờ mở cửa
                            </label>
                            <input
                                type="time"
                                value={formData.openTime}
                                onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Giờ đóng cửa
                            </label>
                            <input
                                type="time"
                                value={formData.closeTime}
                                onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={() => onSave({ ...formData, id: outlet?.id })}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors"
                    >
                        Lưu
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
