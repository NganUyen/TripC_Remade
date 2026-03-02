"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plane, MapPin, Phone, Globe, Loader2 } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

interface FlightRegistrationProps {
    onSuccess: () => void
}

export function FlightRegistration({ onSuccess }: FlightRegistrationProps) {
    const { user } = useUser()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        airline_name: '',
        airline_code: '',
        email: user?.primaryEmailAddress?.emailAddress || '',
        phone: '',
        website: '',
        headquarters_city: '',
        headquarters_country: 'VN',
        hub_airports: '',
        fleet_size: '',
        air_operator_certificate: '',
        business_registration_number: '',
        tax_id: '',
        description: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        setLoading(true)
        try {
            const res = await fetch('/api/partner/flight/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id,
                },
                body: JSON.stringify({
                    ...formData,
                    fleet_size: parseInt(formData.fleet_size) || 0,
                    hub_airports: formData.hub_airports.split(',').map(s => s.trim().toUpperCase()).filter(Boolean),
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

    const inputCls = "w-full p-4 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-all font-medium text-slate-900 dark:text-white"

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-black p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-zinc-800"
            >
                <div className="bg-sky-500/5 p-8 text-center border-b border-slate-100 dark:border-zinc-800">
                    <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plane className="w-8 h-8 text-sky-500" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                        Đăng ký Airline Partner
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        Đăng ký hãng hàng không để quản lý chuyến bay, tuyến bay và bán vé trên TripC.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <Plane className="w-4 h-4 text-sky-500" />
                                Tên hãng hàng không *
                            </label>
                            <input required placeholder="e.g. Vietnam Airlines" className={inputCls}
                                value={formData.airline_name}
                                onChange={e => setFormData({ ...formData, airline_name: e.target.value })} />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                                Mã IATA <span className="text-slate-400 font-normal">(ví dụ: VN, QH, VJ)</span>
                            </label>
                            <input maxLength={3} placeholder="VN" className={inputCls + " uppercase"}
                                value={formData.airline_code}
                                onChange={e => setFormData({ ...formData, airline_code: e.target.value.toUpperCase() })} />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Số lượng máy bay</label>
                            <input type="number" min="0" placeholder="e.g. 45" className={inputCls}
                                value={formData.fleet_size}
                                onChange={e => setFormData({ ...formData, fleet_size: e.target.value })} />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <Phone className="w-4 h-4 text-sky-500" />
                                Số điện thoại
                            </label>
                            <input placeholder="+84..." className={inputCls}
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Email</label>
                            <input type="email" placeholder="contact@airline.com" className={inputCls}
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <MapPin className="w-4 h-4 text-sky-500" />
                                Thành phố trụ sở
                            </label>
                            <input placeholder="e.g. Hà Nội" className={inputCls}
                                value={formData.headquarters_city}
                                onChange={e => setFormData({ ...formData, headquarters_city: e.target.value })} />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <Globe className="w-4 h-4 text-sky-500" />
                                Website
                            </label>
                            <input type="url" placeholder="https://airline.com" className={inputCls}
                                value={formData.website}
                                onChange={e => setFormData({ ...formData, website: e.target.value })} />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Sân bay hub</label>
                            <input placeholder="SGN, HAN, DAD (phân cách bằng dấu phẩy)" className={inputCls}
                                value={formData.hub_airports}
                                onChange={e => setFormData({ ...formData, hub_airports: e.target.value })} />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Giấy phép khai thác AOC</label>
                            <input placeholder="Số giấy phép..." className={inputCls}
                                value={formData.air_operator_certificate}
                                onChange={e => setFormData({ ...formData, air_operator_certificate: e.target.value })} />
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
                        className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {loading ? 'Đang đăng ký...' : 'Hoàn tất đăng ký'}
                    </button>
                </form>
            </motion.div>
        </div>
    )
}
