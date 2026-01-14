"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    Package, 
    Plus,
    Edit,
    Trash2,
    AlertTriangle,
    TrendingDown,
    TrendingUp,
    Minus
} from 'lucide-react'

interface StockItem {
    id: string
    name: string
    category: string
    unit: string
    currentStock: number
    minStock: number
    maxStock: number
    unitPrice: number
    supplier?: string
    lastRestocked?: string
    status: 'in-stock' | 'low-stock' | 'out-of-stock'
}

export function StockControl() {
    const [stockItems, setStockItems] = useState<StockItem[]>([
        {
            id: '1',
            name: 'Thịt bò',
            category: 'Thịt',
            unit: 'kg',
            currentStock: 15,
            minStock: 20,
            maxStock: 100,
            unitPrice: 250000,
            supplier: 'Nhà cung cấp A',
            lastRestocked: '2024-05-18',
            status: 'low-stock'
        },
        {
            id: '2',
            name: 'Rau thơm',
            category: 'Rau củ',
            unit: 'kg',
            currentStock: 5,
            minStock: 10,
            maxStock: 50,
            unitPrice: 50000,
            supplier: 'Nhà cung cấp B',
            lastRestocked: '2024-05-19',
            status: 'low-stock'
        },
        {
            id: '3',
            name: 'Gia vị',
            category: 'Gia vị',
            unit: 'gói',
            currentStock: 50,
            minStock: 30,
            maxStock: 200,
            unitPrice: 15000,
            status: 'in-stock'
        }
    ])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<StockItem | null>(null)
    const [filterCategory, setFilterCategory] = useState<string>('all')
    const [filterStatus, setFilterStatus] = useState<'all' | StockItem['status']>('all')

    const categories = ['Thịt', 'Rau củ', 'Gia vị', 'Đồ uống', 'Khác']
    
    const filteredItems = stockItems.filter(item => {
        const matchesCategory = filterCategory === 'all' || item.category === filterCategory
        const matchesStatus = filterStatus === 'all' || item.status === filterStatus
        return matchesCategory && matchesStatus
    })

    const getStatusColor = (status: StockItem['status']) => {
        switch (status) {
            case 'in-stock':
                return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            case 'low-stock':
                return 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
            case 'out-of-stock':
                return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            default:
                return 'bg-slate-100 dark:bg-slate-800'
        }
    }

    const getStatusLabel = (status: StockItem['status']) => {
        switch (status) {
            case 'in-stock':
                return 'Đủ hàng'
            case 'low-stock':
                return 'Sắp hết'
            case 'out-of-stock':
                return 'Hết hàng'
            default:
                return status
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Quản lý Nguyên liệu
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Theo dõi tồn kho nguyên liệu thô và cảnh báo khi sắp hết
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingItem(null)
                        setIsModalOpen(true)
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Thêm nguyên liệu
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Danh mục
                        </label>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="all">Tất cả</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Trạng thái
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="all">Tất cả</option>
                            <option value="in-stock">Đủ hàng</option>
                            <option value="low-stock">Sắp hết</option>
                            <option value="out-of-stock">Hết hàng</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stock Items List */}
            <div className="space-y-4">
                {filteredItems.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {item.name}
                                    </h3>
                                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold">
                                        {item.category}
                                    </span>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(item.status)}`}>
                                        {getStatusLabel(item.status)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500 dark:text-slate-400">Tồn kho:</span>
                                        <div className="font-semibold text-slate-900 dark:text-white">
                                            {item.currentStock} {item.unit}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 dark:text-slate-400">Tối thiểu:</span>
                                        <div className="font-semibold text-slate-900 dark:text-white">
                                            {item.minStock} {item.unit}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 dark:text-slate-400">Tối đa:</span>
                                        <div className="font-semibold text-slate-900 dark:text-white">
                                            {item.maxStock} {item.unit}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 dark:text-slate-400">Đơn giá:</span>
                                        <div className="font-semibold text-slate-900 dark:text-white">
                                            {item.unitPrice.toLocaleString('vi-VN')} VNĐ/{item.unit}
                                        </div>
                                    </div>
                                </div>

                                {item.supplier && (
                                    <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                                        Nhà cung cấp: {item.supplier}
                                    </div>
                                )}

                                {item.status === 'low-stock' && (
                                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                        <span className="text-sm text-amber-700 dark:text-amber-300">
                                            Cảnh báo: Tồn kho sắp hết! Vui lòng nhập hàng.
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditingItem(item)
                                        setIsModalOpen(true)
                                    }}
                                    className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Bạn có chắc muốn xóa nguyên liệu này?')) {
                                            setStockItems(stockItems.filter(i => i.id !== item.id))
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
                <StockItemModal
                    item={editingItem}
                    categories={categories}
                    onClose={() => setIsModalOpen(false)}
                    onSave={(item) => {
                        // Determine status based on stock levels
                        let status: StockItem['status'] = 'in-stock'
                        if (item.currentStock === 0) {
                            status = 'out-of-stock'
                        } else if (item.currentStock < item.minStock) {
                            status = 'low-stock'
                        }

                        const updatedItem = { ...item, status }

                        if (editingItem) {
                            setStockItems(stockItems.map(i => i.id === updatedItem.id ? updatedItem : i))
                        } else {
                            setStockItems([...stockItems, { ...updatedItem, id: Date.now().toString() }])
                        }
                        setIsModalOpen(false)
                    }}
                />
            )}
        </div>
    )
}

interface StockItemModalProps {
    item: StockItem | null
    categories: string[]
    onClose: () => void
    onSave: (item: Omit<StockItem, 'id' | 'status'> & { id?: string }) => void
}

function StockItemModal({ item, categories, onClose, onSave }: StockItemModalProps) {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        category: item?.category || categories[0],
        unit: item?.unit || 'kg',
        currentStock: item?.currentStock || 0,
        minStock: item?.minStock || 0,
        maxStock: item?.maxStock || 0,
        unitPrice: item?.unitPrice || 0,
        supplier: item?.supplier || ''
    })

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    {item ? 'Chỉnh sửa Nguyên liệu' : 'Thêm Nguyên liệu mới'}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Tên nguyên liệu
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Danh mục
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Đơn vị
                            </label>
                            <input
                                type="text"
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="kg, lít, gói..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Tồn kho hiện tại
                            </label>
                            <input
                                type="number"
                                value={formData.currentStock}
                                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Tối thiểu
                            </label>
                            <input
                                type="number"
                                value={formData.minStock}
                                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Tối đa
                            </label>
                            <input
                                type="number"
                                value={formData.maxStock}
                                onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Đơn giá (VNĐ)
                        </label>
                        <input
                            type="number"
                            value={formData.unitPrice}
                            onChange={(e) => setFormData({ ...formData, unitPrice: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Nhà cung cấp (tùy chọn)
                        </label>
                        <input
                            type="text"
                            value={formData.supplier}
                            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
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
                        onClick={() => onSave({ ...formData, id: item?.id })}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors"
                    >
                        Lưu
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
