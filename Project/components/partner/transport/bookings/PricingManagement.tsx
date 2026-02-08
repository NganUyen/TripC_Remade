"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    DollarSign,
    Plus,
    Search,
    Edit,
    Save,
    X,
    MapPin,
    Percent,
    Calendar,
    TrendingUp
} from 'lucide-react'
import { useSupabaseClient } from '@/lib/supabase'

interface RoutePrice {
    id: string
    origin: string
    destination: string
    type: string
    vehicle_type: string
    price: number
    currency: string
    provider_name?: string
}

export function PricingManagement() {
    const supabase = useSupabaseClient()
    const [loading, setLoading] = useState(true)
    const [prices, setPrices] = useState<RoutePrice[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editPrice, setEditPrice] = useState<number>(0)

    useEffect(() => {
        fetchPrices()
    }, [])

    const fetchPrices = async () => {
        try {
            setLoading(true)

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Get user's providers
            const { data: providers } = await supabase
                .from('transport_providers')
                .select('id')
                .eq('owner_id', user.id)

            if (!providers || providers.length === 0) {
                setPrices([])
                setLoading(false)
                return
            }

            const providerIds = providers.map(p => p.id)

            const { data, error } = await supabase
                .from('transport_routes')
                .select(`
                    id,
                    origin,
                    destination,
                    type,
                    vehicle_type,
                    price,
                    currency,
                    transport_providers (
                        name
                    )
                `)
                .in('provider_id', providerIds)
                .order('origin', { ascending: true })

            if (error) {
                console.error('Error fetching prices:', error)
            } else {
                const formattedData = data?.map(item => ({
                    ...item,
                    provider_name: (item.transport_providers as any)?.name
                })) || []

                // Group unique routes by origin-destination-type-vehicle
                const uniqueRoutes = formattedData.reduce((acc: RoutePrice[], route) => {
                    const key = `${route.origin}-${route.destination}-${route.type}-${route.vehicle_type}`
                    const exists = acc.find(r =>
                        `${r.origin}-${r.destination}-${r.type}-${r.vehicle_type}` === key
                    )
                    if (!exists) {
                        acc.push(route)
                    }
                    return acc
                }, [])

                setPrices(uniqueRoutes)
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const startEdit = (route: RoutePrice) => {
        setEditingId(route.id)
        setEditPrice(route.price)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditPrice(0)
    }

    const savePrice = async (routeId: string) => {
        try {
            const { error } = await supabase
                .from('transport_routes')
                .update({ price: editPrice })
                .eq('id', routeId)

            if (error) {
                console.error('Error updating price:', error)
            } else {
                fetchPrices()
                setEditingId(null)
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const formatCurrency = (amount: number, currency: string = 'VND') => {
        return new Intl.NumberFormat('vi-VN').format(amount) + ' ' + currency
    }

    const getVehicleTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'bus': 'Xe buýt',
            'limousine': 'Limousine',
            'private_car': 'Xe riêng',
            'train': 'Tàu',
            'airplane': 'Máy bay'
        }
        return labels[type] || type
    }

    const filteredPrices = prices.filter(route =>
        route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.vehicle_type.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Calculate average price per type
    const averagePrices = prices.reduce((acc: Record<string, { total: number; count: number }>, route) => {
        if (!acc[route.type]) {
            acc[route.type] = { total: 0, count: 0 }
        }
        acc[route.type].total += route.price
        acc[route.type].count += 1
        return acc
    }, {})

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3.5 bg-green-500/10 rounded-2xl">
                    <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Quản lý Giá
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Hệ thống thiết lập và tối ưu hóa doanh thu vận chuyển
                    </p>
                </div>
            </div>

            {/* Price Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Object.entries(averagePrices).map(([type, data]) => (
                    <div key={type} className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="p-3 bg-green-500/10 rounded-2xl text-green-600 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    Average Price
                                </span>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">
                                    TB {getVehicleTypeLabel(type)}
                                </h3>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">
                                    {formatCurrency(Math.round(data.total / data.count))}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Tìm kiếm tuyến đường..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
            </div>

            {/* Pricing Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredPrices.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                                    <th className="text-left px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Tuyến đường</th>
                                    <th className="text-left px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Loại xe</th>
                                    <th className="text-left px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Nhà cung cấp</th>
                                    <th className="text-left px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Giá hiện tại</th>
                                    <th className="text-right px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredPrices.map((route, index) => (
                                    <motion.tr
                                        key={route.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-900 dark:text-white block">
                                                        {route.origin}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                                                        đến {route.destination}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 ring-1 ring-slate-200/50 dark:ring-slate-700/50">
                                                {getVehicleTypeLabel(route.type)} • {route.vehicle_type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                    {route.provider_name?.charAt(0) || 'N'}
                                                </div>
                                                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                                    {route.provider_name || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {editingId === route.id ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
                                                        <input
                                                            type="number"
                                                            value={editPrice}
                                                            onChange={(e) => setEditPrice(Number(e.target.value))}
                                                            className="w-40 pl-9 pr-14 py-2 bg-white dark:bg-slate-900 border-2 border-green-500 rounded-xl focus:ring-4 focus:ring-green-500/10 outline-none font-bold text-slate-900 dark:text-white"
                                                            autoFocus
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">VND</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-black text-green-600">
                                                        {formatCurrency(route.price)}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{route.currency}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                {editingId === route.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => savePrice(route.id)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold text-sm shadow-lg shadow-green-600/20 active:scale-95"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                            <span>Lưu</span>
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => startEdit(route)}
                                                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white rounded-xl transition-all font-bold text-sm text-slate-600 dark:text-slate-300 active:scale-95"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        <span>Chỉnh sửa</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <DollarSign className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            Chưa có giá nào
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            Thêm tuyến đường để bắt đầu thiết lập giá
                        </p>
                    </div>
                )}
            </div>

            {/* Pricing Tips */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                            Gợi ý tối ưu giá
                        </h3>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                            <li>• Điều chỉnh giá theo mùa cao điểm để tăng doanh thu</li>
                            <li>• Giá limousine thường cao hơn 50-100% so với xe buýt thường</li>
                            <li>• Các tuyến đường dài nên áp dụng chiết khấu theo nhóm</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
