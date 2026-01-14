"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    Gift, 
    Target,
    Trophy,
    Star,
    Plus,
    Edit,
    Trash2,
    RotateCcw,
    MessageSquare
} from 'lucide-react'

interface Quest {
    id: string
    name: string
    type: 'foodie-quest' | 'review-rewards'
    description: string
    requirement: string
    reward: string
    isActive: boolean
}

interface WheelPrize {
    id: string
    name: string
    probability: number
    type: 'voucher' | 'points' | 'item'
    value: number
    color: string
}

export function Gamification() {
    const [activeTab, setActiveTab] = useState<'quests' | 'wheel' | 'reviews'>('quests')

    const [quests, setQuests] = useState<Quest[]>([
        {
            id: '1',
            name: 'Foodie Explorer',
            type: 'foodie-quest',
            description: 'Thử 5 món mới trong tháng',
            requirement: '5 món',
            reward: 'Huy hiệu Foodie + Voucher 100k',
            isActive: true
        },
        {
            id: '2',
            name: 'Loyal Customer',
            type: 'foodie-quest',
            description: 'Đến nhà hàng 10 lần',
            requirement: '10 lần',
            reward: 'Huy hiệu Loyal + Tặng món tráng miệng',
            isActive: true
        },
        {
            id: '3',
            name: 'Review Champion',
            type: 'review-rewards',
            description: 'Để lại đánh giá kèm hình ảnh',
            requirement: '1 đánh giá',
            reward: '50 điểm thưởng',
            isActive: true
        }
    ])

    const [wheelPrizes, setWheelPrizes] = useState<WheelPrize[]>([
        { id: '1', name: 'Voucher 50k', probability: 30, type: 'voucher', value: 50000, color: '#FF6B6B' },
        { id: '2', name: 'Voucher 100k', probability: 15, type: 'voucher', value: 100000, color: '#4ECDC4' },
        { id: '3', name: '100 điểm', probability: 25, type: 'points', value: 100, color: '#FFE66D' },
        { id: '4', name: 'Món tráng miệng', probability: 20, type: 'item', value: 0, color: '#95E1D3' },
        { id: '5', name: 'Chúc may mắn lần sau', probability: 10, type: 'voucher', value: 0, color: '#F38181' }
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Gamification
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Tăng tương tác khách hàng thông qua các trò chơi và thử thách
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('quests')}
                    className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                        activeTab === 'quests'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 dark:text-slate-400'
                    }`}
                >
                    Foodie Quest
                </button>
                <button
                    onClick={() => setActiveTab('wheel')}
                    className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                        activeTab === 'wheel'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 dark:text-slate-400'
                    }`}
                >
                    Lucky Dining Wheel
                </button>
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                        activeTab === 'reviews'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 dark:text-slate-400'
                    }`}
                >
                    Review Rewards
                </button>
            </div>

            {/* Foodie Quest */}
            {activeTab === 'quests' && (
                <div className="space-y-4">
                    {quests.map((quest, index) => (
                        <motion.div
                            key={quest.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-3 rounded-xl bg-primary/10">
                                            <Target className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                {quest.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {quest.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="ml-12 space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                Yêu cầu:
                                            </span>
                                            <span className="text-slate-600 dark:text-slate-400">
                                                {quest.requirement}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Gift className="w-4 h-4 text-primary" />
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                Phần thưởng:
                                            </span>
                                            <span className="text-slate-600 dark:text-slate-400">
                                                {quest.reward}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {quest.isActive ? (
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-xs font-semibold">
                                            Đang hoạt động
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold">
                                            Tạm dừng
                                        </span>
                                    )}
                                    <button className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Lucky Dining Wheel */}
            {activeTab === 'wheel' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            Cấu hình Vòng quay May mắn
                        </h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Điều kiện quay (Giá trị hóa đơn tối thiểu)
                            </label>
                            <input
                                type="number"
                                defaultValue={200000}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                Danh sách Giải thưởng
                            </h3>
                            <button className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                Thêm giải thưởng
                            </button>
                        </div>
                        {wheelPrizes.map((prize, index) => (
                            <motion.div
                                key={prize.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                                            style={{ backgroundColor: prize.color }}
                                        >
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">
                                                {prize.name}
                                            </h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Xác suất: {prize.probability}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Review Rewards */}
            {activeTab === 'reviews' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            Cấu hình Review Rewards
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Điểm thưởng cho đánh giá có hình ảnh
                                </label>
                                <input
                                    type="number"
                                    defaultValue={50}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Điểm thưởng cho đánh giá không hình ảnh
                                </label>
                                <input
                                    type="number"
                                    defaultValue={20}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="autoReward"
                                    defaultChecked
                                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                                />
                                <label htmlFor="autoReward" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Tự động tặng điểm khi khách để lại đánh giá
                                </label>
                            </div>
                        </div>
                        <button className="mt-4 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors">
                            Lưu cài đặt
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
