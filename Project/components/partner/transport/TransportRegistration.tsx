"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bus, MapPin, Phone, Truck, Globe, Loader2 } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

interface TransportRegistrationProps {
    onSuccess: () => void
}

const OPERATOR_TYPES = [
    { value: 'bus', label: '🚌 Bus / Coach' },
    { value: 'car', label: '🚗 Car Rental' },
    { value: 'van', label: '🚐 Van / Minibus' },
    { value: 'limousine', label: '🚘 Limousine' },
    { value: 'shuttle', label: '🛺 Airport Shuttle' },
    { value: 'taxi', label: '🚕 Taxi / Ride-share' },
    { value: 'other', label: '🚙 Other' },
]

export function TransportRegistration({ onSuccess }: TransportRegistrationProps) {
    const { user } = useUser()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        company_name: '',
        operator_type: 'bus',
        email: user?.primaryEmailAddress?.emailAddress || '',
        phone: '',
        website: '',
        headquarters_city: '',
        service_regions: '',
        fleet_size: '',
        vehicle_types: '',
        business_registration_number: '',
        tax_id: '',
        operating_license: '',
        description: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        setLoading(true)
        try {
            const res = await fetch('/api/partner/transport/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id,
                },
                body: JSON.stringify({
                    ...formData,
                    fleet_size: parseInt(formData.fleet_size) || 0,
                    service_regions: formData.service_regions.split(',').map(s => s.trim()).filter(Boolean),
                    vehicle_types: formData.vehicle_types.split(',').map(s => s.trim()).filter(Boolean),
                }),
            })
            const data = await res.json()
            if (res.ok && data.success) {
                onSuccess()
            } else {
                alert(data.error?.message || data.error || 'Registration failed')
            }
        } catch (err) {
            alert('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const inputCls = "w-full p-4 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all font-medium text-slate-900 dark:text-white"

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-black p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-zinc-800"
            >
                <div className="bg-blue-600/5 p-8 text-center border-b border-slate-100 dark:border-zinc-800">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bus className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                        Đăng ký Transport Partner
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        Đăng ký để quản lý đội xe, tuyến đường và đặt chỗ ngay trên TripC.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <Truck className="w-4 h-4 text-blue-600" />
                                Tên công ty *
                            </label>
                            <input required placeholder="e.g. Phương Trang Bus" className={inputCls}
                                value={formData.company_name}
                                onChange={e => setFormData({ ...formData, company_name: e.target.value })} />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Loại hình vận tải</label>
                            <select className={inputCls} value={formData.operator_type}
                                onChange={e => setFormData({ ...formData, operator_type: e.target.value })}>
                                {OPERATOR_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Số lượng phương tiện</label>
                            <input type="number" min="0" placeholder="e.g. 20" className={inputCls}
                                value={formData.fleet_size}
                                onChange={e => setFormData({ ...formData, fleet_size: e.target.value })} />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <Phone className="w-4 h-4 text-blue-600" />
                                Số điện thoại
                            </label>
                            <input placeholder="+84..." className={inputCls}
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Email liên hệ</label>
                            <input type="email" placeholder="contact@company.com" className={inputCls}
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                Thành phố trụ sở
                            </label>
                            <input placeholder="e.g. Hồ Chí Minh" className={inputCls}
                                value={formData.headquarters_city}
                                onChange={e => setFormData({ ...formData, headquarters_city: e.target.value })} />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Khu vực hoạt động</label>
                            <input placeholder="Hà Nội, Đà Nẵng, TP.HCM (phân cách bằng dấu phẩy)" className={inputCls}
                                value={formData.service_regions}
                                onChange={e => setFormData({ ...formData, service_regions: e.target.value })} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Loại phương tiện</label>
                            <input placeholder="35-seat bus, 45-seat bus (phân cách bằng dấu phẩy)" className={inputCls}
                                value={formData.vehicle_types}
                                onChange={e => setFormData({ ...formData, vehicle_types: e.target.value })} />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Mã số doanh nghiệp</label>
                            <input placeholder="0123456789" className={inputCls}
                                value={formData.business_registration_number}
                                onChange={e => setFormData({ ...formData, business_registration_number: e.target.value })} />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Mã số thuế</label>
                            <input placeholder="0123456789" className={inputCls}
                                value={formData.tax_id}
                                onChange={e => setFormData({ ...formData, tax_id: e.target.value })} />
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {loading ? 'Đang đăng ký...' : 'Hoàn tất đăng ký'}
                    </button>
                </form>
            </motion.div>
        </div>
    )
}
