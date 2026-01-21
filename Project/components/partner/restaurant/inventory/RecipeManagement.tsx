"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    UtensilsCrossed, 
    Plus,
    Edit,
    Trash2,
    Package,
    Calculator
} from 'lucide-react'

interface Recipe {
    id: string
    menuItemName: string
    menuItemId: string
    ingredients: {
        stockItemId: string
        stockItemName: string
        quantity: number
        unit: string
    }[]
    yield: number // Số phần ăn
    cost: number // Chi phí nguyên liệu
}

export function RecipeManagement() {
    const [recipes, setRecipes] = useState<Recipe[]>([
        {
            id: '1',
            menuItemName: 'Phở Bò Đặc Biệt',
            menuItemId: 'menu-1',
            ingredients: [
                { stockItemId: 'stock-1', stockItemName: 'Thịt bò', quantity: 0.2, unit: 'kg' },
                { stockItemId: 'stock-2', stockItemName: 'Rau thơm', quantity: 0.05, unit: 'kg' },
                { stockItemId: 'stock-3', stockItemName: 'Gia vị', quantity: 1, unit: 'gói' }
            ],
            yield: 1,
            cost: 55000
        }
    ])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Công thức Món ăn (BOM)
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Quản lý công thức và tự động trừ kho nguyên liệu khi bán món
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingRecipe(null)
                        setIsModalOpen(true)
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Thêm công thức
                </button>
            </div>

            {/* Recipes List */}
            <div className="space-y-4">
                {recipes.map((recipe, index) => (
                    <motion.div
                        key={recipe.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 rounded-xl bg-primary/10">
                                        <UtensilsCrossed className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            {recipe.menuItemName}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                                            <span>Cho {recipe.yield} phần ăn</span>
                                            <span>•</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                Chi phí: {recipe.cost.toLocaleString('vi-VN')} VNĐ
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="ml-12 space-y-2">
                                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                                        Nguyên liệu:
                                    </h4>
                                    {recipe.ingredients.map((ingredient, ingIndex) => (
                                        <div
                                            key={ingIndex}
                                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    {ingredient.stockItemName}
                                                </span>
                                            </div>
                                            <span className="text-slate-600 dark:text-slate-400">
                                                {ingredient.quantity} {ingredient.unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditingRecipe(recipe)
                                        setIsModalOpen(true)
                                    }}
                                    className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Bạn có chắc muốn xóa công thức này?')) {
                                            setRecipes(recipes.filter(r => r.id !== recipe.id))
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

            {/* Info Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                    <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                            Tự động trừ kho
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                            Hệ thống sẽ tự động trừ kho nguyên liệu dựa trên số lượng món ăn đã bán. 
                            Ví dụ: Khi bán 1 phần Phở Bò, hệ thống sẽ tự động trừ 0.2kg thịt bò, 0.05kg rau thơm và 1 gói gia vị.
                        </p>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <RecipeModal
                    recipe={editingRecipe}
                    onClose={() => setIsModalOpen(false)}
                    onSave={(recipe) => {
                        if (editingRecipe) {
                            setRecipes(recipes.map(r => r.id === recipe.id ? recipe : r))
                        } else {
                            setRecipes([...recipes, { ...recipe, id: Date.now().toString() }])
                        }
                        setIsModalOpen(false)
                    }}
                />
            )}
        </div>
    )
}

interface RecipeModalProps {
    recipe: Recipe | null
    onClose: () => void
    onSave: (recipe: Omit<Recipe, 'id'> & { id?: string }) => void
}

function RecipeModal({ recipe, onClose, onSave }: RecipeModalProps) {
    const [formData, setFormData] = useState({
        menuItemName: recipe?.menuItemName || '',
        menuItemId: recipe?.menuItemId || '',
        ingredients: recipe?.ingredients || [],
        yield: recipe?.yield || 1,
        cost: recipe?.cost || 0
    })

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    {recipe ? 'Chỉnh sửa Công thức' : 'Thêm Công thức mới'}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Tên món ăn
                        </label>
                        <input
                            type="text"
                            value={formData.menuItemName}
                            onChange={(e) => setFormData({ ...formData, menuItemName: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Số phần ăn
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.yield}
                            onChange={(e) => setFormData({ ...formData, yield: parseInt(e.target.value) || 1 })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Chi phí nguyên liệu (VNĐ)
                        </label>
                        <input
                            type="number"
                            value={formData.cost}
                            onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Nguyên liệu
                        </label>
                        <div className="space-y-2">
                            {formData.ingredients.map((ingredient, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={ingredient.stockItemName}
                                        placeholder="Tên nguyên liệu"
                                        className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={ingredient.quantity}
                                        placeholder="Số lượng"
                                        className="w-32 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <input
                                        type="text"
                                        value={ingredient.unit}
                                        placeholder="Đơn vị"
                                        className="w-24 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    setFormData({
                                        ...formData,
                                        ingredients: [...formData.ingredients, { stockItemId: '', stockItemName: '', quantity: 0, unit: '' }]
                                    })
                                }}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm nguyên liệu
                            </button>
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
                        onClick={() => onSave({ ...formData, id: recipe?.id })}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors"
                    >
                        Lưu
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
