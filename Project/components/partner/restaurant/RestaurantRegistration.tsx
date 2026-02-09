"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Store, MapPin, Phone, DollarSign, Utensils, Loader2 } from 'lucide-react'
import { partnerApi } from '@/lib/partner/api'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

interface RestaurantRegistrationProps {
    onSuccess: () => void
}

export function RestaurantRegistration({ onSuccess }: RestaurantRegistrationProps) {
    const { user } = useUser()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        price_range: 'moderate',
        cuisine_type: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        setLoading(true)

        try {
            await partnerApi.registerVenue({
                ...formData,
                price_range: formData.price_range as any,
                cuisine_type: formData.cuisine_type.split(',').map(s => s.trim()).filter(Boolean)
            }, user.id)
            onSuccess() // Reload parent state
        } catch (error) {
            console.error("Registration failed:", error)
            alert("Failed to register restaurant. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-black p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-zinc-800"
            >
                <div className="bg-primary/5 p-8 text-center border-b border-slate-100 dark:border-zinc-800">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Store className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                        Become a Partner
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        Register your restaurant to start managing menus, reservations, and orders directly on TripC.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <Store className="w-4 h-4 text-primary" />
                                Restaurant Name
                            </label>
                            <input
                                required
                                placeholder="e.g. Madame Vo's Kitchen"
                                className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    <Phone className="w-4 h-4 text-primary" />
                                    Phone Number
                                </label>
                                <input
                                    required
                                    placeholder="+84..."
                                    className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    <DollarSign className="w-4 h-4 text-primary" />
                                    Price Range
                                </label>
                                <select
                                    className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none"
                                    value={formData.price_range}
                                    onChange={e => setFormData({ ...formData, price_range: e.target.value as any })}
                                >
                                    <option value="budget">Budget ($)</option>
                                    <option value="moderate">Moderate ($$)</option>
                                    <option value="upscale">Upscale ($$$)</option>
                                    <option value="fine_dining">Fine Dining ($$$$)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <Utensils className="w-4 h-4 text-primary" />
                                Cuisine Types
                            </label>
                            <input
                                placeholder="e.g. Vietnamese, Asian Fusion (comma separated)"
                                className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                value={formData.cuisine_type}
                                onChange={e => setFormData({ ...formData, cuisine_type: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                Address
                            </label>
                            <input
                                required
                                placeholder="Full street address..."
                                className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {loading ? 'Creating Restaurant...' : 'Complete Registration'}
                    </button>

                    <p className="text-center text-xs text-slate-400">
                        By registering, you agree to our Partner Terms & Conditions.
                    </p>
                </form>
            </motion.div>
        </div>
    )
}
