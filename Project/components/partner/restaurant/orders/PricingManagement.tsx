"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    DollarSign, 
    Clock,
    Calendar,
    Plus,
    Edit,
    Trash2,
    Tag
} from 'lucide-react'

interface PriceRule {
    id: string
    name: string
    type: 'happy-hour' | 'holiday' | 'time-based' | 'item-based'
    startTime?: string
    endTime?: string
    date?: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
    items?: string[]
    isActive: boolean
}

export function PricingManagement() {
    const [priceRules, setPriceRules] = useState<PriceRule[]>([
        {
            id: '1',
            name: 'Happy Hour - Buổi tối',
            type: 'happy-hour',
            startTime: '17:00',
            endTime: '19:00',
            discountType: 'percentage',
            discountValue: 20,
            isActive: true
        },
        {
            id: '2',
            name: 'Giảm giá Tết',
            type: 'holiday',
            date: '2024-02-10',
            discountType: 'percentage',
            discountValue: 15,
            isActive: true
        },
        {
            id: '3',
            name: 'Giảm giá món đồ uống',
            type: 'item-based',
            discountType: 'fixed',
            discountValue: 10000,
            items: ['Cà Phê Đen', 'Trà Đá'],
            isActive: false
        }
    ])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRule, setEditingRule] = useState<PriceRule | null>(null)

    const getTypeLabel = (type: PriceRule['type']) => {
        switch (type) {
            case 'happy-hour':
                return 'Happy Hour'
            case 'holiday':
                return 'Ngày lễ'
            case 'time-based':
                return 'Theo giờ'
            case 'item-based':
                return 'Theo món'
            default:
                return type
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Kiểm soát Giá
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Thiết lập giá theo khung giờ, ngày lễ và phí dịch vụ
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingRule(null)
                        setIsModalOpen(true)
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Thêm quy tắc giá
                </button>
            </div>

            {/* Price Rules List */}
            <div className="space-y-4">
                {priceRules.map((rule, index) => (
                    <motion.div
                        key={rule.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {rule.name}
                                    </h3>
                                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold">
                                        {getTypeLabel(rule.type)}
                                    </span>
                                    {rule.isActive ? (
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-xs font-semibold">
                                            Đang hoạt động
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold">
                                            Tạm dừng
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    {rule.startTime && rule.endTime && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span>{rule.startTime} - {rule.endTime}</span>
                                        </div>
                                    )}
                                    {rule.date && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>{rule.date}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        <span>
                                            Giảm {rule.discountValue}
                                            {rule.discountType === 'percentage' ? '%' : ' VNĐ'}
                                        </span>
                                    </div>
                                    {rule.items && rule.items.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4" />
                                            <span>{rule.items.join(', ')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditingRule(rule)
                                        setIsModalOpen(true)
                                    }}
                                    className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Bạn có chắc muốn xóa quy tắc này?')) {
                                            setPriceRules(priceRules.filter(r => r.id !== rule.id))
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

            {/* VAT & Service Fee Settings */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    Cài đặt Thuế & Phí dịch vụ
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Thuế VAT (%)
                        </label>
                        <input
                            type="number"
                            defaultValue={10}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Phí dịch vụ (%)
                        </label>
                        <input
                            type="number"
                            defaultValue={5}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors">
                    Lưu cài đặt
                </button>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <PriceRuleModal
                    rule={editingRule}
                    onClose={() => setIsModalOpen(false)}
                    onSave={(rule) => {
                        if (editingRule) {
                            setPriceRules(priceRules.map(r => r.id === rule.id ? rule : r))
                        } else {
                            setPriceRules([...priceRules, { ...rule, id: Date.now().toString() }])
                        }
                        setIsModalOpen(false)
                    }}
                />
            )}
        </div>
    )
}

interface PriceRuleModalProps {
    rule: PriceRule | null
    onClose: () => void
    onSave: (rule: Omit<PriceRule, 'id'> & { id?: string }) => void
}

function PriceRuleModal({ rule, onClose, onSave }: PriceRuleModalProps) {
    const [formData, setFormData] = useState({
        name: rule?.name || '',
        type: rule?.type || 'happy-hour' as PriceRule['type'],
        startTime: rule?.startTime || '',
        endTime: rule?.endTime || '',
        date: rule?.date || '',
        discountType: rule?.discountType || 'percentage' as const,
        discountValue: rule?.discountValue || 0,
        items: rule?.items || [],
        isActive: rule?.isActive ?? true
    })

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    {rule ? 'Chỉnh sửa Quy tắc Giá' : 'Thêm Quy tắc Giá mới'}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Tên quy tắc
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
                            Loại quy tắc
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as PriceRule['type'] })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="happy-hour">Happy Hour</option>
                            <option value="holiday">Ngày lễ</option>
                            <option value="time-based">Theo giờ</option>
                            <option value="item-based">Theo món</option>
                        </select>
                    </div>

                    {(formData.type === 'happy-hour' || formData.type === 'time-based') && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Giờ bắt đầu
                                </label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Giờ kết thúc
                                </label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {formData.type === 'holiday' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Ngày
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        onClick={() => onSave({ ...formData, id: rule?.id })}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors"
                    >
                        Lưu
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
