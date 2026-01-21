"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    Table2, 
    Plus, 
    Edit, 
    Trash2,
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle
} from 'lucide-react'

interface Table {
    id: string
    number: string
    area: string
    capacity: number
    status: 'available' | 'occupied' | 'reserved' | 'cleaning'
    currentGuests?: number
    reservationTime?: string
}

export function TableManagement() {
    const [tables, setTables] = useState<Table[]>([
        { id: '1', number: 'T01', area: 'Tầng 1', capacity: 4, status: 'occupied', currentGuests: 3 },
        { id: '2', number: 'T02', area: 'Tầng 1', capacity: 2, status: 'available' },
        { id: '3', number: 'T03', area: 'Tầng 1', capacity: 6, status: 'reserved', reservationTime: '19:00' },
        { id: '4', number: 'V01', area: 'Phòng VIP', capacity: 8, status: 'occupied', currentGuests: 6 },
        { id: '5', number: 'O01', area: 'Ngoài trời', capacity: 4, status: 'cleaning' }
    ])

    const areas = ['Tầng 1', 'Tầng 2', 'Phòng VIP', 'Ngoài trời']
    const [selectedArea, setSelectedArea] = useState<string>('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTable, setEditingTable] = useState<Table | null>(null)

    const filteredTables = selectedArea === 'all'
        ? tables
        : tables.filter(table => table.area === selectedArea)

    const getStatusColor = (status: Table['status']) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700'
            case 'occupied':
                return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700'
            case 'reserved':
                return 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700'
            case 'cleaning':
                return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700'
            default:
                return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
        }
    }

    const getStatusLabel = (status: Table['status']) => {
        switch (status) {
            case 'available':
                return 'Trống'
            case 'occupied':
                return 'Đang sử dụng'
            case 'reserved':
                return 'Đã đặt'
            case 'cleaning':
                return 'Đang dọn'
            default:
                return status
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Quản lý Sơ đồ Bàn
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Quản lý sơ đồ bàn và trạng thái theo thời gian thực
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingTable(null)
                        setIsModalOpen(true)
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Thêm bàn mới
                </button>
            </div>

            {/* Area Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setSelectedArea('all')}
                    className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                        selectedArea === 'all'
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                >
                    Tất cả
                </button>
                {areas.map((area) => (
                    <button
                        key={area}
                        onClick={() => setSelectedArea(area)}
                        className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                            selectedArea === area
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                    >
                        {area}
                    </button>
                ))}
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredTables.map((table, index) => (
                    <motion.div
                        key={table.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                            bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 
                            ${getStatusColor(table.status)}
                            hover:shadow-lg transition-all cursor-pointer
                        `}
                        onClick={() => {
                            setEditingTable(table)
                            setIsModalOpen(true)
                        }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Table2 className="w-5 h-5" />
                                <span className="font-bold text-lg">{table.number}</span>
                            </div>
                            {table.status === 'occupied' && (
                                <Users className="w-4 h-4" />
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm">
                                <span className="font-semibold">Khu vực:</span> {table.area}
                            </div>
                            <div className="text-sm">
                                <span className="font-semibold">Sức chứa:</span> {table.capacity} người
                            </div>
                            {table.currentGuests && (
                                <div className="text-sm">
                                    <span className="font-semibold">Khách:</span> {table.currentGuests}/{table.capacity}
                                </div>
                            )}
                            {table.reservationTime && (
                                <div className="flex items-center gap-1 text-sm">
                                    <Clock className="w-3 h-3" />
                                    <span>{table.reservationTime}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-current/20">
                            <span className="text-xs font-semibold uppercase">
                                {getStatusLabel(table.status)}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                    { label: 'Trống', count: tables.filter(t => t.status === 'available').length, color: 'green' },
                    { label: 'Đang dùng', count: tables.filter(t => t.status === 'occupied').length, color: 'red' },
                    { label: 'Đã đặt', count: tables.filter(t => t.status === 'reserved').length, color: 'amber' },
                    { label: 'Đang dọn', count: tables.filter(t => t.status === 'cleaning').length, color: 'blue' }
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800"
                    >
                        <div className={`text-2xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400 mb-1`}>
                            {stat.count}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <TableModal
                    table={editingTable}
                    areas={areas}
                    onClose={() => setIsModalOpen(false)}
                    onSave={(table) => {
                        if (editingTable) {
                            setTables(tables.map(t => t.id === table.id ? table : t))
                        } else {
                            setTables([...tables, { ...table, id: Date.now().toString() }])
                        }
                        setIsModalOpen(false)
                    }}
                />
            )}
        </div>
    )
}

interface TableModalProps {
    table: Table | null
    areas: string[]
    onClose: () => void
    onSave: (table: Omit<Table, 'id'> & { id?: string }) => void
}

function TableModal({ table, areas, onClose, onSave }: TableModalProps) {
    const [formData, setFormData] = useState({
        number: table?.number || '',
        area: table?.area || areas[0],
        capacity: table?.capacity || 4,
        status: table?.status || 'available' as const
    })

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md"
            >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    {table ? 'Chỉnh sửa Bàn' : 'Thêm Bàn mới'}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Số bàn
                        </label>
                        <input
                            type="text"
                            value={formData.number}
                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Khu vực
                        </label>
                        <select
                            value={formData.area}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            {areas.map(area => (
                                <option key={area} value={area}>{area}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Sức chứa (người)
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Trạng thái
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as Table['status'] })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="available">Trống</option>
                            <option value="occupied">Đang sử dụng</option>
                            <option value="reserved">Đã đặt</option>
                            <option value="cleaning">Đang dọn</option>
                        </select>
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
                        onClick={() => onSave({ ...formData, id: table?.id })}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors"
                    >
                        Lưu
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
