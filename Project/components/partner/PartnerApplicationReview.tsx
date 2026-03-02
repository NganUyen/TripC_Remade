"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CheckCircle, XCircle, Clock, Search, Filter, RefreshCw,
    Building2, Bus, Plane, Activity, Store, ChevronDown, ChevronRight
} from 'lucide-react'

interface Application {
    id: string
    owner_user_id: string
    partner_type: 'restaurant' | 'hotel' | 'transport' | 'flight' | 'activity'
    status: 'pending' | 'approved' | 'suspended' | 'rejected'
    business_name: string
    business_email: string | null
    business_phone: string | null
    created_at: string
    updated_at: string
    rejection_reason: string | null
    metadata: Record<string, any>
    entity_id: string | null
}

const PORTAL_ICONS: Record<string, React.ElementType> = {
    restaurant: Store,
    hotel: Building2,
    transport: Bus,
    flight: Plane,
    activity: Activity,
}

const PORTAL_COLORS: Record<string, string> = {
    restaurant: 'bg-orange-100 text-orange-700',
    hotel: 'bg-blue-100 text-blue-700',
    transport: 'bg-green-100 text-green-700',
    flight: 'bg-sky-100 text-sky-700',
    activity: 'bg-purple-100 text-purple-700',
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
    rejected: 'bg-slate-100 text-slate-600',
}

interface ReviewModalProps {
    app: Application
    onClose: () => void
    onAction: (id: string, action: 'approved' | 'rejected' | 'suspended', reason?: string) => Promise<void>
}

function ReviewModal({ app, onClose, onAction }: ReviewModalProps) {
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)
    const Icon = PORTAL_ICONS[app.partner_type] || Store

    const handle = async (action: 'approved' | 'rejected' | 'suspended') => {
        setLoading(true)
        try {
            await onAction(app.id, action, reason || undefined)
            onClose()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${PORTAL_COLORS[app.partner_type]}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">{app.business_name}</h3>
                        <p className="text-sm text-slate-500 capitalize">{app.partner_type} Partner · {new Date(app.created_at).toLocaleDateString('vi-VN')}</p>
                    </div>
                </div>

                <div className="space-y-2 mb-5 text-sm">
                    {app.business_email && (
                        <div className="flex gap-2"><span className="text-slate-400 w-24">Email:</span><span className="text-slate-700">{app.business_email}</span></div>
                    )}
                    {app.business_phone && (
                        <div className="flex gap-2"><span className="text-slate-400 w-24">Phone:</span><span className="text-slate-700">{app.business_phone}</span></div>
                    )}
                    <div className="flex gap-2"><span className="text-slate-400 w-24">User ID:</span><span className="text-slate-700 font-mono text-xs">{app.owner_user_id}</span></div>
                    {Object.entries(app.metadata || {}).map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                            <span className="text-slate-400 w-24 capitalize">{k.replace(/_/g, ' ')}:</span>
                            <span className="text-slate-700">{String(v)}</span>
                        </div>
                    ))}
                </div>

                {(app.status === 'pending' || app.status !== 'approved') && (
                    <div className="mb-5">
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Lý do từ chối / tạm dừng (nếu có)</label>
                        <textarea
                            rows={3}
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="Nhập lý do (không bắt buộc khi duyệt)..."
                            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 resize-none"
                        />
                    </div>
                )}

                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        Hủy
                    </button>
                    {app.status !== 'rejected' && (
                        <button
                            onClick={() => handle('rejected')}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Từ chối
                        </button>
                    )}
                    {app.status === 'approved' && (
                        <button
                            onClick={() => handle('suspended')}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Tạm dừng
                        </button>
                    )}
                    {app.status !== 'approved' && (
                        <button
                            onClick={() => handle('approved')}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-semibold bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50"
                        >
                            ✓ Duyệt
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    )
}

/**
 * PartnerApplicationReview
 * Admin component to review, approve, reject, or suspend partner applications.
 * Reads from partner_profiles table (all portal types unified).
 * 
 * Usage: <PartnerApplicationReview />
 * Mount this in an admin-only page.
 */
export function PartnerApplicationReview() {
    const [applications, setApplications] = useState<Application[]>([])
    const [filtered, setFiltered] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('pending')
    const [selected, setSelected] = useState<Application | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchApplications = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/partner-applications')
            const data = await res.json()
            if (data.success) {
                setApplications(data.data)
            }
        } catch (err) {
            console.error('Failed to fetch applications:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchApplications() }, [fetchApplications])

    useEffect(() => {
        let result = [...applications]
        if (typeFilter !== 'all') result = result.filter(a => a.partner_type === typeFilter)
        if (statusFilter !== 'all') result = result.filter(a => a.status === statusFilter)
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(a =>
                a.business_name.toLowerCase().includes(q) ||
                a.business_email?.toLowerCase().includes(q) ||
                a.owner_user_id.toLowerCase().includes(q)
            )
        }
        setFiltered(result)
    }, [applications, typeFilter, statusFilter, search])

    const handleAction = async (id: string, action: 'approved' | 'rejected' | 'suspended', reason?: string) => {
        setActionLoading(id)
        try {
            const res = await fetch(`/api/admin/partner-applications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action, rejection_reason: reason || null }),
            })
            if (res.ok) {
                setApplications(prev => prev.map(a =>
                    a.id === id ? { ...a, status: action, rejection_reason: reason || null } : a
                ))
            }
        } finally {
            setActionLoading(null)
        }
    }

    const counts = {
        all: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        approved: applications.filter(a => a.status === 'approved').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
        suspended: applications.filter(a => a.status === 'suspended').length,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Partner Applications</h2>
                    <p className="text-slate-500 text-sm mt-1">Xem xét và duyệt đơn đăng ký partner portal</p>
                </div>
                <button
                    onClick={fetchApplications}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Làm mới
                </button>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                {(['all', 'pending', 'approved', 'rejected', 'suspended'] as const).map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === s ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {s === 'all' ? 'Tất cả' : s.charAt(0).toUpperCase() + s.slice(1)}
                        <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${statusFilter === s ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-600'}`}>
                            {counts[s]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Tìm theo tên, email, user ID..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500"
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500"
                >
                    <option value="all">Tất cả loại</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="hotel">Hotel</option>
                    <option value="transport">Transport</option>
                    <option value="flight">Flight</option>
                    <option value="activity">Activity</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Doanh nghiệp</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Loại</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Trạng thái</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ngày đăng ký</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-16 text-slate-400">
                                    <div className="flex items-center justify-center gap-2">
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Đang tải...
                                    </div>
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-16 text-slate-400">
                                    Không có đơn nào phù hợp
                                </td></tr>
                            ) : filtered.map(app => {
                                const Icon = PORTAL_ICONS[app.partner_type] || Store
                                return (
                                    <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3.5 px-4">
                                            <div className="font-semibold text-slate-900 text-sm">{app.business_name}</div>
                                            {app.business_email && (
                                                <div className="text-xs text-slate-400 mt-0.5">{app.business_email}</div>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${PORTAL_COLORS[app.partner_type]}`}>
                                                <Icon className="w-3.5 h-3.5" />
                                                {app.partner_type}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[app.status]}`}>
                                                {app.status === 'pending' && <Clock className="w-3 h-3" />}
                                                {app.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                                                {app.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-sm text-slate-500">
                                            {new Date(app.created_at).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <button
                                                onClick={() => setSelected(app)}
                                                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                            >
                                                Xem xét
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selected && (
                    <ReviewModal
                        app={selected}
                        onClose={() => setSelected(null)}
                        onAction={handleAction}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
