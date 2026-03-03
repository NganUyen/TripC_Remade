"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Percent,
    BadgePercent,
    TrendingUp,
    Wallet,
    Receipt,
    Tag,
    Plus,
    Trash2,
    Copy,
    Check,
    ToggleLeft,
    ToggleRight,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Loader2,
    RefreshCw,
} from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

/* ─── Types ─────────────────────────────────────────── */
interface CommissionData {
    provider: { id: string; name: string; voucher_enabled: boolean };
    commission: {
        rate: number;
        ratePercent: string;
        totalRevenue: number;
        commissionAmount: number;
        netRevenue: number;
        totalBookings: number;
    };
    monthly: {
        month: string;
        revenue: number;
        commission: number;
        netRevenue: number;
        bookings: number;
    }[];
}

interface Voucher {
    id: string;
    code: string;
    discount_value: number;
    min_spend: number;
    expires_at: string | null;
    total_usage_limit: number | null;
    current_usage_count: number;
    is_active: boolean;
    created_at: string;
    metadata: { description?: string };
}

interface NewVoucherForm {
    code: string;
    discount_value: string;
    min_spend: string;
    expires_at: string;
    total_usage_limit: string;
    description: string;
}

/* ─── Helpers ────────────────────────────────────────── */
const fmtVND = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "Không giới hạn";

/* ─── Component ──────────────────────────────────────── */
export function CommissionVoucher() {
    const { supabaseUser } = useCurrentUser();

    // Commission state
    const [commData, setCommData] = useState<CommissionData | null>(null);
    const [commLoading, setCommLoading] = useState(true);

    // Voucher state
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [voucherLoading, setVoucherLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<NewVoucherForm>({
        code: "",
        discount_value: "",
        min_spend: "",
        expires_at: "",
        total_usage_limit: "",
        description: "",
    });

    useEffect(() => {
        if (supabaseUser) {
            fetchCommission();
            fetchVouchers();
        }
    }, [supabaseUser]);

    const headers = () => ({
        "Content-Type": "application/json",
        "x-user-id": supabaseUser!.id,
    });

    const fetchCommission = async () => {
        setCommLoading(true);
        try {
            const r = await fetch("/api/partner/transport/commission", { headers: headers() });
            const result = await r.json();
            if (result.success) setCommData(result.data);
        } catch (e) {
            console.error(e);
        } finally {
            setCommLoading(false);
        }
    };

    const fetchVouchers = async () => {
        setVoucherLoading(true);
        try {
            const r = await fetch("/api/partner/transport/vouchers", { headers: headers() });
            const result = await r.json();
            if (result.success) setVouchers(result.data);
        } catch (e) {
            console.error(e);
        } finally {
            setVoucherLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const r = await fetch("/api/partner/transport/vouchers", {
                method: "POST",
                headers: headers(),
                body: JSON.stringify({
                    ...form,
                    discount_value: Number(form.discount_value),
                    min_spend: Number(form.min_spend) || 0,
                    total_usage_limit: form.total_usage_limit ? Number(form.total_usage_limit) : null,
                    expires_at: form.expires_at || null,
                }),
            });
            const result = await r.json();
            if (!result.success) throw new Error(result.error);
            setShowCreateForm(false);
            setForm({ code: "", discount_value: "", min_spend: "", expires_at: "", total_usage_limit: "", description: "" });
            fetchVouchers();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (voucherId: string) => {
        setDeletingId(voucherId);
        try {
            await fetch("/api/partner/transport/vouchers", {
                method: "DELETE",
                headers: headers(),
                body: JSON.stringify({ voucherId }),
            });
            fetchVouchers();
        } finally {
            setDeletingId(null);
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const comm = commData?.commission;
    const monthly = commData?.monthly || [];
    const maxRevenue = Math.max(...monthly.map((m) => m.revenue), 1);

    return (
        <div className="space-y-8">
            {/* ── Header ── */}
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Hoa hồng & Voucher
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Theo dõi thu nhập sau phí nền tảng và quản lý mã giảm giá cho khách hàng
                </p>
            </div>

            {/* ── Commission Cards ── */}
            {commLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse h-28" />
                    ))}
                </div>
            ) : comm ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            label: "Phí nền tảng",
                            value: `${comm.ratePercent}%`,
                            sub: "Mỗi booking",
                            icon: Percent,
                            color: "text-orange-500",
                            bg: "bg-orange-50 dark:bg-orange-900/20",
                        },
                        {
                            label: "Tổng doanh thu",
                            value: fmtVND(comm.totalRevenue),
                            sub: `${comm.totalBookings} booking`,
                            icon: TrendingUp,
                            color: "text-blue-500",
                            bg: "bg-blue-50 dark:bg-blue-900/20",
                        },
                        {
                            label: "Phí nền tảng",
                            value: fmtVND(comm.commissionAmount),
                            sub: `${comm.ratePercent}% doanh thu`,
                            icon: Receipt,
                            color: "text-red-500",
                            bg: "bg-red-50 dark:bg-red-900/20",
                        },
                        {
                            label: "Thu nhập thực nhận",
                            value: fmtVND(comm.netRevenue),
                            sub: `${(100 - Number(comm.ratePercent))}% còn lại`,
                            icon: Wallet,
                            color: "text-green-500",
                            bg: "bg-green-50 dark:bg-green-900/20",
                        },
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
                        >
                            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
                                <card.icon className={`w-5 h-5 ${card.color}`} />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-1">
                                {card.label}
                            </p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{card.value}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
                        </motion.div>
                    ))}
                </div>
            ) : null}

            {/* ── Monthly Revenue Chart ── */}
            {!commLoading && monthly.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="font-bold text-slate-900 dark:text-white">Doanh thu 6 tháng gần nhất</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Xanh = thu nhập thực, Đỏ = phí nền tảng</p>
                        </div>
                        <button onClick={fetchCommission} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <RefreshCw className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                    <div className="flex items-end gap-3 h-40">
                        {monthly.map((m, i) => {
                            const totalH = (m.revenue / maxRevenue) * 100;
                            const commH = (m.commission / maxRevenue) * 100;
                            const netH = (m.netRevenue / maxRevenue) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                    <div className="w-full flex flex-col-reverse rounded-lg overflow-hidden h-32 relative">
                                        {/* Tooltip */}
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap bg-slate-800 text-white text-[10px] rounded px-2 py-1">
                                            {fmtVND(m.revenue)}
                                        </div>
                                        {/* Commission bar (red) */}
                                        <div
                                            className="w-full bg-red-400/30 transition-all duration-500"
                                            style={{ height: `${commH}%` }}
                                        />
                                        {/* Net bar (green) */}
                                        <div
                                            className="w-full bg-emerald-400 transition-all duration-500"
                                            style={{ height: `${netH}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold">{m.month}</span>
                                    <span className="text-[10px] text-slate-500">{m.bookings} vé</span>
                                </div>
                            );
                        })}
                    </div>
                    {/* Legend */}
                    <div className="flex gap-4 mt-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-400 inline-block" /> Thu nhập thực</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-400/30 inline-block" /> Phí nền tảng</span>
                    </div>
                </div>
            )}

            {/* ── Voucher Section ── */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <BadgePercent className="w-5 h-5 text-primary" />
                            Voucher giảm giá
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">Tạo mã giảm giá riêng cho tuyến xe của bạn</p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Tạo voucher
                    </button>
                </div>

                {/* Create Form */}
                {showCreateForm && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                    >
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Tạo voucher mới</h3>
                            {error && (
                                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
                                        Mã voucher *
                                    </label>
                                    <input
                                        required
                                        placeholder="VD: SUMMER30"
                                        value={form.code}
                                        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
                                        Giảm giá (VND) *
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="VD: 50000"
                                        value={form.discount_value}
                                        onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
                                        Đơn hàng tối thiểu (VND)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="VD: 200000"
                                        value={form.min_spend}
                                        onChange={(e) => setForm({ ...form, min_spend: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
                                        Giới hạn sử dụng
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Để trống = không giới hạn"
                                        value={form.total_usage_limit}
                                        onChange={(e) => setForm({ ...form, total_usage_limit: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
                                        Ngày hết hạn
                                    </label>
                                    <input
                                        type="date"
                                        value={form.expires_at}
                                        onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
                                        Mô tả
                                    </label>
                                    <input
                                        placeholder="Mô tả nội dung voucher..."
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-all"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
                                    Tạo voucher
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Voucher List */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {voucherLoading ? (
                        <div className="p-8 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : vouchers.length === 0 ? (
                        <div className="p-12 text-center">
                            <Tag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Chưa có voucher nào</p>
                            <p className="text-sm text-slate-400 mt-1">Tạo voucher để thu hút thêm khách đặt vé</p>
                        </div>
                    ) : (
                        vouchers.map((v) => {
                            const expired = v.expires_at ? new Date(v.expires_at) < new Date() : false;
                            const usageFull = v.total_usage_limit !== null && v.current_usage_count >= v.total_usage_limit;
                            const statusLabel = !v.is_active ? "Đã tắt" : expired ? "Hết hạn" : usageFull ? "Hết lượt" : "Đang hoạt động";
                            const statusColor = !v.is_active || expired || usageFull
                                ? "text-slate-400 bg-slate-100 dark:bg-slate-800"
                                : "text-green-600 bg-green-50 dark:bg-green-900/20";

                            return (
                                <motion.div
                                    key={v.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-4 px-6 py-4"
                                >
                                    {/* Code */}
                                    <div className="flex items-center gap-2 min-w-[140px]">
                                        <code className="text-sm font-black text-primary bg-primary/5 border border-primary/20 px-2.5 py-1 rounded-lg tracking-wide">
                                            {v.code}
                                        </code>
                                        <button
                                            onClick={() => copyCode(v.code)}
                                            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            {copiedCode === v.code
                                                ? <Check className="w-3.5 h-3.5 text-green-500" />
                                                : <Copy className="w-3.5 h-3.5 text-slate-400" />
                                            }
                                        </button>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                            Giảm {fmtVND(v.discount_value)}
                                            {v.min_spend > 0 && (
                                                <span className="font-normal text-slate-400"> · Tối thiểu {fmtVND(v.min_spend)}</span>
                                            )}
                                        </p>
                                        <div className="flex gap-3 mt-0.5 text-xs text-slate-400 flex-wrap">
                                            <span>HH: {fmtDate(v.expires_at)}</span>
                                            <span>Đã dùng: {v.current_usage_count}{v.total_usage_limit ? `/${v.total_usage_limit}` : ""}</span>
                                            {v.metadata?.description && <span className="truncate max-w-[160px]">{v.metadata.description}</span>}
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${statusColor}`}>
                                        {statusLabel}
                                    </span>

                                    {/* Delete */}
                                    <button
                                        onClick={() => handleDelete(v.id)}
                                        disabled={deletingId === v.id}
                                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-all disabled:opacity-50"
                                    >
                                        {deletingId === v.id
                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : <Trash2 className="w-4 h-4" />
                                        }
                                    </button>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
