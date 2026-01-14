"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    Users, 
    Star,
    Gift,
    Plus,
    Edit,
    Trash2,
    Award,
    TrendingUp
} from 'lucide-react'

interface LoyaltyTier {
    id: string
    name: string
    minPoints: number
    benefits: string[]
    color: string
}

interface Reward {
    id: string
    name: string
    pointsRequired: number
    description: string
    stock?: number
    isActive: boolean
}

export function LoyaltyProgram() {
    const [tiers, setTiers] = useState<LoyaltyTier[]>([
        {
            id: '1',
            name: 'Đồng',
            minPoints: 0,
            benefits: ['Tích điểm 1% giá trị hóa đơn'],
            color: 'amber'
        },
        {
            id: '2',
            name: 'Bạc',
            minPoints: 1000,
            benefits: ['Tích điểm 1.5% giá trị hóa đơn', 'Giảm giá 5% cho đơn hàng'],
            color: 'slate'
        },
        {
            id: '3',
            name: 'Vàng',
            minPoints: 5000,
            benefits: ['Tích điểm 2% giá trị hóa đơn', 'Giảm giá 10% cho đơn hàng', 'Ưu tiên đặt bàn'],
            color: 'yellow'
        },
        {
            id: '4',
            name: 'Bạch Kim',
            minPoints: 10000,
            benefits: ['Tích điểm 3% giá trị hóa đơn', 'Giảm giá 15% cho đơn hàng', 'Ưu tiên đặt bàn', 'Quà tặng sinh nhật'],
            color: 'cyan'
        }
    ])

    const [rewards, setRewards] = useState<Reward[]>([
        {
            id: '1',
            name: 'Voucher 50.000 VNĐ',
            pointsRequired: 500,
            description: 'Giảm giá 50.000 VNĐ cho đơn hàng tiếp theo',
            stock: 100,
            isActive: true
        },
        {
            id: '2',
            name: 'Món tráng miệng miễn phí',
            pointsRequired: 300,
            description: 'Nhận một món tráng miệng miễn phí',
            isActive: true
        },
        {
            id: '3',
            name: 'Combo đặc biệt',
            pointsRequired: 1000,
            description: 'Combo 2 người với giá ưu đãi',
            stock: 50,
            isActive: true
        }
    ])

    const [activeTab, setActiveTab] = useState<'tiers' | 'rewards'>('tiers')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Chương trình Hội viên
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Quản lý hạng thẻ khách hàng, tích điểm thưởng và quy đổi quà tặng
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('tiers')}
                    className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                        activeTab === 'tiers'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 dark:text-slate-400'
                    }`}
                >
                    Hạng thẻ
                </button>
                <button
                    onClick={() => setActiveTab('rewards')}
                    className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                        activeTab === 'rewards'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 dark:text-slate-400'
                    }`}
                >
                    Quà tặng
                </button>
            </div>

            {activeTab === 'tiers' && (
                <div className="space-y-4">
                    {tiers.map((tier, index) => (
                        <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-xl bg-${tier.color}-100 dark:bg-${tier.color}-900/20`}>
                                        <Award className={`w-8 h-8 text-${tier.color}-600 dark:text-${tier.color}-400`} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                            Hạng {tier.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Từ {tier.minPoints.toLocaleString('vi-VN')} điểm
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-slate-900 dark:text-white">Quyền lợi:</h4>
                                <ul className="space-y-1">
                                    {tier.benefits.map((benefit, benefitIndex) => (
                                        <li key={benefitIndex} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <Star className="w-4 h-4 text-primary" />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {activeTab === 'rewards' && (
                <div className="space-y-4">
                    {rewards.map((reward, index) => (
                        <motion.div
                            key={reward.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            {reward.name}
                                        </h3>
                                        {reward.isActive ? (
                                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-xs font-semibold">
                                                Đang hoạt động
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold">
                                                Tạm dừng
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                        {reward.description}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Gift className="w-4 h-4 text-primary" />
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {reward.pointsRequired.toLocaleString('vi-VN')} điểm
                                            </span>
                                        </div>
                                        {reward.stock !== undefined && (
                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                Tồn kho: {reward.stock}
                                            </div>
                                        )}
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
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">1,234</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Tổng hội viên</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20">
                            <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">45,678</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Tổng điểm tích lũy</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/20">
                            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">+12.5%</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Tăng trưởng tháng này</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
