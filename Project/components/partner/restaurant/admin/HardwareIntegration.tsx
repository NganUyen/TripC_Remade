"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    Printer, 
    Settings,
    CheckCircle2,
    XCircle,
    Wifi,
    Usb,
    RefreshCw
} from 'lucide-react'

interface HardwareDevice {
    id: string
    name: string
    type: 'bill-printer' | 'kitchen-printer' | 'payment-terminal'
    connection: 'usb' | 'wifi' | 'bluetooth'
    status: 'connected' | 'disconnected' | 'error'
    location?: string
    lastTest?: string
}

export function HardwareIntegration() {
    const [devices, setDevices] = useState<HardwareDevice[]>([
        {
            id: '1',
            name: 'Máy in hóa đơn - Quầy thu ngân',
            type: 'bill-printer',
            connection: 'usb',
            status: 'connected',
            location: 'Quầy thu ngân chính',
            lastTest: '2024-05-20T10:30:00'
        },
        {
            id: '2',
            name: 'Máy in bếp - Khu vực nấu',
            type: 'kitchen-printer',
            connection: 'wifi',
            status: 'connected',
            location: 'Nhà bếp chính',
            lastTest: '2024-05-20T09:15:00'
        },
        {
            id: '3',
            name: 'Máy in bếp - Khu vực đồ uống',
            type: 'kitchen-printer',
            connection: 'wifi',
            status: 'disconnected',
            location: 'Quầy bar',
            lastTest: '2024-05-19T18:00:00'
        },
        {
            id: '4',
            name: 'Cổng thanh toán - Quầy 1',
            type: 'payment-terminal',
            connection: 'usb',
            status: 'connected',
            location: 'Quầy thu ngân chính',
            lastTest: '2024-05-20T11:00:00'
        }
    ])

    const getTypeLabel = (type: HardwareDevice['type']) => {
        switch (type) {
            case 'bill-printer':
                return 'Máy in hóa đơn'
            case 'kitchen-printer':
                return 'Máy in bếp'
            case 'payment-terminal':
                return 'Cổng thanh toán'
            default:
                return type
        }
    }

    const getConnectionIcon = (connection: HardwareDevice['connection']) => {
        switch (connection) {
            case 'usb':
                return Usb
            case 'wifi':
                return Wifi
            default:
                return Settings
        }
    }

    const getStatusColor = (status: HardwareDevice['status']) => {
        switch (status) {
            case 'connected':
                return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            case 'disconnected':
                return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            case 'error':
                return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            default:
                return 'bg-slate-100 dark:bg-slate-800'
        }
    }

    const getStatusLabel = (status: HardwareDevice['status']) => {
        switch (status) {
            case 'connected':
                return 'Đã kết nối'
            case 'disconnected':
                return 'Mất kết nối'
            case 'error':
                return 'Lỗi'
            default:
                return status
        }
    }

    const testDevice = (id: string) => {
        setDevices(devices.map(device => 
            device.id === id 
                ? { ...device, lastTest: new Date().toISOString(), status: 'connected' as const }
                : device
        ))
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Kết nối Thiết bị
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Cấu hình máy in hóa đơn, máy in bếp và các cổng thanh toán điện tử
                    </p>
                </div>
            </div>

            {/* Devices List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {devices.map((device, index) => {
                    const ConnectionIcon = getConnectionIcon(device.connection)
                    return (
                        <motion.div
                            key={device.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-3 rounded-xl bg-primary/10">
                                            <Printer className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                                {device.name}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold">
                                                    {getTypeLabel(device.type)}
                                                </span>
                                                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(device.status)}`}>
                                                    {getStatusLabel(device.status)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ml-12 space-y-2 text-sm">
                                        {device.location && (
                                            <div className="text-slate-600 dark:text-slate-400">
                                                📍 {device.location}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <ConnectionIcon className="w-4 h-4" />
                                            <span className="capitalize">{device.connection}</span>
                                        </div>
                                        {device.lastTest && (
                                            <div className="text-slate-500 dark:text-slate-400 text-xs">
                                                Kiểm tra lần cuối: {new Date(device.lastTest).toLocaleString('vi-VN')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => testDevice(device.id)}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Kiểm tra kết nối
                                </button>
                                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Cấu hình
                                </button>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Setup Guide */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    Hướng dẫn thiết lập
                </h3>
                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-primary font-bold text-xs">1</span>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white mb-1">Kết nối thiết bị</p>
                            <p>Kết nối máy in hoặc cổng thanh toán qua USB, WiFi hoặc Bluetooth</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-primary font-bold text-xs">2</span>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white mb-1">Cấu hình trong hệ thống</p>
                            <p>Thêm thiết bị mới và cấu hình thông tin kết nối (IP, Port, Driver...)</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-primary font-bold text-xs">3</span>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white mb-1">Kiểm tra kết nối</p>
                            <p>Nhấn "Kiểm tra kết nối" để đảm bảo thiết bị hoạt động bình thường</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
