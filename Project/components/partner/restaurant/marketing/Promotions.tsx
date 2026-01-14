"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    Tag, 
    Plus,
    Edit,
    Trash2,
    Calendar,
    Clock,
    Percent,
    Gift,
    CheckCircle2,
    XCircle
} from 'lucide-react'

interface Promotion {
    id: string
    name: string
    type: 'promo-code' | 'e-voucher' | 'item-discount' | 'flash-sale'
    code?: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
    minOrderValue?: number
    maxDiscount?: number
    items?: string[]
    startDate: string
    endDate: string
    usageLimit?: number
    usedCount: number
    isActive: boolean
}

export function Promotions() {
    const [promotions, setPromotions] = useState<Promotion[]>([
        {
            id: '1',
            name: 'Giảm giá cuối tuần',
            type: 'promo-code',
            code: 'WEEKEND20',
            discountType: 'percentage',
            discountValue: 20,
            minOrderValue: 200000,
            startDate: '2024-05-20',
            endDate: '2024-05-26',
            usageLimit: 100,
            usedCount: 45,
            isActive: true
        },
        {
            id: '2',
            name: 'E-Voucher Tết',
            type: 'e-voucher',
            discountType: 'fixed',
            discountValue: 100000,
            minOrderValue: 500000,
            startDate: '2024-01-01',
            endDate: '2024-02-15',
            usageLimit: 50,
            usedCount: 12,
            isActive: true
        },
        {
            id: '3',
            name: 'Giảm giá món đồ uống',
            type: 'item-discount',
            discountType: 'percentage',
            discountValue: 15,
            items: ['Cà Phê Đen', 'Trà Đá', 'Nước Ngọt'],
            startDate: '2024-05-01',
            endDate: '2024-05-31',
            isActive: true
        }
    ])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)

    const getTypeLabel = (type: Promotion['type']) => {
        switch (type) {
            case 'promo-code':
                return 'Mã giảm giá'
            case 'e-voucher':
                return 'E-Voucher'
            case 'item-discount':
                return 'Giảm giá theo món'
            case 'flash-sale':
                return 'Flash Sale'
            default:
                return type
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Khuyến mãi
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Tạo mã giảm giá, E-Vouchers và các chiến dịch giảm giá
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingPromotion(null)
                        setIsModalOpen(true)
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Tạo khuyến mãi
                </button>
            </div>

            {/* Promotions List */}
            <div className="space-y-4">
                {promotions.map((promo, index) => (
                    <motion.div
                        key={promo.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {promo.name}
                                    </h3>
                                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold">
                                        {getTypeLabel(promo.type)}
                                    </span>
                                    {promo.isActive ? (
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-xs font-semibold flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Đang hoạt động
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold flex items-center gap-1">
                                            <XCircle className="w-3 h-3" />
                                            Tạm dừng
                                        </span>
                                    )}
                                </div>

                                {promo.code && (
                                    <div className="mb-3">
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-mono font-semibold">
                                            {promo.code}
                                        </span>
                                    </div>
                                )}

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Percent className="w-4 h-4" />
                                        <span>
                                            Giảm {promo.discountValue}
                                            {promo.discountType === 'percentage' ? '%' : ' VNĐ'}
                                        </span>
                                    </div>
                                    {promo.minOrderValue && (
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <Gift className="w-4 h-4" />
                                            <span>Đơn tối thiểu: {promo.minOrderValue.toLocaleString('vi-VN')} VNĐ</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            {new Date(promo.startDate).toLocaleDateString('vi-VN')} - {new Date(promo.endDate).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    {promo.items && promo.items.length > 0 && (
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <Tag className="w-4 h-4" />
                                            <span>{promo.items.join(', ')}</span>
                                        </div>
                                    )}
                                    {promo.usageLimit && (
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <span>
                                                Đã dùng: {promo.usedCount}/{promo.usageLimit}
                                            </span>
                                            <div className="flex-1 max-w-xs bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full"
                                                    style={{ width: `${(promo.usedCount / promo.usageLimit) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditingPromotion(promo)
                                        setIsModalOpen(true)
                                    }}
                                    className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Bạn có chắc muốn xóa khuyến mãi này?')) {
                                            setPromotions(promotions.filter(p => p.id !== promo.id))
                                        }
                                    }}
                                    className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
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
                <PromotionModal
                    promotion={editingPromotion}
                    onClose={() => setIsModalOpen(false)}
                    onSave={(promo) => {
                        if (editingPromotion) {
                            setPromotions(promotions.map(p => p.id === promo.id ? promo : p))
                        } else {
                            setPromotions([...promotions, { ...promo, id: Date.now().toString(), usedCount: 0 }])
                        }
                        setIsModalOpen(false)
                    }}
                />
            )}
        </div>
    )
}

interface PromotionModalProps {
    promotion: Promotion | null
    onClose: () => void
    onSave: (promotion: Omit<Promotion, 'id'> & { id?: string }) => void
}

function PromotionModal({ promotion, onClose, onSave }: PromotionModalProps) {
    const [formData, setFormData] = useState({
        name: promotion?.name || '',
        type: promotion?.type || 'promo-code' as Promotion['type'],
        code: promotion?.code || '',
        discountType: promotion?.discountType || 'percentage' as const,
        discountValue: promotion?.discountValue || 0,
        minOrderValue: promotion?.minOrderValue || 0,
        maxDiscount: promotion?.maxDiscount || 0,
        items: promotion?.items || [],
        startDate: promotion?.startDate || new Date().toISOString().split('T')[0],
        endDate: promotion?.endDate || new Date().toISOString().split('T')[0],
        usageLimit: promotion?.usageLimit || 0,
        isActive: promotion?.isActive ?? true
    })

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    {promotion ? 'Chỉnh sửa Khuyến mãi' : 'Tạo Khuyến mãi mới'}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Tên khuyến mãi
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
                            Loại khuyến mãi
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as Promotion['type'] })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="promo-code">Mã giảm giá</option>
                            <option value="e-voucher">E-Voucher</option>
                            <option value="item-discount">Giảm giá theo món</option>
                            <option value="flash-sale">Flash Sale</option>
                        </select>
                    </div>

                    {(formData.type === 'promo-code' || formData.type === 'e-voucher') && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Mã khuyến mãi
                            </label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                                placeholder="WEEKEND20"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Loại giảm giá
                            </label>
                            <select
                                value={formData.discountType}
                                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="percentage">Phần trăm (%)</option>
                                <option value="fixed">Số tiền cố định (VNĐ)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Giá trị giảm
                            </label>
                            <input
                                type="number"
                                value={formData.discountValue}
                                onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Đơn tối thiểu (VNĐ)
                            </label>
                            <input
                                type="number"
                                value={formData.minOrderValue}
                                onChange={(e) => setFormData({ ...formData, minOrderValue: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Giảm tối đa (VNĐ)
                            </label>
                            <input
                                type="number"
                                value={formData.maxDiscount}
                                onChange={(e) => setFormData({ ...formData, maxDiscount: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Ngày bắt đầu
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Ngày kết thúc
                            </label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Giới hạn sử dụng
                        </label>
                        <input
                            type="number"
                            value={formData.usageLimit}
                            onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="0 = không giới hạn"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Kích hoạt ngay
                        </label>
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
                        onClick={() => onSave({ ...formData, id: promotion?.id })}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors"
                    >
                        Lưu
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
