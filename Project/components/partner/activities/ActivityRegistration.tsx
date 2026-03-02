"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, MapPin, Phone, Globe, Loader2 } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

interface ActivityRegistrationProps {
    onSuccess: () => void
}

const ACTIVITY_TYPES = [
    'tours', 'water_sports', 'hiking', 'cycling', 'cooking_class',
    'cultural_experience', 'adventure', 'wellness', 'photography', 'other'
]

export function ActivityRegistration({ onSuccess }: ActivityRegistrationProps) {
    const { user } = useUser()
    const [loading, setLoading] = useState(false)
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])
    const [formData, setFormData] = useState({
        company_name: '',
        email: user?.primaryEmailAddress?.emailAddress || '',
        phone: '',
        website: '',
        base_city: '',
        service_areas: '',
        business_registration_number: '',
        tax_id: '',
        tourism_license: '',
        description: '',
    })

    const toggleType = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        setLoading(true)
        try {
            const res = await fetch('/api/partner/activity/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id,
                },
                body: JSON.stringify({
                    ...formData,
                    activity_types: selectedTypes,
                    service_areas: formData.service_areas.split(',').map(s => s.trim()).filter(Boolean),
                }),
            })
            const data = await res.json()
            if (res.ok && data.success) {
                onSuccess()
            } else {
                alert(data.error?.message || data.error || 'Registration failed')
            }
        } catch {
            alert('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const inputCls = "w-full p-4 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 transition-all font-medium text-slate-900 dark:text-white"

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-black p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-zinc-800"
            >
                <div className="bg-orange-500/5 p-8 text-center border-b border-slate-100 dark:border-zinc-800">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="w-8 h-8 text-orange-500" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                        Đăng ký Activity Partner
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        Đăng ký để quản lý tours, hoạt động trải nghiệm và vé tham quan trên TripC.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <Activity className="w-4 h-4 text-orange-500" />
                            Tên công ty / tổ chức *
                        </label>
                        <input required placeholder="e.g. Saigon Adventure Tours" className={inputCls}
                            value={formData.company_name}
                            onChange={e => setFormData({ ...formData, company_name: e.target.value })} />
                    </div>

                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 block">
                            Loại hoạt động cung cấp
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ACTIVITY_TYPES.map(type => (
                                <button key={type} type="button"
                                    onClick={() => toggleType(type)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${selectedTypes.includes(type)
                                            ? 'bg-orange-500 text-white border-orange-500'
                                            : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-zinc-700 hover:border-orange-300'
                                        }`}>
                                    {type.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <Phone className="w-4 h-4 text-orange-500" />
                                Số điện thoại
                            </label>
                            <input placeholder="+84..." className={inputCls}
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Email</label>
                            <input type="email" placeholder="contact@tours.com" className={inputCls}
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <MapPin className="w-4 h-4 text-orange-500" />
                                Thành phố chính
                            </label>
                            <input placeholder="e.g. Đà Nẵng" className={inputCls}
                                value={formData.base_city}
                                onChange={e => setFormData({ ...formData, base_city: e.target.value })} />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <Globe className="w-4 h-4 text-orange-500" />
                                Website
                            </label>
                            <input type="url" placeholder="https://..." className={inputCls}
                                value={formData.website}
                                onChange={e => setFormData({ ...formData, website: e.target.value })} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Khu vực hoạt động</label>
                            <input placeholder="Hội An, Đà Nẵng, Huế (phân cách bằng dấu phẩy)" className={inputCls}
                                value={formData.service_areas}
                                onChange={e => setFormData({ ...formData, service_areas: e.target.value })} />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Giấy phép lữ hành</label>
                            <input placeholder="Số giấy phép..." className={inputCls}
                                value={formData.tourism_license}
                                onChange={e => setFormData({ ...formData, tourism_license: e.target.value })} />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Mã số thuế</label>
                            <input placeholder="0123456789" className={inputCls}
                                value={formData.tax_id}
                                onChange={e => setFormData({ ...formData, tax_id: e.target.value })} />
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {loading ? 'Đang đăng ký...' : 'Hoàn tất đăng ký'}
                    </button>
                </form>
            </motion.div>
        </div>
    )
}
