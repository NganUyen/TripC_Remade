"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    UtensilsCrossed, 
    Plus, 
    Edit, 
    Trash2,
    Image as ImageIcon,
    Tag,
    DollarSign,
    AlertCircle
} from 'lucide-react'

interface MenuItem {
    id: string
    name: string
    category: string
    description: string
    price: number
    image?: string
    allergens?: string[]
    spiceLevel?: number
    isAvailable: boolean
    toppings?: string[]
}

export function MenuManagement() {
    const [activeTab, setActiveTab] = useState('items')
    const [menuItems, setMenuItems] = useState<MenuItem[]>([
        {
            id: '1',
            name: 'Phở Bò Đặc Biệt',
            category: 'Main Course',
            description: 'Phở bò truyền thống với thịt bò tái, gân, bắp',
            price: 120000,
            image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=2680&auto=format&fit=crop',
            allergens: ['Gluten'],
            spiceLevel: 1,
            isAvailable: true
        },
        {
            id: '2',
            name: 'Gỏi Cuốn Tôm Thịt',
            category: 'Appetizers',
            description: 'Gỏi cuốn tươi với tôm, thịt, rau sống',
            price: 85000,
            isAvailable: true
        }
    ])

    const categories = ['Appetizers', 'Main Course', 'Drinks', 'Desserts', 'Combo/Set']

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null)

    const filteredItems = activeTab === 'items' 
        ? menuItems 
        : menuItems.filter(item => item.category === activeTab)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Quản lý Thực đơn
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Quản lý danh mục món ăn, giá cả và thông tin chi tiết
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
                    Thêm món mới
                </button>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setActiveTab('items')}
                    className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                        activeTab === 'items'
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                >
                    Tất cả
                </button>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveTab(category)}
                        className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                            activeTab === category
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                        {item.image ? (
                            <div className="h-48 overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-slate-400" />
                            </div>
                        )}

                        <div className="p-6">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                        {item.name}
                                    </h3>
                                    <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold mb-2">
                                        {item.category}
                                    </span>
                                </div>
                                {!item.isAvailable && (
                                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold">
                                        Hết món
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                                {item.description}
                            </p>

                            {item.allergens && item.allergens.length > 0 && (
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                    <span className="text-xs text-amber-600 dark:text-amber-400">
                                        Dị ứng: {item.allergens.join(', ')}
                                    </span>
                                </div>
                            )}

                            {item.spiceLevel !== undefined && (
                                <div className="flex items-center gap-1 mb-3">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Độ cay:</span>
                                    {[...Array(5)].map((_, i) => (
                                        <span
                                            key={i}
                                            className={`w-2 h-2 rounded-full ${
                                                i < item.spiceLevel!
                                                    ? 'bg-red-500'
                                                    : 'bg-slate-200 dark:bg-slate-700'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {item.price.toLocaleString('vi-VN')}
                                    </span>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">VNĐ</span>
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
                                            if (confirm('Bạn có chắc muốn xóa món này?')) {
                                                setMenuItems(menuItems.filter(i => i.id !== item.id))
                                            }
                                        }}
                                        className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <MenuItemModal
                    item={editingItem}
                    categories={categories}
                    onClose={() => setIsModalOpen(false)}
                    onSave={(item) => {
                        if (editingItem) {
                            setMenuItems(menuItems.map(i => i.id === item.id ? item : i))
                        } else {
                            setMenuItems([...menuItems, { ...item, id: Date.now().toString() }])
                        }
                        setIsModalOpen(false)
                    }}
                />
            )}
        </div>
    )
}

interface MenuItemModalProps {
    item: MenuItem | null
    categories: string[]
    onClose: () => void
    onSave: (item: Omit<MenuItem, 'id'> & { id?: string }) => void
}

function MenuItemModal({ item, categories, onClose, onSave }: MenuItemModalProps) {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        category: item?.category || categories[0],
        description: item?.description || '',
        price: item?.price || 0,
        image: item?.image || '',
        allergens: item?.allergens || [],
        spiceLevel: item?.spiceLevel || 0,
        isAvailable: item?.isAvailable ?? true,
        toppings: item?.toppings || []
    })

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    {item ? 'Chỉnh sửa Món ăn' : 'Thêm Món ăn mới'}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Tên món
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
                            Mô tả
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Giá (VNĐ)
                        </label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            URL Hình ảnh
                        </label>
                        <input
                            type="url"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Độ cay (0-5)
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="5"
                            value={formData.spiceLevel}
                            onChange={(e) => setFormData({ ...formData, spiceLevel: parseInt(e.target.value) })}
                            className="w-full"
                        />
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Mức độ: {formData.spiceLevel}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isAvailable"
                            checked={formData.isAvailable}
                            onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                            className="w-4 h-4 text-primary rounded focus:ring-primary"
                        />
                        <label htmlFor="isAvailable" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Món đang có sẵn
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
