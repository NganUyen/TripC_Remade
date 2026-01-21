"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
    Users, 
    Plus,
    Edit,
    Trash2,
    Shield,
    UserCheck,
    Mail,
    Phone
} from 'lucide-react'

interface Staff {
    id: string
    name: string
    email: string
    phone: string
    role: 'manager' | 'waiter' | 'cashier' | 'chef'
    status: 'active' | 'inactive'
    permissions: string[]
}

export function StaffManagement() {
    const [staff, setStaff] = useState<Staff[]>([
        {
            id: '1',
            name: 'Nguyễn Văn A',
            email: 'nguyenvana@example.com',
            phone: '0901234567',
            role: 'manager',
            status: 'active',
            permissions: ['all']
        },
        {
            id: '2',
            name: 'Trần Thị B',
            email: 'tranthib@example.com',
            phone: '0912345678',
            role: 'waiter',
            status: 'active',
            permissions: ['orders', 'tables']
        },
        {
            id: '3',
            name: 'Lê Văn C',
            email: 'levanc@example.com',
            phone: '0923456789',
            role: 'chef',
            status: 'active',
            permissions: ['kitchen', 'menu']
        }
    ])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null)

    const getRoleLabel = (role: Staff['role']) => {
        switch (role) {
            case 'manager':
                return 'Quản lý nhà hàng'
            case 'waiter':
                return 'Nhân viên phục vụ'
            case 'cashier':
                return 'Thu ngân'
            case 'chef':
                return 'Đầu bếp'
            default:
                return role
        }
    }

    const getRoleColor = (role: Staff['role']) => {
        switch (role) {
            case 'manager':
                return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
            case 'waiter':
                return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
            case 'cashier':
                return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            case 'chef':
                return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
            default:
                return 'bg-slate-100 dark:bg-slate-800'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Quản lý Đội ngũ
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Phân quyền cho Quản lý nhà hàng, Nhân viên phục vụ, Thu ngân và Đầu bếp
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingStaff(null)
                        setIsModalOpen(true)
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Thêm nhân viên
                </button>
            </div>

            {/* Staff List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map((member, index) => (
                    <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            {member.name}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getRoleColor(member.role)}`}>
                                            {getRoleLabel(member.role)}
                                        </span>
                                    </div>
                                </div>

                                <div className="ml-15 space-y-2 mt-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Mail className="w-4 h-4" />
                                        <span>{member.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Phone className="w-4 h-4" />
                                        <span>{member.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                        <span className="text-slate-600 dark:text-slate-400">
                                            Quyền: {member.permissions.length} module
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditingStaff(member)
                                        setIsModalOpen(true)
                                    }}
                                    className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Bạn có chắc muốn xóa nhân viên này?')) {
                                            setStaff(staff.filter(s => s.id !== member.id))
                                        }
                                    }}
                                    className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {member.status === 'active' ? (
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                <UserCheck className="w-4 h-4" />
                                <span>Đang hoạt động</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <span>Không hoạt động</span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <StaffModal
                    staff={editingStaff}
                    onClose={() => setIsModalOpen(false)}
                    onSave={(member) => {
                        if (editingStaff) {
                            setStaff(staff.map(s => s.id === member.id ? member : s))
                        } else {
                            setStaff([...staff, { ...member, id: Date.now().toString() }])
                        }
                        setIsModalOpen(false)
                    }}
                />
            )}
        </div>
    )
}

interface StaffModalProps {
    staff: Staff | null
    onClose: () => void
    onSave: (staff: Omit<Staff, 'id'> & { id?: string }) => void
}

function StaffModal({ staff, onClose, onSave }: StaffModalProps) {
    const [formData, setFormData] = useState({
        name: staff?.name || '',
        email: staff?.email || '',
        phone: staff?.phone || '',
        role: staff?.role || 'waiter' as Staff['role'],
        status: staff?.status || 'active' as const,
        permissions: staff?.permissions || []
    })

    const availablePermissions = [
        { id: 'all', label: 'Tất cả quyền' },
        { id: 'orders', label: 'Quản lý đơn hàng' },
        { id: 'tables', label: 'Quản lý bàn' },
        { id: 'menu', label: 'Quản lý thực đơn' },
        { id: 'kitchen', label: 'Nhà bếp (KDS)' },
        { id: 'reports', label: 'Báo cáo' }
    ]

    const togglePermission = (permissionId: string) => {
        if (permissionId === 'all') {
            setFormData({
                ...formData,
                permissions: formData.permissions.includes('all') ? [] : ['all']
            })
        } else {
            setFormData({
                ...formData,
                permissions: formData.permissions.includes(permissionId)
                    ? formData.permissions.filter(p => p !== permissionId && p !== 'all')
                    : [...formData.permissions.filter(p => p !== 'all'), permissionId]
            })
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    {staff ? 'Chỉnh sửa Nhân viên' : 'Thêm Nhân viên mới'}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Tên nhân viên
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
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Vai trò
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as Staff['role'] })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="manager">Quản lý nhà hàng</option>
                            <option value="waiter">Nhân viên phục vụ</option>
                            <option value="cashier">Thu ngân</option>
                            <option value="chef">Đầu bếp</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Phân quyền
                        </label>
                        <div className="space-y-2">
                            {availablePermissions.map((permission) => (
                                <label key={permission.id} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.permissions.includes(permission.id)}
                                        onChange={() => togglePermission(permission.id)}
                                        className="w-4 h-4 text-primary rounded focus:ring-primary"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                        {permission.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Trạng thái
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as Staff['status'] })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Không hoạt động</option>
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
                        onClick={() => onSave({ ...formData, id: staff?.id })}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-colors"
                    >
                        Lưu
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
